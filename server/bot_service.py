"""
Bot Management Service for Granada OS
Handles web scraping and funding opportunity discovery
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
import asyncio
import hashlib
import json
import os
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
import base64
from urllib.parse import urljoin, urlparse

app = FastAPI(title="Granada OS Bot Service", version="1.0.0")

class BotManager:
    def __init__(self):
        self.deepseek_api_key = os.getenv('DEEPSEEK_API_KEY', 'sk-your-key')
        self.deepseek_base_url = "https://api.deepseek.com/v1"
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
    
    def get_db_connection(self):
        return psycopg2.connect(**self.db_config)
    
    def create_webdriver(self) -> webdriver.Chrome:
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        
        return webdriver.Chrome(options=options)
    
    def extract_page_content(self, driver: webdriver.Chrome, url: str) -> Dict[str, Any]:
        try:
            driver.get(url)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            content = {
                'title': driver.title,
                'url': url,
                'text': driver.find_element(By.TAG_NAME, "body").text,
                'links': [elem.get_attribute('href') for elem in driver.find_elements(By.TAG_NAME, "a") if elem.get_attribute('href')],
                'scraped_at': datetime.now().isoformat()
            }
            
            return content
            
        except Exception as e:
            return {'error': str(e), 'url': url}
    
    def format_with_ai(self, content: Dict[str, Any], country: str) -> Optional[Dict[str, Any]]:
        try:
            prompt = f"""
            Extract funding opportunities from this content for {country}. Return JSON format:
            {{
                "opportunities": [
                    {{
                        "title": "Grant title",
                        "description": "Brief description",
                        "amount_min": 10000,
                        "amount_max": 50000,
                        "currency": "USD",
                        "deadline": "2024-12-31",
                        "eligibility_criteria": "Who can apply",
                        "application_process": "How to apply",
                        "focus_areas": ["education", "health"],
                        "countries": ["{country}"]
                    }}
                ]
            }}
            
            Content: {content.get('text', '')[:2000]}
            """
            
            response = requests.post(
                f"{self.deepseek_base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.deepseek_api_key}"},
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content_text = result['choices'][0]['message']['content']
                return json.loads(content_text)
            
        except Exception as e:
            print(f"AI formatting error: {e}")
        
        return self._basic_format(content, country)
    
    def _basic_format(self, content: Dict[str, Any], country: str) -> List[Dict[str, Any]]:
        return [{
            "title": f"Funding Opportunity - {content.get('title', 'Unknown')}",
            "description": content.get('text', '')[:200] + "...",
            "amount_min": None,
            "amount_max": None,
            "currency": "USD",
            "deadline": None,
            "eligibility_criteria": f"Organizations in {country}",
            "application_process": "Check source website for details",
            "focus_areas": ["General"],
            "countries": [country]
        }]
    
    def save_opportunity(self, opportunity: Dict[str, Any], source_url: str, source_name: str, country: str) -> bool:
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cursor:
                    content_hash = hashlib.md5(
                        f"{opportunity['title']}{opportunity['description']}".encode()
                    ).hexdigest()
                    
                    cursor.execute("""
                        INSERT INTO donor_opportunities (
                            title, description, amount_min, amount_max, currency,
                            deadline, source_url, source_name, country, sector,
                            eligibility_criteria, application_process, keywords,
                            focus_areas, content_hash, is_verified, is_active,
                            scraped_at, created_at, updated_at
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                            NOW(), NOW(), NOW()
                        ) ON CONFLICT (content_hash) DO NOTHING
                    """, (
                        opportunity['title'],
                        opportunity['description'],
                        opportunity.get('amount_min'),
                        opportunity.get('amount_max'),
                        opportunity.get('currency', 'USD'),
                        opportunity.get('deadline'),
                        source_url,
                        source_name,
                        country,
                        'Development',  # Default sector
                        opportunity.get('eligibility_criteria'),
                        opportunity.get('application_process'),
                        opportunity.get('focus_areas', []),
                        opportunity.get('focus_areas', []),
                        content_hash,
                        False,  # is_verified
                        True,   # is_active
                    ))
                    
                    conn.commit()
                    return True
                    
        except Exception as e:
            print(f"Database error: {e}")
            return False
    
    async def run_bot(self, bot_data: Dict) -> int:
        opportunities_found = 0
        driver = None
        
        try:
            # Get search targets for country
            with self.get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT url, name FROM search_targets 
                        WHERE country = %s AND is_active = true
                    """, (bot_data['country'],))
                    targets = cursor.fetchall()
            
            if not targets:
                return 0
            
            driver = self.create_webdriver()
            
            for target in targets:
                try:
                    content = self.extract_page_content(driver, target['url'])
                    
                    if 'error' in content:
                        continue
                    
                    # Format with AI
                    formatted_data = self.format_with_ai(content, bot_data['country'])
                    
                    if formatted_data and 'opportunities' in formatted_data:
                        for opp in formatted_data['opportunities']:
                            if self.save_opportunity(opp, target['url'], target['name'], bot_data['country']):
                                opportunities_found += 1
                    
                    # Small delay between requests
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    print(f"Error processing {target['url']}: {e}")
                    continue
            
        except Exception as e:
            print(f"Bot run error: {e}")
        finally:
            if driver:
                driver.quit()
        
        return opportunities_found

bot_manager = BotManager()

@app.get("/")
async def root():
    return {"message": "Granada OS Bot Service", "status": "running"}

@app.post("/bots/{bot_id}/run")
async def run_bot_endpoint(bot_id: str, background_tasks: BackgroundTasks):
    try:
        # Get bot data
        with bot_manager.get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM search_bots WHERE id = %s", (bot_id,))
                bot_data = cursor.fetchone()
                
                if not bot_data:
                    raise HTTPException(status_code=404, detail="Bot not found")
        
        # Update status to running
        with bot_manager.get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE search_bots SET status = 'running', last_run = NOW() 
                    WHERE id = %s
                """, (bot_id,))
                conn.commit()
        
        # Run bot in background
        background_tasks.add_task(run_bot_background, dict(bot_data))
        
        return {"message": f"Bot {bot_id} started", "status": "running"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_bot_background(bot_data: Dict):
    try:
        opportunities_found = await bot_manager.run_bot(bot_data)
        
        # Update bot stats
        with bot_manager.get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE search_bots 
                    SET status = 'active', opportunities_found = opportunities_found + %s,
                        last_run = NOW()
                    WHERE id = %s
                """, (opportunities_found, bot_data['id']))
                conn.commit()
        
        print(f"Bot {bot_data['id']} completed. Found {opportunities_found} opportunities.")
        
    except Exception as e:
        print(f"Background bot error: {e}")
        
        # Update status to error
        try:
            with bot_manager.get_db_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        UPDATE search_bots SET status = 'error' WHERE id = %s
                    """, (bot_data['id'],))
                    conn.commit()
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("bot_service:app", host="0.0.0.0", port=8001, reload=True)