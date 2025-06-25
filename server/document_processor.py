"""
Document Processing System with LangChain
Handles custom funding call uploads and document analysis
"""

import os
import json
import tempfile
from typing import Dict, List, Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import docx
from io import BytesIO
import requests

class DocumentProcessor:
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
            'database': parsed.path[1:],
            'user': parsed.username,
            'password': parsed.password
        }
    
    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.db_config)
    
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return ""
    
    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            print(f"DOCX extraction error: {e}")
            return ""
    
    def extract_text_from_file(self, file_content: bytes, filename: str) -> str:
        """Extract text based on file type"""
        filename_lower = filename.lower()
        
        if filename_lower.endswith('.pdf'):
            return self.extract_text_from_pdf(file_content)
        elif filename_lower.endswith('.docx'):
            return self.extract_text_from_docx(file_content)
        elif filename_lower.endswith('.txt'):
            return file_content.decode('utf-8', errors='ignore')
        else:
            return ""
    
    def _call_deepseek_api(self, messages: List[Dict]) -> str:
        """Call DeepSeek API for analysis"""
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
                print(f"DeepSeek API error: {response.status_code}")
                return ""
        except Exception as e:
            print(f"DeepSeek API call error: {e}")
            return ""
    
    def analyze_funding_document(self, text_content: str) -> Dict[str, Any]:
        """Analyze funding call document using AI"""
        try:
            prompt = f"""
            Analyze this funding call document and extract key information in JSON format:
            
            Document Content:
            {text_content[:3000]}...
            
            Please extract and structure the following information:
            {{
                "title": "Funding opportunity title",
                "organization": "Funding organization name",
                "description": "Brief description of the opportunity",
                "amount_min": "Minimum funding amount (number only)",
                "amount_max": "Maximum funding amount (number only)",
                "currency": "Currency (USD, EUR, etc.)",
                "deadline": "Application deadline (YYYY-MM-DD format or null)",
                "eligibility_criteria": "Who can apply",
                "application_process": "How to apply",
                "focus_areas": ["List of focus areas/sectors"],
                "countries": ["List of eligible countries"],
                "requirements": ["Key requirements"],
                "evaluation_criteria": ["How applications are evaluated"],
                "contact_info": "Contact information",
                "website": "Application website or URL"
            }}
            
            If any information is not available, use null or empty string/array as appropriate.
            """
            
            messages = [{"role": "user", "content": prompt}]
            response_text = self._call_deepseek_api(messages)
            
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                # Fallback parsing
                return self._parse_document_fallback(text_content)
                
        except Exception as e:
            print(f"Document analysis error: {e}")
            return self._get_default_document_structure()
    
    def _parse_document_fallback(self, text: str) -> Dict[str, Any]:
        """Fallback parsing when AI response is not JSON"""
        # Basic keyword extraction
        lines = text.split('\n')
        title = next((line.strip() for line in lines[:10] if len(line.strip()) > 10), "Custom Funding Opportunity")
        
        return {
            "title": title,
            "organization": "Custom Upload",
            "description": text[:200] + "..." if len(text) > 200 else text,
            "amount_min": None,
            "amount_max": None,
            "currency": "USD",
            "deadline": None,
            "eligibility_criteria": "See document for details",
            "application_process": "See document for application process",
            "focus_areas": ["General"],
            "countries": ["Global"],
            "requirements": ["See document for requirements"],
            "evaluation_criteria": ["See document for evaluation criteria"],
            "contact_info": "See document",
            "website": None
        }
    
    def _get_default_document_structure(self) -> Dict[str, Any]:
        """Default structure when analysis fails"""
        return {
            "title": "Uploaded Funding Opportunity",
            "organization": "Custom Upload",
            "description": "Custom funding opportunity uploaded by user",
            "amount_min": None,
            "amount_max": None,
            "currency": "USD",
            "deadline": None,
            "eligibility_criteria": "Various criteria apply",
            "application_process": "See original document",
            "focus_areas": ["General"],
            "countries": ["Global"],
            "requirements": [],
            "evaluation_criteria": [],
            "contact_info": "",
            "website": None
        }
    
    def store_custom_opportunity(self, analysis: Dict[str, Any], user_id: str, original_text: str, filename: str) -> str:
        """Store custom opportunity in database"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO donor_opportunities (
                            title, description, amount_min, amount_max, currency,
                            deadline, source_url, source_name, country, sector,
                            eligibility_criteria, application_process, keywords,
                            focus_areas, content_hash, is_verified, is_active,
                            scraped_at, created_at, updated_at
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), NOW()
                        ) RETURNING id
                    """, (
                        analysis['title'],
                        analysis['description'],
                        analysis['amount_min'],
                        analysis['amount_max'],
                        analysis['currency'],
                        analysis['deadline'],
                        analysis.get('website'),
                        analysis['organization'],
                        analysis['countries'][0] if analysis['countries'] else 'Global',
                        analysis['focus_areas'][0] if analysis['focus_areas'] else 'General',
                        analysis['eligibility_criteria'],
                        analysis['application_process'],
                        json.dumps(analysis['requirements']),
                        json.dumps(analysis['focus_areas']),
                        f"custom_{filename}_{user_id}",
                        True,
                        True
                    ))
                    opportunity_id = cursor.fetchone()[0]
                    
                    # Store the full document text for reference
                    cursor.execute("""
                        INSERT INTO ai_interactions (
                            user_id, interaction_type, input_data, output_data, created_at
                        ) VALUES (%s, %s, %s, %s, NOW())
                    """, (
                        user_id,
                        'document_upload',
                        json.dumps({'filename': filename, 'analysis': analysis}),
                        original_text
                    ))
                    
                    conn.commit()
                    return opportunity_id
        except Exception as e:
            print(f"Storage error: {e}")
            return None

# Flask app for document processing
app = Flask(__name__)
CORS(app)
processor = DocumentProcessor()

@app.route('/api/documents/upload', methods=['POST'])
def upload_document():
    """Upload and process funding call document"""
    try:
        if 'document' not in request.files:
            return jsonify({'error': 'No document file provided'}), 400
        
        file = request.files['document']
        user_id = request.form.get('user_id', 'anonymous')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file content
        file_content = file.read()
        
        # Extract text from document
        text_content = processor.extract_text_from_file(file_content, file.filename)
        
        if not text_content.strip():
            return jsonify({'error': 'Could not extract text from document'}), 400
        
        # Analyze document
        analysis = processor.analyze_funding_document(text_content)
        
        # Store in database
        opportunity_id = processor.store_custom_opportunity(
            analysis, user_id, text_content, file.filename
        )
        
        return jsonify({
            'success': True,
            'opportunity_id': opportunity_id,
            'analysis': analysis,
            'text_extracted': len(text_content) > 0
        })
        
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents/analyze-text', methods=['POST'])
def analyze_text():
    """Analyze pasted text content"""
    try:
        data = request.json
        text_content = data.get('text_content', '')
        user_id = data.get('user_id', 'anonymous')
        
        if not text_content.strip():
            return jsonify({'error': 'No text content provided'}), 400
        
        # Analyze text
        analysis = processor.analyze_funding_document(text_content)
        
        # Store in database
        opportunity_id = processor.store_custom_opportunity(
            analysis, user_id, text_content, 'pasted_text'
        )
        
        return jsonify({
            'success': True,
            'opportunity_id': opportunity_id,
            'analysis': analysis
        })
        
    except Exception as e:
        print(f"Text analysis error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents/opportunities/<user_id>', methods=['GET'])
def get_user_opportunities(user_id):
    """Get custom opportunities uploaded by user"""
    try:
        with processor.get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT * FROM donor_opportunities 
                    WHERE content_hash LIKE %s
                    ORDER BY created_at DESC
                """, (f'custom_%_{user_id}',))
                
                opportunities = [dict(row) for row in cursor.fetchall()]
                return jsonify({'opportunities': opportunities})
                
    except Exception as e:
        print(f"Error fetching user opportunities: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)