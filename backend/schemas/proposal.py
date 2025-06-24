from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.proposal import ProposalStatus

class ProposalBase(BaseModel):
    title: str
    description: Optional[str] = None
    requested_amount: Optional[float] = None
    currency: str = "USD"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None

class ProposalCreate(ProposalBase):
    pass

class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProposalStatus] = None
    executive_summary: Optional[str] = None
    problem_statement: Optional[str] = None
    objectives: Optional[str] = None
    methodology: Optional[str] = None
    budget_narrative: Optional[str] = None
    monitoring_evaluation: Optional[str] = None
    sustainability: Optional[str] = None

class ProposalResponse(ProposalBase):
    id: int
    status: ProposalStatus
    ai_score: Optional[float] = None
    ai_recommendations: Optional[Dict[str, Any]] = None
    match_score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True