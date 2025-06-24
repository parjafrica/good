#!/usr/bin/env python3
"""
Bot Manager for Granada OS - Web Scraping and AI Processing
Visits web pages, takes screenshots, extracts funding opportunities,
formats with AI, and stores in database.
"""

import asyncio
import hashlib
import json
import os
import re
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from selenium import webdriver
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
import base64
from urllib.parse import urljoin, urlparse

class BotManager:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        # Parse DATABASE_URL for psycopg2
        self.db_config = self._parse_db_url(self.db_url)
        self.deepseek_api_key = os.getenv('DEEPSEEK_API_KEY') or "sk-7153751787d945d98a69a27db92d65ba"
        
        # Chrome options for headless browsing
        self.chrome_options = Options()
        self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--window-size=1920,1080')
        self.chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        # Set ChromeDriver path
        self.chrome_options.add_argument('--remote-debugging-port=9222')
        
    def _parse_db_url(self, url: str) -> Dict[str, str]:
        """Parse DATABASE_URL into connection parameters"""
        from urllib.parse import urlparse, parse_qs
        
        parsed = urlparse(url)
        
        # Extract SSL mode from query parameters
        query_params = parse_qs(parsed.query)
        sslmode = query_params.get('sslmode', ['require'])[0]
        
        return {
            'host': parsed.hostname,
            'port': str(parsed.port or 5432),
            'database': parsed.path.lstrip('/'),
            'user': parsed.username,
            'password': parsed.password,
            'sslmode': sslmode
        }
    
    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(
            host=self.db_config['host'],
            port=self.db_config['port'],
            database=self.db_config['database'],
            user=self.db_config['user'],
            password=self.db_config['password'],
            sslmode=self.db_config.get('sslmode', 'require'),
            cursor_factory=RealDictCursor
        )
    
    def get_active_bots(self) -> List[Dict]:
        """Get all active search bots from database"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM search_bots 
                    WHERE status = 'active'
                    ORDER BY country
                """)
                return cur.fetchall()
    
    def get_search_targets(self, country: str) -> List[Dict]:
        """Get search targets for a specific country"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM search_targets 
                    WHERE country = %s AND is_active = true
                    ORDER BY priority DESC
                """, (country,))
                return cur.fetchall()
    
    def create_webdriver(self) -> webdriver.Chrome:
        """Create and return a Chrome webdriver instance"""
        from selenium.webdriver.chrome.service import Service
        service = Service('/nix/store/3qnxr5x6gw3k9a9i7d0akz0m6bksbwff-chromedriver-125.0.6422.141/bin/chromedriver')
        return webdriver.Chrome(service=service, options=self.chrome_options)
    
    def take_screenshot(self, driver: webdriver.Chrome, url: str) -> Optional[str]:
        """Take screenshot and return base64 encoded image"""
        try:
            screenshot = driver.get_screenshot_as_png()
            return base64.b64encode(screenshot).decode('utf-8')
        except Exception as e:
            print(f"Error taking screenshot for {url}: {e}")
            return None
    
    def extract_page_content(self, driver: webdriver.Chrome, url: str) -> Dict[str, Any]:
        """Extract content from a web page"""
        try:
            driver.get(url)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Take screenshot
            screenshot = self.take_screenshot(driver, url)
            
            # Extract text content
            title = driver.title
            body_text = driver.find_element(By.TAG_NAME, "body").text
            
            # Look for funding-related content
            funding_keywords = [
                'funding', 'grant', 'opportunity', 'application', 'deadline',
                'amount', 'budget', 'proposal', 'eligibility', 'criteria'
            ]
            
            # Extract links that might be opportunities
            links = []
            try:
                link_elements = driver.find_elements(By.TAG_NAME, "a")
                for link in link_elements[:20]:  # Limit to first 20 links
                    href = link.get_attribute('href')
                    text = link.text.strip()
                    if href and any(keyword in text.lower() for keyword in funding_keywords):
                        links.append({
                            'url': urljoin(url, href),
                            'text': text
                        })
            except Exception as e:
                print(f"Error extracting links: {e}")
            
            return {
                'url': url,
                'title': title,
                'content': body_text,
                'links': links,
                'screenshot': screenshot,
                'scraped_at': datetime.now().isoformat()
            }
            
        except TimeoutException:
            print(f"Timeout loading {url}")
            return None
        except WebDriverException as e:
            print(f"WebDriver error for {url}: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error extracting content from {url}: {e}")
            return None
    
    def format_with_ai(self, content: Dict[str, Any], country: str) -> Optional[Dict[str, Any]]:
        """Format extracted content using DeepSeek AI"""
        if not self.deepseek_api_key:
            print("No DeepSeek API key found, using basic formatting")
            return self._basic_format(content, country)
        
        try:
            prompt = f"""
            Extract funding opportunities from this web page content. 
            Country focus: {country}
            
            Page Title: {content.get('title', '')}
            URL: {content.get('url', '')}
            Content: {content.get('content', '')[:3000]}  # Limit content length
            
            Please extract and format any funding opportunities as JSON with these fields:
            - title: Clear opportunity title
            - description: Brief description
            - deadline: Deadline if mentioned (ISO format or null)
            - amount_min: Minimum funding amount (number or null)
            - amount_max: Maximum funding amount (number or null)
            - currency: Currency code (default USD)
            - eligibility_criteria: Who can apply
            - application_process: How to apply
            - contact_email: Contact email if available
            - contact_phone: Contact phone if available
            - keywords: Array of relevant keywords
            - focus_areas: Array of focus areas/sectors
            - sector: Primary sector (Education, Health, Environment, etc.)
            
            Return only valid JSON array of opportunities found, or empty array if none.
            """
            
            response = requests.post(
                'https://api.deepseek.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.deepseek_api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'deepseek-chat',
                    'messages': [
                        {'role': 'user', 'content': prompt}
                    ],
                    'temperature': 0.1,
                    'max_tokens': 2000
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_content = result['choices'][0]['message']['content']
                
                # Try to parse JSON from AI response
                try:
                    # Clean up the response to extract JSON
                    json_start = ai_content.find('[')
                    json_end = ai_content.rfind(']') + 1
                    if json_start >= 0 and json_end > json_start:
                        json_str = ai_content[json_start:json_end]
                        opportunities = json.loads(json_str)
                        return opportunities
                except json.JSONDecodeError:
                    print("Failed to parse AI response as JSON")
            
        except Exception as e:
            print(f"Error calling DeepSeek API: {e}")
        
        # Fallback to basic formatting
        return self._basic_format(content, country)
    
    def _basic_format(self, content: Dict[str, Any], country: str) -> List[Dict[str, Any]]:
        """Basic content formatting when AI is not available"""
        opportunities = []
        
        # Simple heuristic-based extraction
        text = content.get('content', '').lower()
        title = content.get('title', '')
        
        funding_indicators = ['grant', 'funding', 'opportunity', 'application', 'deadline']
        
        if any(indicator in text for indicator in funding_indicators):
            # Extract potential amount
            amount_pattern = r'\$?(\d+(?:,\d{3})*(?:\.\d{2})?)'
            amounts = re.findall(amount_pattern, text.replace(',', ''))
            
            opportunity = {
                'title': title or f"Funding Opportunity from {urlparse(content.get('url', '')).netloc}",
                'description': text[:300] + "..." if len(text) > 300 else text,
                'deadline': None,
                'amount_min': int(amounts[0]) if amounts else None,
                'amount_max': int(amounts[-1]) if len(amounts) > 1 else None,
                'currency': 'USD',
                'eligibility_criteria': 'See source website for details',
                'application_process': 'Visit source website for application details',
                'contact_email': None,
                'contact_phone': None,
                'keywords': ['funding', 'opportunity'],
                'focus_areas': ['General'],
                'sector': 'General'
            }
            opportunities.append(opportunity)
        
        return opportunities
    
    def generate_content_hash(self, content: str) -> str:
        """Generate unique hash for content deduplication"""
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def save_opportunity(self, opportunity: Dict[str, Any], source_url: str, source_name: str, country: str) -> bool:
        """Save opportunity to database"""
        try:
            content_hash = self.generate_content_hash(
                f"{opportunity.get('title', '')}{opportunity.get('description', '')}{source_url}"
            )
            
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    # Check if opportunity already exists
                    cur.execute(
                        "SELECT id FROM donor_opportunities WHERE content_hash = %s",
                        (content_hash,)
                    )
                    
                    if cur.fetchone():
                        print(f"Opportunity already exists: {opportunity.get('title', 'Unknown')}")
                        return False
                    
                    # Insert new opportunity
                    cur.execute("""
                        INSERT INTO donor_opportunities (
                            title, description, deadline, amount_min, amount_max, currency,
                            source_url, source_name, country, sector, eligibility_criteria,
                            application_process, contact_email, contact_phone, keywords,
                            focus_areas, content_hash, is_verified, verification_score
                        ) VALUES (
                            %(title)s, %(description)s, %(deadline)s, %(amount_min)s, %(amount_max)s, %(currency)s,
                            %(source_url)s, %(source_name)s, %(country)s, %(sector)s, %(eligibility_criteria)s,
                            %(application_process)s, %(contact_email)s, %(contact_phone)s, %(keywords)s,
                            %(focus_areas)s, %(content_hash)s, %(is_verified)s, %(verification_score)s
                        ) RETURNING id
                    """, {
                        'title': opportunity.get('title'),
                        'description': opportunity.get('description'),
                        'deadline': opportunity.get('deadline'),
                        'amount_min': opportunity.get('amount_min'),
                        'amount_max': opportunity.get('amount_max'),
                        'currency': opportunity.get('currency', 'USD'),
                        'source_url': source_url,
                        'source_name': source_name,
                        'country': country,
                        'sector': opportunity.get('sector'),
                        'eligibility_criteria': opportunity.get('eligibility_criteria'),
                        'application_process': opportunity.get('application_process'),
                        'contact_email': opportunity.get('contact_email'),
                        'contact_phone': opportunity.get('contact_phone'),
                        'keywords': json.dumps(opportunity.get('keywords', [])),
                        'focus_areas': json.dumps(opportunity.get('focus_areas', [])),
                        'content_hash': content_hash,
                        'is_verified': True,  # Mark as verified since it's from active scraping
                        'verification_score': 0.8  # High verification score for scraped content
                    })
                    
                    opportunity_id = cur.fetchone()['id']
                    conn.commit()
                    print(f"Saved opportunity: {opportunity.get('title', 'Unknown')} (ID: {opportunity_id})")
                    return True
                    
        except Exception as e:
            print(f"Error saving opportunity: {e}")
            return False
    
    def update_bot_stats(self, bot_id: str, opportunities_found: int, success: bool):
        """Update bot statistics"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    # Update bot stats
                    cur.execute("""
                        UPDATE search_bots 
                        SET last_run = NOW(),
                            total_opportunities_found = total_opportunities_found + %s,
                            error_count = CASE WHEN %s THEN error_count ELSE error_count + 1 END
                        WHERE bot_id = %s
                    """, (opportunities_found, success, bot_id))
                    
                    # Award points for successful scraping
                    if success and opportunities_found > 0:
                        reward_points = opportunities_found * 10  # 10 points per opportunity
                        cur.execute("""
                            INSERT INTO bot_rewards (bot_id, country, opportunities_found, reward_points)
                            SELECT %s, country, %s, %s FROM search_bots WHERE bot_id = %s
                        """, (bot_id, opportunities_found, reward_points, bot_id))
                        
                        cur.execute("""
                            UPDATE search_bots 
                            SET total_reward_points = total_reward_points + %s
                            WHERE bot_id = %s
                        """, (reward_points, bot_id))
                    
                    conn.commit()
                    print(f"Updated stats for bot {bot_id}: {opportunities_found} opportunities, points: {opportunities_found * 10 if success else 0}")
                    
        except Exception as e:
            print(f"Error updating bot stats: {e}")
    
    def run_bot(self, bot_data: Dict) -> int:
        """Run a single bot to scrape opportunities"""
        bot_id = bot_data['bot_id']
        country = bot_data['country']
        targets_config = bot_data.get('targets_config', [])
        
        print(f"Running bot {bot_id} for {country}")
        
        opportunities_found = 0
        driver = None
        
        try:
            driver = self.create_webdriver()
            search_targets = self.get_search_targets(country)
            
            for target in search_targets:
                try:
                    print(f"Scraping {target['name']}: {target['url']}")
                    
                    # Extract content from page
                    content = self.extract_page_content(driver, target['url'])
                    if not content:
                        continue
                    
                    # Format content with AI
                    opportunities = self.format_with_ai(content, country)
                    if not opportunities:
                        continue
                    
                    # Save opportunities to database
                    for opp in opportunities:
                        if self.save_opportunity(opp, target['url'], target['name'], country):
                            opportunities_found += 1
                    
                    # Rate limiting
                    time.sleep(target.get('rate_limit', 30))
                    
                except Exception as e:
                    print(f"Error processing target {target['name']}: {e}")
                    continue
            
            # Update bot statistics
            self.update_bot_stats(bot_id, opportunities_found, True)
            return opportunities_found
            
        except Exception as e:
            print(f"Error running bot {bot_id}: {e}")
            self.update_bot_stats(bot_id, 0, False)
            return 0
        finally:
            if driver:
                driver.quit()
    
    def run_all_bots(self):
        """Run all active bots"""
        bots = self.get_active_bots()
        print(f"Found {len(bots)} active bots")
        
        total_opportunities = 0
        for bot in bots:
            opportunities = self.run_bot(bot)
            total_opportunities += opportunities
            
            # Small delay between bots
            time.sleep(5)
        
        print(f"Bot run completed. Total opportunities found: {total_opportunities}")
        return total_opportunities

def main():
    """Main function to run the bot manager"""
    try:
        bot_manager = BotManager()
        bot_manager.run_all_bots()
    except Exception as e:
        print(f"Fatal error: {e}")
        return 1
    return 0

if __name__ == "__main__":
    exit(main())