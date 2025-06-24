import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Set
from dataclasses import dataclass
from enum import Enum
import json
import hashlib
from urllib.parse import urljoin, urlparse
import re
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Browser, Page
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, delete
from sqlalchemy.future import select as future_select
import uuid
import os # <-- CHANGE #1: IMPORT ADDED

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import models and database connection
from ..database.models import DonorOpportunity, SearchBot, BotReward, SearchTarget, OpportunityVerification, CrawlLog
from ..database.connection import get_db_session

class BotStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    ERROR = "error"
    MAINTENANCE = "maintenance"

class FundingBot:
    def __init__(self, bot_id: str, country: str):
        self.bot_id = bot_id
        self.country = country
        self.status = BotStatus.ACTIVE
        self.session: Optional[aiohttp.ClientSession] = None
        self.p_playwright: Optional[async_playwright] = None
        self.p_browser: Optional[Browser] = None
        self.opportunities_found = 0
        self.last_run: Optional[datetime] = None
        self.errors: List[str] = []

    async def start_sessions(self):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        self.session = aiohttp.ClientSession(headers=headers, timeout=aiohttp.ClientTimeout(total=30))
        logger.info(f"Bot {self.bot_id}: aiohttp session started.")

        try:
            self.p_playwright = await async_playwright().start()
            self.p_browser = await self.p_playwright.chromium.launch(headless=True)
            logger.info(f"Bot {self.bot_id}: Playwright session started.")
        except Exception as e:
            logger.error(f"Bot {self.bot_id}: Failed to start Playwright: {e}")
            self.status = BotStatus.ERROR
            self.errors.append(f"Playwright initialization failed: {e}")


    async def close_sessions(self):
        if self.session and not self.session.closed:
            await self.session.close()
            logger.info(f"Bot {self.bot_id}: aiohttp session closed.")
        if self.p_browser and self.p_browser.is_connected():
            await self.p_browser.close()
            logger.info(f"Bot {self.bot_id}: Playwright browser closed.")
        if self.p_playwright:
            await self.p_playwright.stop()
            logger.info(f"Bot {self.bot_id}: Playwright stopped.")

    async def search_target(self, target: SearchTarget, session: AsyncSession) -> List[Dict[str, Any]]:
        logger.info(f"Bot {self.bot_id} searching target '{target.name}' ({target.type}) at {target.url}")
        try:
            if target.type == "playwright":
                if not self.p_browser:
                    logger.warning(f"Bot {self.bot_id}: Playwright not available, skipping target {target.name}")
                    return []
                return await self._crawl_with_playwright(target, session)
            elif target.type == "scraping":
                return await self._scrape_website(target)
            else:
                logger.warning(f"Unknown or unsupported target type: {target.type} for target {target.name}")
                return []
        except Exception as e:
            error_msg = f"Error searching target {target.name}: {e}"
            logger.error(error_msg, exc_info=True)
            self.errors.append(error_msg)
            return []
    
    # --- CHANGE #2: NEW SCREENSHOT HELPER FUNCTION ADDED ---
    async def _take_opportunity_screenshot(self, page: Page, url: str) -> Optional[str]:
        """Navigates to a URL and takes a full-page screenshot."""
        if not url:
            return None
        try:
            logger.info(f"Navigating to details page for screenshot: {url}")
            await page.goto(url, wait_until="networkidle", timeout=60000)

            screenshot_dir = "screenshots"
            os.makedirs(screenshot_dir, exist_ok=True)
            filename = f"{uuid.uuid4()}.png"
            filepath = os.path.join(screenshot_dir, filename)

            await page.screenshot(path=filepath, full_page=True)
            logger.info(f"Screenshot saved to: {filepath}")
            return filepath
        except Exception as e:
            logger.error(f"Failed to take screenshot for {url}: {e}")
            return None

    # --- CHANGE #3: THIS FUNCTION IS MODIFIED TO INCLUDE SCREENSHOTS ---
    async def _crawl_with_playwright(self, target: SearchTarget, db_session: AsyncSession) -> List[Dict[str, Any]]:
        """
        Launches a crawl, finds opportunities, visits each detail page to take a screenshot, then continues crawling.
        """
        all_opportunities = []
        page = None
        try:
            page = await self.p_browser.new_page()
            start_url = target.url
            domain = urlparse(start_url).netloc
            
            urls_to_visit = [start_url]
            visited_urls = await self._get_visited_urls(db_session, domain)

            while urls_to_visit:
                current_url = urls_to_visit.pop(0)
                if current_url in visited_urls or not self._is_relevant_link(current_url, domain):
                    continue

                logger.info(f"Crawling: {current_url}")
                try:
                    await page.goto(current_url, timeout=90000)
                    
                    logger.info("Waiting for page content to load...")
                    if target.name == 'FundsforNGOs - South Sudan':
                        await page.wait_for_selector('article.article-list', timeout=30000)
                    elif target.name == 'UN Jobs - South Sudan':
                        await page.wait_for_selector('div.job-container', timeout=30000)
                    else:
                        await page.wait_for_timeout(5000)
                    logger.info("Page content loaded. Proceeding to scrape.")

                    html_content = await page.content()
                    visited_urls.add(current_url)
                    await self._log_crawl(db_session, current_url, domain, target.name)
                    soup = BeautifulSoup(html_content, 'html.parser')
                    
                    opportunities_on_page = self._extract_opportunities(soup, target, current_url)
                    
                    if opportunities_on_page:
                        logger.info(f"Found {len(opportunities_on_page)} potential opportunities on {current_url}. Now taking screenshots.")
                        
                        # Loop through found opportunities to get their screenshots
                        for opp in opportunities_on_page:
                            detail_url = opp.get("source_url")
                            # Use a temporary page to avoid navigation conflicts
                            screenshot_page = await self.p_browser.new_page()
                            try:
                                screenshot_path = await self._take_opportunity_screenshot(screenshot_page, detail_url)
                                opp["screenshot_path"] = screenshot_path # Add path to the data
                            finally:
                                await screenshot_page.close() # Always close the temp page
                            
                            all_opportunities.append(opp) # Add enriched opp to the final list

                    # Discover more links to crawl on the current page
                    links = self._discover_internal_links(soup, start_url)
                    for link in links:
                        if link not in visited_urls and link not in urls_to_visit:
                            urls_to_visit.append(link)
                
                except Exception as e:
                    logger.warning(f"Failed to process page {current_url}: {e}", exc_info=True)
                
                await asyncio.sleep(2)

            await db_session.commit()
            return all_opportunities
        except Exception as e:
            logger.error(f"Playwright crawl failed for target {target.name}: {e}", exc_info=True)
            return []
        finally:
            if page:
                await page.close()

    async def _get_visited_urls(self, session: AsyncSession, domain: str) -> Set[str]:
        stmt = select(CrawlLog.url).where(CrawlLog.domain == domain)
        result = await session.execute(stmt)
        return {row.url for row in result.all()}

    async def _log_crawl(self, session: AsyncSession, url: str, domain: str, target_name: str):
        stmt = insert(CrawlLog).values(
            url=url, domain=domain, origin_target_name=target_name, visited_at=datetime.utcnow()
        )
        await session.execute(stmt)

    def _is_relevant_link(self, link: str, domain: str) -> bool:
        parsed_link = urlparse(link)
        if parsed_link.netloc != domain:
            return False
        
        excluded_extensions = ['.pdf', '.jpg', '.png', '.zip', '.xml', '.css', '.js']
        if any(parsed_link.path.lower().endswith(ext) for ext in excluded_extensions):
            return False
            
        return True

    def _discover_internal_links(self, soup: BeautifulSoup, base_url: str) -> Set[str]:
        links = set()
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            full_url = urljoin(base_url, href)
            if self._is_relevant_link(full_url, urlparse(base_url).netloc):
                links.add(full_url)
        return links

    async def _scrape_website(self, target: SearchTarget) -> List[Dict[str, Any]]:
        try:
            async with self.session.get(target.url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    return self._extract_opportunities(soup, target, target.url)
                else:
                    logger.warning(f"Scraping {target.name} failed with status: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Scraping error for {target.name}: {e}")
            return []

    def _extract_opportunities(self, soup: BeautifulSoup, target: SearchTarget, page_url: str) -> List[Dict[str, Any]]:
        opportunities = []
        
        if target.name == 'UN Jobs - South Sudan':
            containers = soup.select('div.job-container')
            for container in containers:
                try:
                    title_element = container.select_one('a.jobtitle')
                    if title_element:
                        title = title_element.get_text(strip=True)
                        relative_link = title_element['href']
                        source_url = urljoin(page_url, relative_link)
                        opportunity = {'title': title, 'description': title, 'source_url': source_url,
                                       'source_name': target.name, 'country': target.country,
                                       'scraped_at': datetime.utcnow()}
                        opportunity['content_hash'] = self._generate_content_hash(opportunity)
                        opportunities.append(opportunity)
                except Exception as e:
                    logger.error(f"Error extracting from UN Jobs container on {page_url}: {e}")

        elif target.name == 'FundsforNGOs - South Sudan':
            containers = soup.select('article.article-list')
            for container in containers:
                try:
                    title_element = container.select_one('h3.article-list__title a')
                    if title_element:
                        title = title_element.get_text(strip=True)
                        source_url = title_element['href']
                        desc_element = container.select_one('div.article-list__content p')
                        description = desc_element.get_text(strip=True) if desc_element else title
                        opportunity = {'title': title, 'description': description, 'source_url': source_url,
                                       'source_name': target.name, 'country': target.country,
                                       'scraped_at': datetime.utcnow()}
                        opportunity['content_hash'] = self._generate_content_hash(opportunity)
                        opportunities.append(opportunity)
                except Exception as e:
                    logger.error(f"Error extracting from FundsforNGOs container on {page_url}: {e}")
        
        else:
            # Generic fallback logic
            pass
        
        return opportunities

    def _generate_content_hash(self, opp_data: Dict[str, Any]) -> str:
        hash_input = f"{opp_data.get('title', '')}{opp_data.get('source_name', '')}{opp_data.get('description', '')}"
        return hashlib.sha256(hash_input.encode('utf-8')).hexdigest()

class BotManager:
    def __init__(self):
        self.bot: Optional[FundingBot] = None
        self.running = False

    async def initialize_bot(self, bot_id: str, country: str):
        logger.info(f"Initializing bot '{bot_id}' for country '{country}'.")
        self.bot = FundingBot(bot_id=bot_id, country=country)
        await self.bot.start_sessions()
        if self.bot.status == BotStatus.ERROR:
            logger.error(f"Bot '{bot_id}' failed to initialize properly.")
            self.bot = None

    async def start_continuous_search(self, run_interval_seconds: int = 3600):
        if not self.bot:
            logger.error("Bot is not initialized. Cannot start search.")
            return
        self.running = True
        logger.info(f"Starting continuous funding search for bot {self.bot.bot_id}. Interval: {run_interval_seconds}s")
        while self.running:
            try:
                await self._run_bot_cycle()
                logger.info(f"Search cycle complete. Waiting for {run_interval_seconds} seconds.")
                await asyncio.sleep(run_interval_seconds)
            except Exception as e:
                logger.error(f"Critical error in continuous search loop: {e}", exc_info=True)
                await asyncio.sleep(60)

    async def _run_bot_cycle(self):
        if not self.bot or self.bot.status != BotStatus.ACTIVE:
            logger.warning("Bot is not active or not initialized, skipping cycle.")
            return
        logger.info(f"Running search cycle for bot {self.bot.bot_id}")
        self.bot.last_run = datetime.utcnow()
        async with get_db_session() as session:
            try:
                targets = await self._get_search_targets(session, self.bot.country)
                if not targets:
                    logger.warning(f"No active search targets found for country: {self.bot.country}")
                    return
                all_opportunities = []
                for target in targets:
                    opportunities = await self.bot.search_target(target, session)
                    if opportunities:
                        all_opportunities.extend(opportunities)
                    await asyncio.sleep(10)
                if all_opportunities:
                    saved_count = await self._save_opportunities(session, all_opportunities)
                    self.bot.opportunities_found += saved_count
                    logger.info(f"Bot {self.bot.bot_id} found and saved {saved_count} new opportunities.")
                await session.commit()
            except Exception as e:
                logger.error(f"Error during bot cycle for {self.bot.bot_id}: {e}", exc_info=True)
                await session.rollback()

    async def _get_search_targets(self, session: AsyncSession, country: str) -> List[SearchTarget]:
        stmt = select(SearchTarget).where(
            SearchTarget.country == country,
            SearchTarget.is_active == True
        ).order_by(SearchTarget.priority.desc())
        result = await session.execute(stmt)
        return result.scalars().all()

    # --- CHANGE #4: THIS FUNCTION IS MODIFIED ---
    async def _save_opportunities(self, session: AsyncSession, opportunities: List[Dict[str, Any]]) -> int:
        """Saves new opportunities to the database, including the screenshot path."""
        saved_count = 0
        hashes = [opp['content_hash'] for opp in opportunities]
        stmt = select(DonorOpportunity.content_hash).where(DonorOpportunity.content_hash.in_(hashes))
        result = await session.execute(stmt)
        existing_hashes = {row.content_hash for row in result}
        new_opportunities = []
        for opp_data in opportunities:
            if opp_data['content_hash'] not in existing_hashes:
                new_opp = DonorOpportunity(
                    id=uuid.uuid4(),
                    title=opp_data['title'],
                    description=opp_data['description'],
                    source_url=opp_data['source_url'],
                    source_name=opp_data['source_name'],
                    country=opp_data['country'],
                    content_hash=opp_data['content_hash'],
                    scraped_at=opp_data['scraped_at'],
                    is_verified=False,
                    is_active=True,
                    # Add the new field, using .get() for safety
                    screenshot_path=opp_data.get('screenshot_path')
                )
                new_opportunities.append(new_opp)
                existing_hashes.add(opp_data['content_hash'])
        if new_opportunities:
            session.add_all(new_opportunities)
            saved_count = len(new_opportunities)
        return saved_count

    async def stop(self):
        self.running = False
        if self.bot:
            await self.bot.close_sessions()
        logger.info("Bot manager stopped.")

# Global bot manager instance
bot_manager = BotManager()

async def start_bot_system():
    BOT_ID = "hybrid_funding_bot_v1"
    COUNTRY = "South Sudan" 
    await bot_manager.initialize_bot(BOT_ID, COUNTRY)
    if bot_manager.bot:
        asyncio.create_task(bot_manager.start_continuous_search())

async def stop_bot_system():
    await bot_manager.stop()

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.create_task(start_bot_system())
        loop.run_forever()
    except KeyboardInterrupt:
        logger.info("Shutdown signal received.")
    finally:
        loop.run_until_complete(stop_bot_system())
        loop.close()