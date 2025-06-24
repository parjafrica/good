from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ...core.database import get_db
from ...core.auth import get_current_user
from ...models.user import User
from ...models.donor import Donor, DonorCall
from ...schemas.donor import DonorResponse, DonorCallResponse
from ...services.matching_service import MatchingService

router = APIRouter()

@router.get("/", response_model=List[DonorResponse])
async def get_donors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Donor))
    donors = result.scalars().all()
    return donors

@router.get("/calls", response_model=List[DonorCallResponse])
async def get_donor_calls(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DonorCall))
    calls = result.scalars().all()
    return calls

@router.get("/calls/matched")
async def get_matched_opportunities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get donor calls matched to user's organization"""
    matching_service = MatchingService()
    matched_calls = await matching_service.find_matching_opportunities(
        current_user.organization_id, db
    )
    return matched_calls

@router.get("/calls/{call_id}", response_model=DonorCallResponse)
async def get_donor_call(
    call_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DonorCall).where(DonorCall.id == call_id))
    call = result.scalar_one_or_none()
    
    if not call:
        raise HTTPException(status_code=404, detail="Donor call not found")
    
    return call