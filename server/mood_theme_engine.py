"""
Granada OS Mood Theme Engine - FastAPI Service
AI-powered adaptive UI color themes based on user mood detection and preferences
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import os
import asyncio
import json
import random
from datetime import datetime, timedelta
import uvicorn
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Granada OS Mood Theme Engine",
    description="AI-powered adaptive UI color themes based on user mood",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoodDetectionRequest(BaseModel):
    user_id: str
    interaction_data: Dict[str, Any]
    time_of_day: str
    recent_activities: List[str]
    explicit_mood: Optional[str] = None

class ThemePreferencesRequest(BaseModel):
    user_id: str
    preferred_moods: List[str]
    color_preferences: Dict[str, str]
    accessibility_needs: Optional[Dict[str, Any]] = None

class MoodThemeResponse(BaseModel):
    mood: str
    confidence: float
    theme: Dict[str, Any]
    colors: Dict[str, str]
    recommendations: List[str]

class MoodDatabase:
    def __init__(self):
        self.db_params = self._parse_db_url(os.getenv('DATABASE_URL', ''))
    
    def _parse_db_url(self, url: str) -> Dict[str, str]:
        """Parse DATABASE_URL into connection parameters"""
        if not url:
            return {
                'host': 'localhost',
                'port': '5432',
                'database': 'granada_os',
                'user': 'user',
                'password': 'password'
            }
        
        # Parse postgres://user:password@host:port/database
        import re
        pattern = r'postgres://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)'
        match = re.match(pattern, url)
        
        if match:
            return {
                'user': match.group(1),
                'password': match.group(2),
                'host': match.group(3),
                'port': match.group(4),
                'database': match.group(5)
            }
        return {}
    
    def get_connection(self):
        """Get database connection"""
        try:
            return psycopg2.connect(**self.db_params)
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return None
    
    def save_mood_detection(self, user_id: str, mood_data: Dict) -> str:
        """Save mood detection results"""
        try:
            conn = self.get_connection()
            if not conn:
                return ""
                
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO user_mood_history (user_id, detected_mood, confidence, 
                                                 interaction_data, theme_applied, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    user_id,
                    mood_data.get('mood'),
                    mood_data.get('confidence'),
                    json.dumps(mood_data.get('interaction_data', {})),
                    json.dumps(mood_data.get('theme', {})),
                    datetime.now()
                ))
                
                mood_id = cur.fetchone()[0]
                conn.commit()
                return str(mood_id)
        except Exception as e:
            logger.error(f"Error saving mood detection: {e}")
            return ""
        finally:
            if conn:
                conn.close()
    
    def get_user_mood_history(self, user_id: str, days: int = 7) -> List[Dict]:
        """Get user's mood history"""
        try:
            conn = self.get_connection()
            if not conn:
                return []
                
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT * FROM user_mood_history 
                    WHERE user_id = %s AND created_at >= %s
                    ORDER BY created_at DESC
                """, (user_id, datetime.now() - timedelta(days=days)))
                
                return [dict(row) for row in cur.fetchall()]
        except Exception as e:
            logger.error(f"Error fetching mood history: {e}")
            return []
        finally:
            if conn:
                conn.close()
    
    def save_theme_preferences(self, user_id: str, preferences: Dict) -> bool:
        """Save user theme preferences"""
        try:
            conn = self.get_connection()
            if not conn:
                return False
                
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO user_theme_preferences (user_id, preferences, updated_at)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (user_id) 
                    DO UPDATE SET preferences = %s, updated_at = %s
                """, (
                    user_id,
                    json.dumps(preferences),
                    datetime.now(),
                    json.dumps(preferences),
                    datetime.now()
                ))
                
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error saving theme preferences: {e}")
            return False
        finally:
            if conn:
                conn.close()

class MoodDetectionEngine:
    """AI-powered mood detection from user interactions"""
    
    def __init__(self):
        self.mood_patterns = {
            'energetic': {
                'indicators': ['quick_clicks', 'rapid_scrolling', 'high_activity'],
                'colors': ['orange', 'yellow', 'red'],
                'time_patterns': ['morning', 'afternoon']
            },
            'focused': {
                'indicators': ['steady_interactions', 'long_sessions', 'detailed_reading'],
                'colors': ['blue', 'teal', 'indigo'],
                'time_patterns': ['morning', 'afternoon', 'evening']
            },
            'calm': {
                'indicators': ['slow_scrolling', 'thoughtful_pauses', 'gentle_interactions'],
                'colors': ['green', 'blue', 'purple'],
                'time_patterns': ['evening', 'night']
            },
            'creative': {
                'indicators': ['exploration', 'diverse_activities', 'idea_generation'],
                'colors': ['purple', 'pink', 'orange'],
                'time_patterns': ['afternoon', 'evening']
            },
            'professional': {
                'indicators': ['business_focus', 'proposal_work', 'formal_interactions'],
                'colors': ['navy', 'gray', 'blue'],
                'time_patterns': ['morning', 'afternoon']
            },
            'stressed': {
                'indicators': ['erratic_clicks', 'short_sessions', 'error_patterns'],
                'colors': ['muted_blue', 'gray', 'soft_green'],
                'time_patterns': ['any']
            }
        }
    
    async def detect_mood(self, request: MoodDetectionRequest) -> Dict[str, Any]:
        """Detect user mood from interaction data"""
        try:
            # If explicit mood provided, use it
            if request.explicit_mood:
                return await self._generate_mood_response(request.explicit_mood, 1.0, request)
            
            # Analyze interaction patterns
            mood_scores = {}
            interaction_data = request.interaction_data
            
            # Time-based mood inference
            time_factor = self._analyze_time_patterns(request.time_of_day)
            
            # Activity pattern analysis
            activity_factor = self._analyze_activities(request.recent_activities)
            
            # Interaction behavior analysis
            interaction_factor = self._analyze_interactions(interaction_data)
            
            # Calculate mood scores
            for mood, patterns in self.mood_patterns.items():
                score = 0.0
                
                # Time alignment
                if request.time_of_day in patterns['time_patterns'] or 'any' in patterns['time_patterns']:
                    score += 0.3
                
                # Activity alignment
                for activity in request.recent_activities:
                    if any(indicator in activity.lower() for indicator in patterns['indicators']):
                        score += 0.4
                
                # Interaction pattern alignment
                for indicator in patterns['indicators']:
                    if indicator in interaction_data:
                        score += interaction_data[indicator] * 0.3
                
                mood_scores[mood] = min(score, 1.0)
            
            # Find best mood match
            best_mood = max(mood_scores.items(), key=lambda x: x[1])
            mood_name = best_mood[0]
            confidence = best_mood[1]
            
            # Ensure minimum confidence
            if confidence < 0.3:
                mood_name = self._get_default_mood(request.time_of_day)
                confidence = 0.5
            
            return await self._generate_mood_response(mood_name, confidence, request)
            
        except Exception as e:
            logger.error(f"Error detecting mood: {e}")
            return await self._generate_mood_response('calm', 0.5, request)
    
    def _analyze_time_patterns(self, time_of_day: str) -> float:
        """Analyze time-based mood patterns"""
        time_moods = {
            'early_morning': 'calm',
            'morning': 'energetic',
            'afternoon': 'focused',
            'evening': 'creative',
            'night': 'calm'
        }
        return 0.3  # Base time factor
    
    def _analyze_activities(self, activities: List[str]) -> float:
        """Analyze recent activities for mood indicators"""
        activity_weights = {
            'proposal': 0.4,  # Professional
            'search': 0.3,    # Focused
            'explore': 0.5,   # Creative
            'dashboard': 0.2, # General
            'settings': 0.1   # Maintenance
        }
        
        total_weight = 0.0
        for activity in activities:
            for key, weight in activity_weights.items():
                if key in activity.lower():
                    total_weight += weight
        
        return min(total_weight / len(activities) if activities else 0.2, 1.0)
    
    def _analyze_interactions(self, interaction_data: Dict[str, Any]) -> float:
        """Analyze interaction patterns"""
        patterns = {
            'click_frequency': interaction_data.get('clicks_per_minute', 0),
            'scroll_speed': interaction_data.get('scroll_speed', 0),
            'session_length': interaction_data.get('session_minutes', 0),
            'error_rate': interaction_data.get('errors', 0)
        }
        
        # Normalize and weight patterns
        score = 0.0
        if patterns['click_frequency'] > 30:
            score += 0.3  # Energetic
        elif patterns['click_frequency'] > 10:
            score += 0.2  # Focused
        else:
            score += 0.1  # Calm
        
        return min(score, 1.0)
    
    def _get_default_mood(self, time_of_day: str) -> str:
        """Get default mood based on time"""
        time_defaults = {
            'early_morning': 'calm',
            'morning': 'focused',
            'afternoon': 'professional',
            'evening': 'creative',
            'night': 'calm'
        }
        return time_defaults.get(time_of_day, 'focused')
    
    async def _generate_mood_response(self, mood: str, confidence: float, request: MoodDetectionRequest) -> Dict[str, Any]:
        """Generate comprehensive mood response with theme"""
        theme_generator = ThemeGenerator()
        theme = await theme_generator.generate_theme(mood, request.user_id)
        
        return {
            'mood': mood,
            'confidence': confidence,
            'theme': theme,
            'interaction_analysis': {
                'primary_patterns': self._get_mood_indicators(mood),
                'time_alignment': request.time_of_day,
                'activity_context': request.recent_activities[:3]
            },
            'recommendations': self._get_mood_recommendations(mood)
        }
    
    def _get_mood_indicators(self, mood: str) -> List[str]:
        """Get primary indicators for a mood"""
        return self.mood_patterns.get(mood, {}).get('indicators', [])
    
    def _get_mood_recommendations(self, mood: str) -> List[str]:
        """Get recommendations based on mood"""
        recommendations = {
            'energetic': [
                'Consider tackling challenging proposals today',
                'Great time for brainstorming new ideas',
                'Schedule important calls or meetings'
            ],
            'focused': [
                'Perfect for detailed proposal writing',
                'Review and refine existing documents',
                'Conduct thorough research sessions'
            ],
            'calm': [
                'Ideal for planning and strategizing',
                'Review long-term goals and objectives',
                'Organize your workspace and files'
            ],
            'creative': [
                'Explore new funding opportunities',
                'Brainstorm innovative project concepts',
                'Design compelling proposal narratives'
            ],
            'professional': [
                'Focus on formal communications',
                'Update organizational profiles',
                'Schedule stakeholder meetings'
            ],
            'stressed': [
                'Take breaks between tasks',
                'Focus on simple, manageable activities',
                'Consider reaching out for support'
            ]
        }
        return recommendations.get(mood, ['Stay productive and positive!'])

class ThemeGenerator:
    """Generate adaptive UI themes based on mood"""
    
    def __init__(self):
        self.theme_palettes = {
            'energetic': {
                'primary': '#FF6B35',      # Vibrant orange
                'secondary': '#F7931E',    # Golden orange  
                'accent': '#FFD23F',       # Bright yellow
                'background': '#FFF8F3',   # Warm white
                'surface': '#FFEDE0',      # Light peach
                'text': '#2D1810',         # Dark brown
                'muted': '#8B4513'         # Saddle brown
            },
            'focused': {
                'primary': '#2563EB',      # Blue
                'secondary': '#0EA5E9',    # Sky blue
                'accent': '#06B6D4',       # Cyan
                'background': '#F8FAFC',   # Cool white
                'surface': '#E2E8F0',      # Light blue-gray
                'text': '#0F172A',         # Dark blue-gray
                'muted': '#64748B'         # Slate
            },
            'calm': {
                'primary': '#10B981',      # Emerald
                'secondary': '#059669',    # Green
                'accent': '#34D399',       # Light green
                'background': '#F0FDF4',   # Mint white
                'surface': '#DCFCE7',      # Light mint
                'text': '#064E3B',         # Dark green
                'muted': '#6B7280'         # Gray
            },
            'creative': {
                'primary': '#8B5CF6',      # Purple
                'secondary': '#A855F7',    # Violet
                'accent': '#EC4899',       # Pink
                'background': '#FDFCFF',   # Purple white
                'surface': '#F3E8FF',      # Light purple
                'text': '#3B0764',         # Dark purple
                'muted': '#7C3AED'         # Medium purple
            },
            'professional': {
                'primary': '#1E40AF',      # Navy blue
                'secondary': '#3730A3',    # Indigo
                'accent': '#6366F1',       # Blue
                'background': '#F9FAFB',   # Cool gray
                'surface': '#E5E7EB',      # Light gray
                'text': '#111827',         # Almost black
                'muted': '#4B5563'         # Dark gray
            },
            'stressed': {
                'primary': '#6B7280',      # Neutral gray
                'secondary': '#9CA3AF',    # Light gray
                'accent': '#10B981',       # Calming green
                'background': '#F9FAFB',   # Soft white
                'surface': '#F3F4F6',      # Very light gray
                'text': '#374151',         # Dark gray
                'muted': '#9CA3AF'         # Medium gray
            }
        }
    
    async def generate_theme(self, mood: str, user_id: str) -> Dict[str, Any]:
        """Generate complete theme based on mood"""
        try:
            palette = self.theme_palettes.get(mood, self.theme_palettes['focused'])
            
            # Get time-based adjustments
            current_hour = datetime.now().hour
            if 20 <= current_hour or current_hour <= 6:  # Night mode
                palette = self._adjust_for_night_mode(palette)
            
            # Generate comprehensive theme
            theme = {
                'name': f"{mood.title()} Theme",
                'mood': mood,
                'colors': palette,
                'typography': self._get_typography_settings(mood),
                'spacing': self._get_spacing_settings(mood),
                'animations': self._get_animation_settings(mood),
                'effects': self._get_visual_effects(mood),
                'accessibility': self._get_accessibility_settings(mood),
                'css_variables': self._generate_css_variables(palette)
            }
            
            return theme
            
        except Exception as e:
            logger.error(f"Error generating theme: {e}")
            return self._get_default_theme()
    
    def _adjust_for_night_mode(self, palette: Dict[str, str]) -> Dict[str, str]:
        """Adjust theme for night mode"""
        return {
            **palette,
            'background': '#0F172A',   # Dark background
            'surface': '#1E293B',      # Dark surface
            'text': '#F1F5F9',         # Light text
            'muted': '#94A3B8'         # Light muted
        }
    
    def _get_typography_settings(self, mood: str) -> Dict[str, Any]:
        """Get typography settings for mood"""
        settings = {
            'energetic': {
                'headingWeight': '700',
                'bodyWeight': '500',
                'lineHeight': '1.4',
                'letterSpacing': '0.02em'
            },
            'focused': {
                'headingWeight': '600',
                'bodyWeight': '400',
                'lineHeight': '1.6',
                'letterSpacing': '0.01em'
            },
            'calm': {
                'headingWeight': '500',
                'bodyWeight': '400',
                'lineHeight': '1.8',
                'letterSpacing': '0.03em'
            },
            'creative': {
                'headingWeight': '700',
                'bodyWeight': '400',
                'lineHeight': '1.5',
                'letterSpacing': '0.02em'
            },
            'professional': {
                'headingWeight': '600',
                'bodyWeight': '400',
                'lineHeight': '1.5',
                'letterSpacing': '0.01em'
            },
            'stressed': {
                'headingWeight': '500',
                'bodyWeight': '400',
                'lineHeight': '1.7',
                'letterSpacing': '0.02em'
            }
        }
        return settings.get(mood, settings['focused'])
    
    def _get_spacing_settings(self, mood: str) -> Dict[str, Any]:
        """Get spacing settings for mood"""
        settings = {
            'energetic': {'scale': 1.1, 'density': 'comfortable'},
            'focused': {'scale': 1.0, 'density': 'standard'},
            'calm': {'scale': 1.2, 'density': 'relaxed'},
            'creative': {'scale': 1.1, 'density': 'comfortable'},
            'professional': {'scale': 1.0, 'density': 'standard'},
            'stressed': {'scale': 1.3, 'density': 'relaxed'}
        }
        return settings.get(mood, settings['focused'])
    
    def _get_animation_settings(self, mood: str) -> Dict[str, Any]:
        """Get animation settings for mood"""
        settings = {
            'energetic': {'speed': 'fast', 'style': 'bouncy'},
            'focused': {'speed': 'medium', 'style': 'smooth'},
            'calm': {'speed': 'slow', 'style': 'gentle'},
            'creative': {'speed': 'medium', 'style': 'playful'},
            'professional': {'speed': 'medium', 'style': 'crisp'},
            'stressed': {'speed': 'slow', 'style': 'minimal'}
        }
        return settings.get(mood, settings['focused'])
    
    def _get_visual_effects(self, mood: str) -> Dict[str, Any]:
        """Get visual effects for mood"""
        effects = {
            'energetic': {
                'shadows': 'bold',
                'borders': 'thick',
                'gradients': True,
                'glow': True
            },
            'focused': {
                'shadows': 'subtle',
                'borders': 'clean',
                'gradients': False,
                'glow': False
            },
            'calm': {
                'shadows': 'soft',
                'borders': 'rounded',
                'gradients': True,
                'glow': False
            },
            'creative': {
                'shadows': 'colorful',
                'borders': 'playful',
                'gradients': True,
                'glow': True
            },
            'professional': {
                'shadows': 'crisp',
                'borders': 'sharp',
                'gradients': False,
                'glow': False
            },
            'stressed': {
                'shadows': 'minimal',
                'borders': 'soft',
                'gradients': False,
                'glow': False
            }
        }
        return effects.get(mood, effects['focused'])
    
    def _get_accessibility_settings(self, mood: str) -> Dict[str, Any]:
        """Get accessibility settings"""
        return {
            'contrast_ratio': 4.5,
            'reduced_motion': mood == 'stressed',
            'large_targets': mood in ['stressed', 'calm'],
            'high_contrast': mood == 'professional'
        }
    
    def _generate_css_variables(self, palette: Dict[str, str]) -> Dict[str, str]:
        """Generate CSS custom properties"""
        css_vars = {}
        for key, value in palette.items():
            css_vars[f'--color-{key.replace("_", "-")}'] = value
        return css_vars
    
    def _get_default_theme(self) -> Dict[str, Any]:
        """Get default theme as fallback"""
        return {
            'name': 'Default Theme',
            'mood': 'focused',
            'colors': self.theme_palettes['focused'],
            'typography': self._get_typography_settings('focused'),
            'spacing': self._get_spacing_settings('focused'),
            'animations': self._get_animation_settings('focused'),
            'effects': self._get_visual_effects('focused'),
            'accessibility': self._get_accessibility_settings('focused'),
            'css_variables': self._generate_css_variables(self.theme_palettes['focused'])
        }

# Initialize services
mood_db = MoodDatabase()
mood_engine = MoodDetectionEngine()

@app.get("/")
async def root():
    return {
        "service": "Granada OS Mood Theme Engine",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": {
            "detect_mood": "/detect-mood",
            "get_theme": "/get-theme",
            "save_preferences": "/save-preferences",
            "mood_history": "/mood-history/{user_id}"
        }
    }

@app.post("/detect-mood", response_model=MoodThemeResponse)
async def detect_user_mood(request: MoodDetectionRequest, background_tasks: BackgroundTasks):
    """Detect user mood and generate adaptive theme"""
    try:
        # Detect mood using AI engine
        mood_result = await mood_engine.detect_mood(request)
        
        # Save to database in background
        background_tasks.add_task(
            save_mood_detection_background,
            request.user_id,
            mood_result
        )
        
        return MoodThemeResponse(
            mood=mood_result['mood'],
            confidence=mood_result['confidence'],
            theme=mood_result['theme'],
            colors=mood_result['theme']['colors'],
            recommendations=mood_result['recommendations']
        )
        
    except Exception as e:
        logger.error(f"Error in mood detection endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Mood detection failed: {str(e)}")

@app.get("/get-theme/{mood}")
async def get_theme_by_mood(mood: str, user_id: str = "default"):
    """Get theme for specific mood"""
    try:
        theme_generator = ThemeGenerator()
        theme = await theme_generator.generate_theme(mood, user_id)
        
        return {
            "mood": mood,
            "theme": theme,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating theme: {e}")
        raise HTTPException(status_code=500, detail=f"Theme generation failed: {str(e)}")

@app.post("/save-preferences")
async def save_theme_preferences(request: ThemePreferencesRequest):
    """Save user theme preferences"""
    try:
        preferences = {
            "preferred_moods": request.preferred_moods,
            "color_preferences": request.color_preferences,
            "accessibility_needs": request.accessibility_needs or {}
        }
        
        success = mood_db.save_theme_preferences(request.user_id, preferences)
        
        if success:
            return {"message": "Theme preferences saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save preferences")
            
    except Exception as e:
        logger.error(f"Error saving preferences: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save preferences: {str(e)}")

@app.get("/mood-history/{user_id}")
async def get_mood_history(user_id: str, days: int = 7):
    """Get user's mood history"""
    try:
        history = mood_db.get_user_mood_history(user_id, days)
        
        return {
            "user_id": user_id,
            "days": days,
            "history": history,
            "summary": {
                "total_sessions": len(history),
                "most_common_mood": _get_most_common_mood(history),
                "average_confidence": _calculate_average_confidence(history)
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching mood history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

async def save_mood_detection_background(user_id: str, mood_result: Dict):
    """Background task to save mood detection results"""
    try:
        mood_db.save_mood_detection(user_id, mood_result)
    except Exception as e:
        logger.error(f"Background save failed: {e}")

def _get_most_common_mood(history: List[Dict]) -> str:
    """Get most common mood from history"""
    if not history:
        return "unknown"
    
    mood_counts = {}
    for record in history:
        mood = record.get('detected_mood', 'unknown')
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    return max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else "unknown"

def _calculate_average_confidence(history: List[Dict]) -> float:
    """Calculate average confidence from history"""
    if not history:
        return 0.0
    
    confidences = [record.get('confidence', 0.0) for record in history]
    return sum(confidences) / len(confidences)

if __name__ == "__main__":
    uvicorn.run(
        "mood_theme_engine:app",
        host="0.0.0.0",
        port=8007,
        reload=True,
        log_level="info"
    )