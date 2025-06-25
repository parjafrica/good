"""
Admin API Service for Granada OS
FastAPI-based admin dashboard backend
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
import os
from datetime import datetime, timedelta
import json

app = FastAPI(
    title="Granada OS Admin API",
    description="Admin dashboard and management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AdminDatabase:
    def __init__(self):
        self.db_config = self._parse_db_url(os.getenv('DATABASE_URL'))
    
    def _parse_db_url(self, url: str) -> Dict[str, str]:
        if not url:
            raise ValueError("DATABASE_URL environment variable not set")
        
        parsed = urlparse(url)
        return {
            'host': parsed.hostname,
            'port': parsed.port or 5432,
            'database': parsed.path[1:],
            'user': parsed.username,
            'password': parsed.password
        }
    
    def get_connection(self):
        return psycopg2.connect(**self.db_config)

admin_db = AdminDatabase()

@app.get("/")
async def root():
    return {"message": "Granada OS Admin API", "status": "running"}

@app.get("/api/admin/dashboard")
async def get_dashboard_stats():
    """Get comprehensive admin dashboard statistics"""
    try:
        with admin_db.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Users statistics
                cursor.execute("SELECT COUNT(*) as total FROM users WHERE is_active = true")
                total_users = cursor.fetchone()['total']
                
                cursor.execute("SELECT COUNT(*) as admins FROM users WHERE user_type = 'admin'")
                admin_users = cursor.fetchone()['admins']
                
                cursor.execute("SELECT COUNT(*) as students FROM users WHERE user_type = 'student'")
                student_users = cursor.fetchone()['students']
                
                cursor.execute("SELECT COUNT(*) as ngos FROM users WHERE user_type = 'donor'")
                ngo_users = cursor.fetchone()['ngos']
                
                # Opportunities statistics
                cursor.execute("SELECT COUNT(*) as total FROM donor_opportunities WHERE is_active = true")
                total_opportunities = cursor.fetchone()['total']
                
                cursor.execute("SELECT COUNT(*) as verified FROM donor_opportunities WHERE is_verified = true")
                verified_opportunities = cursor.fetchone()['verified']
                
                cursor.execute("SELECT COUNT(DISTINCT country) as countries FROM donor_opportunities")
                countries_count = cursor.fetchone()['countries']
                
                # Bot statistics
                cursor.execute("SELECT COUNT(*) as total FROM search_bots")
                total_bots = cursor.fetchone()['total']
                
                cursor.execute("SELECT COUNT(*) as active FROM search_bots WHERE status = 'active'")
                active_bots = cursor.fetchone()['active']
                
                cursor.execute("SELECT SUM(opportunities_found) as total_found FROM search_bots")
                total_found = cursor.fetchone()['total_found'] or 0
                
                # Recent activity
                cursor.execute("""
                    SELECT action_type, COUNT(*) as count, DATE(created_at) as date
                    FROM user_interactions 
                    WHERE created_at >= NOW() - INTERVAL '7 days'
                    GROUP BY action_type, DATE(created_at)
                    ORDER BY date DESC
                    LIMIT 20
                """)
                recent_activity = cursor.fetchall()
                
                # Credit transactions
                cursor.execute("""
                    SELECT SUM(amount) as total_credits, transaction_type
                    FROM credit_transactions
                    WHERE created_at >= NOW() - INTERVAL '30 days'
                    GROUP BY transaction_type
                """)
                credit_stats = cursor.fetchall()
                
                return {
                    "users": {
                        "total": total_users,
                        "admins": admin_users,
                        "students": student_users,
                        "ngos": ngo_users
                    },
                    "opportunities": {
                        "total": total_opportunities,
                        "verified": verified_opportunities,
                        "countries": countries_count
                    },
                    "bots": {
                        "total": total_bots,
                        "active": active_bots,
                        "total_found": total_found
                    },
                    "activity": [dict(row) for row in recent_activity],
                    "credits": [dict(row) for row in credit_stats],
                    "system": {
                        "status": "healthy",
                        "last_updated": datetime.now().isoformat()
                    }
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/users")
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    user_type: Optional[str] = None
):
    """Get paginated list of users with search and filters"""
    try:
        with admin_db.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                offset = (page - 1) * limit
                
                # Build query with filters
                query = """
                    SELECT id, email, first_name, last_name, country, sector,
                           organization_type, credits, user_type, is_active,
                           is_banned, created_at, updated_at
                    FROM users
                    WHERE 1=1
                """
                params = []
                
                if search:
                    query += " AND (email ILIKE %s OR first_name ILIKE %s OR last_name ILIKE %s)"
                    search_term = f"%{search}%"
                    params.extend([search_term, search_term, search_term])
                
                if user_type:
                    query += " AND user_type = %s"
                    params.append(user_type)
                
                query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
                params.extend([limit, offset])
                
                cursor.execute(query, params)
                users = cursor.fetchall()
                
                # Get total count
                count_query = "SELECT COUNT(*) as total FROM users WHERE 1=1"
                count_params = []
                
                if search:
                    count_query += " AND (email ILIKE %s OR first_name ILIKE %s OR last_name ILIKE %s)"
                    count_params.extend([search_term, search_term, search_term])
                
                if user_type:
                    count_query += " AND user_type = %s"
                    count_params.append(user_type)
                
                cursor.execute(count_query, count_params)
                total = cursor.fetchone()['total']
                
                return {
                    "users": [dict(row) for row in users],
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total": total,
                        "pages": (total + limit - 1) // limit
                    }
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/users/{user_id}/ban")
async def ban_user(user_id: str):
    """Ban a user"""
    try:
        with admin_db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE users SET is_banned = true, is_active = false
                    WHERE id = %s
                """, (user_id,))
                
                if cursor.rowcount == 0:
                    raise HTTPException(status_code=404, detail="User not found")
                
                conn.commit()
                return {"message": "User banned successfully"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/users/{user_id}/unban")
async def unban_user(user_id: str):
    """Unban a user"""
    try:
        with admin_db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE users SET is_banned = false, is_active = true
                    WHERE id = %s
                """, (user_id,))
                
                if cursor.rowcount == 0:
                    raise HTTPException(status_code=404, detail="User not found")
                
                conn.commit()
                return {"message": "User unbanned successfully"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/users/{user_id}/credits")
async def adjust_user_credits(user_id: str, adjustment: Dict[str, Any]):
    """Adjust user credits"""
    try:
        amount = adjustment.get('amount', 0)
        reason = adjustment.get('reason', 'Admin adjustment')
        
        with admin_db.get_connection() as conn:
            with conn.cursor() as cursor:
                # Update user credits
                cursor.execute("""
                    UPDATE users SET credits = credits + %s
                    WHERE id = %s
                    RETURNING credits
                """, (amount, user_id))
                
                result = cursor.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="User not found")
                
                new_balance = result[0]
                
                # Record transaction
                cursor.execute("""
                    INSERT INTO credit_transactions (
                        user_id, amount, transaction_type, description, created_at
                    ) VALUES (%s, %s, %s, %s, NOW())
                """, (user_id, amount, 'admin_adjustment', reason))
                
                conn.commit()
                
                return {
                    "message": "Credits adjusted successfully",
                    "new_balance": new_balance,
                    "adjustment": amount
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/opportunities")
async def get_opportunities(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    verified_only: bool = False,
    country: Optional[str] = None
):
    """Get paginated opportunities"""
    try:
        with admin_db.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                offset = (page - 1) * limit
                
                query = """
                    SELECT id, title, description, amount_min, amount_max, currency,
                           deadline, source_url, source_name, country, sector,
                           is_verified, is_active, scraped_at, created_at
                    FROM donor_opportunities
                    WHERE is_active = true
                """
                params = []
                
                if verified_only:
                    query += " AND is_verified = true"
                
                if country:
                    query += " AND country = %s"
                    params.append(country)
                
                query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
                params.extend([limit, offset])
                
                cursor.execute(query, params)
                opportunities = cursor.fetchall()
                
                # Get total count
                count_query = "SELECT COUNT(*) as total FROM donor_opportunities WHERE is_active = true"
                count_params = []
                
                if verified_only:
                    count_query += " AND is_verified = true"
                
                if country:
                    count_query += " AND country = %s"
                    count_params.append(country)
                
                cursor.execute(count_query, count_params)
                total = cursor.fetchone()['total']
                
                return {
                    "opportunities": [dict(row) for row in opportunities],
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total": total,
                        "pages": (total + limit - 1) // limit
                    }
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/opportunities/{opportunity_id}/verify")
async def verify_opportunity(opportunity_id: str):
    """Verify an opportunity"""
    try:
        with admin_db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE donor_opportunities 
                    SET is_verified = true, last_verified = NOW()
                    WHERE id = %s
                """, (opportunity_id,))
                
                if cursor.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Opportunity not found")
                
                conn.commit()
                return {"message": "Opportunity verified successfully"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/system/logs")
async def get_system_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500)
):
    """Get system activity logs"""
    try:
        with admin_db.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                offset = (page - 1) * limit
                
                cursor.execute("""
                    SELECT ui.id, ui.user_id, ui.action_type, ui.action_details,
                           ui.ip_address, ui.created_at, u.email as user_email
                    FROM user_interactions ui
                    LEFT JOIN users u ON ui.user_id = u.id
                    ORDER BY ui.created_at DESC
                    LIMIT %s OFFSET %s
                """, (limit, offset))
                
                logs = cursor.fetchall()
                
                cursor.execute("SELECT COUNT(*) as total FROM user_interactions")
                total = cursor.fetchone()['total']
                
                return {
                    "logs": [dict(row) for row in logs],
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total": total,
                        "pages": (total + limit - 1) // limit
                    }
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("admin_api:app", host="0.0.0.0", port=8002, reload=True)