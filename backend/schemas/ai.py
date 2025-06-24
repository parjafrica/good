from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    content: str
    context: Optional[Dict[str, Any]] = None

class AINotification(BaseModel):
    id: str
    type: str  # alert, suggestion, reminder, insight
    title: str
    message: str
    priority: str  # high, medium, low
    timestamp: datetime
    actionable: bool
    action: Optional[str] = None

class AIAnalysisRequest(BaseModel):
    analysis_type: str  # proposal, donor_match, etc.
    content: str
    context: Optional[Dict[str, Any]] = None