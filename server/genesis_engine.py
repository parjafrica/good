"""
Granada OS Genesis Engine - FastAPI Service
Transforms ideas into complete organizations with AI-powered document generation
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
from urllib.parse import urlparse

app = FastAPI(title="Granada OS Genesis Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenesisRequest(BaseModel):
    concept: str
    sector: str
    location: str
    target_audience: str
    funding_needs: str
    user_id: str
    organization_type: str = "NGO"

class DocumentRequest(BaseModel):
    organization_id: str
    document_type: str  # mission, bylaws, policies, strategic_plan
    custom_requirements: Optional[str] = None

class BrandRequest(BaseModel):
    organization_id: str
    brand_elements: List[str]  # logo, colors, typography, guidelines
    style_preferences: Optional[Dict[str, Any]] = None

class GenesisDatabase:
    def __init__(self):
        self.db_url = os.environ.get("DATABASE_URL")
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable not set")

    def get_connection(self):
        return psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)

    def create_organization(self, genesis_data: GenesisRequest) -> str:
        """Create new organization from Genesis request"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                org_id = str(uuid.uuid4())
                
                cur.execute("""
                    INSERT INTO organizations (
                        id, name, concept, sector, location, target_audience,
                        funding_needs, organization_type, user_id, status, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    org_id,
                    f"{genesis_data.sector} Organization",
                    genesis_data.concept,
                    genesis_data.sector,
                    genesis_data.location,
                    genesis_data.target_audience,
                    genesis_data.funding_needs,
                    genesis_data.organization_type,
                    genesis_data.user_id,
                    'genesis_processing',
                    datetime.now()
                ))
                
                conn.commit()
                return org_id

    def save_generated_document(self, org_id: str, doc_type: str, content: str, metadata: Dict):
        """Save AI-generated document"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO organization_documents (
                        id, organization_id, document_type, content, metadata, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    str(uuid.uuid4()),
                    org_id,
                    doc_type,
                    content,
                    json.dumps(metadata),
                    datetime.now()
                ))
                conn.commit()

    def get_organization(self, org_id: str) -> Dict:
        """Get organization details"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM organizations WHERE id = %s", (org_id,))
                return dict(cur.fetchone() or {})

db = GenesisDatabase()

class AIDocumentGenerator:
    """AI-powered document generation for organizations"""
    
    def __init__(self):
        self.templates = {
            "mission": self._load_mission_templates(),
            "bylaws": self._load_bylaws_templates(),
            "policies": self._load_policy_templates(),
            "strategic_plan": self._load_strategic_templates()
        }

    def _load_mission_templates(self):
        return {
            "education": {
                "mission": "To transform lives through quality education and sustainable learning opportunities",
                "vision": "A world where every individual has access to transformative educational experiences",
                "values": ["Excellence", "Inclusivity", "Innovation", "Integrity", "Impact"]
            },
            "healthcare": {
                "mission": "To improve health outcomes and strengthen healthcare systems in underserved communities",
                "vision": "Healthy communities with equitable access to quality healthcare services",
                "values": ["Compassion", "Quality", "Accessibility", "Innovation", "Community"]
            },
            "environment": {
                "mission": "To protect and restore environmental sustainability for future generations",
                "vision": "A world where humans and nature thrive in harmony",
                "values": ["Sustainability", "Stewardship", "Innovation", "Collaboration", "Impact"]
            }
        }

    def _load_bylaws_templates(self):
        return {
            "standard_ngo": """
ORGANIZATIONAL BYLAWS

ARTICLE I - NAME AND PURPOSE
The name of this organization shall be [ORGANIZATION_NAME], a nonprofit organization 
operating under the laws of [LOCATION].

Purpose: [MISSION_STATEMENT]

ARTICLE II - MEMBERSHIP
Membership shall be open to individuals who support the mission and values of the organization.

ARTICLE III - BOARD OF DIRECTORS
The organization shall be governed by a Board of Directors consisting of not less than 
three (3) and not more than fifteen (15) members.

ARTICLE IV - OFFICERS
The officers shall consist of a President, Vice President, Secretary, and Treasurer.

ARTICLE V - MEETINGS
Regular meetings of the Board shall be held quarterly.

ARTICLE VI - FINANCIAL MANAGEMENT
All funds shall be managed in accordance with nonprofit best practices and applicable laws.
            """
        }

    def _load_policy_templates(self):
        return {
            "financial_policy": """
FINANCIAL MANAGEMENT POLICY

1. BUDGET PLANNING
- Annual budgets must be approved by the Board of Directors
- Monthly financial reports required
- Quarterly budget reviews mandatory

2. EXPENDITURE APPROVAL
- Expenses under $500: Program Manager approval
- Expenses $500-$2,000: Executive Director approval  
- Expenses over $2,000: Board approval required

3. PROCUREMENT
- Competitive bidding for purchases over $1,000
- Vendor evaluation and selection criteria
- Contract management procedures

4. AUDIT AND COMPLIANCE
- Annual independent audit required
- Donor compliance monitoring
- Grant reporting procedures
            """,
            "hr_policy": """
HUMAN RESOURCES POLICY

1. RECRUITMENT AND HIRING
- Equal opportunity employment practices
- Standardized interview processes
- Background check requirements

2. COMPENSATION AND BENEFITS
- Salary structure and pay scales
- Performance-based incentives
- Health and welfare benefits

3. PERFORMANCE MANAGEMENT
- Annual performance reviews
- Professional development opportunities
- Disciplinary procedures

4. WORKPLACE CONDUCT
- Code of conduct and ethics
- Anti-harassment policies
- Conflict resolution procedures
            """
        }

    def _load_strategic_templates(self):
        return {
            "3_year_plan": """
STRATEGIC PLAN (2024-2027)

EXECUTIVE SUMMARY
[ORGANIZATION_NAME] seeks to [MISSION_SUMMARY] through innovative programs and partnerships.

STRATEGIC OBJECTIVES

Goal 1: Program Excellence
- Objective 1.1: Develop high-impact programs
- Objective 1.2: Expand service delivery capacity
- Objective 1.3: Enhance program quality measures

Goal 2: Organizational Sustainability  
- Objective 2.1: Diversify funding sources
- Objective 2.2: Build institutional capacity
- Objective 2.3: Strengthen governance systems

Goal 3: Community Impact
- Objective 3.1: Increase beneficiary reach
- Objective 3.2: Measure and communicate impact
- Objective 3.3: Foster community partnerships

IMPLEMENTATION TIMELINE
Year 1: Foundation building and program launch
Year 2: Expansion and capacity building
Year 3: Consolidation and sustainability

RESOURCE REQUIREMENTS
Total Budget: [FUNDING_NEEDS]
Staffing: [PROJECTED_STAFF]
Infrastructure: [FACILITY_NEEDS]
            """
        }

    async def generate_mission_statement(self, genesis_data: GenesisRequest) -> Dict[str, Any]:
        """Generate AI-enhanced mission statement"""
        template = self.templates["mission"].get(genesis_data.sector, self.templates["mission"]["education"])
        
        # AI enhancement logic would go here
        enhanced_mission = f"""
MISSION STATEMENT
{template['mission']} in {genesis_data.location}, focusing on {genesis_data.target_audience}.

VISION STATEMENT  
{template['vision']} throughout {genesis_data.location} and beyond.

CORE VALUES
{', '.join(template['values'])}

ORGANIZATIONAL FOCUS
Sector: {genesis_data.sector.title()}
Geographic Scope: {genesis_data.location}
Target Beneficiaries: {genesis_data.target_audience}
Funding Goal: {genesis_data.funding_needs}

UNIQUE VALUE PROPOSITION
{genesis_data.concept}
        """
        
        return {
            "content": enhanced_mission,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "template_used": genesis_data.sector,
                "customization_level": "high"
            }
        }

    async def generate_bylaws(self, org_id: str) -> Dict[str, Any]:
        """Generate organizational bylaws"""
        org_data = db.get_organization(org_id)
        template = self.templates["bylaws"]["standard_ngo"]
        
        # Replace placeholders with actual organization data
        bylaws = template.replace("[ORGANIZATION_NAME]", org_data.get("name", "Organization"))
        bylaws = bylaws.replace("[LOCATION]", org_data.get("location", "Location"))
        bylaws = bylaws.replace("[MISSION_STATEMENT]", org_data.get("concept", "Mission Statement"))
        
        return {
            "content": bylaws,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "template_type": "standard_ngo",
                "jurisdiction": org_data.get("location")
            }
        }

    async def generate_policies(self, org_id: str, policy_types: List[str]) -> Dict[str, Any]:
        """Generate organizational policies"""
        policies_content = ""
        
        for policy_type in policy_types:
            if policy_type in self.templates["policies"]:
                policies_content += self.templates["policies"][policy_type] + "\n\n"
        
        return {
            "content": policies_content,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "policy_types": policy_types,
                "compliance_level": "standard"
            }
        }

    async def generate_strategic_plan(self, org_id: str) -> Dict[str, Any]:
        """Generate 3-year strategic plan"""
        org_data = db.get_organization(org_id)
        template = self.templates["strategic_plan"]["3_year_plan"]
        
        # Replace placeholders
        plan = template.replace("[ORGANIZATION_NAME]", org_data.get("name", "Organization"))
        plan = plan.replace("[MISSION_SUMMARY]", org_data.get("concept", "mission summary"))
        plan = plan.replace("[FUNDING_NEEDS]", org_data.get("funding_needs", "TBD"))
        
        return {
            "content": plan,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "plan_duration": "3_years",
                "review_cycle": "annual"
            }
        }

ai_generator = AIDocumentGenerator()

class BrandGenerator:
    """AI-powered brand identity generation"""
    
    def __init__(self):
        self.color_palettes = {
            "education": {
                "primary": "#1E40AF",
                "secondary": "#3B82F6", 
                "accent": "#EF4444",
                "neutral": "#6B7280"
            },
            "healthcare": {
                "primary": "#059669",
                "secondary": "#10B981",
                "accent": "#F59E0B", 
                "neutral": "#6B7280"
            },
            "environment": {
                "primary": "#065F46",
                "secondary": "#059669",
                "accent": "#DC2626",
                "neutral": "#6B7280"
            }
        }

    async def generate_brand_package(self, org_id: str, elements: List[str]) -> Dict[str, Any]:
        """Generate complete brand identity package"""
        org_data = db.get_organization(org_id)
        sector = org_data.get("sector", "education")
        
        brand_package = {
            "logo_concepts": await self._generate_logo_concepts(org_data),
            "color_palette": self.color_palettes.get(sector, self.color_palettes["education"]),
            "typography": await self._generate_typography_guide(org_data),
            "brand_guidelines": await self._generate_brand_guidelines(org_data)
        }
        
        return {
            "content": brand_package,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "sector": sector,
                "elements_included": elements
            }
        }

    async def _generate_logo_concepts(self, org_data: Dict) -> List[Dict]:
        """Generate logo concepts and descriptions"""
        return [
            {
                "concept": "Symbol-based",
                "description": f"Abstract symbol representing {org_data.get('sector', 'mission')}",
                "style": "Modern, minimalist",
                "colors": "Primary and secondary brand colors"
            },
            {
                "concept": "Text-based", 
                "description": f"Typography-focused design with organization name",
                "style": "Professional, readable",
                "colors": "Primary color with neutral accent"
            },
            {
                "concept": "Combination",
                "description": "Symbol and text integrated design",
                "style": "Balanced, versatile",
                "colors": "Full color palette implementation"
            }
        ]

    async def _generate_typography_guide(self, org_data: Dict) -> Dict:
        """Generate typography guidelines"""
        return {
            "primary_font": "Inter",
            "secondary_font": "Source Sans Pro", 
            "heading_styles": {
                "h1": {"size": "2.5rem", "weight": "700"},
                "h2": {"size": "2rem", "weight": "600"},
                "h3": {"size": "1.5rem", "weight": "600"}
            },
            "body_text": {"size": "1rem", "weight": "400", "line_height": "1.6"}
        }

    async def _generate_brand_guidelines(self, org_data: Dict) -> str:
        """Generate comprehensive brand guidelines document"""
        return f"""
BRAND GUIDELINES

MISSION ALIGNMENT
All brand elements should reflect our commitment to {org_data.get('concept', 'our mission')}.

LOGO USAGE
- Minimum size: 24px height for digital, 0.5 inch for print
- Clear space: Equal to the height of the logo on all sides
- Approved color variations: Full color, single color, white, black

COLOR APPLICATION
- Primary color for headers and key elements
- Secondary color for accents and highlights
- Neutral colors for body text and backgrounds

TYPOGRAPHY HIERARCHY
- Use primary font for all headings
- Use secondary font for body text
- Maintain consistent spacing and sizing

VOICE AND TONE
- Professional yet approachable
- Authoritative but not intimidating
- Inspiring and action-oriented
- Culturally sensitive and inclusive

APPLICATIONS
- Digital: Website, social media, email
- Print: Letterhead, business cards, brochures
- Signage: Banners, displays, vehicle graphics
        """

brand_generator = BrandGenerator()

# API Endpoints

@app.get("/")
async def root():
    return {"service": "Granada OS Genesis Engine", "status": "active", "version": "1.0.0"}

@app.post("/genesis/start")
async def start_genesis(request: GenesisRequest, background_tasks: BackgroundTasks):
    """Initialize Genesis process - create organization and start AI generation"""
    try:
        # Create organization record
        org_id = db.create_organization(request)
        
        # Start background AI generation process
        background_tasks.add_task(process_genesis_pipeline, org_id, request)
        
        return {
            "organization_id": org_id,
            "status": "genesis_started",
            "estimated_completion": "5-10 minutes",
            "message": "AI Genesis pipeline initiated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Genesis initialization failed: {str(e)}")

@app.post("/genesis/documents/generate")
async def generate_documents(request: DocumentRequest):
    """Generate specific organizational documents"""
    try:
        org_data = db.get_organization(request.organization_id)
        if not org_data:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        if request.document_type == "mission":
            genesis_req = GenesisRequest(**org_data)
            result = await ai_generator.generate_mission_statement(genesis_req)
        elif request.document_type == "bylaws":
            result = await ai_generator.generate_bylaws(request.organization_id)
        elif request.document_type == "policies":
            policy_types = ["financial_policy", "hr_policy"]
            result = await ai_generator.generate_policies(request.organization_id, policy_types)
        elif request.document_type == "strategic_plan":
            result = await ai_generator.generate_strategic_plan(request.organization_id)
        else:
            raise HTTPException(status_code=400, detail="Invalid document type")
        
        # Save to database
        db.save_generated_document(
            request.organization_id, 
            request.document_type, 
            result["content"], 
            result["metadata"]
        )
        
        return {
            "document_type": request.document_type,
            "content": result["content"],
            "metadata": result["metadata"],
            "status": "generated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document generation failed: {str(e)}")

@app.post("/genesis/brand/generate")
async def generate_brand(request: BrandRequest):
    """Generate brand identity package"""
    try:
        result = await brand_generator.generate_brand_package(
            request.organization_id, 
            request.brand_elements
        )
        
        # Save to database
        db.save_generated_document(
            request.organization_id,
            "brand_package",
            json.dumps(result["content"]),
            result["metadata"]
        )
        
        return {
            "brand_elements": result["content"],
            "metadata": result["metadata"],
            "status": "generated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brand generation failed: {str(e)}")

@app.get("/genesis/organization/{org_id}/status")
async def get_organization_status(org_id: str):
    """Get organization and Genesis progress status"""
    try:
        org_data = db.get_organization(org_id)
        if not org_data:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        # Get generated documents count
        with db.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT document_type, created_at FROM organization_documents WHERE organization_id = %s",
                    (org_id,)
                )
                documents = cur.fetchall()
        
        return {
            "organization": dict(org_data),
            "documents_generated": len(documents),
            "document_types": [doc["document_type"] for doc in documents],
            "genesis_progress": calculate_genesis_progress(documents),
            "status": org_data.get("status", "unknown")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

async def process_genesis_pipeline(org_id: str, request: GenesisRequest):
    """Background task to process complete Genesis pipeline"""
    try:
        # Update status
        with db.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE organizations SET status = %s WHERE id = %s",
                    ("processing", org_id)
                )
                conn.commit()
        
        # Generate all core documents
        documents_to_generate = [
            ("mission", ai_generator.generate_mission_statement, request),
            ("bylaws", ai_generator.generate_bylaws, org_id),
            ("policies", lambda x: ai_generator.generate_policies(x, ["financial_policy", "hr_policy"]), org_id),
            ("strategic_plan", ai_generator.generate_strategic_plan, org_id)
        ]
        
        for doc_type, generator_func, param in documents_to_generate:
            try:
                result = await generator_func(param)
                db.save_generated_document(org_id, doc_type, result["content"], result["metadata"])
                await asyncio.sleep(1)  # Prevent overwhelming the system
            except Exception as e:
                print(f"Failed to generate {doc_type}: {str(e)}")
        
        # Generate brand package
        try:
            brand_result = await brand_generator.generate_brand_package(org_id, ["logo", "colors", "typography"])
            db.save_generated_document(org_id, "brand_package", json.dumps(brand_result["content"]), brand_result["metadata"])
        except Exception as e:
            print(f"Failed to generate brand package: {str(e)}")
        
        # Update final status
        with db.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE organizations SET status = %s WHERE id = %s",
                    ("completed", org_id)
                )
                conn.commit()
                
    except Exception as e:
        # Update error status
        with db.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE organizations SET status = %s WHERE id = %s",
                    ("error", org_id)
                )
                conn.commit()
        print(f"Genesis pipeline failed for {org_id}: {str(e)}")

def calculate_genesis_progress(documents: List[Dict]) -> int:
    """Calculate Genesis completion percentage"""
    required_docs = ["mission", "bylaws", "policies", "strategic_plan", "brand_package"]
    completed_docs = [doc["document_type"] for doc in documents]
    completed_count = sum(1 for doc in required_docs if doc in completed_docs)
    return int((completed_count / len(required_docs)) * 100)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)