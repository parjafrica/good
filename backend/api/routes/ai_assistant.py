from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ...core.database import get_db
from ...core.auth import get_current_user
from ...models.user import User
from ...services.ai_service import AIService
from ...schemas.ai import ChatMessage, AINotification, AIAnalysisRequest

router = APIRouter()

@router.post("/chat")
async def chat_with_ai(
    message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Chat with Granada AI Assistant"""
    ai_service = AIService()
    response = await ai_service.process_chat_message(
        message.content, 
        current_user.organization_id,
        db
    )
    return {"response": response}

@router.get("/notifications", response_model=List[AINotification])
async def get_ai_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get AI-generated notifications and insights"""
    ai_service = AIService()
    notifications = await ai_service.generate_notifications(
        current_user.organization_id, db
    )
    return notifications

@router.post("/analyze")
async def analyze_with_ai(
    request: AIAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze content with AI"""
    ai_service = AIService()
    
    if request.analysis_type == "proposal":
        result = await ai_service.analyze_proposal_content(request.content)
    elif request.analysis_type == "donor_match":
        result = await ai_service.analyze_donor_match(request.content)
    else:
        raise HTTPException(status_code=400, detail="Invalid analysis type")
    
    return result

@router.post("/generate")
async def generate_content(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate content using AI"""
    ai_service = AIService()
    
    content_type = request.get("type")
    prompt = request.get("prompt")
    context = request.get("context", {})
    
    if content_type == "proposal_section":
        result = await ai_service.generate_proposal_section(prompt, context)
    elif content_type == "executive_summary":
        result = await ai_service.generate_executive_summary(context)
    else:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    return {"generated_content": result}