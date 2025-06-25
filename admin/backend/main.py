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
from database_manager import db_manager

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

@app.get("/admin/submissions", response_class=HTMLResponse)
async def admin_submissions_page(request: Request):
    """Serve submissions management page"""
    return templates.TemplateResponse("submissions.html", {"request": request})

@app.get("/admin/hr", response_class=HTMLResponse)
async def admin_hr_page(request: Request):
    """Serve HR management page"""
    return templates.TemplateResponse("hr.html", {"request": request})

@app.get("/admin/accounting", response_class=HTMLResponse)
async def admin_accounting_page(request: Request):
    """Serve accounting management page"""
    return templates.TemplateResponse("accounting.html", {"request": request})

@app.get("/admin/analytics", response_class=HTMLResponse)
async def admin_analytics_page(request: Request):
    """Serve analytics page"""
    return templates.TemplateResponse("analytics.html", {"request": request})

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
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
                COUNT(CASE WHEN is_banned = true THEN 1 END) as banned_users
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
                action_type,
                DATE(created_at) as date,
                COUNT(*) as count
            FROM user_interactions 
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY action_type, DATE(created_at)
            ORDER BY date DESC, count DESC
            LIMIT 20
        """
        activity_data = admin_db.execute_query(activity_query)
        
        return {
            "users": {
                "total": user_stats['total_users'] or 0,
                "admins": user_stats['admin_users'] or 0,
                "students": user_stats['student_users'] or 0,
                "ngos": user_stats['ngo_users'] or 0,
                "active": user_stats['active_users'] or 0,
                "banned": user_stats['banned_users'] or 0
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
            SELECT id, email, first_name, last_name, user_type, is_active, 
                   is_banned, country, sector, organization_type, created_at,
                   COALESCE(credits, 0) as credits
            FROM users
        """
        
        where_clause = ""
        params = []
        
        if search:
            where_clause = " WHERE (email ILIKE %s OR first_name ILIKE %s OR last_name ILIKE %s)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])
        
        # Get users
        users_query = f"{base_query}{where_clause} ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        users = admin_db.execute_query(users_query, params)
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM users{where_clause}"
        count_params = params[:-2] if search else []
        if search and len(params) >= 5:  # Adjusted for 3 search terms
            count_params = params[:-2]
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

@app.get("/api/admin/analytics/users")
async def get_user_analytics(days: int = Query(30, ge=1, le=365)):
    """Get comprehensive user analytics"""
    try:
        analytics = db_manager.get_user_analytics(days)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/analytics/opportunities") 
async def get_opportunity_analytics(days: int = Query(30, ge=1, le=365)):
    """Get comprehensive opportunity analytics"""
    try:
        analytics = db_manager.get_opportunity_analytics(days)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/analytics/bots")
async def get_bot_analytics():
    """Get comprehensive bot analytics"""
    try:
        analytics = db_manager.get_bot_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/analytics/financial")
async def get_financial_analytics():
    """Get financial and credit analytics"""
    try:
        analytics = db_manager.get_financial_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/system/health")
async def get_system_health():
    """Get comprehensive system health metrics"""
    try:
        health = db_manager.get_system_health()
        return health
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/system/cleanup")
async def cleanup_system(days: int = Query(90, ge=30, le=365)):
    """Clean up old data and optimize database"""
    try:
        results = db_manager.cleanup_old_data(days)
        return {"message": "Cleanup completed", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/export/{table_name}")
async def export_table_data(table_name: str):
    """Export data from specified table"""
    allowed_tables = ['users', 'donor_opportunities', 'user_interactions', 'credit_transactions', 'search_bots']
    
    if table_name not in allowed_tables:
        raise HTTPException(status_code=400, detail="Table not allowed for export")
    
    try:
        data = db_manager.export_data(table_name)
        return {"data": data, "count": len(data), "table": table_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/users/{user_id}/credits")
async def adjust_user_credits(user_id: str, adjustment: Dict[str, Any]):
    """Adjust user credits with transaction logging"""
    try:
        amount = adjustment.get('amount', 0)
        reason = adjustment.get('reason', 'Admin adjustment')
        
        # Update user credits
        update_query = """
            UPDATE users SET credits = credits + %s
            WHERE id = %s
            RETURNING credits
        """
        
        result = admin_db.execute_query(update_query, [amount, user_id])
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        new_balance = result[0]['credits']
        
        # Record transaction
        transaction_query = """
            INSERT INTO credit_transactions (
                user_id, amount, transaction_type, description, created_at
            ) VALUES (%s, %s, %s, %s, NOW())
        """
        
        admin_db.execute_query(transaction_query, [user_id, amount, 'admin_adjustment', reason], fetch=False)
        
        # Log interaction
        interaction_query = """
            INSERT INTO user_interactions (
                user_id, action_type, action_details, created_at
            ) VALUES (%s, %s, %s, NOW())
        """
        
        action_details = json.dumps({
            'amount': amount,
            'reason': reason,
            'new_balance': new_balance,
            'admin_action': True
        })
        
        admin_db.execute_query(interaction_query, [user_id, 'credit_adjustment', action_details], fetch=False)
        
        return {
            "message": "Credits adjusted successfully",
            "new_balance": new_balance,
            "adjustment": amount
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/users/{user_id}/ban")
async def ban_user(user_id: str):
    """Ban a user with logging"""
    try:
        query = """
            UPDATE users 
            SET is_banned = true, is_active = false 
            WHERE id = %s 
            RETURNING email
        """
        
        result = admin_db.execute_query(query, [user_id])
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_email = result[0]['email']
        
        # Log admin action
        interaction_query = """
            INSERT INTO user_interactions (
                user_id, action_type, action_details, created_at
            ) VALUES (%s, %s, %s, NOW())
        """
        
        action_details = json.dumps({
            'action': 'user_banned',
            'email': user_email,
            'admin_action': True
        })
        
        admin_db.execute_query(interaction_query, [user_id, 'admin_ban_user', action_details], fetch=False)
        
        return {"message": f"User {user_email} banned successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/users/{user_id}/unban")
async def unban_user(user_id: str):
    """Unban a user with logging"""
    try:
        query = """
            UPDATE users 
            SET is_banned = false, is_active = true 
            WHERE id = %s 
            RETURNING email
        """
        
        result = admin_db.execute_query(query, [user_id])
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_email = result[0]['email']
        
        # Log admin action
        interaction_query = """
            INSERT INTO user_interactions (
                user_id, action_type, action_details, created_at
            ) VALUES (%s, %s, %s, NOW())
        """
        
        action_details = json.dumps({
            'action': 'user_unbanned',
            'email': user_email,
            'admin_action': True
        })
        
        admin_db.execute_query(interaction_query, [user_id, 'admin_unban_user', action_details], fetch=False)
        
        return {"message": f"User {user_email} unbanned successfully"}
        
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