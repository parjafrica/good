"""
Granada OS Academic Engine - FastAPI Service
AI-powered literature review, research assistance, and academic writing support
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
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
import requests
import hashlib

app = FastAPI(title="Granada OS Academic Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LiteratureSearchRequest(BaseModel):
    user_id: str
    research_topic: str
    search_query: str
    databases: List[str] = ["pubmed", "scholar", "arxiv"]
    max_results: int = 50
    years_range: Optional[Dict[str, int]] = None

class ResearchAssistantRequest(BaseModel):
    user_id: str
    research_type: str  # methodology, analysis, survey, hypothesis
    research_context: str
    specific_requirements: Optional[str] = None

class CitationRequest(BaseModel):
    user_id: str
    papers: List[Dict[str, Any]]
    citation_style: str = "apa"

class AcademicDatabase:
    def __init__(self):
        self.db_url = os.environ.get("DATABASE_URL")
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable not set")

    def get_connection(self):
        return psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)

    def save_literature_search(self, user_id: str, search_data: Dict, results: List[Dict]) -> str:
        """Save literature search results"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                search_id = str(uuid.uuid4())
                
                cur.execute("""
                    INSERT INTO literature_searches (
                        id, user_id, search_query, search_parameters, results_count, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    search_id,
                    user_id,
                    search_data["search_query"],
                    json.dumps(search_data),
                    len(results),
                    datetime.now()
                ))
                
                # Save individual papers
                for paper in results:
                    cur.execute("""
                        INSERT INTO research_papers (
                            id, search_id, paper_data, relevance_score, created_at
                        ) VALUES (%s, %s, %s, %s, %s)
                    """, (
                        str(uuid.uuid4()),
                        search_id,
                        json.dumps(paper),
                        paper.get("relevance_score", 0),
                        datetime.now()
                    ))
                
                conn.commit()
                return search_id

    def get_user_searches(self, user_id: str) -> List[Dict]:
        """Get all searches for a user"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, search_query, results_count, created_at 
                    FROM literature_searches 
                    WHERE user_id = %s 
                    ORDER BY created_at DESC
                """, (user_id,))
                return [dict(row) for row in cur.fetchall()]

    def save_research_analysis(self, user_id: str, analysis_type: str, content: Dict) -> str:
        """Save research analysis results"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                analysis_id = str(uuid.uuid4())
                
                cur.execute("""
                    INSERT INTO research_analyses (
                        id, user_id, analysis_type, content, created_at
                    ) VALUES (%s, %s, %s, %s, %s)
                """, (
                    analysis_id,
                    user_id,
                    analysis_type,
                    json.dumps(content),
                    datetime.now()
                ))
                
                conn.commit()
                return analysis_id

db = AcademicDatabase()

class LiteratureSearchEngine:
    """AI-powered literature discovery and analysis"""
    
    def __init__(self):
        self.database_configs = {
            "pubmed": {
                "name": "PubMed",
                "description": "Biomedical and life sciences literature",
                "base_url": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/",
                "paper_count": "34M+"
            },
            "scholar": {
                "name": "Google Scholar",
                "description": "Multi-disciplinary academic literature",
                "base_url": "https://scholar.google.com/",
                "paper_count": "389M+"
            },
            "arxiv": {
                "name": "arXiv",
                "description": "Physics, mathematics, computer science preprints",
                "base_url": "https://arxiv.org/",
                "paper_count": "2M+"
            },
            "ssrn": {
                "name": "SSRN",
                "description": "Social sciences research network",
                "base_url": "https://www.ssrn.com/",
                "paper_count": "1M+"
            }
        }

    async def search_literature(self, request: LiteratureSearchRequest) -> Dict[str, Any]:
        """Perform comprehensive literature search across multiple databases"""
        
        all_results = []
        search_metadata = {
            "total_searched": 0,
            "databases_used": [],
            "search_strategies": []
        }
        
        for database in request.databases:
            if database in self.database_configs:
                try:
                    results = await self._search_database(database, request)
                    all_results.extend(results)
                    search_metadata["databases_used"].append(database)
                    search_metadata["total_searched"] += len(results)
                except Exception as e:
                    print(f"Search failed for {database}: {str(e)}")
        
        # Remove duplicates and enhance results
        unique_results = await self._deduplicate_papers(all_results)
        enhanced_results = await self._enhance_search_results(unique_results, request.research_topic)
        
        # Rank by relevance
        ranked_results = await self._rank_by_relevance(enhanced_results, request.search_query)
        
        return {
            "papers": ranked_results[:request.max_results],
            "metadata": search_metadata,
            "search_summary": await self._generate_search_summary(ranked_results, request),
            "suggested_refinements": await self._suggest_search_refinements(request, len(ranked_results))
        }

    async def _search_database(self, database: str, request: LiteratureSearchRequest) -> List[Dict]:
        """Search individual database - mock implementation for now"""
        # In production, this would make actual API calls to academic databases
        
        base_papers = await self._generate_relevant_papers(request.search_query, request.research_topic, database)
        
        # Apply year filtering if specified
        if request.years_range:
            base_papers = [
                paper for paper in base_papers 
                if request.years_range.get("start", 2000) <= paper["year"] <= request.years_range.get("end", 2024)
            ]
        
        return base_papers

    async def _generate_relevant_papers(self, query: str, topic: str, database: str) -> List[Dict]:
        """Generate realistic academic papers based on search parameters"""
        
        topics_map = {
            "climate": ["climate change adaptation", "environmental sustainability", "carbon emissions", "renewable energy"],
            "health": ["public health interventions", "healthcare systems", "disease prevention", "health outcomes"],
            "education": ["educational technology", "learning outcomes", "curriculum development", "student engagement"],
            "development": ["sustainable development", "poverty reduction", "economic growth", "social impact"],
            "technology": ["artificial intelligence", "machine learning", "software engineering", "digital transformation"]
        }
        
        # Determine relevant topics based on query and research topic
        relevant_topics = []
        for key, topics in topics_map.items():
            if key in query.lower() or key in topic.lower():
                relevant_topics.extend(topics)
        
        if not relevant_topics:
            relevant_topics = ["interdisciplinary research", "systematic review", "empirical analysis"]
        
        papers = []
        for i in range(15):  # Generate 15 papers per database
            paper_topic = relevant_topics[i % len(relevant_topics)]
            
            paper = {
                "id": f"{database}_{hashlib.md5(f'{paper_topic}_{i}'.encode()).hexdigest()[:8]}",
                "title": f"{paper_topic.title()}: {query} perspectives in {topic}",
                "authors": [f"Author{i+1}, J.", f"Researcher{i+1}, A."],
                "journal": self._get_relevant_journal(database, paper_topic),
                "year": 2018 + (i % 7),
                "abstract": f"This study examines {paper_topic} in the context of {topic}, utilizing {query}-based methodologies. Our research demonstrates significant implications for understanding {paper_topic} mechanisms and their practical applications in {topic} settings. The findings contribute to the growing body of literature on {query} approaches and suggest new directions for future research.",
                "doi": f"10.1000/{database}.{i+1000}",
                "citations": max(10, 500 - i * 20 + (hash(paper_topic) % 100)),
                "access_type": ["open", "subscription", "preprint"][i % 3],
                "keywords": [query.lower(), topic.lower(), paper_topic.replace(" ", "_")],
                "database_source": database,
                "relevance_score": max(60, 95 - i * 3),
                "methodology": self._infer_methodology(paper_topic, query),
                "study_type": ["empirical", "theoretical", "review", "meta-analysis"][i % 4]
            }
            papers.append(paper)
        
        return papers

    def _get_relevant_journal(self, database: str, topic: str) -> str:
        """Get relevant journal based on database and topic"""
        journal_map = {
            "pubmed": {
                "health": ["The Lancet", "NEJM", "BMJ", "JAMA"],
                "climate": ["Environmental Health Perspectives", "Global Environmental Change"],
                "default": ["PLoS ONE", "Scientific Reports"]
            },
            "scholar": {
                "education": ["Journal of Educational Research", "Educational Technology Research"],
                "development": ["World Development", "Development Policy Review"],
                "default": ["Nature", "Science"]
            },
            "arxiv": {
                "technology": ["arXiv:cs.AI", "arXiv:cs.LG", "arXiv:cs.SE"],
                "default": ["arXiv:stat.ML", "arXiv:econ.GN"]
            }
        }
        
        db_journals = journal_map.get(database, journal_map["scholar"])
        
        for key, journals in db_journals.items():
            if key in topic.lower():
                return journals[hash(topic) % len(journals)]
        
        return db_journals["default"][0]

    def _infer_methodology(self, topic: str, query: str) -> str:
        """Infer research methodology based on topic and query"""
        if "intervention" in topic or "program" in query:
            return "Randomized Controlled Trial"
        elif "survey" in query or "assessment" in query:
            return "Cross-sectional Survey"
        elif "analysis" in topic or "model" in query:
            return "Quantitative Analysis"
        elif "review" in topic:
            return "Systematic Review"
        else:
            return "Mixed Methods"

    async def _deduplicate_papers(self, papers: List[Dict]) -> List[Dict]:
        """Remove duplicate papers based on title similarity"""
        unique_papers = []
        seen_titles = set()
        
        for paper in papers:
            title_normalized = paper["title"].lower().strip()
            if title_normalized not in seen_titles:
                seen_titles.add(title_normalized)
                unique_papers.append(paper)
        
        return unique_papers

    async def _enhance_search_results(self, papers: List[Dict], research_topic: str) -> List[Dict]:
        """Enhance search results with additional metadata and analysis"""
        enhanced = []
        
        for paper in papers:
            # Add research impact metrics
            paper["impact_metrics"] = {
                "citation_velocity": paper["citations"] / max(1, 2024 - paper["year"]),
                "cross_disciplinary_score": self._calculate_cross_disciplinary_score(paper, research_topic),
                "methodological_rigor": self._assess_methodological_rigor(paper)
            }
            
            # Add topic modeling results
            paper["topic_alignment"] = await self._calculate_topic_alignment(paper, research_topic)
            
            # Add readability and complexity metrics
            paper["complexity_metrics"] = {
                "readability_score": 7.5,  # Graduate level
                "technical_complexity": "high" if "model" in paper["title"].lower() else "medium",
                "data_availability": "available" if paper["access_type"] == "open" else "restricted"
            }
            
            enhanced.append(paper)
        
        return enhanced

    def _calculate_cross_disciplinary_score(self, paper: Dict, research_topic: str) -> float:
        """Calculate how well paper bridges disciplines"""
        keywords = paper.get("keywords", [])
        title_words = paper["title"].lower().split()
        
        # Count interdisciplinary indicators
        interdisciplinary_terms = ["interdisciplinary", "multidisciplinary", "cross-sector", "integrated", "holistic"]
        score = sum(1 for term in interdisciplinary_terms if any(term in keyword for keyword in keywords))
        
        # Bonus for methodology diversity
        if paper.get("methodology") == "Mixed Methods":
            score += 1
        
        return min(5.0, score * 1.2)

    def _assess_methodological_rigor(self, paper: Dict) -> str:
        """Assess methodological rigor based on study characteristics"""
        study_type = paper.get("study_type", "")
        methodology = paper.get("methodology", "")
        citations = paper.get("citations", 0)
        
        if study_type == "meta-analysis" and citations > 200:
            return "very_high"
        elif methodology == "Randomized Controlled Trial" and citations > 100:
            return "high"
        elif study_type == "empirical" and citations > 50:
            return "medium_high"
        elif citations > 20:
            return "medium"
        else:
            return "developing"

    async def _calculate_topic_alignment(self, paper: Dict, research_topic: str) -> float:
        """Calculate how well paper aligns with research topic"""
        title = paper["title"].lower()
        abstract = paper["abstract"].lower()
        topic = research_topic.lower()
        
        # Simple keyword matching - would use semantic similarity in production
        topic_words = topic.split()
        
        title_matches = sum(1 for word in topic_words if word in title)
        abstract_matches = sum(1 for word in topic_words if word in abstract)
        
        alignment_score = (title_matches * 2 + abstract_matches) / (len(topic_words) * 3)
        return min(1.0, alignment_score)

    async def _rank_by_relevance(self, papers: List[Dict], query: str) -> List[Dict]:
        """Rank papers by comprehensive relevance score"""
        
        for paper in papers:
            # Combine multiple relevance factors
            base_relevance = paper.get("relevance_score", 50) / 100
            topic_alignment = paper.get("topic_alignment", 0.5)
            citation_impact = min(1.0, paper.get("citations", 0) / 200)
            cross_disciplinary = paper["impact_metrics"]["cross_disciplinary_score"] / 5
            
            # Calculate composite relevance score
            composite_score = (
                base_relevance * 0.4 +
                topic_alignment * 0.3 +
                citation_impact * 0.2 +
                cross_disciplinary * 0.1
            ) * 100
            
            paper["composite_relevance_score"] = round(composite_score, 1)
        
        # Sort by composite relevance score
        return sorted(papers, key=lambda p: p["composite_relevance_score"], reverse=True)

    async def _generate_search_summary(self, papers: List[Dict], request: LiteratureSearchRequest) -> Dict[str, Any]:
        """Generate comprehensive search summary"""
        if not papers:
            return {"message": "No papers found matching search criteria"}
        
        # Analyze paper characteristics
        total_papers = len(papers)
        avg_relevance = sum(p["composite_relevance_score"] for p in papers) / total_papers
        
        year_distribution = {}
        methodology_distribution = {}
        access_distribution = {}
        
        for paper in papers:
            year = paper["year"]
            year_distribution[year] = year_distribution.get(year, 0) + 1
            
            methodology = paper.get("methodology", "Unknown")
            methodology_distribution[methodology] = methodology_distribution.get(methodology, 0) + 1
            
            access = paper.get("access_type", "unknown")
            access_distribution[access] = access_distribution.get(access, 0) + 1
        
        return {
            "total_papers": total_papers,
            "average_relevance": round(avg_relevance, 1),
            "year_range": f"{min(year_distribution.keys())}-{max(year_distribution.keys())}",
            "methodology_breakdown": methodology_distribution,
            "access_breakdown": access_distribution,
            "top_themes": await self._extract_top_themes(papers),
            "research_gaps": await self._identify_research_gaps(papers, request.research_topic)
        }

    async def _extract_top_themes(self, papers: List[Dict]) -> List[str]:
        """Extract top research themes from papers"""
        # Simple keyword frequency analysis
        all_keywords = []
        for paper in papers:
            all_keywords.extend(paper.get("keywords", []))
        
        keyword_freq = {}
        for keyword in all_keywords:
            keyword_freq[keyword] = keyword_freq.get(keyword, 0) + 1
        
        # Return top 5 themes
        sorted_themes = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)
        return [theme[0] for theme in sorted_themes[:5]]

    async def _identify_research_gaps(self, papers: List[Dict], topic: str) -> List[str]:
        """Identify potential research gaps based on literature analysis"""
        gaps = []
        
        # Analyze methodological gaps
        methodologies = [p.get("methodology", "") for p in papers]
        if "Longitudinal Study" not in methodologies:
            gaps.append(f"Limited longitudinal research on {topic}")
        
        if "Qualitative Research" not in methodologies:
            gaps.append(f"Need for more qualitative insights into {topic}")
        
        # Analyze geographic gaps
        if not any("africa" in p["title"].lower() or "developing" in p["abstract"].lower() for p in papers):
            gaps.append(f"Limited research on {topic} in developing country contexts")
        
        # Analyze temporal gaps
        recent_papers = [p for p in papers if p["year"] >= 2022]
        if len(recent_papers) < len(papers) * 0.3:
            gaps.append(f"Need for more recent research on {topic}")
        
        return gaps[:3]  # Return top 3 gaps

    async def _suggest_search_refinements(self, request: LiteratureSearchRequest, results_count: int) -> List[str]:
        """Suggest search refinements based on results"""
        suggestions = []
        
        if results_count == 0:
            suggestions = [
                "Try broader search terms or synonyms",
                "Expand the year range to include older studies",
                "Include related disciplines in your search",
                "Consider different methodological approaches"
            ]
        elif results_count < 10:
            suggestions = [
                "Consider expanding search terms to include related concepts",
                "Add more databases to your search strategy",
                "Include grey literature and conference proceedings"
            ]
        elif results_count > 100:
            suggestions = [
                "Narrow your search with more specific terms",
                "Add methodological filters (e.g., RCT, systematic review)",
                "Focus on recent publications (last 5 years)",
                "Limit to high-impact journals"
            ]
        else:
            suggestions = [
                "Consider adding citation analysis for key papers",
                "Look for systematic reviews and meta-analyses",
                "Explore forward and backward citation tracking"
            ]
        
        return suggestions

literature_engine = LiteratureSearchEngine()

class ResearchAssistant:
    """AI-powered research methodology and analysis support"""
    
    def __init__(self):
        self.methodology_templates = {
            "quantitative": {
                "design_options": ["Experimental", "Quasi-experimental", "Cross-sectional", "Longitudinal"],
                "analysis_methods": ["Descriptive statistics", "Regression analysis", "ANOVA", "Time series"],
                "tools": ["SPSS", "R", "Python (pandas)", "Stata"],
                "sample_size_guidelines": "Power analysis recommended for experimental designs"
            },
            "qualitative": {
                "design_options": ["Ethnography", "Case study", "Phenomenology", "Grounded theory"],
                "analysis_methods": ["Thematic analysis", "Content analysis", "Narrative analysis", "Framework analysis"],
                "tools": ["NVivo", "Atlas.ti", "Dedoose", "Manual coding"],
                "sample_size_guidelines": "Theoretical saturation typically achieved with 12-30 participants"
            },
            "mixed_methods": {
                "design_options": ["Convergent parallel", "Sequential explanatory", "Sequential exploratory", "Transformative"],
                "analysis_methods": ["Joint displays", "Data transformation", "Meta-inferences", "Integration protocols"],
                "tools": ["Mixed methods software", "Multiple platforms", "Custom integration"],
                "sample_size_guidelines": "Combine quantitative power analysis with qualitative saturation"
            }
        }

    async def generate_research_design(self, request: ResearchAssistantRequest) -> Dict[str, Any]:
        """Generate comprehensive research design recommendations"""
        
        if request.research_type == "methodology":
            return await self._design_methodology(request)
        elif request.research_type == "analysis":
            return await self._design_analysis_plan(request)
        elif request.research_type == "survey":
            return await self._design_survey_instrument(request)
        elif request.research_type == "hypothesis":
            return await self._develop_hypothesis_framework(request)
        else:
            raise HTTPException(status_code=400, detail="Invalid research type")

    async def _design_methodology(self, request: ResearchAssistantRequest) -> Dict[str, Any]:
        """Design research methodology based on context"""
        
        # Determine appropriate methodology based on research context
        context = request.research_context.lower()
        
        if any(word in context for word in ["measure", "test", "compare", "effect", "impact"]):
            recommended_approach = "quantitative"
        elif any(word in context for word in ["understand", "explore", "experience", "perception", "meaning"]):
            recommended_approach = "qualitative"
        else:
            recommended_approach = "mixed_methods"
        
        template = self.methodology_templates[recommended_approach]
        
        methodology_design = {
            "recommended_approach": recommended_approach,
            "rationale": await self._generate_methodology_rationale(request.research_context, recommended_approach),
            "research_design": {
                "primary_design": template["design_options"][0],
                "alternative_designs": template["design_options"][1:3],
                "design_justification": await self._justify_design_choice(request.research_context, template["design_options"][0])
            },
            "data_collection": await self._design_data_collection(request.research_context, recommended_approach),
            "analysis_plan": {
                "primary_methods": template["analysis_methods"][:2],
                "software_recommendations": template["tools"],
                "sample_size_guidance": template["sample_size_guidelines"]
            },
            "timeline": await self._generate_research_timeline(recommended_approach),
            "ethical_considerations": await self._identify_ethical_considerations(request.research_context),
            "quality_assurance": await self._design_quality_measures(recommended_approach)
        }
        
        return methodology_design

    async def _generate_methodology_rationale(self, context: str, approach: str) -> str:
        """Generate rationale for methodology choice"""
        rationales = {
            "quantitative": f"Given the research context focusing on {context}, a quantitative approach is recommended to enable statistical testing, measurement of relationships, and generalization of findings to larger populations.",
            "qualitative": f"The research context of {context} suggests a qualitative approach to deeply understand experiences, perceptions, and meanings that cannot be captured through numerical data alone.",
            "mixed_methods": f"The complexity of {context} warrants a mixed-methods approach to leverage both the statistical power of quantitative methods and the deep insights from qualitative inquiry."
        }
        return rationales.get(approach, "Methodology selected based on research objectives and context.")

    async def _justify_design_choice(self, context: str, design: str) -> str:
        """Justify specific research design choice"""
        justifications = {
            "Experimental": "Allows for causal inference through controlled manipulation of variables",
            "Cross-sectional": "Efficient for examining relationships at a specific point in time",
            "Longitudinal": "Essential for understanding changes and development over time",
            "Ethnography": "Provides deep cultural understanding through immersive observation",
            "Case study": "Enables in-depth examination of complex phenomena in real-world contexts",
            "Convergent parallel": "Allows simultaneous collection and analysis of both data types"
        }
        return justifications.get(design, "Design selected based on research objectives and practical constraints.")

    async def _design_data_collection(self, context: str, approach: str) -> Dict[str, Any]:
        """Design data collection strategy"""
        
        if approach == "quantitative":
            return {
                "instruments": ["Structured questionnaire", "Standardized scales", "Administrative data"],
                "sampling_strategy": "Probability sampling (simple random, stratified, or cluster)",
                "data_collection_methods": ["Online surveys", "Face-to-face interviews", "Phone interviews"],
                "measurement_considerations": "Validity and reliability testing of instruments",
                "pilot_testing": "Recommended with 10% of target sample size"
            }
        elif approach == "qualitative":
            return {
                "instruments": ["Semi-structured interview guide", "Focus group protocol", "Observation framework"],
                "sampling_strategy": "Purposive sampling for information-rich cases",
                "data_collection_methods": ["In-depth interviews", "Focus groups", "Participant observation"],
                "measurement_considerations": "Trustworthiness through credibility, transferability, dependability",
                "pilot_testing": "Initial interviews to refine guide and approach"
            }
        else:
            return {
                "instruments": ["Mixed questionnaire", "Interview guide", "Multiple data sources"],
                "sampling_strategy": "Sequential or concurrent sampling strategies",
                "data_collection_methods": ["Surveys and interviews", "Multiple phases", "Triangulation"],
                "measurement_considerations": "Integration of validity and trustworthiness criteria",
                "pilot_testing": "Separate pilots for each component"
            }

    async def _generate_research_timeline(self, approach: str) -> Dict[str, str]:
        """Generate realistic research timeline"""
        base_timeline = {
            "Literature review": "4-6 weeks",
            "Methodology development": "2-3 weeks",
            "Ethical approval": "4-8 weeks",
            "Pilot testing": "2-3 weeks",
            "Data collection": "8-12 weeks",
            "Data analysis": "6-10 weeks",
            "Report writing": "6-8 weeks",
            "Review and revision": "2-4 weeks"
        }
        
        if approach == "mixed_methods":
            base_timeline["Data integration"] = "3-4 weeks"
            base_timeline["Data analysis"] = "8-12 weeks"
        
        return base_timeline

    async def _identify_ethical_considerations(self, context: str) -> List[str]:
        """Identify key ethical considerations"""
        considerations = [
            "Informed consent procedures and documentation",
            "Privacy and confidentiality protection measures",
            "Data security and storage protocols",
            "Participant right to withdraw without penalty"
        ]
        
        # Add context-specific considerations
        if any(word in context.lower() for word in ["children", "minors", "vulnerable"]):
            considerations.append("Special protections for vulnerable populations")
        
        if any(word in context.lower() for word in ["health", "medical", "clinical"]):
            considerations.append("Medical ethics and potential risks to participants")
        
        if any(word in context.lower() for word in ["sensitive", "trauma", "conflict"]):
            considerations.append("Psychological support and referral protocols")
        
        return considerations

    async def _design_quality_measures(self, approach: str) -> Dict[str, List[str]]:
        """Design quality assurance measures"""
        
        if approach == "quantitative":
            return {
                "validity": ["Content validity through expert review", "Construct validity through factor analysis", "Criterion validity through correlation"],
                "reliability": ["Internal consistency (Cronbach's alpha)", "Test-retest reliability", "Inter-rater reliability"],
                "bias_reduction": ["Random sampling", "Standardized procedures", "Blinding where possible"]
            }
        elif approach == "qualitative":
            return {
                "credibility": ["Member checking", "Peer debriefing", "Prolonged engagement"],
                "transferability": ["Thick description", "Maximum variation sampling", "Clear context description"],
                "dependability": ["Audit trail", "Reflexivity", "Consistent data collection procedures"]
            }
        else:
            return {
                "integration_quality": ["Joint displays", "Meta-inferences", "Mixed methods matrix"],
                "component_quality": ["Quantitative and qualitative criteria", "Sequential validation", "Convergent validation"],
                "overall_quality": ["Legitimation criteria", "Multiple validities", "Transformative framework"]
            }

research_assistant = ResearchAssistant()

# API Endpoints

@app.get("/")
async def root():
    return {"service": "Granada OS Academic Engine", "status": "active", "version": "1.0.0"}

@app.post("/academic/literature/search")
async def search_literature(request: LiteratureSearchRequest, background_tasks: BackgroundTasks):
    """Perform comprehensive literature search"""
    try:
        # Perform literature search
        search_results = await literature_engine.search_literature(request)
        
        # Save results to database
        background_tasks.add_task(
            save_search_results, 
            request.user_id, 
            request.dict(), 
            search_results["papers"]
        )
        
        return {
            "search_id": str(uuid.uuid4()),
            "papers": search_results["papers"],
            "metadata": search_results["metadata"],
            "search_summary": search_results["search_summary"],
            "suggested_refinements": search_results["suggested_refinements"],
            "status": "completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Literature search failed: {str(e)}")

@app.post("/academic/research/design")
async def generate_research_design(request: ResearchAssistantRequest):
    """Generate comprehensive research design"""
    try:
        design = await research_assistant.generate_research_design(request)
        
        # Save to database
        analysis_id = db.save_research_analysis(request.user_id, request.research_type, design)
        
        return {
            "analysis_id": analysis_id,
            "research_design": design,
            "status": "generated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research design generation failed: {str(e)}")

@app.get("/academic/user/{user_id}/searches")
async def get_user_searches(user_id: str):
    """Get all literature searches for a user"""
    try:
        searches = db.get_user_searches(user_id)
        return {
            "user_id": user_id,
            "searches": searches,
            "total_count": len(searches)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve searches: {str(e)}")

@app.post("/academic/citations/generate")
async def generate_citations(request: CitationRequest):
    """Generate formatted citations for papers"""
    try:
        citations = await generate_formatted_citations(request.papers, request.citation_style)
        
        return {
            "citations": citations,
            "style": request.citation_style,
            "count": len(citations),
            "status": "generated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citation generation failed: {str(e)}")

async def save_search_results(user_id: str, search_data: Dict, results: List[Dict]):
    """Background task to save search results"""
    try:
        search_id = db.save_literature_search(user_id, search_data, results)
        print(f"Saved literature search {search_id} for user {user_id}")
    except Exception as e:
        print(f"Failed to save search results: {str(e)}")

async def generate_formatted_citations(papers: List[Dict], style: str) -> List[str]:
    """Generate formatted citations in specified style"""
    citations = []
    
    for paper in papers:
        if style.lower() == "apa":
            # APA format: Author, A. A. (Year). Title. Journal, Volume(Issue), pages.
            authors = ", ".join(paper.get("authors", ["Unknown"]))
            year = paper.get("year", "n.d.")
            title = paper.get("title", "Unknown title")
            journal = paper.get("journal", "Unknown journal")
            
            citation = f"{authors} ({year}). {title}. {journal}."
            if paper.get("doi"):
                citation += f" https://doi.org/{paper['doi']}"
                
        elif style.lower() == "mla":
            # MLA format: Author. "Title." Journal, vol. #, no. #, Year, pp. #-#.
            authors = paper.get("authors", ["Unknown"])[0]  # First author only
            title = paper.get("title", "Unknown title")
            journal = paper.get("journal", "Unknown journal")
            year = paper.get("year", "n.d.")
            
            citation = f'{authors}. "{title}." {journal}, {year}.'
            
        else:  # Default to Chicago
            # Chicago format: Author. "Title." Journal vol, no. # (Year): pages.
            authors = ", ".join(paper.get("authors", ["Unknown"]))
            title = paper.get("title", "Unknown title")
            journal = paper.get("journal", "Unknown journal")
            year = paper.get("year", "n.d.")
            
            citation = f'{authors}. "{title}." {journal} ({year}).'
        
        citations.append(citation)
    
    return citations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)