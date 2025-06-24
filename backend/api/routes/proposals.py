from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ...core.database import get_db
from ...core.auth import get_current_user
from ...models.user import User
from ...models.proposal import Proposal, ProposalStatus
from ...schemas.proposal import ProposalCreate, ProposalResponse, ProposalUpdate
from ...services.ai_service import AIService

router = APIRouter()

@router.get("/", response_model=List[ProposalResponse])
async def get_proposals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Proposal).where(
            and_(
                Proposal.organization_id == current_user.organization_id,
                Proposal.created_by_id == current_user.id
            )
        )
    )
    proposals = result.scalars().all()
    return proposals

@router.post("/", response_model=ProposalResponse)
async def create_proposal(
    proposal_data: ProposalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_proposal = Proposal(
        **proposal_data.dict(),
        organization_id=current_user.organization_id,
        created_by_id=current_user.id
    )
    
    db.add(db_proposal)
    await db.commit()
    await db.refresh(db_proposal)
    
    return db_proposal

@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Proposal).where(
            and_(
                Proposal.id == proposal_id,
                Proposal.organization_id == current_user.organization_id
            )
        )
    )
    proposal = result.scalar_one_or_none()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    return proposal

@router.put("/{proposal_id}", response_model=ProposalResponse)
async def update_proposal(
    proposal_id: int,
    proposal_data: ProposalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Proposal).where(
            and_(
                Proposal.id == proposal_id,
                Proposal.organization_id == current_user.organization_id
            )
        )
    )
    proposal = result.scalar_one_or_none()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Update fields
    for field, value in proposal_data.dict(exclude_unset=True).items():
        setattr(proposal, field, value)
    
    await db.commit()
    await db.refresh(proposal)
    
    return proposal

@router.post("/{proposal_id}/ai-analyze")
async def analyze_proposal_with_ai(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Proposal).where(
            and_(
                Proposal.id == proposal_id,
                Proposal.organization_id == current_user.organization_id
            )
        )
    )
    proposal = result.scalar_one_or_none()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Use AI service to analyze proposal
    ai_service = AIService()
    analysis = await ai_service.analyze_proposal(proposal)
    
    # Update proposal with AI analysis
    proposal.ai_score = analysis["score"]
    proposal.ai_recommendations = analysis["recommendations"]
    
    await db.commit()
    
    return analysis