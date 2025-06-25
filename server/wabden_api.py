#!/usr/bin/env python3
"""
Granada OS Wabden Admin API
Python FastAPI backend for admin user management with professional CSV exports
"""

import os
import io
import csv
import uuid
import json
import hashlib
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse

app = FastAPI(
    title="Granada OS Wabden Admin API",
    description="Professional admin interface backend with CSV export capabilities",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class User(BaseModel):
    id: str
    email: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    userType: str
    credits: int = 0
    isBanned: bool = False
    createdAt: datetime
    lastLogin: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    firstName: str
    lastName: str
    userType: str
    credits: int = 100

class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    userType: Optional[str] = None
    credits: Optional[int] = None
    isBanned: Optional[bool] = None

# Database connection
def get_db_connection():
    """Get database connection from environment"""
    try:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise Exception("DATABASE_URL not found")
        
        # Parse the URL
        parsed = urlparse(database_url)
        
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port,
            database=parsed.path[1:],  # Remove leading slash
            user=parsed.username,
            password=parsed.password,
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# Sample data for demonstration
SAMPLE_USERS = [
    {
        'id': 'user1',
        'email': 'john.doe@student.edu',
        'firstName': 'John',
        'lastName': 'Doe',
        'userType': 'student',
        'credits': 150,
        'isBanned': False,
        'createdAt': datetime(2024, 1, 15),
        'lastLogin': datetime(2024, 12, 20)
    },
    {
        'id': 'user2',
        'email': 'sarah.wilson@ngo.org',
        'firstName': 'Sarah',
        'lastName': 'Wilson',
        'userType': 'ngo',
        'credits': 300,
        'isBanned': False,
        'createdAt': datetime(2024, 2, 20),
        'lastLogin': datetime(2024, 12, 19)
    },
    {
        'id': 'user3',
        'email': 'mike.chen@startup.co',
        'firstName': 'Mike',
        'lastName': 'Chen',
        'userType': 'business',
        'credits': 500,
        'isBanned': False,
        'createdAt': datetime(2024, 3, 10),
        'lastLogin': datetime(2024, 12, 18)
    },
    {
        'id': 'user4',
        'email': 'banned.user@example.com',
        'firstName': 'Banned',
        'lastName': 'User',
        'userType': 'student',
        'credits': 0,
        'isBanned': True,
        'createdAt': datetime(2024, 4, 5),
        'lastLogin': datetime(2024, 12, 10)
    },
    {
        'id': 'user5',
        'email': 'admin@granada.os',
        'firstName': 'System',
        'lastName': 'Admin',
        'userType': 'admin',
        'credits': 1000,
        'isBanned': False,
        'createdAt': datetime(2024, 1, 1),
        'lastLogin': datetime(2024, 12, 25)
    }
]

def get_all_users():
    """Get all users from database or return sample data"""
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, email, first_name as firstName, last_name as lastName, 
                           user_type as userType, credits, is_banned as isBanned,
                           created_at as createdAt
                    FROM users 
                    ORDER BY created_at DESC
                """)
                users = cur.fetchall()
                result = []
                for user in users:
                    user_dict = dict(user)
                    # Convert datetime to string for JSON serialization
                    if user_dict.get('createdAt'):
                        user_dict['createdAt'] = user_dict['createdAt'].isoformat()
                    result.append(user_dict)
                return result
        except Exception as e:
            print(f"Database query error: {e}")
        finally:
            conn.close()
    
    # Return sample data if database unavailable
    return SAMPLE_USERS

def create_professional_csv(users: List[Dict], export_type: str = "users") -> str:
    """Create professionally formatted CSV with Granada branding"""
    output = io.StringIO()
    
    # Granada OS Header with branding
    header_lines = [
        "# GRANADA OS - FUNDING OPPORTUNITIES PLATFORM",
        "# Professional User Management System",
        "# Export Generated: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "# Report Type: User Database Export",
        "# Total Records: " + str(len(users)),
        "#",
        "# ════════════════════════════════════════════════════════",
        "# CONFIDENTIAL - Granada OS Internal Use Only",
        "# ════════════════════════════════════════════════════════",
        "#"
    ]
    
    # Write header
    for line in header_lines:
        output.write(line + "\n")
    
    # Create CSV writer
    writer = csv.writer(output)
    
    # Column headers
    headers = [
        "User ID",
        "Email Address", 
        "First Name",
        "Last Name",
        "Full Name",
        "User Type",
        "Credits Balance",
        "Account Status",
        "Registration Date",
        "Last Login",
        "Days Since Login",
        "Account Age (Days)"
    ]
    
    writer.writerow(headers)
    
    # Data rows
    for user in users:
        created_date = user.get('createdAt')
        last_login = user.get('lastLogin')
        
        if isinstance(created_date, str):
            created_date = datetime.fromisoformat(created_date.replace('Z', '+00:00'))
        if isinstance(last_login, str):
            last_login = datetime.fromisoformat(last_login.replace('Z', '+00:00'))
        
        # Calculate days
        now = datetime.now()
        days_since_login = (now - last_login).days if last_login else "Never"
        account_age = (now - created_date).days if created_date else 0
        
        # Full name
        full_name = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
        
        # Status
        status = "BANNED" if user.get('isBanned', False) else "ACTIVE"
        
        row = [
            user.get('id', ''),
            user.get('email', ''),
            user.get('firstName', ''),
            user.get('lastName', ''),
            full_name,
            user.get('userType', '').upper(),
            user.get('credits', 0),
            status,
            created_date.strftime("%Y-%m-%d %H:%M") if created_date else '',
            last_login.strftime("%Y-%m-%d %H:%M") if last_login else 'Never',
            days_since_login if isinstance(days_since_login, str) else f"{days_since_login} days",
            f"{account_age} days"
        ]
        
        writer.writerow(row)
    
    # Footer with statistics
    footer_lines = [
        "",
        "# ════════════════════════════════════════════════════════",
        "# EXPORT STATISTICS",
        "# ════════════════════════════════════════════════════════",
    ]
    
    # Calculate statistics
    total_users = len(users)
    active_users = len([u for u in users if not u.get('isBanned', False)])
    banned_users = total_users - active_users
    total_credits = sum(u.get('credits', 0) for u in users)
    
    # User type breakdown
    user_types = {}
    for user in users:
        user_type = user.get('userType', 'unknown')
        user_types[user_type] = user_types.get(user_type, 0) + 1
    
    footer_lines.extend([
        f"# Total Users: {total_users}",
        f"# Active Users: {active_users}",
        f"# Banned Users: {banned_users}",
        f"# Total Credits in System: {total_credits:,}",
        f"# Average Credits per User: {total_credits // total_users if total_users > 0 else 0}",
        "#"
    ])
    
    for user_type, count in user_types.items():
        footer_lines.append(f"# {user_type.title()} Users: {count}")
    
    footer_lines.extend([
        "#",
        "# Generated by Granada OS Wabden Admin System",
        "# https://granada.os - Professional Funding Platform",
        "# ════════════════════════════════════════════════════════"
    ])
    
    # Write footer
    for line in footer_lines:
        output.write("\n" + line)
    
    csv_content = output.getvalue()
    output.close()
    
    return csv_content

# API Endpoints

@app.get("/")
async def root():
    return {
        "service": "Granada OS Wabden Admin API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "users": "/api/users",
            "export": "/api/export/users",
            "docs": "/docs"
        }
    }

@app.get("/api/users")
async def get_users():
    """Get all users with statistics"""
    try:
        users = get_all_users()
        
        # Calculate user statistics
        user_stats = {}
        for user in users:
            user_type = user.get('userType', 'unknown')
            user_stats[user_type] = user_stats.get(user_type, 0) + 1
        
        return {
            "users": users,
            "userStats": user_stats,
            "total": len(users),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@app.post("/api/users")
async def create_user(user_data: UserCreate):
    """Create a new user"""
    try:
        # Generate new user ID
        new_user_id = str(uuid.uuid4())
        
        # For demonstration, add to sample data
        new_user = {
            'id': new_user_id,
            'email': user_data.email,
            'firstName': user_data.firstName,
            'lastName': user_data.lastName,
            'userType': user_data.userType,
            'credits': user_data.credits,
            'isBanned': False,
            'createdAt': datetime.now(),
            'lastLogin': None
        }
        
        SAMPLE_USERS.append(new_user)
        
        return {
            "success": True,
            "message": "User created successfully",
            "user": new_user
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@app.patch("/api/users/{user_id}")
async def update_user(user_id: str, user_data: UserUpdate):
    """Update user information"""
    try:
        # Find user in sample data
        for user in SAMPLE_USERS:
            if user['id'] == user_id:
                if user_data.firstName is not None:
                    user['firstName'] = user_data.firstName
                if user_data.lastName is not None:
                    user['lastName'] = user_data.lastName
                if user_data.userType is not None:
                    user['userType'] = user_data.userType
                if user_data.credits is not None:
                    user['credits'] = user_data.credits
                if user_data.isBanned is not None:
                    user['isBanned'] = user_data.isBanned
                
                return {
                    "success": True,
                    "message": "User updated successfully",
                    "user": user
                }
        
        raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

@app.post("/api/users/{user_id}/ban")
async def ban_user(user_id: str):
    """Ban a user"""
    try:
        for user in SAMPLE_USERS:
            if user['id'] == user_id:
                user['isBanned'] = True
                return {
                    "success": True,
                    "message": "User banned successfully"
                }
        
        raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ban user: {str(e)}")

@app.post("/api/users/{user_id}/unban")
async def unban_user(user_id: str):
    """Unban a user"""
    try:
        for user in SAMPLE_USERS:
            if user['id'] == user_id:
                user['isBanned'] = False
                return {
                    "success": True,
                    "message": "User unbanned successfully"
                }
        
        raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unban user: {str(e)}")

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str):
    """Delete a user"""
    try:
        global SAMPLE_USERS
        original_length = len(SAMPLE_USERS)
        SAMPLE_USERS = [user for user in SAMPLE_USERS if user['id'] != user_id]
        
        if len(SAMPLE_USERS) < original_length:
            return {
                "success": True,
                "message": "User deleted successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")

@app.get("/api/export/users")
async def export_users_csv():
    """Export users as professionally formatted CSV"""
    try:
        users = get_all_users()
        csv_content = create_professional_csv(users, "users")
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"granada_os_users_export_{timestamp}.csv"
        
        # Return CSV as download
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "text/csv; charset=utf-8"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export users: {str(e)}")

@app.get("/api/activity/heatmap")
async def get_activity_heatmap():
    """Get user activity heatmap data for visualization"""
    try:
        conn = get_db_connection()
        if not conn:
            # Return mock heatmap data for demonstration
            return generate_mock_heatmap_data()
        
        with conn.cursor() as cur:
            # Get hourly activity data for the last 7 days
            cur.execute("""
                SELECT 
                    EXTRACT(hour FROM created_at) as hour,
                    EXTRACT(dow FROM created_at) as day_of_week,
                    COUNT(*) as activity_count,
                    DATE(created_at) as activity_date
                FROM user_interactions 
                WHERE created_at >= NOW() - INTERVAL '7 days'
                GROUP BY hour, day_of_week, activity_date
                ORDER BY activity_date DESC, hour
            """)
            activity_data = cur.fetchall()
            
            # Get geographic distribution
            cur.execute("""
                SELECT 
                    COALESCE(country, 'Unknown') as country,
                    COUNT(DISTINCT user_id) as user_count,
                    COUNT(*) as interaction_count
                FROM user_interactions ui
                LEFT JOIN users u ON ui.user_id = u.id
                WHERE ui.created_at >= NOW() - INTERVAL '7 days'
                GROUP BY country
                ORDER BY interaction_count DESC
                LIMIT 10
            """)
            geo_data = cur.fetchall()
            
            # Get peak activity times
            cur.execute("""
                SELECT 
                    EXTRACT(hour FROM created_at) as hour,
                    COUNT(*) as activity_count,
                    AVG(COUNT(*)) OVER() as avg_activity
                FROM user_interactions 
                WHERE created_at >= NOW() - INTERVAL '7 days'
                GROUP BY hour
                ORDER BY hour
            """)
            hourly_peaks = cur.fetchall()
            
        conn.close()
        
        return {
            "heatmap_data": [dict(row) for row in activity_data],
            "geographic_data": [dict(row) for row in geo_data],
            "hourly_peaks": [dict(row) for row in hourly_peaks],
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Heatmap data error: {e}")
        return generate_mock_heatmap_data()

def generate_mock_heatmap_data():
    """Generate realistic heatmap data for demonstration"""
    import random
    from datetime import timedelta
    
    # Generate hourly activity data for 7 days
    heatmap_data = []
    for day in range(7):
        for hour in range(24):
            # Simulate realistic activity patterns (higher during business hours)
            base_activity = 10 if 9 <= hour <= 17 else 3
            activity_count = random.randint(base_activity, base_activity * 3)
            
            heatmap_data.append({
                "hour": hour,
                "day_of_week": day,
                "activity_count": activity_count,
                "activity_date": (datetime.now() - timedelta(days=day)).strftime("%Y-%m-%d")
            })
    
    # Geographic data
    geographic_data = [
        {"country": "Kenya", "user_count": 234, "interaction_count": 1567},
        {"country": "Uganda", "user_count": 187, "interaction_count": 1234},
        {"country": "South Sudan", "user_count": 145, "interaction_count": 892},
        {"country": "Tanzania", "user_count": 98, "interaction_count": 654},
        {"country": "Rwanda", "user_count": 76, "interaction_count": 432},
        {"country": "Global", "user_count": 312, "interaction_count": 2156}
    ]
    
    # Hourly peaks
    hourly_peaks = []
    for hour in range(24):
        base_activity = 15 if 9 <= hour <= 17 else 5
        activity_count = random.randint(base_activity, base_activity * 2)
        hourly_peaks.append({
            "hour": hour,
            "activity_count": activity_count,
            "avg_activity": 25.5
        })
    
    return {
        "heatmap_data": heatmap_data,
        "geographic_data": geographic_data,
        "hourly_peaks": hourly_peaks,
        "last_updated": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)