interface AIInsight {
  type: 'guidance' | 'warning' | 'suggestion' | 'help_offer';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actions: AIAction[];
  metadata: {
    confidence: number;
    reasoning: string;
    triggerConditions: string[];
    estimatedImpact: number;
  };
}

interface AIAction {
  id: string;
  label: string;
  type: 'navigate' | 'highlight' | 'tutorial' | 'external' | 'dismiss';
  target?: string;
  data?: any;
}

interface BehaviorAnalysis {
  sessionDuration: number;
  events: any[];
  metrics: any;
  intent: any;
  patterns: any;
  anomalies: any[];
  recommendations: string[];
}

class AIEngine {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';
  private analysisQueue: BehaviorAnalysis[] = [];
  private isProcessing = false;
  private lastInsight: AIInsight | null = null;
  private insightHistory: AIInsight[] = [];
  private onInsightCallback: ((insight: AIInsight) => void) | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeBehavior(analysis: BehaviorAnalysis): Promise<AIInsight | null> {
    if (this.isProcessing) {
      this.analysisQueue.push(analysis);
      return null;
    }

    this.isProcessing = true;

    try {
      const insight = await this.processWithDeepSeek(analysis);
      
      if (insight && this.shouldShowInsight(insight)) {
        this.lastInsight = insight;
        this.insightHistory.push(insight);
        
        if (this.onInsightCallback) {
          this.onInsightCallback(insight);
        }
        
        return insight;
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      this.isProcessing = false;
      
      // Process queued analyses
      if (this.analysisQueue.length > 0) {
        const nextAnalysis = this.analysisQueue.shift();
        if (nextAnalysis) {
          setTimeout(() => this.analyzeBehavior(nextAnalysis), 1000);
        }
      }
    }

    return null;
  }

  private async processWithDeepSeek(analysis: BehaviorAnalysis): Promise<AIInsight | null> {
    const prompt = this.constructAnalysisPrompt(analysis);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are an expert user experience analyst specializing in real-time behavior analysis for funding opportunity platforms. Your role is to analyze user interactions and provide intelligent, contextual guidance.

ANALYSIS CONTEXT:
- Platform: Granada OS - Funding Opportunities Discovery
- User Goal: Finding and applying for funding opportunities
- Current Page: Donor Discovery page with search and filtering capabilities

BEHAVIORAL PATTERNS TO DETECT:
1. Confusion (erratic mouse movements, excessive scrolling, rapid clicking)
2. Frustration (high velocity movements, backtracking, repetitive actions)
3. Hesitation (mouse stops, hover delays, indecision patterns)
4. Success indicators (focused interactions, progressive task completion)
5. Abandonment risk (decreasing engagement, exit patterns)

GUIDANCE PRINCIPLES:
- Provide actionable, specific suggestions
- Prioritize user goals and reduce friction
- Offer help before users get stuck
- Suggest relevant features or shortcuts
- Guide toward successful funding discovery

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
  "type": "guidance|warning|suggestion|help_offer",
  "priority": "low|medium|high|urgent",
  "title": "Brief, action-oriented title",
  "message": "Clear, helpful message (2-3 sentences max)",
  "actions": [
    {
      "id": "unique_action_id",
      "label": "Action button text",
      "type": "navigate|highlight|tutorial|external|dismiss",
      "target": "css_selector_or_url",
      "data": {}
    }
  ],
  "metadata": {
    "confidence": 0.85,
    "reasoning": "Why this insight was generated",
    "triggerConditions": ["specific patterns detected"],
    "estimatedImpact": 0.7
  }
}

Only generate insights when there's clear evidence of user need. Avoid overwhelming users with constant suggestions.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (content) {
        return JSON.parse(content) as AIInsight;
      }
    } catch (error) {
      console.error('DeepSeek processing error:', error);
      
      // Fallback to local analysis if API fails
      return this.fallbackAnalysis(analysis);
    }

    return null;
  }

  private constructAnalysisPrompt(analysis: BehaviorAnalysis): string {
    const { sessionDuration, metrics, intent, patterns, anomalies, recommendations } = analysis;
    
    return `Analyze this user behavior data from a funding opportunities platform:

SESSION OVERVIEW:
- Duration: ${Math.round(sessionDuration / 1000)}s
- Mouse distance: ${Math.round(metrics.mouseDistance)}px
- Clicks: ${metrics.clickCount}
- Scrolling: ${Math.round(metrics.scrollDistance)}px
- Frustration score: ${metrics.frustrationScore?.toFixed(2) || 0}
- Engagement score: ${metrics.engagementScore?.toFixed(2) || 0}
- Confidence score: ${metrics.confidenceScore?.toFixed(2) || 0}

USER INTENT:
- Primary: ${intent.primary}
- Urgency: ${intent.urgency}
- Struggling with: ${intent.strugglingWith?.join(', ') || 'none detected'}
- Next likely action: ${intent.nextLikelyAction}

DETECTED PATTERNS:
${JSON.stringify(patterns, null, 2)}

ANOMALIES:
${anomalies.map(a => `- ${a.type}: ${a.count}`).join('\n')}

SYSTEM RECOMMENDATIONS:
${recommendations.join(', ')}

RECENT EVENTS (last 10):
${analysis.events.slice(-10).map(e => `${e.type}: ${e.data?.element || 'unknown'}`).join('\n')}

Based on this analysis, should we provide guidance to the user? If yes, what specific help would be most valuable right now?`;
  }

  private shouldShowInsight(insight: AIInsight): boolean {
    // Don't overwhelm users with low-priority insights
    if (insight.priority === 'low' && this.insightHistory.length > 5) {
      return false;
    }

    // Don't repeat similar insights too quickly
    const recentSimilar = this.insightHistory
      .slice(-3)
      .some(h => h.type === insight.type && h.title === insight.title);
    
    if (recentSimilar) {
      return false;
    }

    // Only show medium-confidence insights or higher
    if (insight.metadata.confidence < 0.5) {
      return false;
    }

    // Always show urgent insights
    if (insight.priority === 'urgent') {
      return true;
    }

    // Limit insight frequency (reduced intervals for better responsiveness)
    const timeSinceLastInsight = this.lastInsight 
      ? Date.now() - this.getInsightTimestamp(this.lastInsight)
      : Infinity;

    const minInterval = insight.priority === 'high' ? 5000 : 15000; // 5s for high, 15s for others
    
    return timeSinceLastInsight > minInterval;
  }

  private getInsightTimestamp(insight: AIInsight): number {
    // In real implementation, we'd store timestamps with insights
    return Date.now();
  }

  private fallbackAnalysis(analysis: BehaviorAnalysis): AIInsight | null {
    const { metrics, intent, sessionDuration } = analysis;

    // Generate insights based on user behavior patterns
    
    // High engagement with reading behavior
    if (metrics.engagementScore > 0.6 && sessionDuration > 30000) {
      return {
        type: 'suggestion',
        priority: 'medium',
        title: 'Expert Insight Available',
        message: 'Based on your reading patterns, I can provide targeted funding recommendations for your sector. Would you like personalized suggestions?',
        actions: [
          {
            id: 'get_recommendations',
            label: 'Get Recommendations',
            type: 'tutorial',
            target: '#opportunity-grid'
          },
          {
            id: 'dismiss',
            label: 'Maybe Later',
            type: 'dismiss'
          }
        ],
        metadata: {
          confidence: 0.9,
          reasoning: 'High engagement with content reading detected',
          triggerConditions: ['engagement_score > 0.6', 'session_duration > 30s'],
          estimatedImpact: 0.8
        }
      };
    }

    // Scrolling patterns indicate browsing behavior
    if (metrics.scrollDistance > 1000 && metrics.clickCount > 5) {
      return {
        type: 'guidance',
        priority: 'medium',
        title: 'Browsing Multiple Opportunities?',
        message: 'I see you\'re exploring several funding options. Try using filters to narrow down opportunities that match your organization\'s focus.',
        actions: [
          {
            id: 'show_filters',
            label: 'Show Filter Options',
            type: 'highlight',
            target: '#filter-panel'
          },
          {
            id: 'dismiss',
            label: 'Continue Browsing',
            type: 'dismiss'
          }
        ],
        metadata: {
          confidence: 0.7,
          reasoning: 'Active browsing behavior with multiple interactions',
          triggerConditions: ['scroll_distance > 1000px', 'click_count > 5'],
          estimatedImpact: 0.6
        }
      };
    }

    // High frustration detection
    if (metrics.frustrationScore > 0.7) {
      return {
        type: 'help_offer',
        priority: 'high',
        title: 'Need Expert Assistance?',
        message: 'Having trouble finding the right opportunities? Our expert system can help you discover funding that matches your specific needs.',
        actions: [
          {
            id: 'get_expert_help',
            label: 'Get Expert Help',
            type: 'tutorial',
            target: '#search-input'
          },
          {
            id: 'dismiss_help',
            label: 'Continue Searching',
            type: 'dismiss'
          }
        ],
        metadata: {
          confidence: 0.8,
          reasoning: 'High frustration score detected',
          triggerConditions: ['frustration_score > 0.7'],
          estimatedImpact: 0.9
        }
      };
    }

    // Low engagement with searching struggle
    if (metrics.engagementScore < 0.3 && intent.strugglingWith?.includes('finding_content')) {
      return {
        type: 'suggestion',
        priority: 'medium',
        title: 'Try our smart search features',
        message: 'Use filters like sector, funding amount, and deadline to find exactly what you need.',
        actions: [
          {
            id: 'show_filters',
            label: 'Show Filters',
            type: 'highlight',
            target: '.filter-panel'
          },
          {
            id: 'dismiss',
            label: 'Got it',
            type: 'dismiss'
          }
        ],
        metadata: {
          confidence: 0.7,
          reasoning: 'Low engagement with content finding struggle',
          triggerConditions: ['low_engagement', 'finding_content_struggle'],
          estimatedImpact: 0.6
        }
      };
    }

    // Default insight for active users (ensures AI guidance is visible)
    if (metrics.clickCount > 1 && sessionDuration > 5000) {
      return {
        type: 'guidance',
        priority: 'medium',
        title: 'Expert System Active',
        message: 'The AI expert system is analyzing your behavior to provide personalized funding recommendations. Continue exploring to receive targeted suggestions.',
        actions: [
          {
            id: 'continue_exploring',
            label: 'Continue Exploring',
            type: 'dismiss'
          },
          {
            id: 'get_help',
            label: 'Get Expert Help',
            type: 'tutorial',
            target: '#opportunity-grid'
          }
        ],
        metadata: {
          confidence: 0.8,
          reasoning: 'Active user engagement detected',
          triggerConditions: ['click_count > 1', 'session_duration > 5s'],
          estimatedImpact: 0.7
        }
      };
    }

    return null;
  }

  onInsight(callback: (insight: AIInsight) => void) {
    this.onInsightCallback = callback;
  }

  getInsightHistory(): AIInsight[] {
    return [...this.insightHistory];
  }

  clearHistory() {
    this.insightHistory = [];
    this.lastInsight = null;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default AIEngine;
export type { AIInsight, AIAction, BehaviorAnalysis };