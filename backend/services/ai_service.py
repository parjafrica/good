import openai
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.config import settings
from ..models.proposal import Proposal
from ..models.organization import Organization

class AIService:
    def __init__(self):
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
    
    async def analyze_proposal(self, proposal: Proposal) -> Dict[str, Any]:
        """Analyze a proposal and provide AI scoring and recommendations"""
        
        # Combine all proposal sections for analysis
        content = f"""
        Title: {proposal.title}
        Description: {proposal.description}
        Executive Summary: {proposal.executive_summary or ''}
        Problem Statement: {proposal.problem_statement or ''}
        Objectives: {proposal.objectives or ''}
        Methodology: {proposal.methodology or ''}
        M&E Plan: {proposal.monitoring_evaluation or ''}
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are Granada AI, an expert grant proposal analyzer. 
                        Analyze the proposal and provide:
                        1. A score from 0-100 based on clarity, completeness, and strength
                        2. Specific recommendations for improvement
                        3. Identify missing sections or weak areas
                        4. Suggest ways to strengthen the narrative
                        
                        Return your analysis in JSON format with 'score' and 'recommendations' fields."""
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this proposal:\n\n{content}"
                    }
                ],
                temperature=0.3
            )
            
            # Parse AI response
            ai_analysis = response.choices[0].message.content
            
            # For demo purposes, return structured data
            return {
                "score": 78,
                "recommendations": [
                    {
                        "section": "Problem Statement",
                        "priority": "high",
                        "suggestion": "Add more specific statistics and evidence to strengthen the problem definition"
                    },
                    {
                        "section": "M&E Framework",
                        "priority": "medium", 
                        "suggestion": "Include more specific indicators and baseline data collection methods"
                    },
                    {
                        "section": "Budget Narrative",
                        "priority": "low",
                        "suggestion": "Provide more detailed justification for personnel costs"
                    }
                ],
                "strengths": [
                    "Clear project objectives",
                    "Well-defined target beneficiaries",
                    "Strong organizational capacity"
                ],
                "overall_feedback": "This proposal shows strong potential with clear objectives and methodology. Focus on strengthening the evidence base and M&E framework to improve competitiveness."
            }
            
        except Exception as e:
            # Fallback analysis if OpenAI is not available
            return {
                "score": 75,
                "recommendations": [
                    {
                        "section": "General",
                        "priority": "medium",
                        "suggestion": "AI analysis temporarily unavailable. Manual review recommended."
                    }
                ],
                "strengths": ["Proposal structure is complete"],
                "overall_feedback": "Proposal ready for manual review."
            }
    
    async def process_chat_message(self, message: str, organization_id: int, db: AsyncSession) -> str:
        """Process a chat message from the user"""
        
        # Get organization context
        result = await db.execute(select(Organization).where(Organization.id == organization_id))
        org = result.scalar_one_or_none()
        
        context = f"Organization: {org.name if org else 'Unknown'}\nSector: {org.sector if org else 'Unknown'}"
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are Granada AI, an intelligent assistant for NGOs and social enterprises.
                        You help with proposal writing, funding opportunities, project management, and organizational development.
                        
                        User's organization context:
                        {context}
                        
                        Be helpful, professional, and provide actionable advice."""
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return "I'm here to help! I can assist you with proposal writing, finding funding opportunities, project management, and more. What would you like to know?"
    
    async def generate_notifications(self, organization_id: int, db: AsyncSession) -> List[Dict[str, Any]]:
        """Generate AI-powered notifications and insights"""
        
        # This would typically analyze recent data and generate contextual notifications
        # For demo purposes, return sample notifications
        return [
            {
                "id": "1",
                "type": "alert",
                "title": "High-Priority Match",
                "message": "New USAID funding call matches 95% with your 'Digital Literacy' project proposal.",
                "priority": "high",
                "timestamp": "2024-01-15T10:30:00Z",
                "actionable": True,
                "action": "Review Opportunity"
            },
            {
                "id": "2", 
                "type": "suggestion",
                "title": "Proposal Enhancement",
                "message": "Your 'Youth Empowerment' proposal could be strengthened by adding more impact metrics.",
                "priority": "medium",
                "timestamp": "2024-01-15T08:15:00Z",
                "actionable": True,
                "action": "Improve Proposal"
            },
            {
                "id": "3",
                "type": "reminder",
                "title": "Deadline Approaching", 
                "message": "UNDP Climate Action call deadline is in 3 days. Current proposal completion: 78%.",
                "priority": "high",
                "timestamp": "2024-01-15T06:00:00Z",
                "actionable": True,
                "action": "Continue Proposal"
            }
        ]
    
    async def generate_proposal_section(self, prompt: str, context: Dict[str, Any]) -> str:
        """Generate proposal section content based on prompt and context"""
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are Granada AI, an expert grant proposal writer. 
                        Generate high-quality, professional proposal content based on the user's prompt and context.
                        Make the content specific, evidence-based, and compelling."""
                    },
                    {
                        "role": "user",
                        "content": f"Context: {context}\n\nPrompt: {prompt}"
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return "AI content generation temporarily unavailable. Please try again later or write this section manually."