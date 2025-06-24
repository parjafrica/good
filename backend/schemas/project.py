from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.project import ProjectStatus

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_budget: Optional[float] = None
    currency: str = "USD"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    completion_percentage: Optional[float] = None
    spent_amount: Optional[float] = None

class ProjectResponse(ProjectBase):
    id: int
    status: ProjectStatus
    completion_percentage: float
    spent_amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True