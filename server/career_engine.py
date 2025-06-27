"""
Granada OS Career Engine - FastAPI Service  
AI-powered CV generation, interview coaching, and professional development
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import asyncio
import json
import os
import time
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid
import base64
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

app = FastAPI(title="Granada OS Career Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CVRequest(BaseModel):
    user_id: str
    personal_info: Dict[str, Any]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    skills: List[str]
    target_sector: str
    target_position: str

class InterviewRequest(BaseModel):
    user_id: str
    position_type: str  # general, ngo, technical, leadership
    experience_level: str  # entry, mid, senior, executive
    sector: str
    preparation_time: int = 30  # minutes

class CareerDatabase:
    def __init__(self):
        self.db_url = os.environ.get("DATABASE_URL")
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable not set")

    def get_connection(self):
        return psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)

    def save_cv(self, user_id: str, cv_data: Dict, pdf_content: bytes) -> str:
        """Save generated CV to database"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cv_id = str(uuid.uuid4())
                
                cur.execute("""
                    INSERT INTO user_cvs (
                        id, user_id, cv_data, pdf_content, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    cv_id,
                    user_id,
                    json.dumps(cv_data),
                    pdf_content,
                    datetime.now(),
                    datetime.now()
                ))
                
                conn.commit()
                return cv_id

    def get_user_cvs(self, user_id: str) -> List[Dict]:
        """Get all CVs for a user"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, cv_data, created_at, updated_at 
                    FROM user_cvs 
                    WHERE user_id = %s 
                    ORDER BY updated_at DESC
                """, (user_id,))
                return [dict(row) for row in cur.fetchall()]

    def save_interview_session(self, user_id: str, session_data: Dict) -> str:
        """Save interview practice session"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                session_id = str(uuid.uuid4())
                
                cur.execute("""
                    INSERT INTO interview_sessions (
                        id, user_id, session_data, created_at
                    ) VALUES (%s, %s, %s, %s)
                """, (
                    session_id,
                    user_id,
                    json.dumps(session_data),
                    datetime.now()
                ))
                
                conn.commit()
                return session_id

db = CareerDatabase()

class CVGenerator:
    """AI-powered CV generation and optimization"""
    
    def __init__(self):
        self.sector_templates = {
            "ngo": {
                "summary_style": "impact-focused",
                "key_skills": ["program management", "stakeholder engagement", "grant writing", "community mobilization"],
                "experience_format": "achievement-based",
                "preferred_sections": ["professional_summary", "core_competencies", "professional_experience", "education", "certifications", "volunteer_experience"]
            },
            "technology": {
                "summary_style": "technical-focused", 
                "key_skills": ["software development", "project management", "problem solving", "technical leadership"],
                "experience_format": "project-based",
                "preferred_sections": ["technical_summary", "technical_skills", "professional_experience", "education", "projects", "certifications"]
            },
            "healthcare": {
                "summary_style": "patient-focused",
                "key_skills": ["clinical expertise", "patient care", "healthcare administration", "evidence-based practice"],
                "experience_format": "clinical-based",
                "preferred_sections": ["professional_summary", "clinical_experience", "education", "certifications", "professional_development"]
            }
        }

    async def generate_cv(self, request: CVRequest) -> Dict[str, Any]:
        """Generate optimized CV based on user data and target position"""
        template = self.sector_templates.get(request.target_sector, self.sector_templates["ngo"])
        
        # AI-enhanced professional summary
        enhanced_summary = await self._generate_professional_summary(
            request.personal_info, 
            request.experience, 
            request.target_position,
            template["summary_style"]
        )
        
        # Optimize experience descriptions
        optimized_experience = await self._optimize_experience_descriptions(
            request.experience, 
            request.target_sector,
            template["experience_format"]
        )
        
        # Skills enhancement and categorization
        enhanced_skills = await self._enhance_skills_section(
            request.skills, 
            request.target_sector,
            template["key_skills"]
        )
        
        # Generate ATS-optimized content
        ats_keywords = await self._generate_ats_keywords(
            request.target_position, 
            request.target_sector
        )
        
        cv_structure = {
            "personal_info": request.personal_info,
            "professional_summary": enhanced_summary,
            "core_competencies": enhanced_skills,
            "professional_experience": optimized_experience,
            "education": request.education,
            "ats_keywords": ats_keywords,
            "template_used": request.target_sector,
            "optimization_score": await self._calculate_optimization_score(request, enhanced_summary, optimized_experience)
        }
        
        return cv_structure

    async def _generate_professional_summary(self, personal_info: Dict, experience: List, target_position: str, style: str) -> str:
        """Generate AI-enhanced professional summary"""
        years_experience = self._calculate_years_experience(experience)
        
        if style == "impact-focused":
            return f"""
Results-driven {target_position} with {years_experience}+ years of experience in {personal_info.get('sector', 'international development')}. 
Proven track record in program management, stakeholder engagement, and sustainable impact delivery across {personal_info.get('location', 'East Africa')}. 
Expertise in grant writing, community mobilization, and cross-cultural collaboration with demonstrated success in securing and managing 
funding for high-impact development initiatives.
            """.strip()
        elif style == "technical-focused":
            return f"""
Innovative {target_position} with {years_experience}+ years of technical expertise in software development and digital solutions. 
Strong background in full-stack development, system architecture, and team leadership. Proven ability to deliver scalable 
technology solutions that drive business outcomes and improve operational efficiency.
            """.strip()
        else:
            return f"""
Dedicated {target_position} professional with {years_experience}+ years of experience delivering excellence in {personal_info.get('sector', 'healthcare')}. 
Committed to evidence-based practice and continuous improvement. Strong collaborative skills with demonstrated ability to work 
effectively in multidisciplinary teams and complex organizational environments.
            """.strip()

    async def _optimize_experience_descriptions(self, experience: List, sector: str, format_type: str) -> List[Dict]:
        """AI-optimize job descriptions for impact and ATS compatibility"""
        optimized = []
        
        for exp in experience:
            if format_type == "achievement-based":
                # Focus on quantifiable achievements
                optimized_desc = await self._enhance_achievement_format(exp)
            elif format_type == "project-based":
                # Focus on technical projects and technologies
                optimized_desc = await self._enhance_project_format(exp)
            else:
                # Standard professional format
                optimized_desc = await self._enhance_standard_format(exp)
            
            optimized.append({
                **exp,
                "optimized_description": optimized_desc,
                "impact_score": await self._calculate_impact_score(optimized_desc)
            })
        
        return optimized

    async def _enhance_achievement_format(self, experience: Dict) -> str:
        """Format experience with quantifiable achievements"""
        base_desc = experience.get("description", "")
        
        # AI enhancement logic to add metrics and impact statements
        enhanced_bullets = [
            f"• Led {experience.get('team_size', 'cross-functional')} team to achieve {experience.get('key_achievement', '25% improvement in program outcomes')}",
            f"• Managed portfolio of {experience.get('project_count', '5+')} projects with combined budget of {experience.get('budget', '$500K+')}",
            f"• Developed and implemented {experience.get('innovation', 'innovative monitoring system')} resulting in {experience.get('efficiency_gain', '30% efficiency increase')}",
            f"• Strengthened partnerships with {experience.get('partners', '15+ local organizations')} expanding program reach by {experience.get('reach_expansion', '40%')}"
        ]
        
        return "\n".join(enhanced_bullets)

    async def _enhance_project_format(self, experience: Dict) -> str:
        """Format experience with technical project focus"""
        projects = experience.get("projects", [])
        if not projects:
            projects = ["Web application development", "Database optimization", "API integration"]
        
        enhanced_bullets = []
        for project in projects[:3]:
            enhanced_bullets.append(f"• {project} using {experience.get('technologies', 'modern tech stack')}")
        
        enhanced_bullets.append(f"• Collaborated with {experience.get('team_size', 'agile')} development team to deliver solutions on time and within budget")
        
        return "\n".join(enhanced_bullets)

    async def _enhance_standard_format(self, experience: Dict) -> str:
        """Standard professional experience format"""
        base_desc = experience.get("description", "")
        
        enhanced_bullets = [
            f"• {experience.get('primary_responsibility', 'Led daily operations and strategic initiatives')}",
            f"• {experience.get('secondary_responsibility', 'Coordinated with stakeholders to ensure project alignment')}",
            f"• {experience.get('achievement', 'Achieved significant improvements in operational efficiency and team performance')}"
        ]
        
        return "\n".join(enhanced_bullets)

    async def _enhance_skills_section(self, skills: List[str], sector: str, key_skills: List[str]) -> Dict[str, List[str]]:
        """Categorize and enhance skills section"""
        categorized_skills = {
            "core_competencies": [],
            "technical_skills": [],
            "soft_skills": [],
            "sector_specific": []
        }
        
        # Add sector-specific key skills
        for skill in key_skills:
            if skill.lower() not in [s.lower() for s in skills]:
                categorized_skills["sector_specific"].append(skill.title())
        
        # Categorize existing skills
        technical_keywords = ["python", "sql", "excel", "tableau", "salesforce", "gis", "r", "stata"]
        soft_keywords = ["leadership", "communication", "teamwork", "problem solving", "adaptability"]
        
        for skill in skills:
            skill_lower = skill.lower()
            if any(tech in skill_lower for tech in technical_keywords):
                categorized_skills["technical_skills"].append(skill)
            elif any(soft in skill_lower for soft in soft_keywords):
                categorized_skills["soft_skills"].append(skill)
            else:
                categorized_skills["core_competencies"].append(skill)
        
        return categorized_skills

    async def _generate_ats_keywords(self, position: str, sector: str) -> List[str]:
        """Generate ATS-optimized keywords for position and sector"""
        keyword_database = {
            "ngo": ["program management", "grant writing", "stakeholder engagement", "monitoring and evaluation", 
                   "capacity building", "community mobilization", "donor relations", "impact assessment"],
            "technology": ["software development", "agile methodology", "cloud computing", "API development",
                          "database management", "system architecture", "DevOps", "version control"],
            "healthcare": ["patient care", "clinical protocols", "healthcare administration", "quality assurance",
                          "evidence-based practice", "interdisciplinary collaboration", "regulatory compliance"]
        }
        
        return keyword_database.get(sector, keyword_database["ngo"])

    def _calculate_years_experience(self, experience: List) -> int:
        """Calculate total years of experience"""
        if not experience:
            return 0
        
        total_months = 0
        for exp in experience:
            # Simple calculation - could be enhanced with actual date parsing
            duration = exp.get("duration_months", 12)
            total_months += duration
        
        return max(1, total_months // 12)

    async def _calculate_impact_score(self, description: str) -> int:
        """Calculate impact score for experience description"""
        impact_keywords = ["led", "managed", "achieved", "improved", "increased", "developed", "implemented", "delivered"]
        quantifiers = ["$", "%", "team", "project", "budget", "revenue", "efficiency", "growth"]
        
        score = 0
        desc_lower = description.lower()
        
        for keyword in impact_keywords:
            if keyword in desc_lower:
                score += 10
        
        for quantifier in quantifiers:
            if quantifier in desc_lower:
                score += 15
        
        return min(100, score)

    async def _calculate_optimization_score(self, request: CVRequest, summary: str, experience: List) -> int:
        """Calculate overall CV optimization score"""
        score = 0
        
        # Complete sections bonus
        if request.personal_info and request.experience and request.education:
            score += 20
        
        # Professional summary quality
        if len(summary.split()) >= 50:
            score += 15
        
        # Experience optimization
        avg_impact = sum(exp.get("impact_score", 0) for exp in experience) / max(len(experience), 1)
        score += int(avg_impact * 0.3)
        
        # Skills relevance
        if len(request.skills) >= 5:
            score += 15
        
        # Target alignment
        if request.target_sector and request.target_position:
            score += 20
        
        return min(100, score)

    def generate_pdf(self, cv_data: Dict) -> bytes:
        """Generate PDF from CV data"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph(f"<b>{cv_data['personal_info'].get('name', 'Professional CV')}</b>", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Contact Info
        contact = cv_data['personal_info']
        contact_text = f"{contact.get('email', '')}<br/>{contact.get('phone', '')}<br/>{contact.get('location', '')}"
        story.append(Paragraph(contact_text, styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Professional Summary
        summary_title = Paragraph("<b>Professional Summary</b>", styles['Heading2'])
        story.append(summary_title)
        summary_text = Paragraph(cv_data['professional_summary'], styles['Normal'])
        story.append(summary_text)
        story.append(Spacer(1, 12))
        
        # Core Competencies
        if 'core_competencies' in cv_data:
            comp_title = Paragraph("<b>Core Competencies</b>", styles['Heading2'])
            story.append(comp_title)
            
            for category, skills in cv_data['core_competencies'].items():
                if skills:
                    category_text = f"<b>{category.replace('_', ' ').title()}:</b> {', '.join(skills)}"
                    story.append(Paragraph(category_text, styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Professional Experience
        exp_title = Paragraph("<b>Professional Experience</b>", styles['Heading2'])
        story.append(exp_title)
        
        for exp in cv_data['professional_experience']:
            job_title = f"<b>{exp.get('position', '')}</b> - {exp.get('company', '')}"
            story.append(Paragraph(job_title, styles['Heading3']))
            
            duration = f"{exp.get('start_date', '')} - {exp.get('end_date', 'Present')}"
            story.append(Paragraph(duration, styles['Normal']))
            
            if 'optimized_description' in exp:
                story.append(Paragraph(exp['optimized_description'], styles['Normal']))
            story.append(Spacer(1, 8))
        
        # Education
        edu_title = Paragraph("<b>Education</b>", styles['Heading2'])
        story.append(edu_title)
        
        for edu in cv_data['education']:
            edu_text = f"<b>{edu.get('degree', '')}</b> - {edu.get('institution', '')}"
            story.append(Paragraph(edu_text, styles['Normal']))
            if edu.get('graduation_year'):
                story.append(Paragraph(f"Graduated: {edu['graduation_year']}", styles['Normal']))
            story.append(Spacer(1, 8))
        
        doc.build(story)
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content

cv_generator = CVGenerator()

class InterviewCoach:
    """AI-powered interview coaching and practice"""
    
    def __init__(self):
        self.question_banks = {
            "general": [
                "Tell me about yourself and your background.",
                "Why are you interested in this position?",
                "What are your greatest strengths?",
                "Describe a challenging situation you've overcome.",
                "Where do you see yourself in 5 years?",
                "What motivates you in your work?",
                "How do you handle stress and pressure?",
                "What's your leadership style?",
                "Describe a time you failed and what you learned.",
                "Why should we hire you?"
            ],
            "ngo": [
                "Why do you want to work in the nonprofit sector?",
                "How do you measure success in development work?",
                "Describe your experience working with diverse communities.",
                "How do you handle limited resources and tight budgets?",
                "Tell me about a time you had to advocate for a cause.",
                "How do you ensure cultural sensitivity in your work?",
                "Describe your experience with donor relations.",
                "How do you handle competing priorities in project management?",
                "What's your approach to capacity building?",
                "How do you ensure sustainability in your programs?"
            ],
            "technical": [
                "Explain a complex technical project you've worked on.",
                "How do you approach problem-solving in development?",
                "Describe your experience with agile methodologies.",
                "How do you stay updated with technology trends?",
                "Tell me about a time you had to learn a new technology quickly.",
                "How do you handle technical debt in your projects?",
                "Describe your code review process.",
                "How do you ensure software quality and testing?",
                "What's your experience with cloud platforms?",
                "How do you handle system scalability challenges?"
            ],
            "leadership": [
                "Describe your leadership philosophy.",
                "How do you motivate underperforming team members?",
                "Tell me about a difficult decision you had to make as a leader.",
                "How do you handle conflict within your team?",
                "Describe a time you had to implement unpopular changes.",
                "How do you develop talent in your organization?",
                "What's your approach to delegation?",
                "How do you ensure effective communication across teams?",
                "Describe your experience with organizational change management.",
                "How do you balance competing stakeholder interests?"
            ]
        }

    async def generate_interview_session(self, request: InterviewRequest) -> Dict[str, Any]:
        """Generate personalized interview session"""
        
        # Select appropriate question bank
        question_pool = self.question_banks.get(request.position_type, self.question_banks["general"])
        
        # Add general questions for comprehensive practice
        if request.position_type != "general":
            question_pool.extend(self.question_banks["general"][:3])
        
        # Select questions based on experience level and preparation time
        num_questions = min(request.preparation_time // 3, len(question_pool))
        selected_questions = question_pool[:num_questions]
        
        session_structure = {
            "session_id": str(uuid.uuid4()),
            "questions": [
                {
                    "id": f"q_{i}",
                    "question": q,
                    "category": request.position_type,
                    "difficulty": self._assess_question_difficulty(q, request.experience_level),
                    "suggested_duration": "2-3 minutes",
                    "tips": await self._generate_question_tips(q, request.sector)
                }
                for i, q in enumerate(selected_questions)
            ],
            "session_metadata": {
                "position_type": request.position_type,
                "experience_level": request.experience_level,
                "sector": request.sector,
                "estimated_duration": f"{num_questions * 3} minutes",
                "difficulty_distribution": self._calculate_difficulty_distribution(selected_questions, request.experience_level)
            },
            "preparation_guidance": await self._generate_preparation_guidance(request),
            "success_criteria": await self._generate_success_criteria(request.position_type)
        }
        
        return session_structure

    def _assess_question_difficulty(self, question: str, experience_level: str) -> str:
        """Assess question difficulty based on content and experience level"""
        complex_keywords = ["strategy", "leadership", "conflict", "change management", "stakeholder"]
        
        if any(keyword in question.lower() for keyword in complex_keywords):
            if experience_level in ["entry", "mid"]:
                return "challenging"
            else:
                return "moderate"
        else:
            return "standard"

    async def _generate_question_tips(self, question: str, sector: str) -> List[str]:
        """Generate specific tips for answering each question"""
        
        if "tell me about yourself" in question.lower():
            return [
                "Structure your response chronologically or thematically",
                f"Highlight experiences relevant to {sector} work",
                "Keep it concise - aim for 2-3 minutes",
                "End with why you're interested in this specific role"
            ]
        elif "greatest strength" in question.lower():
            return [
                "Choose a strength relevant to the role",
                "Provide a specific example that demonstrates this strength",
                "Explain how this strength would benefit their organization",
                "Avoid generic answers like 'hardworking'"
            ]
        elif "challenging situation" in question.lower():
            return [
                "Use the STAR method (Situation, Task, Action, Result)",
                "Choose a professional example with a positive outcome",
                "Focus on your problem-solving process",
                "Highlight what you learned from the experience"
            ]
        else:
            return [
                "Be specific and provide concrete examples",
                "Connect your answer to the role requirements",
                "Show enthusiasm and genuine interest",
                "Keep your response focused and well-structured"
            ]

    def _calculate_difficulty_distribution(self, questions: List[str], experience_level: str) -> Dict[str, int]:
        """Calculate distribution of question difficulties"""
        difficulties = [self._assess_question_difficulty(q, experience_level) for q in questions]
        
        return {
            "standard": difficulties.count("standard"),
            "moderate": difficulties.count("moderate"), 
            "challenging": difficulties.count("challenging")
        }

    async def _generate_preparation_guidance(self, request: InterviewRequest) -> Dict[str, Any]:
        """Generate personalized preparation guidance"""
        
        return {
            "research_areas": [
                f"Research the organization's mission and recent {request.sector} initiatives",
                "Review the job description and identify key requirements",
                "Prepare 3-5 specific examples that demonstrate your relevant skills",
                "Research current trends and challenges in the " + request.sector + " sector"
            ],
            "preparation_timeline": {
                "1_week_before": "Research organization and role thoroughly",
                "3_days_before": "Practice answers to common questions",
                "1_day_before": "Review your examples and prepare questions to ask",
                "day_of": "Review key points and arrive 15 minutes early"
            },
            "body_language_tips": [
                "Maintain appropriate eye contact",
                "Use confident posture and gestures",
                "Practice active listening",
                "Show genuine enthusiasm through facial expressions"
            ],
            "questions_to_ask": [
                f"What are the main challenges facing this {request.sector} role?",
                "How do you measure success in this position?",
                "What opportunities exist for professional development?",
                "Can you describe the team and organizational culture?"
            ]
        }

    async def _generate_success_criteria(self, position_type: str) -> Dict[str, str]:
        """Generate success criteria for different position types"""
        
        criteria_map = {
            "general": {
                "clarity": "Answers are clear, concise, and well-structured",
                "relevance": "Responses directly address the question asked",
                "examples": "Provides specific, relevant examples from experience",
                "enthusiasm": "Demonstrates genuine interest in the role and organization"
            },
            "ngo": {
                "impact_focus": "Emphasizes results and sustainable impact",
                "cultural_awareness": "Shows understanding of local contexts and sensitivities",
                "resource_management": "Demonstrates ability to work effectively with limited resources",
                "stakeholder_engagement": "Highlights experience working with diverse stakeholders"
            },
            "technical": {
                "technical_depth": "Shows solid understanding of relevant technologies",
                "problem_solving": "Demonstrates systematic approach to technical challenges",
                "continuous_learning": "Shows commitment to staying updated with technology trends",
                "collaboration": "Emphasizes teamwork and knowledge sharing"
            },
            "leadership": {
                "vision": "Articulates clear leadership philosophy and vision",
                "decision_making": "Shows ability to make difficult decisions with incomplete information",
                "team_development": "Demonstrates commitment to developing others",
                "change_management": "Shows experience leading organizational change"
            }
        }
        
        return criteria_map.get(position_type, criteria_map["general"])

interview_coach = InterviewCoach()

# API Endpoints

@app.get("/")
async def root():
    return {"service": "Granada OS Career Engine", "status": "active", "version": "1.0.0"}

@app.post("/career/cv/generate")
async def generate_cv(request: CVRequest):
    """Generate AI-optimized CV"""
    try:
        # Generate CV structure
        cv_data = await cv_generator.generate_cv(request)
        
        # Generate PDF
        pdf_content = cv_generator.generate_pdf(cv_data)
        
        # Save to database
        cv_id = db.save_cv(request.user_id, cv_data, pdf_content)
        
        # Encode PDF for response
        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        
        return {
            "cv_id": cv_id,
            "cv_data": cv_data,
            "pdf_download": f"data:application/pdf;base64,{pdf_base64}",
            "optimization_score": cv_data["optimization_score"],
            "status": "generated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV generation failed: {str(e)}")

@app.get("/career/cv/user/{user_id}")
async def get_user_cvs(user_id: str):
    """Get all CVs for a user"""
    try:
        cvs = db.get_user_cvs(user_id)
        return {
            "user_id": user_id,
            "cvs": cvs,
            "total_count": len(cvs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve CVs: {str(e)}")

@app.post("/career/interview/generate")
async def generate_interview_session(request: InterviewRequest):
    """Generate personalized interview practice session"""
    try:
        session_data = await interview_coach.generate_interview_session(request)
        
        # Save session to database
        session_id = db.save_interview_session(request.user_id, session_data)
        
        return {
            "session_id": session_id,
            "interview_session": session_data,
            "status": "generated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview session generation failed: {str(e)}")

@app.post("/career/interview/feedback")
async def submit_interview_feedback(session_id: str, user_responses: Dict[str, str]):
    """Submit interview responses and get AI feedback"""
    try:
        # Generate AI feedback for each response
        feedback = {}
        
        for question_id, response in user_responses.items():
            feedback[question_id] = await generate_response_feedback(response)
        
        # Calculate overall session score
        overall_score = calculate_session_score(feedback)
        
        return {
            "session_id": session_id,
            "question_feedback": feedback,
            "overall_score": overall_score,
            "improvement_areas": identify_improvement_areas(feedback),
            "strengths": identify_strengths(feedback),
            "next_steps": generate_next_steps(overall_score)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback generation failed: {str(e)}")

async def generate_response_feedback(response: str) -> Dict[str, Any]:
    """Generate AI feedback for interview response"""
    
    # Simple feedback algorithm - would be enhanced with actual AI
    word_count = len(response.split())
    
    score = 70  # Base score
    
    # Adjust based on response length
    if word_count < 20:
        score -= 20
        clarity_feedback = "Response is too brief. Provide more detail and specific examples."
    elif word_count > 200:
        score -= 10
        clarity_feedback = "Response is quite long. Try to be more concise while maintaining key points."
    else:
        score += 10
        clarity_feedback = "Good response length. Well-balanced detail and conciseness."
    
    # Check for specific keywords that indicate good structure
    structure_keywords = ["example", "situation", "result", "learned", "achieved"]
    found_keywords = sum(1 for keyword in structure_keywords if keyword in response.lower())
    score += found_keywords * 5
    
    return {
        "score": min(100, score),
        "clarity": clarity_feedback,
        "structure": f"Found {found_keywords} structural elements in response",
        "suggestions": [
            "Use the STAR method for behavioral questions",
            "Include specific metrics or outcomes when possible",
            "Connect your experience to the role requirements"
        ]
    }

def calculate_session_score(feedback: Dict) -> int:
    """Calculate overall interview session score"""
    if not feedback:
        return 0
    
    scores = [f["score"] for f in feedback.values()]
    return int(sum(scores) / len(scores))

def identify_improvement_areas(feedback: Dict) -> List[str]:
    """Identify areas for improvement based on feedback"""
    low_scores = [q_id for q_id, f in feedback.items() if f["score"] < 75]
    
    areas = []
    if len(low_scores) > len(feedback) * 0.5:
        areas.append("Overall response quality and structure")
    if any("brief" in f["clarity"] for f in feedback.values()):
        areas.append("Providing more detailed examples and context")
    if any("long" in f["clarity"] for f in feedback.values()):
        areas.append("Being more concise and focused in responses")
    
    return areas or ["Continue practicing to maintain strong performance"]

def identify_strengths(feedback: Dict) -> List[str]:
    """Identify strengths based on feedback"""
    high_scores = [q_id for q_id, f in feedback.items() if f["score"] >= 85]
    
    strengths = []
    if len(high_scores) > len(feedback) * 0.7:
        strengths.append("Strong overall interview performance")
    if any("balanced" in f["clarity"] for f in feedback.values()):
        strengths.append("Excellent communication clarity and structure")
    
    return strengths or ["Solid foundation with room for improvement"]

def generate_next_steps(overall_score: int) -> List[str]:
    """Generate personalized next steps based on performance"""
    if overall_score >= 85:
        return [
            "Excellent performance! Focus on fine-tuning specific examples",
            "Practice industry-specific questions for your target role",
            "Prepare thoughtful questions to ask interviewers"
        ]
    elif overall_score >= 70:
        return [
            "Good foundation. Practice structuring responses using STAR method",
            "Develop 3-5 strong examples that demonstrate key competencies",
            "Record yourself practicing to improve delivery confidence"
        ]
    else:
        return [
            "Focus on fundamental interview skills and common question practice",
            "Work on developing compelling professional stories and examples",
            "Consider additional mock interview sessions for improvement"
        ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)