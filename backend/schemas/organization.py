from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None
    mission_statement: Optional[str] = None
    vision_statement: Optional[str] = None
    sector: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None

class OrganizationResponse(OrganizationBase):
    id: int
    brand_colors: Optional[Dict[str, str]] = None
    logo_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True