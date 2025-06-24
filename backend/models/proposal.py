from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from ..core.database import Base

class ProposalStatus(PyEnum):
    DRAFT = "draft"
    REVIEW = "review"
    SUBMITTED = "submitted"
    AWARDED = "awarded"
    DECLINED = "declined"

class Proposal(Base):
    __tablename__ = "proposals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(ProposalStatus), default=ProposalStatus.DRAFT)
    
    # Financial
    requested_amount = Column(Float)
    currency = Column(String, default="USD")
    
    # Timeline
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    submission_deadline = Column(DateTime)
    
    # Content sections
    executive_summary = Column(Text)
    problem_statement = Column(Text)
    objectives = Column(Text)
    methodology = Column(Text)
    budget_narrative = Column(Text)
    monitoring_evaluation = Column(Text)
    sustainability = Column(Text)
    
    # AI Analysis
    ai_score = Column(Float)  # Granada AI scoring
    ai_recommendations = Column(JSON)
    match_score = Column(Float)  # Donor matching score
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    created_by_id = Column(Integer, ForeignKey("users.id"))
    donor_call_id = Column(Integer, ForeignKey("donor_calls.id"), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="proposals")
    created_by_user = relationship("User", back_populates="proposals")
    donor_call = relationship("DonorCall", back_populates="proposals")