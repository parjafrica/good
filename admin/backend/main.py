"""
Granada OS Admin Backend
Complete FastAPI admin system with database management
"""

from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from typing import Dict, List, Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
import os
from datetime import datetime, timedelta
import json
import hashlib

app = FastAPI(
    title="Granada OS Admin System",
    description="Complete admin dashboard and management system",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="admin/frontend/static"), name="static")
templates = Jinja2Templates(directory="admin/frontend/templates")

class AdminDB:
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
    
    def execute_query(self, query: str, params=None, fetch=True):
        """Execute database query with error handling"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(query, params or ())
                    if fetch:
                        return cursor.fetchall()
                    conn.commit()
                    return cursor.rowcount
        except Exception as e:
            print(f"Database error: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

admin_db = AdminDB()

# Admin Frontend Routes
@app.get("/admin", response_class=HTMLResponse)
@app.get("/admin/", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    """Serve admin dashboard HTML"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/admin/users", response_class=HTMLResponse)
async def admin_users_page(request: Request):
    """Serve users management page"""
    return templates.TemplateResponse("users.html", {"request": request})

@app.get("/admin/opportunities", response_class=HTMLResponse)
async def admin_opportunities_page(request: Request):
    """Serve opportunities management page"""
    return templates.TemplateResponse("opportunities.html", {"request": request})

@app.get("/admin/bots", response_class=HTMLResponse)
async def admin_bots_page(request: Request):
    """Serve bots management page"""
    return templates.TemplateResponse("bots.html", {"request": request})

@app.get("/admin/system", response_class=HTMLResponse)
async def admin_system_page(request: Request):
    """Serve system logs page"""
    return templates.TemplateResponse("system.html", {"request": request})

# API Routes
@app.get("/api/admin/dashboard")
async def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
    try:
        # Get user counts
        users_query = """
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admin_users,
                COUNT(CASE WHEN user_type = 'student' THEN 1 END) as student_users,
                COUNT(CASE WHEN user_type = 'donor' THEN 1 END) as ngo_users,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
            FROM users
        """
        user_stats = admin_db.execute_query(users_query)[0]
        
        # Get opportunity counts
        opp_query = """
            SELECT 
                COUNT(*) as total_opportunities,
                COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_opportunities,
                COUNT(DISTINCT country) as countries_count
            FROM donor_opportunities 
            WHERE is_active = true
        """
        opp_stats = admin_db.execute_query(opp_query)[0]
        
        # Get bot counts
        bot_query = """
            SELECT 
                COUNT(*) as total_bots,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_bots,
                COALESCE(SUM(opportunities_found), 0) as total_found
            FROM search_bots
        """
        bot_stats = admin_db.execute_query(bot_query)[0]
        
        # Get recent activity (last 7 days)
        activity_query = """
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as activity_count
            FROM donor_opportunities 
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        """
        activity_data = admin_db.execute_query(activity_query)
        
        return {
            "users": {
                "total": user_stats['total_users'] or 0,
                "admins": user_stats['admin_users'] or 0,
                "students": user_stats['student_users'] or 0,
                "ngos": user_stats['ngo_users'] or 0,
                "active": user_stats['active_users'] or 0
            },
            "opportunities": {
                "total": opp_stats['total_opportunities'] or 0,
                "verified": opp_stats['verified_opportunities'] or 0,
                "countries": opp_stats['countries_count'] or 0
            },
            "bots": {
                "total": bot_stats['total_bots'] or 0,
                "active": bot_stats['active_bots'] or 0,
                "total_found": bot_stats['total_found'] or 0
            },
            "activity": [dict(row) for row in activity_data],
            "system": {
                "status": "healthy",
                "last_updated": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        return {
            "users": {"total": 0, "admins": 0, "students": 0, "ngos": 0, "active": 0},
            "opportunities": {"total": 0, "verified": 0, "countries": 0},
            "bots": {"total": 0, "active": 0, "total_found": 0},
            "activity": [],
            "system": {"status": "error", "error": str(e)}
        }

@app.get("/api/admin/users")
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None
):
    """Get paginated list of users"""
    try:
        offset = (page - 1) * limit
        
        # Build base query
        base_query = """
            SELECT id, email, user_type, is_active, created_at,
                   COALESCE(credits, 0) as credits
            FROM users
        """
        
        where_clause = ""
        params = []
        
        if search:
            where_clause = " WHERE email ILIKE %s"
            params.append(f"%{search}%")
        
        # Get users
        users_query = f"{base_query}{where_clause} ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        users = admin_db.execute_query(users_query, params)
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM users{where_clause}"
        count_params = params[:-2] if search else []
        total = admin_db.execute_query(count_query, count_params)[0]['total']
        
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

@app.get("/api/admin/opportunities")
async def get_opportunities(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    verified_only: bool = False
):
    """Get paginated opportunities"""
    try:
        offset = (page - 1) * limit
        
        where_clause = "WHERE is_active = true"
        if verified_only:
            where_clause += " AND is_verified = true"
        
        # Get opportunities
        query = f"""
            SELECT id, title, description, country, sector, source_name,
                   is_verified, is_active, created_at,
                   COALESCE(amount_min, 0) as amount_min,
                   COALESCE(amount_max, 0) as amount_max,
                   COALESCE(currency, 'USD') as currency
            FROM donor_opportunities
            {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        
        opportunities = admin_db.execute_query(query, [limit, offset])
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM donor_opportunities {where_clause}"
        total = admin_db.execute_query(count_query)[0]['total']
        
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

@app.get("/api/admin/bots")
async def get_bots():
    """Get bot status and statistics"""
    try:
        query = """
            SELECT id, name, country, status, last_run,
                   COALESCE(opportunities_found, 0) as opportunities_found,
                   COALESCE(reward_points, 0) as reward_points,
                   COALESCE(success_rate, 0) as success_rate
            FROM search_bots
            ORDER BY last_run DESC NULLS LAST
        """
        
        bots = admin_db.execute_query(query)
        
        return {"bots": [dict(row) for row in bots]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: str):
    """Toggle user active status"""
    try:
        query = """
            UPDATE users 
            SET is_active = NOT is_active 
            WHERE id = %s 
            RETURNING is_active
        """
        
        result = admin_db.execute_query(query, [user_id])
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        new_status = result[0]['is_active']
        return {"message": f"User {'activated' if new_status else 'deactivated'}", "is_active": new_status}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/opportunities/{opportunity_id}/verify")
async def verify_opportunity(opportunity_id: str):
    """Verify an opportunity"""
    try:
        query = """
            UPDATE donor_opportunities 
            SET is_verified = true, last_verified = NOW()
            WHERE id = %s
        """
        
        rows_affected = admin_db.execute_query(query, [opportunity_id], fetch=False)
        if rows_affected == 0:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        return {"message": "Opportunity verified successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/bots/{bot_id}/run")
async def run_bot(bot_id: str):
    """Run a specific bot"""
    try:
        query = """
            UPDATE search_bots 
            SET status = 'running', last_run = NOW()
            WHERE id = %s
        """
        
        rows_affected = admin_db.execute_query(query, [bot_id], fetch=False)
        if rows_affected == 0:
            raise HTTPException(status_code=404, detail="Bot not found")
        
        return {"message": f"Bot {bot_id} started successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/system/logs")
async def get_system_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500)
):
    """Get system activity logs"""
    try:
        offset = (page - 1) * limit
        
        # Get recent opportunities as activity logs
        query = """
            SELECT id, title as action, source_name as source,
                   created_at, 'opportunity_created' as type
            FROM donor_opportunities
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        
        logs = admin_db.execute_query(query, [limit, offset])
        
        # Get total count
        total = admin_db.execute_query("SELECT COUNT(*) as total FROM donor_opportunities")[0]['total']
        
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
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)