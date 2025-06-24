interface AIProvider {
  name: string;
  apiKey?: string;
  endpoint: string;
}

interface AIRequest {
  prompt: string;
  context?: any;
  provider?: 'openai' | 'gemini' | 'deepseek' | 'dalle';
}

interface FileAnalysis {
  content: string;
  type: string;
  insights: string[];
}

interface DonorSearchRequest {
  query: string;
  filters: any;
  country?: string;
  sector?: string;
}

class AIService {
  private providers: Record<string, AIProvider> = {
    openai: {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions'
    },
    gemini: {
      name: 'Google Gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    },
    deepseek: {
      name: 'DeepSeek',
      endpoint: 'https://api.deepseek.com/v1/chat/completions'
    },
    dalle: {
      name: 'DALL-E',
      endpoint: 'https://api.openai.com/v1/images/generations'
    }
  };

  private apiKeys: Record<string, string> = {};

  setApiKey(provider: string, apiKey: string) {
    this.apiKeys[provider] = apiKey;
  }

  async generateProposal(request: AIRequest): Promise<string> {
    // Mock AI response for demo - in production this would call actual AI APIs
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API delay
    
    const hasFiles = request.context?.hasFiles;
    const hasVoiceRecordings = request.context?.hasVoiceRecordings;
    
    let additionalSections = '';
    
    if (hasFiles) {
      additionalSections += `

## Document Analysis
Based on the uploaded documents, we have identified key project components and requirements that align with best practices in the sector. The documentation provides valuable context for project implementation and stakeholder engagement.`;
    }

    if (hasVoiceRecordings) {
      additionalSections += `

## Voice Input Analysis
The voice recordings have been transcribed and analyzed to capture the passion and vision behind this project. Key themes identified include community engagement, sustainable impact, and innovative approaches to addressing local challenges.`;
    }
    
    return `# ${request.context?.title || 'AI-Generated Proposal'}

## Executive Summary
This proposal outlines a comprehensive initiative to address critical needs in our target community. Our organization, ${request.context?.organizationName || 'Impact First Foundation'}, brings extensive experience and proven methodologies to ensure successful project implementation and measurable impact.

## Problem Statement
${request.prompt}

## Project Objectives
1. Deliver sustainable solutions that address root causes
2. Build local capacity and ownership
3. Establish measurable impact metrics
4. Create scalable and replicable models
5. Foster community engagement and participation

## Methodology
Our approach combines evidence-based practices with community-centered design, ensuring cultural relevance and long-term sustainability. We will employ:

- Participatory planning with community stakeholders
- Phased implementation with regular milestone reviews
- Continuous monitoring and adaptive management
- Knowledge transfer and capacity building
- Partnership development with local organizations

## Implementation Timeline
**Phase 1 (Months 1-3):** Project setup, stakeholder engagement, baseline studies
**Phase 2 (Months 4-9):** Core implementation activities
**Phase 3 (Months 10-12):** Evaluation, knowledge transfer, sustainability planning

## Budget Overview
Total Project Cost: $${request.context?.fundingAmount?.toLocaleString() || '50,000'}

### Budget Breakdown:
- Personnel (40%): $${Math.round((request.context?.fundingAmount || 50000) * 0.4).toLocaleString()}
- Equipment & Supplies (25%): $${Math.round((request.context?.fundingAmount || 50000) * 0.25).toLocaleString()}
- Training & Capacity Building (20%): $${Math.round((request.context?.fundingAmount || 50000) * 0.2).toLocaleString()}
- Monitoring & Evaluation (10%): $${Math.round((request.context?.fundingAmount || 50000) * 0.1).toLocaleString()}
- Administrative Costs (5%): $${Math.round((request.context?.fundingAmount || 50000) * 0.05).toLocaleString()}

## Expected Outcomes
- **Direct beneficiaries:** 5,000+ individuals
- **Indirect impact:** 15,000+ community members
- **Sustainability rate:** 85%+ after project completion
- **Capacity building:** 50+ local staff trained
- **Knowledge products:** 3 best practice guides developed

## Risk Management
We have identified potential risks and developed mitigation strategies:

1. **Community Acceptance:** Early and continuous engagement
2. **Technical Challenges:** Expert consultation and adaptive approaches
3. **Financial Constraints:** Diversified funding and cost-effective solutions
4. **Environmental Factors:** Climate-resilient design and contingency planning

## Monitoring & Evaluation
Comprehensive M&E framework with:
- Quarterly progress reports
- Impact measurement using both quantitative and qualitative indicators
- Stakeholder feedback mechanisms
- External evaluation at project midpoint and completion
- Real-time data collection and analysis

## Sustainability Plan
- Local ownership and management structures
- Revenue generation mechanisms where applicable
- Ongoing technical support arrangements
- Policy advocacy for systemic change
- Knowledge sharing and replication strategies

## Organization Capacity
${request.context?.organizationName || 'Impact First Foundation'} has demonstrated expertise in:
- Community development and engagement
- Project management and implementation
- Monitoring, evaluation, and learning
- Partnership development and collaboration
- Financial management and accountability${additionalSections}

## Conclusion
This project represents a strategic investment in sustainable development that will create lasting positive change. With your support, we can transform lives and build stronger, more resilient communities.

---
*This proposal was generated using Granada AI and incorporates multiple input sources including ${hasFiles ? 'uploaded documents, ' : ''}${hasVoiceRecordings ? 'voice recordings, ' : ''}and detailed project descriptions. It is ready for customization and submission.*`;
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    // Mock transcription - in production this would use speech-to-text APIs
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return "This is a mock transcription of the audio recording. In production, this would use services like OpenAI Whisper, Google Speech-to-Text, or similar APIs to convert speech to text.";
  }

  async analyzeDocument(file: File): Promise<FileAnalysis> {
    // Mock document analysis - in production this would extract and analyze file content
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      content: "Extracted content from the document...",
      type: file.type,
      insights: [
        "Document contains project timeline information",
        "Budget details are present",
        "Stakeholder information identified",
        "Risk factors mentioned"
      ]
    };
  }

  async searchDonors(request: DonorSearchRequest): Promise<any[]> {
    // Mock donor search with AI enhancement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would:
    // 1. Use AI to understand search intent
    // 2. Query multiple donor databases
    // 3. Apply semantic matching
    // 4. Score and rank results
    
    const mockResults = [
      {
        id: '1',
        name: 'Gates Foundation',
        type: 'Private Foundation',
        matchScore: 98,
        focusAreas: ['Global Health', 'Education', 'Technology'],
        typicalGrantSize: '$100K - $5M',
        deadline: 'Rolling',
        activeOpportunities: 3,
        isBookmarked: true,
        lastUpdated: '2h ago',
        country: 'United States',
        description: 'Leading foundation focused on global health and education initiatives'
      },
      {
        id: '2',
        name: 'Ford Foundation',
        type: 'Private Foundation',
        matchScore: 94,
        focusAreas: ['Social Justice', 'Human Rights', 'Economic Development'],
        typicalGrantSize: '$50K - $2M',
        deadline: 'March 15, 2024',
        activeOpportunities: 2,
        isBookmarked: false,
        lastUpdated: '4h ago',
        country: 'United States',
        description: 'Advancing social justice and human rights worldwide'
      },
      {
        id: '3',
        name: 'USAID',
        type: 'Government',
        matchScore: 91,
        focusAreas: ['Development', 'Democracy', 'Health'],
        typicalGrantSize: '$500K - $10M',
        deadline: 'April 30, 2024',
        activeOpportunities: 5,
        isBookmarked: false,
        lastUpdated: '1d ago',
        country: 'United States',
        description: 'US government agency for international development'
      }
    ];

    // Apply AI-enhanced filtering based on query
    if (request.query) {
      const queryLower = request.query.toLowerCase();
      return mockResults.filter(result => 
        result.name.toLowerCase().includes(queryLower) ||
        result.focusAreas.some(area => area.toLowerCase().includes(queryLower)) ||
        result.description.toLowerCase().includes(queryLower)
      );
    }

    return mockResults;
  }

  async enhanceDonorSearch(query: string, results: any[]): Promise<any[]> {
    // AI-powered enhancement of search results
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would:
    // 1. Analyze query intent with NLP
    // 2. Re-rank results based on semantic similarity
    // 3. Add AI-generated insights
    // 4. Suggest related opportunities
    
    return results.map(result => ({
      ...result,
      aiInsights: [
        'High alignment with your organization\'s mission',
        'Strong track record of funding similar projects',
        'Favorable application timeline'
      ],
      matchReasons: [
        'Sector alignment: Education',
        'Geographic focus: Global',
        'Funding range: Suitable'
      ]
    }));
  }

  async analyzeProposal(content: string): Promise<any> {
    // Mock proposal analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      score: 87,
      strengths: ['Clear objectives', 'Strong methodology', 'Comprehensive budget'],
      improvements: ['Add more impact metrics', 'Strengthen sustainability plan'],
      recommendations: ['Consider partnership opportunities', 'Include risk mitigation strategies']
    };
  }

  async generateDonorOutreach(donorInfo: any, projectInfo: any): Promise<string> {
    // Generate personalized outreach content
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `Subject: Partnership Opportunity - ${projectInfo.title}

Dear ${donorInfo.name} Team,

I hope this message finds you well. I am writing to introduce an exciting opportunity that aligns perfectly with your foundation's commitment to ${donorInfo.focusAreas.join(', ')}.

Our organization, ${projectInfo.organizationName}, has developed an innovative ${projectInfo.title} that addresses critical challenges in our community. This initiative directly supports your mission of advancing ${donorInfo.focusAreas[0].toLowerCase()} through sustainable, community-driven solutions.

Key highlights of our proposal:
• Direct impact on 5,000+ beneficiaries
• Sustainable approach with 85%+ continuation rate
• Strong local partnerships and community engagement
• Comprehensive monitoring and evaluation framework

We would welcome the opportunity to discuss how this project aligns with your funding priorities and explore potential partnership opportunities.

Thank you for your consideration and continued commitment to creating positive change.

Best regards,
[Your Name]
[Your Title]
${projectInfo.organizationName}`;
  }

  async continuousSearch(filters: any): Promise<void> {
    // Continuous background search for new opportunities
    console.log('Starting continuous search with filters:', filters);
    
    // In production, this would:
    // 1. Set up scheduled searches
    // 2. Monitor RSS feeds and APIs
    // 3. Use web scraping for new opportunities
    // 4. Send notifications for high-match results
  }

  getAvailableProviders(): string[] {
    return Object.keys(this.providers);
  }

  async testApiConnection(provider: string): Promise<boolean> {
    // Test API connection for a provider
    try {
      // Mock test - in production would make actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Math.random() > 0.2; // 80% success rate for demo
    } catch (error) {
      return false;
    }
  }
}

export const aiService = new AIService();