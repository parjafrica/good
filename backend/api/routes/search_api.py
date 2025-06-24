import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc

from ...core.database import get_db
from ...database.models import DonorOpportunity
from ...services.bot_manager import bot_manager

# Configure a logger for this file
logger = logging.getLogger(__name__)

# --- THIS IS THE MISSING LINE THAT CAUSED THE CRASH ---
router = APIRouter()
# ----------------------------------------------------

@router.get("/opportunities", response_model=dict)
async def get_opportunities(
    query: Optional[str] = None,
    country: Optional[str] = None,
    sector: Optional[str] = None,
    min_amount: Optional[int] = None,
    verified_only: bool = False,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Get funding opportunities with robust filtering and error handling.
    """
    try:
        # Start with a clean query every time
        stmt = select(DonorOpportunity)
        
        filter_conditions = []

        # Always filter for active opportunities, unless a specific query is for an expired one
        if "expired" not in (query or "").lower():
             filter_conditions.append(DonorOpportunity.is_active == True)
        
        if query:
            # Search in title, description, country, and source_name for better matching
            filter_conditions.append(or_(
                DonorOpportunity.title.ilike(f"%{query}%"),
                DonorOpportunity.description.ilike(f"%{query}%"),
                DonorOpportunity.country.ilike(f"%{query}%"),
                DonorOpportunity.source_name.ilike(f"%{query}%")
            ))
        
        if country:
            filter_conditions.append(DonorOpportunity.country.ilike(f"%{country}%"))
        if sector:
            filter_conditions.append(DonorOpportunity.sector.ilike(f"%{sector}%"))
        if min_amount:
            filter_conditions.append(DonorOpportunity.amount_max >= min_amount)
        if verified_only:
            filter_conditions.append(DonorOpportunity.is_verified == True)

        # Apply all collected filters to the statement
        if filter_conditions:
            stmt = stmt.where(and_(*filter_conditions))
        
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_count = await db.scalar(count_stmt)

        stmt = stmt.order_by(desc(DonorOpportunity.scraped_at)).offset(offset).limit(limit)
        
        result = await db.execute(stmt)
        opportunities = result.scalars().all()
        
        response_data = []
        for opp in opportunities:
            response_data.append({
                "id": str(opp.id),
                "title": opp.title,
                "description": opp.description,
                "deadline": opp.deadline.isoformat() if opp.deadline else None,
                "amount_min": opp.amount_min,
                "amount_max": opp.amount_max,
                "currency": opp.currency,
                "source_url": opp.source_url,
                "source_name": opp.source_name,
                "country": opp.country,
                "sector": opp.sector,
                "is_verified": opp.is_verified,
                "verification_score": opp.verification_score,
                "scraped_at": opp.scraped_at.isoformat() if opp.scraped_at else None,
                "content_hash": opp.content_hash
            })

        return {
            "opportunities": response_data,
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total_count
        }
        
    except Exception as e:
        logger.error(f"API Error in /opportunities: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred while fetching opportunities.")


@router.get("/opportunity/{opportunity_id}", response_model=dict)
async def get_opportunity_details(
    opportunity_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific opportunity.
    """
    try:
        try:
            opp_id = uuid.UUID(opportunity_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid opportunity ID format. Must be a valid UUID.")
        
        result = await db.execute(select(DonorOpportunity).where(DonorOpportunity.id == opp_id))
        opportunity = result.scalar_one_or_none()
        
        if not opportunity:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        # Safely format response based on the actual DonorOpportunity model
        return {
            "id": str(opportunity.id),
            "title": opportunity.title,
            "description": opportunity.description,
            "deadline": opportunity.deadline.isoformat() if opportunity.deadline else None,
            "amount_min": opportunity.amount_min,
            "amount_max": opportunity.amount_max,
            "currency": opportunity.currency,
            "source_url": opportunity.source_url,
            "source_name": opportunity.source_name,
            "country": opportunity.country,
            "sector": opportunity.sector,
            "keywords": opportunity.keywords,
            "focus_areas": opportunity.focus_areas,
            "is_verified": opportunity.is_verified,
            "verification_score": opportunity.verification_score,
            "scraped_at": opportunity.scraped_at.isoformat() if opportunity.scraped_at else None,
            "last_verified": opportunity.last_verified.isoformat() if opportunity.last_verified else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API Error in /opportunity/{opportunity_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred while fetching the opportunity.")


@router.get("/bot-status", response_model=dict)
async def get_bot_status():
    """
    Get the current status of the search bot system.
    """
    if not bot_manager.bot:
        return {"status": "inactive", "message": "Bot has not been initialized."}

    return {
        "bot_id": bot_manager.bot.bot_id,
        "country": bot_manager.bot.country,
        "status": bot_manager.bot.status.value,
        "is_running": bot_manager.running,
        "opportunities_found_this_session": bot_manager.bot.opportunities_found,
        "last_run": bot_manager.bot.last_run.isoformat() if bot_manager.bot.last_run else None,
        "errors_count": len(bot_manager.bot.errors)
    }