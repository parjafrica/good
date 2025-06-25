"""
Granada OS - Secure Admin Dashboard (Wabden)
Enhanced admin interface with HR, Accounting, and Submissions management
"""

import os
import json
import psycopg2
from datetime import datetime, timedelta
import math
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse
from fastapi import FastAPI, Request, HTTPException, Form, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import hashlib

app = FastAPI(title="Granada OS Wabden System", description="Secure Administrative Dashboard")

# Mount static files (ensure directory exists)
import pathlib
static_dir = pathlib.Path("static")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

class DatabaseManager:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable not set")
    
    def _parse_db_url(self, url: str) -> Dict[str, str]:
        """Parse DATABASE_URL into connection parameters"""
        parsed = urlparse(url)
        return {
            'host': parsed.hostname,
            'port': parsed.port or 5432,
            'database': parsed.path[1:],
            'user': parsed.username,
            'password': parsed.password
        }
    
    def get_connection(self):
        """Get database connection"""
        params = self._parse_db_url(self.db_url)
        return psycopg2.connect(**params)

# Initialize database manager
db_manager = DatabaseManager()

@app.get("/", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    """Main admin dashboard"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get dashboard statistics
        stats = {}
        
        # User stats
        cursor.execute("SELECT COUNT(*) FROM users")
        stats['total_users'] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days'")
        stats['new_users_30d'] = cursor.fetchone()[0]
        
        # Opportunity stats
        cursor.execute("SELECT COUNT(*) FROM donor_opportunities")
        stats['total_opportunities'] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM donor_opportunities WHERE is_verified = true")
        stats['verified_opportunities'] = cursor.fetchone()[0]
        
        # Proposal stats
        cursor.execute("SELECT COUNT(*) FROM proposals")
        stats['total_proposals'] = cursor.fetchone()[0]
        
        # Bot stats
        cursor.execute("SELECT COUNT(*) FROM search_bots WHERE is_active = true")
        stats['active_bots'] = cursor.fetchone()[0]
        
        # Recent activity
        cursor.execute("""
            SELECT u.email, ui.action_type, ui.timestamp, ui.details
            FROM user_interactions ui
            JOIN users u ON ui.user_id = u.id
            ORDER BY ui.timestamp DESC
            LIMIT 10
        """)
        recent_activity = cursor.fetchall()
        
        # Financial data
        cursor.execute("SELECT SUM(amount) FROM credit_transactions WHERE transaction_type = 'purchase'")
        total_revenue = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT COUNT(*) FROM credit_transactions WHERE created_at >= NOW() - INTERVAL '7 days'")
        weekly_transactions = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return templates.TemplateResponse("dashboard.html", {
            "request": request,
            "stats": stats,
            "recent_activity": recent_activity,
            "total_revenue": total_revenue,
            "weekly_transactions": weekly_transactions,
            "datetime": datetime,
            "now": datetime.now
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/users", response_class=HTMLResponse)
async def users_management(request: Request):
    """User management interface"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get all users with detailed info
        cursor.execute("""
            SELECT u.id, u.email, u.first_name, u.last_name, u.user_type, 
                   u.credits, u.is_banned, u.created_at, u.last_login,
                   COUNT(p.id) as proposal_count,
                   COALESCE(SUM(ct.amount), 0) as total_spent
            FROM users u
            LEFT JOIN proposals p ON u.id = p.user_id
            LEFT JOIN credit_transactions ct ON u.id = ct.user_id AND ct.transaction_type = 'purchase'
            GROUP BY u.id, u.email, u.first_name, u.last_name, u.user_type, 
                     u.credits, u.is_banned, u.created_at, u.last_login
            ORDER BY u.created_at DESC
        """)
        users = cursor.fetchall()
        
        # Get user type statistics
        cursor.execute("SELECT user_type, COUNT(*) FROM users GROUP BY user_type")
        user_type_stats = dict(cursor.fetchall())
        
        cursor.close()
        conn.close()
        
        return templates.TemplateResponse("users.html", {
            "request": request,
            "users": users,
            "user_type_stats": user_type_stats,
            "datetime": datetime
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/opportunities", response_class=HTMLResponse)
async def opportunities_management(request: Request):
    """Opportunities management interface"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get all opportunities
        cursor.execute("""
            SELECT id, title, description, amount_min, amount_max, currency,
                   deadline, country, sector, is_verified, source_name,
                   scraped_at, source_url
            FROM donor_opportunities
            ORDER BY scraped_at DESC
            LIMIT 100
        """)
        opportunities = cursor.fetchall()
        
        # Get opportunity statistics
        cursor.execute("SELECT country, COUNT(*) FROM donor_opportunities GROUP BY country ORDER BY COUNT(*) DESC LIMIT 10")
        country_stats = cursor.fetchall()
        
        cursor.execute("SELECT sector, COUNT(*) FROM donor_opportunities WHERE sector IS NOT NULL GROUP BY sector ORDER BY COUNT(*) DESC LIMIT 10")
        sector_stats = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return templates.TemplateResponse("opportunities.html", {
            "request": request,
            "opportunities": opportunities,
            "country_stats": country_stats,
            "sector_stats": sector_stats
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/hr", response_class=HTMLResponse)
async def hr_management(request: Request):
    """HR Management interface"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get HR statistics and data
        cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'staff'")
        total_staff = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'admin'")
        total_admins = cursor.fetchone()[0]
        
        # Mock employee data for demo
        employees = [
            {"id": 1, "name": "Sarah Johnson", "position": "Project Manager", "department": "Operations", "status": "Active", "hire_date": "2023-01-15"},
            {"id": 2, "name": "Michael Chen", "position": "Data Analyst", "department": "Analytics", "status": "Active", "hire_date": "2023-03-20"},
            {"id": 3, "name": "Emily Rodriguez", "position": "HR Coordinator", "department": "Human Resources", "status": "On Leave", "hire_date": "2022-11-10"},
        ]
        
        cursor.close()
        conn.close()
        
        return templates.TemplateResponse("hr.html", {
            "request": request,
            "total_staff": total_staff,
            "total_admins": total_admins,
            "employees": employees
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/accounting", response_class=HTMLResponse)
async def accounting_management(request: Request):
    """Accounting & Finance interface"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get financial data
        cursor.execute("SELECT SUM(amount) FROM credit_transactions WHERE transaction_type = 'purchase'")
        total_revenue = cursor.fetchone()[0] or 0
        
        cursor.execute("""
            SELECT SUM(amount) FROM credit_transactions 
            WHERE transaction_type = 'purchase' 
            AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
        """)
        monthly_revenue = cursor.fetchone()[0] or 0
        
        # Get recent transactions
        cursor.execute("""
            SELECT ct.amount, ct.transaction_type, ct.created_at, u.email
            FROM credit_transactions ct
            JOIN users u ON ct.user_id = u.id
            ORDER BY ct.created_at DESC
            LIMIT 20
        """)
        recent_transactions = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return templates.TemplateResponse("accounting.html", {
            "request": request,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "recent_transactions": recent_transactions
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/submissions", response_class=HTMLResponse)
async def submissions_management(request: Request):
    """User Submissions & Requests interface"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get proposals/submissions data
        cursor.execute("""
            SELECT p.id, p.title, p.content, p.status, p.created_at,
                   u.email, u.first_name, u.last_name
            FROM proposals p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 50
        """)
        submissions = cursor.fetchall()
        
        # Get submission statistics
        cursor.execute("SELECT status, COUNT(*) FROM proposals GROUP BY status")
        status_stats = dict(cursor.fetchall())
        
        cursor.close()
        conn.close()
        
        return templates.TemplateResponse("submissions.html", {
            "request": request,
            "submissions": submissions,
            "status_stats": status_stats
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/bots", response_class=HTMLResponse)
async def bots_management(request: Request):
    """Bot management interface"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get bot data
        cursor.execute("""
            SELECT id, name, country, is_active, total_runs, 
                   opportunities_found, last_run, success_rate
            FROM search_bots
            ORDER BY last_run DESC
        """)
        bots = cursor.fetchall()
        
        # Get bot statistics
        cursor.execute("SELECT COUNT(*) FROM search_bots WHERE is_active = true")
        active_bots = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(opportunities_found) FROM search_bots")
        total_opportunities_found = cursor.fetchone()[0] or 0
        
        cursor.close()
        conn.close()
        
        return templates.TemplateResponse("bots.html", {
            "request": request,
            "bots": bots,
            "active_bots": active_bots,
            "total_opportunities_found": total_opportunities_found
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# API Endpoints
@app.post("/api/users/{user_id}/ban")
async def ban_user(user_id: str):
    """Ban a user"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE users SET is_banned = true WHERE id = %s", (user_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {"status": "success", "message": "User banned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{user_id}/unban")
async def unban_user(user_id: str):
    """Unban a user"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE users SET is_banned = false WHERE id = %s", (user_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {"status": "success", "message": "User unbanned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/opportunities/{opp_id}/verify")
async def verify_opportunity(opp_id: str):
    """Verify an opportunity"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE donor_opportunities SET is_verified = true WHERE id = %s", (opp_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {"status": "success", "message": "Opportunity verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/revenue")
async def get_revenue_analytics():
    """Get revenue analytics data"""
    try:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        # Get monthly revenue for the last 12 months
        cursor.execute("""
            SELECT DATE_TRUNC('month', created_at) as month,
                   SUM(amount) as revenue
            FROM credit_transactions
            WHERE transaction_type = 'purchase'
            AND created_at >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month
        """)
        monthly_data = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "monthly_revenue": [
                {"month": row[0].strftime("%Y-%m"), "revenue": float(row[1])}
                for row in monthly_data
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)