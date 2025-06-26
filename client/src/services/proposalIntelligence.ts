/**
 * Proposal Intelligence Service - AI-powered proposal analysis and optimization
 */

interface ProposalAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  competitiveAdvantage: string[];
  riskFactors: string[];
  fundingProbability: number;
}

interface ProposalOptimization {
  suggestedChanges: {
    section: string;
    current: string;
    suggested: string;
    reasoning: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  keywordOptimization: {
    missing: string[];
    overused: string[];
    trending: string[];
  };
  structureRecommendations: string[];
}

interface SmartInsights {
  matchScore: number;
  deadlineUrgency: 'low' | 'medium' | 'high' | 'critical';
  competitionLevel: 'low' | 'medium' | 'high';
  successProbability: number;
  suggestedActions: string[];
  timeToComplete: string;
}

export class ProposalIntelligenceService {
  private apiUrl = 'http://localhost:8000';

  // Analyze proposal content for strengths, weaknesses, and recommendations
  async analyzeProposal(proposalContent: any, opportunityDetails: any): Promise<ProposalAnalysis> {
    try {
      const response = await fetch(`${this.apiUrl}/proposal/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalContent, opportunityDetails })
      });

      if (!response.ok) {
        throw new Error('Analysis service unavailable');
      }

      return await response.json();
    } catch (error) {
      console.error('Proposal analysis failed:', error);
      throw error;
    }
  }

  // Get AI-powered optimization suggestions
  async getOptimizationSuggestions(proposalContent: any, opportunityDetails: any): Promise<ProposalOptimization> {
    try {
      const response = await fetch(`${this.apiUrl}/proposal/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalContent, opportunityDetails })
      });

      if (!response.ok) {
        throw new Error('Optimization service unavailable');
      }

      return await response.json();
    } catch (error) {
      console.error('Proposal optimization failed:', error);
      throw error;
    }
  }

  // Generate smart insights about proposal-opportunity match
  async getSmartInsights(proposalContent: any, opportunityDetails: any, userProfile: any): Promise<SmartInsights> {
    try {
      const response = await fetch(`${this.apiUrl}/proposal/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalContent, opportunityDetails, userProfile })
      });

      if (!response.ok) {
        throw new Error('Insights service unavailable');
      }

      return await response.json();
    } catch (error) {
      console.error('Smart insights failed:', error);
      throw error;
    }
  }

  // AI-powered content enhancement
  async enhanceContent(section: string, currentContent: string, context: any): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/proposal/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, currentContent, context })
      });

      if (!response.ok) {
        throw new Error('Content enhancement service unavailable');
      }

      const result = await response.json();
      return result.enhancedContent;
    } catch (error) {
      console.error('Content enhancement failed:', error);
      throw error;
    }
  }

  // Generate competitive analysis
  async getCompetitiveAnalysis(opportunityDetails: any, userProfile: any): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/proposal/competitive-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityDetails, userProfile })
      });

      if (!response.ok) {
        throw new Error('Competitive analysis service unavailable');
      }

      return await response.json();
    } catch (error) {
      console.error('Competitive analysis failed:', error);
      throw error;
    }
  }

  // Smart deadline management
  calculateOptimalTimeline(opportunity: any, proposalComplexity: number): any {
    const deadline = new Date(opportunity.deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const complexityMultiplier = proposalComplexity > 8 ? 1.5 : proposalComplexity > 5 ? 1.2 : 1.0;
    const baseTimeNeeded = Math.ceil(10 * complexityMultiplier); // Base 10 days

    return {
      daysRemaining: daysLeft,
      estimatedTimeNeeded: baseTimeNeeded,
      urgencyLevel: daysLeft < baseTimeNeeded ? 'critical' : 
                   daysLeft < baseTimeNeeded * 1.5 ? 'high' :
                   daysLeft < baseTimeNeeded * 2 ? 'medium' : 'low',
      recommendedStartDate: new Date(deadline.getTime() - (baseTimeNeeded * 24 * 60 * 60 * 1000)),
      milestones: this.generateMilestones(baseTimeNeeded, deadline)
    };
  }

  private generateMilestones(timeNeeded: number, deadline: Date): any[] {
    const milestones = [];
    const milestoneCount = Math.min(5, Math.max(3, Math.floor(timeNeeded / 2)));
    
    for (let i = 0; i < milestoneCount; i++) {
      const daysFromDeadline = timeNeeded - (i * (timeNeeded / milestoneCount));
      const milestoneDate = new Date(deadline.getTime() - (daysFromDeadline * 24 * 60 * 60 * 1000));
      
      milestones.push({
        title: this.getMilestoneTitle(i, milestoneCount),
        date: milestoneDate,
        description: this.getMilestoneDescription(i, milestoneCount),
        completed: false
      });
    }
    
    return milestones;
  }

  private getMilestoneTitle(index: number, total: number): string {
    const titles = [
      'Initial Draft & Research',
      'Core Content Development',
      'Budget & Technical Details',
      'Review & Refinement',
      'Final Submission Prep'
    ];
    return titles[Math.min(index, titles.length - 1)];
  }

  private getMilestoneDescription(index: number, total: number): string {
    const descriptions = [
      'Complete background research and create proposal outline',
      'Develop main content sections and narrative',
      'Finalize budget, timeline, and technical specifications',
      'Internal review, expert feedback, and revisions',
      'Final formatting, documentation, and submission'
    ];
    return descriptions[Math.min(index, descriptions.length - 1)];
  }

  // Fallback methods for when AI service is unavailable
  private generateBasicAnalysis(proposalContent: any, opportunityDetails: any): ProposalAnalysis {
    const contentLength = JSON.stringify(proposalContent).length;
    const score = Math.min(95, Math.max(60, 70 + (contentLength / 100)));

    return {
      score,
      strengths: [
        'Clear project objectives outlined',
        'Relevant experience demonstrated',
        'Appropriate budget allocation'
      ],
      weaknesses: [
        'Could benefit from more specific metrics',
        'Additional stakeholder engagement details needed',
        'Risk mitigation strategies could be expanded'
      ],
      recommendations: [
        'Include more quantitative success indicators',
        'Add detailed implementation timeline',
        'Strengthen evaluation methodology section'
      ],
      competitiveAdvantage: [
        'Strong organizational track record',
        'Innovative approach to problem solving',
        'Established community partnerships'
      ],
      riskFactors: [
        'Timeline may be ambitious',
        'External dependency considerations',
        'Market condition variables'
      ],
      fundingProbability: Math.max(0.6, Math.min(0.95, score / 100))
    };
  }

  private generateBasicOptimization(proposalContent: any, opportunityDetails: any): ProposalOptimization {
    return {
      suggestedChanges: [
        {
          section: 'Executive Summary',
          current: 'Current summary text...',
          suggested: 'Enhanced summary with stronger impact statements...',
          reasoning: 'More compelling opening increases reader engagement',
          impact: 'high' as const
        }
      ],
      keywordOptimization: {
        missing: ['sustainability', 'innovation', 'community impact'],
        overused: ['project', 'organization'],
        trending: ['digital transformation', 'capacity building', 'stakeholder engagement']
      },
      structureRecommendations: [
        'Consider adding a dedicated impact measurement section',
        'Include visual elements like charts or infographics',
        'Strengthen the call-to-action in conclusion'
      ]
    };
  }

  private generateBasicInsights(proposalContent: any, opportunityDetails: any, userProfile: any): SmartInsights {
    return {
      matchScore: 0.85,
      deadlineUrgency: 'medium' as const,
      competitionLevel: 'medium' as const,
      successProbability: 0.82,
      suggestedActions: [
        'Complete budget section within 3 days',
        'Schedule expert review session',
        'Gather additional supporting documents'
      ],
      timeToComplete: '7-10 days'
    };
  }

  private generateBasicEnhancement(section: string, currentContent: string, context: any): string {
    return currentContent + '\n\n[Enhanced with expert-level language and stronger impact statements]';
  }

  private generateBasicCompetitiveAnalysis(opportunityDetails: any, userProfile: any): any {
    return {
      competitorCount: Math.floor(Math.random() * 50) + 20,
      competitiveAdvantages: [
        'Unique geographical focus',
        'Specialized expertise in sector',
        'Strong community partnerships'
      ],
      recommendedDifferentiators: [
        'Emphasize innovative methodology',
        'Highlight measurable impact history',
        'Showcase collaborative approach'
      ]
    };
  }
}

export const proposalIntelligence = new ProposalIntelligenceService();