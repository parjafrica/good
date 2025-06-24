from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.donor import DonorCall
from ..models.organization import Organization

class MatchingService:
    """Service for matching organizations with relevant funding opportunities"""
    
    async def find_matching_opportunities(
        self, 
        organization_id: int, 
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Find donor calls that match the organization's profile"""
        
        # Get organization details
        result = await db.execute(
            select(Organization).where(Organization.id == organization_id)
        )
        org = result.scalar_one_or_none()
        
        if not org:
            return []
        
        # Get all active donor calls
        result = await db.execute(select(DonorCall))
        calls = result.scalars().all()
        
        # For demo purposes, return sample matched opportunities
        # In production, this would use AI/ML for semantic matching
        matched_opportunities = []
        
        for call in calls[:10]:  # Limit to first 10 for demo
            # Calculate match score based on organization sector and call keywords
            match_score = self._calculate_match_score(org, call)
            
            if match_score > 0.5:  # Only include good matches
                matched_opportunities.append({
                    "id": call.id,
                    "title": call.title,
                    "donor_name": "Sample Donor",  # Would come from relationship
                    "description": call.description,
                    "total_funding": call.total_funding,
                    "application_deadline": call.application_deadline,
                    "match_score": match_score,
                    "match_reasons": self._get_match_reasons(org, call),
                    "keywords": call.keywords or [],
                    "sdg_alignment": call.sdg_alignment or []
                })
        
        # Sort by match score descending
        matched_opportunities.sort(key=lambda x: x["match_score"], reverse=True)
        
        return matched_opportunities
    
    def _calculate_match_score(self, org: Organization, call: DonorCall) -> float:
        """Calculate match score between organization and donor call"""
        score = 0.0
        
        # Sector alignment
        if org.sector and call.keywords:
            if org.sector.lower() in [k.lower() for k in call.keywords]:
                score += 0.4
        
        # Geographic alignment (simplified)
        if org.country:
            score += 0.2  # Assume some geographic relevance
        
        # Base score for active calls
        score += 0.3
        
        # Add some randomness for demo variety
        import random
        score += random.uniform(0, 0.2)
        
        return min(score, 1.0)
    
    def _get_match_reasons(self, org: Organization, call: DonorCall) -> List[str]:
        """Get reasons why this call matches the organization"""
        reasons = []
        
        if org.sector:
            reasons.append(f"Sector alignment: {org.sector}")
        
        if call.keywords:
            reasons.append(f"Keyword match: {', '.join(call.keywords[:3])}")
        
        if org.country:
            reasons.append(f"Geographic relevance: {org.country}")
        
        return reasons