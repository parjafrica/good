"""
Advanced Personalization Engine for Granada OS
Creates unique experiences for each user based on their data, behavior, and preferences
"""

import os
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import asyncio
import random

# Pydantic Models for API
class UserPersonalizationRequest(BaseModel):
    user_id: str
    profile_data: Dict[str, Any]
    location_data: Dict[str, Any]
    behavior_data: Optional[Dict[str, Any]] = {}

class PersonalizationResponse(BaseModel):
    user_id: str
    theme_colors: Dict[str, str]
    personalized_content: Dict[str, Any]
    success_stories: List[Dict[str, Any]]
    ai_recommendations: List[str]
    system_adaptations: Dict[str, Any]
    learning_insights: Dict[str, Any]

class BehaviorTrackingData(BaseModel):
    user_id: str
    action: str
    page: str
    metadata: Optional[Dict[str, Any]] = {}
    timestamp: Optional[datetime] = None

app = FastAPI(title="Granada OS Personalization Engine")

class PersonalizationEngine:
    def __init__(self):
        self.db_config = self._parse_db_url()
        self.color_palettes = self._load_color_palettes()
        self.content_templates = self._load_content_templates()
        self.learning_patterns = {}
        
    def _parse_db_url(self) -> Dict[str, str]:
        """Parse DATABASE_URL into connection parameters"""
        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            raise ValueError("DATABASE_URL environment variable not set")
            
        # Parse PostgreSQL URL
        import urllib.parse as urlparse
        parsed = urlparse.urlparse(db_url)
        
        return {
            'host': parsed.hostname,
            'port': parsed.port or 5432,
            'database': parsed.path[1:],  # Remove leading '/'
            'user': parsed.username,
            'password': parsed.password
        }
    
    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.db_config, cursor_factory=RealDictCursor)
    
    def _load_color_palettes(self) -> Dict[str, Dict[str, str]]:
        """Load personalized color palettes based on user characteristics"""
        return {
            'student_africa': {
                'primary': '#2563eb',     # Blue
                'secondary': '#16a34a',   # Green
                'accent': '#dc2626',      # Red
                'background': '#0f172a',  # Dark
                'surface': '#1e293b',     # Gray
                'text': '#f8fafc'        # Light
            },
            'student_europe': {
                'primary': '#7c3aed',     # Purple
                'secondary': '#059669',   # Emerald
                'accent': '#ea580c',      # Orange
                'background': '#111827',  # Dark
                'surface': '#374151',     # Gray
                'text': '#f9fafb'        # Light
            },
            'organization_africa': {
                'primary': '#16a34a',     # Green
                'secondary': '#2563eb',   # Blue
                'accent': '#ca8a04',      # Yellow
                'background': '#14532d',  # Dark Green
                'surface': '#166534',     # Green
                'text': '#ecfdf5'        # Light Green
            },
            'organization_global': {
                'primary': '#0891b2',     # Cyan
                'secondary': '#7c2d12',   # Brown
                'accent': '#be123c',      # Rose
                'background': '#164e63',  # Dark Cyan
                'surface': '#0e7490',     # Cyan
                'text': '#cffafe'        # Light Cyan
            },
            'business_tech': {
                'primary': '#6366f1',     # Indigo
                'secondary': '#8b5cf6',   # Violet
                'accent': '#ec4899',      # Pink
                'background': '#312e81',  # Dark Indigo
                'surface': '#4338ca',     # Indigo
                'text': '#e0e7ff'        # Light Indigo
            },
            'business_traditional': {
                'primary': '#1f2937',     # Gray
                'secondary': '#374151',   # Gray
                'accent': '#059669',      # Emerald
                'background': '#111827',  # Dark
                'surface': '#1f2937',     # Gray
                'text': '#f3f4f6'        # Light Gray
            }
        }
    
    def _load_content_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load content templates for different user types and regions"""
        return {
            'student_africa': {
                'welcome_message': 'Karibu! Your African scholarship journey starts here',
                'success_metrics': 'Join 2,500+ African students who secured funding',
                'primary_focus': 'Education & Research Grants',
                'motivational_tone': 'Empowering and community-focused'
            },
            'student_global': {
                'welcome_message': 'Welcome to your global education funding platform',
                'success_metrics': 'Connect with 15,000+ successful scholars worldwide',
                'primary_focus': 'International Scholarships & Fellowships',
                'motivational_tone': 'Achievement-oriented and aspirational'
            },
            'organization_africa': {
                'welcome_message': 'Transforming communities through strategic funding',
                'success_metrics': '500+ African NGOs funded over $50M annually',
                'primary_focus': 'Development & Social Impact Grants',
                'motivational_tone': 'Impact-driven and collaborative'
            },
            'business_startup': {
                'welcome_message': 'Scale your startup with strategic funding',
                'success_metrics': '1,200+ startups raised $2B+ in funding',
                'primary_focus': 'Venture Capital & Innovation Grants',
                'motivational_tone': 'Dynamic and growth-focused'
            }
        }
    
    def generate_user_color_scheme(self, user_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate personalized color scheme based on user profile"""
        user_type = user_data.get('userType', 'student')
        location = user_data.get('location', {})
        continent = location.get('continent', 'Global')
        country = location.get('country', 'Global')
        
        # AI-driven color selection logic
        if user_type == 'student':
            if continent == 'Africa':
                base_palette = 'student_africa'
            else:
                base_palette = 'student_europe'
        elif user_type == 'organization':
            if continent == 'Africa':
                base_palette = 'organization_africa'
            else:
                base_palette = 'organization_global'
        elif user_type == 'business':
            # Detect if tech-oriented based on business type or sector
            business_type = user_data.get('businessType', '')
            if 'tech' in business_type.lower() or 'software' in business_type.lower():
                base_palette = 'business_tech'
            else:
                base_palette = 'business_traditional'
        else:
            base_palette = 'student_africa'  # Default
        
        colors = self.color_palettes.get(base_palette, self.color_palettes['student_africa'])
        
        # Add personalization based on user preferences or behavior
        user_hash = hashlib.md5(str(user_data).encode()).hexdigest()
        seed = int(user_hash[:8], 16)
        random.seed(seed)
        
        # Slightly modify colors for uniqueness while maintaining harmony
        hue_shift = random.randint(-20, 20)
        colors['gradient_start'] = self._shift_color_hue(colors['primary'], hue_shift)
        colors['gradient_end'] = self._shift_color_hue(colors['secondary'], hue_shift)
        
        return colors
    
    def _shift_color_hue(self, hex_color: str, shift: int) -> str:
        """Shift the hue of a hex color by a given amount"""
        # Simple hue shifting - in production, use proper color space conversion
        try:
            rgb = tuple(int(hex_color[i:i+2], 16) for i in (1, 3, 5))
            # Basic hue shift approximation
            r, g, b = rgb
            factor = 1 + (shift / 100)
            r = min(255, max(0, int(r * factor)))
            g = min(255, max(0, int(g * factor)))
            b = min(255, max(0, int(b * factor)))
            return f'#{r:02x}{g:02x}{b:02x}'
        except:
            return hex_color
    
    def generate_personalized_content(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized content based on user profile and location"""
        user_type = user_data.get('userType', 'student')
        location = user_data.get('location', {})
        country = location.get('country', 'Global')
        continent = location.get('continent', 'Global')
        
        # Determine content template
        if user_type == 'student' and continent == 'Africa':
            template_key = 'student_africa'
        elif user_type == 'student':
            template_key = 'student_global'
        elif user_type == 'organization' and continent == 'Africa':
            template_key = 'organization_africa'
        elif user_type == 'business':
            template_key = 'business_startup'
        else:
            template_key = 'student_global'
        
        base_content = self.content_templates.get(template_key, self.content_templates['student_global'])
        
        # Personalize with user-specific data
        personalized_content = {
            'welcome_title': base_content['welcome_message'],
            'success_metrics': base_content['success_metrics'],
            'primary_focus': base_content['primary_focus'],
            'country_specific_info': self._get_country_funding_info(country),
            'user_journey_stage': self._determine_user_stage(user_data),
            'recommended_next_steps': self._generate_next_steps(user_data),
            'personalized_greeting': self._generate_personalized_greeting(user_data)
        }
        
        return personalized_content
    
    def generate_personalized_success_stories(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate success stories that match user's profile and aspirations"""
        user_type = user_data.get('userType', 'student')
        location = user_data.get('location', {})
        country = location.get('country', 'Global')
        continent = location.get('continent', 'Global')
        
        # Base success stories tailored to user type and location
        if user_type == 'student' and continent == 'Africa':
            stories = [
                {
                    "name": "Amina Hassan",
                    "type": "Kenyan Medical Student",
                    "achievement": "Secured $75,000 WHO Health Research Fellowship",
                    "amount": "$75K",
                    "image": "👩‍⚕️",
                    "quote": "Granada OS connected me with the perfect research opportunity in global health.",
                    "location": "Nairobi, Kenya",
                    "timeframe": "3 months",
                    "sector": "Health"
                },
                {
                    "name": "David Mugisha",
                    "type": "Ugandan Engineering Student",
                    "achievement": "Won $50,000 Innovation Grant for Solar Tech",
                    "amount": "$50K",
                    "image": "⚡",
                    "quote": "The AI-powered matching found funders specifically interested in renewable energy in East Africa.",
                    "location": "Kampala, Uganda",
                    "timeframe": "4 months",
                    "sector": "Technology"
                }
            ]
        elif user_type == 'organization' and continent == 'Africa':
            stories = [
                {
                    "name": "Ubuntu Education Initiative",
                    "type": "South African NGO",
                    "achievement": "Received $300,000 Gates Foundation Grant",
                    "amount": "$300K",
                    "image": "📚",
                    "quote": "Granada OS helped us navigate complex international funding requirements.",
                    "location": "Cape Town, South Africa",
                    "timeframe": "6 months",
                    "sector": "Education"
                }
            ]
        elif user_type == 'business':
            stories = [
                {
                    "name": "AgriTech Solutions",
                    "type": "Nigerian Startup",
                    "achievement": "Raised $1.2M Series A from European VCs",
                    "amount": "$1.2M",
                    "image": "🌾",
                    "quote": "The platform connected us with impact investors who understood our mission.",
                    "location": "Lagos, Nigeria",
                    "timeframe": "8 months",
                    "sector": "Agriculture"
                }
            ]
        else:
            # Global/default stories
            stories = [
                {
                    "name": "Maria Rodriguez",
                    "type": "International Scholar",
                    "achievement": "Secured Fulbright Fellowship for Climate Research",
                    "amount": "$85K",
                    "image": "🌍",
                    "quote": "Granada OS made the complex application process manageable and strategic.",
                    "location": "Global Program",
                    "timeframe": "5 months",
                    "sector": "Environment"
                }
            ]
        
        # Add country-specific stories if available
        country_stories = self._get_country_specific_stories(country)
        stories.extend(country_stories)
        
        return stories[:6]  # Return top 6 most relevant stories
    
    def _get_country_funding_info(self, country: str) -> Dict[str, Any]:
        """Get country-specific funding information"""
        country_data = {
            'Kenya': {
                'total_opportunities': 850,
                'average_amount': '$45,000',
                'success_rate': '68%',
                'top_sectors': ['Agriculture', 'Health', 'Education'],
                'local_funders': ['Kenya National Innovation Agency', 'USAID Kenya', 'World Bank Kenya']
            },
            'Nigeria': {
                'total_opportunities': 1200,
                'average_amount': '$62,000',
                'success_rate': '71%',
                'top_sectors': ['Technology', 'Agriculture', 'Social Enterprise'],
                'local_funders': ['Bank of Industry', 'TechStars Lagos', 'Lagos State Employment Trust Fund']
            },
            'Uganda': {
                'total_opportunities': 600,
                'average_amount': '$38,000',
                'success_rate': '65%',
                'top_sectors': ['Education', 'Health', 'Agriculture'],
                'local_funders': ['Uganda Industrial Research Institute', 'USAID Uganda', 'World Vision Uganda']
            }
        }
        
        return country_data.get(country, {
            'total_opportunities': 500,
            'average_amount': '$55,000',
            'success_rate': '58%',
            'top_sectors': ['General', 'Innovation', 'Development'],
            'local_funders': ['International Development Organizations']
        })
    
    def _determine_user_stage(self, user_data: Dict[str, Any]) -> str:
        """Determine what stage the user is at in their funding journey"""
        # This would be enhanced with actual behavior tracking
        return "getting_started"  # Can be: getting_started, researching, applying, advanced
    
    def _generate_next_steps(self, user_data: Dict[str, Any]) -> List[str]:
        """Generate personalized next steps for the user"""
        user_type = user_data.get('userType', 'student')
        location = user_data.get('location', {})
        
        if user_type == 'student':
            return [
                f"Complete your academic profile for {location.get('country', 'your region')}",
                "Upload your CV and transcripts",
                "Browse scholarships matching your field of study",
                "Set up funding alerts for your interests"
            ]
        elif user_type == 'organization':
            return [
                "Register your organization details",
                "Define your impact areas and target demographics",
                "Explore grants matching your mission",
                "Connect with similar organizations in your region"
            ]
        else:  # business
            return [
                "Complete your business profile and pitch deck",
                "Define your funding stage and requirements",
                "Browse investor networks and grant opportunities",
                "Schedule calls with relevant funders"
            ]
    
    def _generate_personalized_greeting(self, user_data: Dict[str, Any]) -> str:
        """Generate a personalized greeting based on user data"""
        first_name = user_data.get('firstName', 'there')
        location = user_data.get('location', {})
        country = location.get('country', '')
        user_type = user_data.get('userType', 'student')
        
        time_hour = datetime.now().hour
        time_greeting = "Good morning" if time_hour < 12 else "Good afternoon" if time_hour < 17 else "Good evening"
        
        if country in ['Kenya', 'Uganda', 'Tanzania']:
            return f"Karibu, {first_name}! {time_greeting} from your funding success platform."
        elif country in ['Nigeria', 'Ghana']:
            return f"Welcome, {first_name}! {time_greeting} - let's unlock funding opportunities for you."
        else:
            return f"{time_greeting}, {first_name}! Ready to discover perfect funding matches?"
    
    def _get_country_specific_stories(self, country: str) -> List[Dict[str, Any]]:
        """Get additional success stories specific to user's country"""
        # This would be populated from database in production
        return []
    
    def track_user_behavior(self, behavior_data: BehaviorTrackingData):
        """Track user behavior to improve personalization"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO user_behavior_tracking 
                        (user_id, action, page, metadata, timestamp)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        behavior_data.user_id,
                        behavior_data.action,
                        behavior_data.page,
                        json.dumps(behavior_data.metadata),
                        behavior_data.timestamp or datetime.now()
                    ))
                    conn.commit()
        except Exception as e:
            print(f"Error tracking behavior: {e}")
    
    def learn_and_adapt(self, user_id: str) -> Dict[str, Any]:
        """Analyze user behavior and adapt the system accordingly"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cur:
                    # Get user's recent behavior
                    cur.execute("""
                        SELECT action, page, metadata, timestamp
                        FROM user_behavior_tracking
                        WHERE user_id = %s AND timestamp >= %s
                        ORDER BY timestamp DESC
                        LIMIT 100
                    """, (user_id, datetime.now() - timedelta(days=30)))
                    
                    behaviors = cur.fetchall()
                    
                    # Analyze patterns
                    learning_insights = {
                        'total_actions': len(behaviors),
                        'most_visited_pages': self._analyze_page_visits(behaviors),
                        'engagement_level': self._calculate_engagement(behaviors),
                        'preferred_content_types': self._analyze_content_preferences(behaviors),
                        'optimal_interaction_times': self._analyze_time_patterns(behaviors),
                        'next_adaptations': self._suggest_adaptations(behaviors)
                    }
                    
                    return learning_insights
        except Exception as e:
            print(f"Error in learning and adaptation: {e}")
            return {}
    
    def _analyze_page_visits(self, behaviors: List[Dict]) -> List[str]:
        """Analyze which pages user visits most"""
        page_counts = {}
        for behavior in behaviors:
            page = behavior.get('page', 'unknown')
            page_counts[page] = page_counts.get(page, 0) + 1
        
        return sorted(page_counts.keys(), key=lambda x: page_counts[x], reverse=True)[:5]
    
    def _calculate_engagement(self, behaviors: List[Dict]) -> str:
        """Calculate user engagement level"""
        if len(behaviors) > 50:
            return "high"
        elif len(behaviors) > 20:
            return "medium"
        else:
            return "low"
    
    def _analyze_content_preferences(self, behaviors: List[Dict]) -> List[str]:
        """Analyze what type of content user prefers"""
        # This would be more sophisticated in production
        return ["funding_opportunities", "success_stories", "application_tips"]
    
    def _analyze_time_patterns(self, behaviors: List[Dict]) -> Dict[str, Any]:
        """Analyze when user is most active"""
        hour_counts = {}
        for behavior in behaviors:
            timestamp = behavior.get('timestamp')
            if timestamp:
                hour = timestamp.hour
                hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        if hour_counts:
            peak_hour = max(hour_counts.keys(), key=lambda x: hour_counts[x])
            return {
                'peak_hour': peak_hour,
                'peak_period': 'morning' if peak_hour < 12 else 'afternoon' if peak_hour < 17 else 'evening'
            }
        
        return {'peak_hour': 14, 'peak_period': 'afternoon'}  # Default
    
    def _suggest_adaptations(self, behaviors: List[Dict]) -> List[str]:
        """Suggest system adaptations based on user behavior"""
        suggestions = []
        
        # Analyze behavior patterns and suggest improvements
        if len(behaviors) < 10:
            suggestions.append("Increase onboarding guidance")
        
        action_types = [b.get('action', '') for b in behaviors]
        if action_types.count('search') > action_types.count('apply'):
            suggestions.append("Suggest more application support")
        
        if any('funding_opportunities' in str(b.get('metadata', {})) for b in behaviors):
            suggestions.append("Highlight matching opportunities more prominently")
        
        return suggestions

# Initialize the personalization engine
personalization_engine = PersonalizationEngine()

# API Endpoints
@app.post("/api/personalization/generate", response_model=PersonalizationResponse)
async def generate_personalization(request: UserPersonalizationRequest):
    """Generate complete personalization for a user"""
    try:
        # Generate personalized color scheme
        colors = personalization_engine.generate_user_color_scheme({
            'userType': request.profile_data.get('userType'),
            'location': request.location_data,
            **request.profile_data
        })
        
        # Generate personalized content
        content = personalization_engine.generate_personalized_content({
            'userType': request.profile_data.get('userType'),
            'location': request.location_data,
            **request.profile_data
        })
        
        # Generate personalized success stories
        stories = personalization_engine.generate_personalized_success_stories({
            'userType': request.profile_data.get('userType'),
            'location': request.location_data,
            **request.profile_data
        })
        
        # Get learning insights
        learning_insights = personalization_engine.learn_and_adapt(request.user_id)
        
        return PersonalizationResponse(
            user_id=request.user_id,
            theme_colors=colors,
            personalized_content=content,
            success_stories=stories,
            ai_recommendations=content.get('recommended_next_steps', []),
            system_adaptations={
                'layout_preferences': 'adaptive',
                'content_density': 'medium',
                'interaction_style': 'guided'
            },
            learning_insights=learning_insights
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating personalization: {str(e)}")

@app.post("/api/personalization/track-behavior")
async def track_behavior(behavior: BehaviorTrackingData):
    """Track user behavior for learning and adaptation"""
    try:
        personalization_engine.track_user_behavior(behavior)
        return {"status": "success", "message": "Behavior tracked successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tracking behavior: {str(e)}")

@app.get("/api/personalization/insights/{user_id}")
async def get_user_insights(user_id: str):
    """Get learning insights for a specific user"""
    try:
        insights = personalization_engine.learn_and_adapt(user_id)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting insights: {str(e)}")

@app.get("/api/personalization/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Granada OS Personalization Engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)