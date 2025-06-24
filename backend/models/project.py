from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from ..core.database import Base

class ProjectStatus(PyEnum):
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING)
    
    # Timeline
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    actual_start_date = Column(DateTime, nullable=True)
    actual_end_date = Column(DateTime, nullable=True)
    
    # Financial
    total_budget = Column(Float)
    spent_amount = Column(Float, default=0)
    currency = Column(String, default="USD")
    
    # Progress tracking
    completion_percentage = Column(Float, default=0)
    milestones = Column(JSON)  # List of milestone objects
    
    # Logic Model / Theory of Change
    theory_of_change = Column(JSON)
    logic_model = Column(JSON)
    
    # M&E Framework
    indicators = Column(JSON)  # List of indicator objects
    baseline_data = Column(JSON)
    target_values = Column(JSON)
    actual_values = Column(JSON)
    
    # Risk Management
    risk_register = Column(JSON)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    manager_id = Column(Integer, ForeignKey("users.id"))
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="projects")
    manager = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="todo")  # todo, in_progress, completed
    priority = Column(String, default="medium")  # low, medium, high
    
    # Timeline
    due_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    
    # Assignment
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    # Relationships
    project = relationship("Project", back_populates="tasks")