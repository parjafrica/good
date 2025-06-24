"""
AI-Powered Proposal Generation System
Integrates with OpenAI for transcription, analysis, and proposal enhancement
"""

import os
import json
import asyncio
import tempfile
from typing import Dict, List, Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
import requests

class ProposalAI:
    def __init__(self):
        self.deepseek_api_key = os.getenv('DEEPSEEK_API_KEY', 'sk-your-deepseek-key')
        self.deepseek_base_url = "https://api.deepseek.com/v1"
        self.db_config = self._parse_db_url(os.getenv('DATABASE_URL'))
    
    def _parse_db_url(self, url: str) -> Dict[str, str]:
        """Parse DATABASE_URL into connection parameters"""
        if not url:
            raise ValueError("DATABASE_URL environment variable not set")
        
        parsed = urlparse(url)
        return {
            'host': parsed.hostname,
            'port': parsed.port or 5432,
            'database': parsed.path[1:],  # Remove leading '/'
            'user': parsed.username,
            'password': parsed.password
        }
    
    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.db_config)
    
    def get_opportunity_details(self, opportunity_id: str) -> Optional[Dict]:
        """Fetch opportunity details from database"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM donor_opportunities 
                        WHERE id = %s AND is_active = true
                    """, (opportunity_id,))
                    return dict(cursor.fetchone()) if cursor.fetchone() else None
        except Exception as e:
            print(f"Error fetching opportunity: {e}")
            return None
    
    def transcribe_audio(self, audio_file_path: str) -> Dict[str, Any]:
        """Transcribe audio file using Web Speech API simulation"""
        try:
            # For now, return a placeholder for real-time transcription
            # In production, this would integrate with the browser's Web Speech API
            return {
                'text': 'Real-time transcription will be handled by the frontend Web Speech API',
                'duration': 0,
                'language': 'en',
                'segments': []
            }
        except Exception as e:
            print(f"Transcription error: {e}")
            return {'text': '', 'duration': 0, 'language': 'en', 'segments': []}
    
    def _call_deepseek_api(self, messages: List[Dict], response_format: str = "text") -> str:
        """Call DeepSeek API"""
        try:
            headers = {
                "Authorization": f"Bearer {self.deepseek_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "deepseek-chat",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 4000
            }
            
            response = requests.post(
                f"{self.deepseek_base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                print(f"DeepSeek API error: {response.status_code} - {response.text}")
                return ""
        except Exception as e:
            print(f"DeepSeek API call error: {e}")
            return ""

    def analyze_opportunity(self, opportunity: Dict) -> Dict[str, Any]:
        """Analyze funding opportunity and provide insights"""
        try:
            prompt = f"""
            Analyze this funding opportunity and provide key insights for proposal writing:
            
            Title: {opportunity.get('title', 'N/A')}
            Description: {opportunity.get('description', 'N/A')}
            Funding Range: ${opportunity.get('amount_min', 0):,} - ${opportunity.get('amount_max', 0):,}
            Sector: {opportunity.get('sector', 'N/A')}
            Country: {opportunity.get('country', 'N/A')}
            Eligibility: {opportunity.get('eligibility_criteria', 'N/A')}
            Application Process: {opportunity.get('application_process', 'N/A')}
            
            Provide analysis in JSON format with:
            {{
                "key_requirements": ["requirement1", "requirement2"],
                "success_factors": ["factor1", "factor2"],
                "proposal_sections": ["section1", "section2"],
                "budget_considerations": ["consideration1", "consideration2"],
                "timeline_suggestions": ["suggestion1", "suggestion2"],
                "competitive_advantages": ["advantage1", "advantage2"]
            }}
            """
            
            messages = [{"role": "user", "content": prompt}]
            response_text = self._call_deepseek_api(messages)
            
            if response_text:
                # Try to extract JSON from response
                try:
                    return json.loads(response_text)
                except json.JSONDecodeError:
                    # If not valid JSON, return structured fallback
                    return self._parse_analysis_fallback(response_text)
            
            return self._get_default_analysis()
        except Exception as e:
            print(f"Analysis error: {e}")
            return self._get_default_analysis()
    
    def _parse_analysis_fallback(self, text: str) -> Dict[str, Any]:
        """Parse analysis from text when JSON parsing fails"""
        return {
            "key_requirements": ["Review eligibility criteria carefully", "Align project with funder priorities"],
            "success_factors": ["Clear problem statement", "Measurable outcomes", "Strong methodology"],
            "proposal_sections": ["Executive Summary", "Problem Statement", "Objectives", "Methodology", "Budget", "Timeline"],
            "budget_considerations": ["Justify all costs", "Include indirect costs", "Show cost-effectiveness"],
            "timeline_suggestions": ["Set realistic milestones", "Include buffer time", "Plan evaluation phases"],
            "competitive_advantages": ["Unique approach", "Strong team expertise", "Community partnerships"]
        }
    
    def _get_default_analysis(self) -> Dict[str, Any]:
        """Get default analysis structure"""
        return {
            "key_requirements": [],
            "success_factors": [],
            "proposal_sections": [],
            "budget_considerations": [],
            "timeline_suggestions": [],
            "competitive_advantages": []
        }
    
    def generate_proposal_section(self, section_type: str, opportunity: Dict, user_input: str = "", transcribed_text: str = "") -> str:
        """Generate specific proposal section"""
        try:
            context = f"""
            Funding Opportunity: {opportunity.get('title', 'N/A')}
            Sector: {opportunity.get('sector', 'N/A')}
            Funding: ${opportunity.get('amount_min', 0):,} - ${opportunity.get('amount_max', 0):,}
            """
            
            if transcribed_text:
                context += f"\nUser Audio Input: {transcribed_text}"
            
            if user_input:
                context += f"\nUser Written Input: {user_input}"
            
            section_prompts = {
                "executive_summary": "Write a compelling executive summary that captures the essence of the project and its alignment with the funding opportunity.",
                "problem_statement": "Develop a clear problem statement that identifies the issue your project addresses and its relevance to the funder's priorities.",
                "objectives": "Create specific, measurable objectives that align with the funding opportunity requirements.",
                "methodology": "Design a comprehensive methodology that outlines your approach to achieving the project objectives.",
                "budget": "Develop a detailed budget breakdown that justifies costs and aligns with the funding range.",
                "timeline": "Create a realistic timeline with key milestones and deliverables.",
                "evaluation": "Design an evaluation framework to measure project success and impact.",
                "sustainability": "Outline plans for project sustainability and long-term impact."
            }
            
            prompt = f"""
            {context}
            
            Generate a professional {section_type} section for this grant proposal.
            
            Requirements:
            - {section_prompts.get(section_type, 'Generate appropriate content for this section')}
            - Align with the funding opportunity requirements
            - Be specific and actionable
            - Use professional grant writing language
            - Length: 300-500 words
            
            Do not include section headers, just the content.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Section generation error: {e}")
            return f"Error generating {section_type} section. Please try again."
    
    def enhance_content(self, content: str, opportunity: Dict, enhancement_type: str = "improve") -> str:
        """Enhance existing proposal content"""
        try:
            enhancement_prompts = {
                "improve": "Improve the clarity, impact, and persuasiveness of this content while maintaining accuracy.",
                "expand": "Expand this content with more detail, examples, and supporting evidence.",
                "simplify": "Simplify this content to be more accessible while maintaining key points.",
                "align": "Better align this content with the funding opportunity requirements and priorities."
            }
            
            prompt = f"""
            Funding Opportunity: {opportunity.get('title', 'N/A')}
            Sector: {opportunity.get('sector', 'N/A')}
            
            Task: {enhancement_prompts.get(enhancement_type, 'Improve this content')}
            
            Content to enhance:
            {content}
            
            Return only the enhanced content, no explanations.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Enhancement error: {e}")
            return content
    
    def get_writing_suggestions(self, current_text: str, opportunity: Dict) -> List[str]:
        """Get AI writing suggestions for current content"""
        try:
            prompt = f"""
            Analyze this proposal content and provide 3-5 specific writing suggestions:
            
            Funding Opportunity: {opportunity.get('title', 'N/A')}
            
            Current Content:
            {current_text}
            
            Provide suggestions in JSON format:
            {{
                "suggestions": [
                    "suggestion 1",
                    "suggestion 2",
                    "suggestion 3"
                ]
            }}
            """
            
            messages = [{"role": "user", "content": prompt}]
            response_text = self._call_deepseek_api(messages)
            
            try:
                result = json.loads(response_text)
                return result.get('suggestions', [])
            except json.JSONDecodeError:
                # Extract suggestions from text format
                return self._extract_suggestions_from_text(response_text)
        except Exception as e:
            print(f"Suggestions error: {e}")
            return []
    
    def _extract_suggestions_from_text(self, text: str) -> List[str]:
        """Extract suggestions from text when JSON parsing fails"""
        suggestions = []
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                suggestion = line.lstrip('-•* ').strip()
                if suggestion:
                    suggestions.append(suggestion)
        return suggestions[:5]  # Limit to 5 suggestions
    
    def save_proposal_draft(self, user_id: str, opportunity_id: str, content: Dict) -> str:
        """Save proposal draft to database"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO proposals (
                            user_id, opportunity_id, title, content, 
                            status, created_at, updated_at
                        ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                        RETURNING id
                    """, (
                        user_id,
                        opportunity_id,
                        content.get('title', 'Draft Proposal'),
                        json.dumps(content),
                        'draft'
                    ))
                    proposal_id = cursor.fetchone()[0]
                    conn.commit()
                    return proposal_id
        except Exception as e:
            print(f"Save error: {e}")
            return None

# Flask endpoints for the proposal AI system
from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)
proposal_ai = ProposalAI()

@app.route('/api/proposal/analyze-opportunity', methods=['POST'])
def analyze_opportunity():
    """Analyze funding opportunity for proposal insights"""
    try:
        data = request.json
        opportunity_id = data.get('opportunity_id')
        
        opportunity = proposal_ai.get_opportunity_details(opportunity_id)
        if not opportunity:
            return jsonify({'error': 'Opportunity not found'}), 404
        
        analysis = proposal_ai.analyze_opportunity(opportunity)
        return jsonify({
            'opportunity': opportunity,
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/proposal/transcribe-audio', methods=['POST'])
def transcribe_audio():
    """Transcribe uploaded audio file"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            
            # Transcribe
            result = proposal_ai.transcribe_audio(temp_file.name)
            
            # Clean up
            os.unlink(temp_file.name)
            
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/proposal/generate-section', methods=['POST'])
def generate_section():
    """Generate proposal section content"""
    try:
        data = request.json
        section_type = data.get('section_type')
        opportunity_id = data.get('opportunity_id')
        user_input = data.get('user_input', '')
        transcribed_text = data.get('transcribed_text', '')
        
        opportunity = proposal_ai.get_opportunity_details(opportunity_id)
        if not opportunity:
            return jsonify({'error': 'Opportunity not found'}), 404
        
        content = proposal_ai.generate_proposal_section(
            section_type, opportunity, user_input, transcribed_text
        )
        
        return jsonify({'content': content})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/proposal/enhance-content', methods=['POST'])
def enhance_content():
    """Enhance existing proposal content"""
    try:
        data = request.json
        content = data.get('content')
        opportunity_id = data.get('opportunity_id')
        enhancement_type = data.get('enhancement_type', 'improve')
        
        opportunity = proposal_ai.get_opportunity_details(opportunity_id)
        if not opportunity:
            return jsonify({'error': 'Opportunity not found'}), 404
        
        enhanced = proposal_ai.enhance_content(content, opportunity, enhancement_type)
        return jsonify({'enhanced_content': enhanced})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/proposal/suggestions', methods=['POST'])
def get_suggestions():
    """Get AI writing suggestions"""
    try:
        data = request.json
        current_text = data.get('current_text')
        opportunity_id = data.get('opportunity_id')
        
        opportunity = proposal_ai.get_opportunity_details(opportunity_id)
        if not opportunity:
            return jsonify({'error': 'Opportunity not found'}), 404
        
        suggestions = proposal_ai.get_writing_suggestions(current_text, opportunity)
        return jsonify({'suggestions': suggestions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/proposal/save-draft', methods=['POST'])
def save_draft():
    """Save proposal draft"""
    try:
        data = request.json
        user_id = data.get('user_id')
        opportunity_id = data.get('opportunity_id')
        content = data.get('content')
        
        proposal_id = proposal_ai.save_proposal_draft(user_id, opportunity_id, content)
        return jsonify({'proposal_id': proposal_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)