"""
Granada OS - Secure Admin Dashboard (Wabden)
Enhanced admin interface with HR, Accounting, and Submissions management
"""

import os
import json
from datetime import datetime, timedelta
import math
from typing import Dict, List, Optional, Any
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

class MockDataProvider:
    """Provides realistic mock data for admin dashboard"""
    
    def get_dashboard_stats(self):
        return {
            'total_users': 1847,
            'new_users_30d': 234,
            'total_opportunities': 3421,
            'verified_opportunities': 2987,
            'total_proposals': 892,
            'active_bots': 7
        }
    
    def get_recent_activity(self):
        activities = [
            ('john.doe@example.com', 'proposal_submitted', datetime.now() - timedelta(minutes=5), 'Education Grant Proposal'),
            ('sarah.wilson@ngo.org', 'user_registered', datetime.now() - timedelta(minutes=15), 'New NGO registration'),
            ('mike.chen@startup.co', 'opportunity_viewed', datetime.now() - timedelta(minutes=23), 'Tech Innovation Fund'),
            ('admin@system', 'bot_completed', datetime.now() - timedelta(minutes=35), 'ReliefWeb scraping completed'),
            ('user@domain.com', 'proposal_approved', datetime.now() - timedelta(hours=1), 'Healthcare Initiative'),
        ]
        return activities
    
    def get_users_data(self):
        users = [
            ('user1', 'john.doe@example.com', 'John', 'Doe', 'student', 150, False, datetime.now() - timedelta(days=30), datetime.now() - timedelta(hours=2), 3, 45.50),
            ('user2', 'sarah.wilson@ngo.org', 'Sarah', 'Wilson', 'ngo', 300, False, datetime.now() - timedelta(days=15), datetime.now() - timedelta(hours=1), 8, 120.00),
            ('user3', 'mike.chen@startup.co', 'Mike', 'Chen', 'business', 500, False, datetime.now() - timedelta(days=45), datetime.now() - timedelta(minutes=30), 12, 250.75),
            ('user4', 'admin@system', 'Admin', 'User', 'admin', 1000, False, datetime.now() - timedelta(days=90), datetime.now() - timedelta(minutes=5), 0, 0.00),
        ]
        return users
    
    def get_opportunities_data(self):
        opportunities = [
            ('opp1', 'Education Innovation Grant', 'Supporting innovative educational technologies...', 50000, 150000, 'USD', datetime.now() + timedelta(days=30), 'Kenya', 'education', True, 'GrantSpace', datetime.now() - timedelta(days=2), 'https://grantspace.org/education'),
            ('opp2', 'Healthcare Development Fund', 'Improving healthcare access in rural areas...', 25000, 100000, 'USD', datetime.now() + timedelta(days=45), 'Uganda', 'health', True, 'ReliefWeb', datetime.now() - timedelta(days=1), 'https://reliefweb.int/health'),
            ('opp3', 'Agricultural Innovation Program', 'Sustainable farming technologies for Africa...', 75000, 300000, 'USD', None, 'South Sudan', 'agriculture', False, 'UN Jobs', datetime.now() - timedelta(hours=6), 'https://jobs.un.org/agriculture'),
        ]
        return opportunities
    
    def get_bots_data(self):
        bots = [
            ('bot1', 'ReliefWeb Scraper', 'Kenya', True, 45, 234, datetime.now() - timedelta(hours=2), 94.5),
            ('bot2', 'GrantSpace Monitor', 'Uganda', True, 38, 187, datetime.now() - timedelta(hours=1), 91.2),
            ('bot3', 'UN Jobs Crawler', 'South Sudan', False, 23, 156, datetime.now() - timedelta(days=1), 88.7),
            ('bot4', 'EU Portal Scanner', 'East Africa', True, 67, 345, datetime.now() - timedelta(minutes=30), 96.1),
        ]
        return bots
    
    def get_proposals_data(self):
        proposals = [
            ('prop1', 'Community Health Initiative', 'Comprehensive healthcare program for rural communities...', 'pending', datetime.now() - timedelta(days=2), 'john.doe@example.com', 'John', 'Doe'),
            ('prop2', 'Education Technology Project', 'Digital learning platform for underserved schools...', 'approved', datetime.now() - timedelta(days=5), 'sarah.wilson@ngo.org', 'Sarah', 'Wilson'),
            ('prop3', 'Agricultural Development Program', 'Sustainable farming techniques training...', 'in_progress', datetime.now() - timedelta(days=8), 'mike.chen@startup.co', 'Mike', 'Chen'),
        ]
        return proposals

# Initialize data provider
data_provider = MockDataProvider()

@app.get("/", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    """Main admin dashboard"""
    try:
        stats = data_provider.get_dashboard_stats()
        recent_activity = data_provider.get_recent_activity()
        total_revenue = 47850.75
        weekly_transactions = 89
        
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
        raise HTTPException(status_code=500, detail=f"Error loading dashboard: {str(e)}")

@app.get("/users", response_class=HTMLResponse)
async def users_management(request: Request):
    """User management interface"""
    try:
        users = data_provider.get_users_data()
        user_type_stats = {'student': 892, 'ngo': 456, 'business': 234, 'admin': 8}
        
        return templates.TemplateResponse("users.html", {
            "request": request,
            "users": users,
            "user_type_stats": user_type_stats,
            "datetime": datetime
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading users: {str(e)}")

@app.get("/opportunities", response_class=HTMLResponse)
async def opportunities_management(request: Request):
    """Opportunities management interface"""
    try:
        opportunities = data_provider.get_opportunities_data()
        country_stats = [('Kenya', 456), ('Uganda', 234), ('South Sudan', 189), ('Tanzania', 167)]
        sector_stats = [('education', 234), ('health', 189), ('agriculture', 156), ('technology', 134)]
        
        return templates.TemplateResponse("opportunities.html", {
            "request": request,
            "opportunities": opportunities,
            "country_stats": country_stats,
            "sector_stats": sector_stats,
            "datetime": datetime
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading opportunities: {str(e)}")

@app.get("/hr", response_class=HTMLResponse)
async def hr_management(request: Request):
    """HR Management interface"""
    try:
        total_staff = 23
        total_admins = 5
        
        employees = [
            {"id": 1, "name": "Sarah Johnson", "position": "Project Manager", "department": "Operations", "status": "Active", "hire_date": "2023-01-15"},
            {"id": 2, "name": "Michael Chen", "position": "Data Analyst", "department": "Analytics", "status": "Active", "hire_date": "2023-03-20"},
            {"id": 3, "name": "Emily Rodriguez", "position": "HR Coordinator", "department": "Human Resources", "status": "On Leave", "hire_date": "2022-11-10"},
        ]
        
        return templates.TemplateResponse("hr.html", {
            "request": request,
            "total_staff": total_staff,
            "total_admins": total_admins,
            "employees": employees,
            "datetime": datetime,
            "timedelta": timedelta
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading HR data: {str(e)}")

@app.get("/accounting", response_class=HTMLResponse)
async def accounting_management(request: Request):
    """Accounting & Finance interface"""
    try:
        total_revenue = 125750.25
        monthly_revenue = 23450.80
        
        recent_transactions = [
            (125.00, 'purchase', datetime.now() - timedelta(hours=2), 'john.doe@example.com'),
            (250.00, 'purchase', datetime.now() - timedelta(hours=5), 'sarah.wilson@ngo.org'),
            (75.00, 'purchase', datetime.now() - timedelta(days=1), 'mike.chen@startup.co'),
            (300.00, 'purchase', datetime.now() - timedelta(days=2), 'admin@system'),
        ]
        
        return templates.TemplateResponse("accounting.html", {
            "request": request,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "recent_transactions": recent_transactions,
            "datetime": datetime,
            "timedelta": timedelta
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading accounting data: {str(e)}")

@app.get("/submissions", response_class=HTMLResponse)
async def submissions_management(request: Request):
    """User Submissions & Requests interface"""
    try:
        submissions = data_provider.get_proposals_data()
        status_stats = {'pending': 45, 'approved': 234, 'in_progress': 67, 'completed': 189, 'rejected': 23}
        
        return templates.TemplateResponse("submissions.html", {
            "request": request,
            "submissions": submissions,
            "status_stats": status_stats,
            "datetime": datetime,
            "timedelta": timedelta
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading submissions: {str(e)}")

@app.get("/bots", response_class=HTMLResponse)
async def bots_management(request: Request):
    """Bot management interface"""
    try:
        bots = data_provider.get_bots_data()
        active_bots = 4
        total_opportunities_found = 922
        
        return templates.TemplateResponse("bots.html", {
            "request": request,
            "bots": bots,
            "active_bots": active_bots,
            "total_opportunities_found": total_opportunities_found,
            "datetime": datetime,
            "timedelta": timedelta
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading bots data: {str(e)}")

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