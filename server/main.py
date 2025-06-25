"""
Granada OS FastAPI Backend
Main API server for funding opportunities platform
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import json
from typing import Dict, List, Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
import requests
from datetime import datetime
import hashlib

app = FastAPI(
    title="Granada OS API",
    description="Funding opportunities platform API",
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

class DatabaseManager:
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

db_manager = DatabaseManager()

@app.get("/")
async def root():
    return {"message": "Granada OS FastAPI Backend", "status": "running"}

@app.get("/health")
async def health_check():
    try:
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/opportunities")
async def get_opportunities(
    country: Optional[str] = None,
    sector: Optional[str] = None,
    verified_only: bool = False,
    limit: int = 50
):
    """Get funding opportunities with filters"""
    try:
        with db_manager.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                    SELECT id, title, description, amount_min, amount_max, currency,
                           deadline, source_url, source_name, country, sector,
                           eligibility_criteria, application_process, keywords,
                           focus_areas, is_verified, scraped_at, created_at
                    FROM donor_opportunities
                    WHERE is_active = true
                """
                params = []
                
                if country:
                    query += " AND (country = %s OR country = 'Global')"
                    params.append(country)
                
                if sector:
                    query += " AND sector = %s"
                    params.append(sector)
                
                if verified_only:
                    query += " AND is_verified = true"
                
                query += " ORDER BY created_at DESC LIMIT %s"
                params.append(limit)
                
                cursor.execute(query, params)
                opportunities = cursor.fetchall()
                
                return {"opportunities": [dict(row) for row in opportunities]}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/opportunities")
async def create_opportunity(opportunity_data: Dict[str, Any]):
    """Create a new funding opportunity"""
    try:
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO donor_opportunities (
                        title, description, amount_min, amount_max, currency,
                        deadline, source_url, source_name, country, sector,
                        eligibility_criteria, application_process, keywords,
                        focus_areas, content_hash, is_verified, is_active,
                        scraped_at, created_at, updated_at
                    ) VALUES (
                        %(title)s, %(description)s, %(amount_min)s, %(amount_max)s, %(currency)s,
                        %(deadline)s, %(source_url)s, %(source_name)s, %(country)s, %(sector)s,
                        %(eligibility_criteria)s, %(application_process)s, %(keywords)s,
                        %(focus_areas)s, %(content_hash)s, %(is_verified)s, %(is_active)s,
                        NOW(), NOW(), NOW()
                    ) RETURNING id
                """, opportunity_data)
                
                opportunity_id = cursor.fetchone()[0]
                conn.commit()
                
                return {"id": opportunity_id, "message": "Opportunity created successfully"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bots")
async def get_bots():
    """Get bot status and statistics"""
    try:
        with db_manager.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT id, name, country, status, last_run, 
                           opportunities_found, reward_points, success_rate
                    FROM search_bots
                    ORDER BY last_run DESC
                """)
                bots = cursor.fetchall()
                
                return {"bots": [dict(row) for row in bots]}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bots/{bot_id}/run")
async def run_bot(bot_id: str):
    """Run a specific bot"""
    try:
        # Update bot status to running
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE search_bots 
                    SET status = 'running', last_run = NOW()
                    WHERE id = %s
                """, (bot_id,))
                conn.commit()
                
        return {"message": f"Bot {bot_id} started successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/proposals/generate")
async def generate_proposal(
    opportunity_id: str = Form(...),
    user_input: str = Form(""),
    audio_file: Optional[UploadFile] = File(None)
):
    """Generate AI proposal content"""
    try:
        # Get opportunity details
        with db_manager.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT * FROM donor_opportunities WHERE id = %s
                """, (opportunity_id,))
                opportunity = cursor.fetchone()
                
                if not opportunity:
                    raise HTTPException(status_code=404, detail="Opportunity not found")
        
        # Process audio if provided
        transcribed_text = ""
        if audio_file:
            # Placeholder for audio transcription
            transcribed_text = "Audio transcription would be processed here"
        
        # Generate proposal sections
        proposal_content = {
            "executive_summary": f"Executive summary for {opportunity['title']}",
            "problem_statement": f"Problem statement addressing {opportunity['sector']} challenges",
            "project_description": f"Project description for {opportunity['title']}",
            "budget": f"Budget breakdown for {opportunity['amount_min']}-{opportunity['amount_max']} {opportunity['currency']}",
            "evaluation": "Evaluation and monitoring framework"
        }
        
        return {
            "proposal_content": proposal_content,
            "opportunity": dict(opportunity),
            "user_input": user_input,
            "transcribed_text": transcribed_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process funding documents"""
    try:
        content = await file.read()
        
        # Basic file processing
        if file.filename.endswith('.pdf'):
            # PDF processing would go here
            text_content = f"PDF content from {file.filename}"
        elif file.filename.endswith('.docx'):
            # DOCX processing would go here
            text_content = f"DOCX content from {file.filename}"
        else:
            text_content = content.decode('utf-8', errors='ignore')
        
        # Generate content hash
        content_hash = hashlib.md5(content).hexdigest()
        
        # Store in database
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO donor_opportunities (
                        title, description, source_name, content_hash,
                        is_verified, is_active, created_at, updated_at
                    ) VALUES (
                        %s, %s, %s, %s, false, true, NOW(), NOW()
                    ) RETURNING id
                """, (
                    f"Custom Upload: {file.filename}",
                    text_content[:500] + "..." if len(text_content) > 500 else text_content,
                    "User Upload",
                    content_hash
                ))
                
                doc_id = cursor.fetchone()[0]
                conn.commit()
        
        return {
            "id": doc_id,
            "filename": file.filename,
            "content_hash": content_hash,
            "message": "Document uploaded and processed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/stats")
async def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                # Get counts
                cursor.execute("SELECT COUNT(*) FROM donor_opportunities WHERE is_active = true")
                total_opportunities = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM donor_opportunities WHERE is_verified = true")
                verified_opportunities = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(DISTINCT country) FROM donor_opportunities")
                countries_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM search_bots")
                total_bots = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM search_bots WHERE status = 'active'")
                active_bots = cursor.fetchone()[0]
                
                return {
                    "opportunities": {
                        "total": total_opportunities,
                        "verified": verified_opportunities,
                        "countries": countries_count
                    },
                    "bots": {
                        "total": total_bots,
                        "active": active_bots
                    },
                    "system": {
                        "status": "healthy",
                        "uptime": "Running"
                    }
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )