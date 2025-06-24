import uuid
import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse
import re
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from ..database.models import DonorOpportunity, OpportunityVerification
from ..database.connection import get_db_session

logger = logging.getLogger(__name__)

class OpportunityVerifier:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def start_session(self):
        """Initialize HTTP session"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        timeout = aiohttp.ClientTimeout(total=15, connect=5)
        self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
    
    async def close_session(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
    
    async def verify_opportunity(self, opportunity: DonorOpportunity) -> Dict[str, Any]:
        """Verify a single opportunity"""
        verification_results = {
            'url_check': await self._verify_url(opportunity),
            'content_analysis': await self._analyze_content(opportunity),
            'deadline_validation': await self._validate_deadline(opportunity),
            'duplicate_check': await self._check_duplicates(opportunity)
        }
        
        # Calculate overall score
        scores = [result['score'] for result in verification_results.values()]
        overall_score = sum(scores) / len(scores)
        
        # Determine verification status
        status = 'verified' if overall_score >= 0.7 else 'failed'
        
        # Save verification results
        await self._save_verification(opportunity.id, verification_results, overall_score, status)
        
        # Update opportunity verification status
        await self._update_opportunity_verification(opportunity.id, overall_score, status == 'verified')
        
        return {
            'opportunity_id': str(opportunity.id),
            'status': status,
            'score': overall_score,
            'details': verification_results
        }
    
    async def _verify_url(self, opportunity: DonorOpportunity) -> Dict[str, Any]:
        """Verify that the source URL is accessible and valid"""
        try:
            if not opportunity.source_url:
                return {'score': 0.0, 'status': 'failed', 'reason': 'No URL provided'}
            
            # Parse URL
            parsed = urlparse(opportunity.source_url)
            if not parsed.scheme or not parsed.netloc:
                return {'score': 0.0, 'status': 'failed', 'reason': 'Invalid URL format'}
            
            # Check if URL is accessible
            async with self.session.get(opportunity.source_url) as response:
                if response.status == 200:
                    # Check if content is relevant
                    content = await response.text()
                    relevance_score = self._check_content_relevance(content, opportunity.title)
                    
                    return {
                        'score': min(1.0, 0.7 + relevance_score * 0.3),
                        'status': 'verified',
                        'response_code': response.status,
                        'relevance_score': relevance_score
                    }
                elif response.status in [301, 302, 303, 307, 308]:
                    return {'score': 0.8, 'status': 'verified', 'reason': 'Redirected but accessible'}
                else:
                    return {'score': 0.2, 'status': 'failed', 'reason': f'HTTP {response.status}'}
                    
        except asyncio.TimeoutError:
            return {'score': 0.1, 'status': 'failed', 'reason': 'Request timeout'}
        except Exception as e:
            return {'score': 0.0, 'status': 'failed', 'reason': str(e)}
    
    def _check_content_relevance(self, content: str, title: str) -> float:
        """Check if page content is relevant to the opportunity"""
        if not content or not title:
            return 0.0
        
        # Convert to lowercase for comparison
        content_lower = content.lower()
        title_words = title.lower().split()
        
        # Check for funding-related keywords
        funding_keywords = [
            'grant', 'funding', 'opportunity', 'application', 'proposal',
            'award', 'fellowship', 'scholarship', 'call', 'tender'
        ]
        
        keyword_matches = sum(1 for keyword in funding_keywords if keyword in content_lower)
        title_matches = sum(1 for word in title_words if len(word) > 3 and word in content_lower)
        
        # Calculate relevance score
        keyword_score = min(1.0, keyword_matches / len(funding_keywords))
        title_score = min(1.0, title_matches / max(1, len([w for w in title_words if len(w) > 3])))
        
        return (keyword_score + title_score) / 2
    
    async def _analyze_content(self, opportunity: DonorOpportunity) -> Dict[str, Any]:
        """Analyze opportunity content for quality and completeness"""
        score = 0.0
        issues = []
        
        # Check title quality
        if opportunity.title:
            if len(opportunity.title) >= 20:
                score += 0.2
            else:
                issues.append('Title too short')
        else:
            issues.append('Missing title')
        
        # Check description quality
        if opportunity.description:
            if len(opportunity.description) >= 100:
                score += 0.3
            elif len(opportunity.description) >= 50:
                score += 0.15
            else:
                issues.append('Description too short')
        else:
            issues.append('Missing description')
        
        # Check funding information
        if opportunity.amount_min or opportunity.amount_max:
            score += 0.2
            if opportunity.amount_min and opportunity.amount_max:
                if opportunity.amount_min <= opportunity.amount_max:
                    score += 0.1
                else:
                    issues.append('Invalid funding range')
        else:
            issues.append('Missing funding information')
        
        # Check deadline
        if opportunity.deadline:
            if opportunity.deadline > datetime.utcnow():
                score += 0.2
            else:
                issues.append('Deadline has passed')
        else:
            issues.append('Missing deadline')
        
        return {
            'score': score,
            'status': 'verified' if score >= 0.6 else 'failed',
            'issues': issues
        }
    
    async def _validate_deadline(self, opportunity: DonorOpportunity) -> Dict[str, Any]:
        """Validate opportunity deadline"""
        if not opportunity.deadline:
            return {'score': 0.0, 'status': 'failed', 'reason': 'No deadline provided'}
        
        now = datetime.utcnow()
        
        # Check if deadline is in the future
        if opportunity.deadline <= now:
            return {'score': 0.0, 'status': 'failed', 'reason': 'Deadline has passed'}
        
        # Check if deadline is reasonable (not too far in future)
        days_until_deadline = (opportunity.deadline - now).days
        
        if days_until_deadline > 730:  # More than 2 years
            return {'score': 0.3, 'status': 'warning', 'reason': 'Deadline very far in future'}
        elif days_until_deadline > 365:  # More than 1 year
            return {'score': 0.7, 'status': 'verified', 'reason': 'Long-term opportunity'}
        else:
            return {'score': 1.0, 'status': 'verified', 'days_remaining': days_until_deadline}
    
    async def _check_duplicates(self, opportunity: DonorOpportunity) -> Dict[str, Any]:
        """Check for duplicate opportunities"""
        async with get_db_session() as session:
            # Check for exact title matches from same source
            exact_matches = await session.execute(
                select(DonorOpportunity).where(
                    DonorOpportunity.title == opportunity.title,
                    DonorOpportunity.source_name == opportunity.source_name,
                    DonorOpportunity.id != opportunity.id
                )
            )
            
            exact_count = len(exact_matches.all())
            
            if exact_count > 0:
                return {'score': 0.0, 'status': 'failed', 'reason': 'Exact duplicate found'}
            
            # Check for similar titles
            similar_matches = await session.execute(
                select(DonorOpportunity).where(
                    DonorOpportunity.source_name == opportunity.source_name,
                    DonorOpportunity.id != opportunity.id
                )
            )
            
            similar_opps = similar_matches.scalars().all()
            
            for opp in similar_opps:
                similarity = self._calculate_title_similarity(opportunity.title, opp.title)
                if similarity > 0.8:
                    return {
                        'score': 0.2, 
                        'status': 'warning', 
                        'reason': 'Similar opportunity exists',
                        'similarity': similarity,
                        'similar_id': str(opp.id)
                    }
            
            return {'score': 1.0, 'status': 'verified', 'reason': 'No duplicates found'}
    
    def _calculate_title_similarity(self, title1: str, title2: str) -> float:
        """Calculate similarity between two titles"""
        if not title1 or not title2:
            return 0.0
        
        # Normalize titles
        t1 = title1.lower()
        t2 = title2.lower()
        
        # Remove common words
        common_words = {'the', 'and', 'for', 'in', 'on', 'of', 'to', 'a', 'an'}
        t1_words = [w for w in t1.split() if w not in common_words]
        t2_words = [w for w in t2.split() if w not in common_words]
        
        # Count matching words
        matches = sum(1 for w in t1_words if w in t2_words)
        
        # Calculate similarity
        if not t1_words or not t2_words:
            return 0.0
        
        return matches / max(len(t1_words), len(t2_words))
    
    async def _save_verification(self, opportunity_id: uuid.UUID, results: Dict[str, Any], 
                                score: float, status: str):
        """Save verification results to database"""
        async with get_db_session() as session:
            for check_type, result in results.items():
                verification = OpportunityVerification(
                    opportunity_id=opportunity_id,
                    verification_type=check_type,
                    status=result.get('status', 'unknown'),
                    score=result.get('score', 0.0),
                    details=result,
                    verified_at=datetime.utcnow(),
                    verified_by='verification_service'
                )
                
                session.add(verification)
            
            await session.commit()
    
    async def _update_opportunity_verification(self, opportunity_id: uuid.UUID, 
                                             score: float, is_verified: bool):
        """Update opportunity verification status"""
        async with get_db_session() as session:
            await session.execute(
                update(DonorOpportunity)
                .where(DonorOpportunity.id == opportunity_id)
                .values(
                    verification_score=score,
                    is_verified=is_verified,
                    last_verified=datetime.utcnow()
                )
            )
            
            await session.commit()

class VerificationService:
    def __init__(self):
        self.verifier = OpportunityVerifier()
        self.running = False
    
    async def start(self):
        """Start verification service"""
        await self.verifier.start_session()
        self.running = True
        
        logger.info("Verification service started")
        
        while self.running:
            try:
                # Get unverified opportunities
                async with get_db_session() as session:
                    unverified = await session.execute(
                        select(DonorOpportunity)
                        .where(
                            DonorOpportunity.is_verified == False,
                            DonorOpportunity.verification_score == 0.0
                        )
                        .limit(50)
                    )
                    
                    opportunities = unverified.scalars().all()
                
                if opportunities:
                    logger.info(f"Verifying {len(opportunities)} opportunities")
                    
                    # Verify each opportunity
                    for opp in opportunities:
                        try:
                            await self.verifier.verify_opportunity(opp)
                            # Rate limiting
                            await asyncio.sleep(1)
                        except Exception as e:
                            logger.error(f"Error verifying opportunity {opp.id}: {e}")
                
                # Wait before next batch
                await asyncio.sleep(300)  # 5 minutes
                
            except Exception as e:
                logger.error(f"Error in verification service: {e}")
                await asyncio.sleep(60)
    
    async def stop(self):
        """Stop verification service"""
        self.running = False
        await self.verifier.close_session()
        logger.info("Verification service stopped")

# Global verification service instance
verification_service = VerificationService()

async def start_verification_service():
    """Start the verification service"""
    await verification_service.start()

async def stop_verification_service():
    """Stop the verification service"""
    await verification_service.stop()