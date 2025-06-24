from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Donor(Base):
    __tablename__ = "donors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(String)  # Government, Foundation, Multilateral, etc.
    country = Column(String)
    website = Column(String)
    description = Column(Text)
    
    # Focus areas and priorities
    focus_areas = Column(JSON)  # ["Education", "Health", "Environment"]
    geographic_focus = Column(JSON)  # ["Africa", "Asia", "Global"]
    funding_range_min = Column(Float)
    funding_range_max = Column(Float)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    calls = relationship("DonorCall", back_populates="donor")
    interactions = relationship("DonorInteraction", back_populates="donor")

class DonorCall(Base):
    __tablename__ = "donor_calls"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    
    # Financial
    total_funding = Column(Float)
    max_grant_size = Column(Float)
    min_grant_size = Column(Float)
    currency = Column(String, default="USD")
    
    # Timeline
    application_deadline = Column(DateTime)
    project_start_date = Column(DateTime)
    project_duration_months = Column(Integer)
    
    # Requirements
    eligibility_criteria = Column(Text)
    required_documents = Column(JSON)
    evaluation_criteria = Column(Text)
    
    # AI Processing
    embedding_vector = Column(JSON)  # For semantic matching
    keywords = Column(JSON)
    sdg_alignment = Column(JSON)  # SDG goals alignment
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id"))
    
    # Relationships
    donor = relationship("Donor", back_populates="calls")
    proposals = relationship("Proposal", back_populates="donor_call")

class DonorInteraction(Base):
    __tablename__ = "donor_interactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interaction_type = Column(String)  # Email, Meeting, Call, etc.
    subject = Column(String)
    notes = Column(Text)
    interaction_date = Column(DateTime)
    follow_up_date = Column(DateTime, nullable=True)
    
    # Foreign Keys
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Relationships
    donor = relationship("Donor", back_populates="interactions")
    organization = relationship("Organization", back_populates="donor_interactions")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())