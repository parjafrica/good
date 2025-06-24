from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DonorBase(BaseModel):
    name: str
    type: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

class DonorResponse(DonorBase):
    id: int
    focus_areas: Optional[List[str]] = None
    geographic_focus: Optional[List[str]] = None
    funding_range_min: Optional[float] = None
    funding_range_max: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class DonorCallBase(BaseModel):
    title: str
    description: Optional[str] = None
    total_funding: Optional[float] = None
    max_grant_size: Optional[float] = None
    min_grant_size: Optional[float] = None
    currency: str = "USD"
    application_deadline: Optional[datetime] = None

class DonorCallResponse(DonorCallBase):
    id: int
    donor_id: int
    eligibility_criteria: Optional[str] = None
    required_documents: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    sdg_alignment: Optional[List[int]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True