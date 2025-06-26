/**
 * Intelligent Background Assistant - Granada OS
 * Monitors user behavior and provides contextual guidance
 */

interface UserBehavior {
  clicksPerMinute: number;
  timeOnPage: number;
  scrollDepth: number;
  interactionTypes: string[];
  currentPage: string;
  sessionDuration: number;
  strugglingIndicators: string[];
  successIndicators: string[];
}

interface AssistantAdvice {
  type: 'encouragement' | 'guidance' | 'help_suggestion' | 'success_celebration' | 'warning';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: string;
  timing: 'immediate' | 'delayed' | 'on_exit';
}

export class IntelligentAssistant {
  private behavior: UserBehavior = {
    clicksPerMinute: 0,
    timeOnPage: 0,
    scrollDepth: 0,
    interactionTypes: [],
    currentPage: '',
    sessionDuration: 0,
    strugglingIndicators: [],
    successIndicators: []
  };

  private clickTracker = 0;
  private sessionStart = Date.now();
  private pageStart = Date.now();
  private adviceHistory: AssistantAdvice[] = [];
  private isActive = true;

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    // Track clicks and interactions
    document.addEventListener('click', (e) => {
      if (!this.isActive) return;
      
      this.trackClick(e);
      this.analyzeUserBehavior();
    });

    // Track scroll behavior
    document.addEventListener('scroll', () => {
      if (!this.isActive) return;
      this.trackScroll();
    });

    // Track page focus/blur
    document.addEventListener('visibilitychange', () => {
      if (!this.isActive) return;
      this.trackFocusChange();
    });

    // Periodic behavior analysis
    setInterval(() => {
      if (this.isActive) {
        this.updateMetrics();
        this.generateAdvice();
      }
    }, 30000); // Every 30 seconds
  }

  private trackClick(event: MouseEvent) {
    this.clickTracker++;
    const target = event.target as HTMLElement;
    const elementType = this.getElementType(target);
    
    this.behavior.interactionTypes.push(elementType);
    
    // Detect struggling patterns
    if (this.isStruggleIndicator(elementType, target)) {
      this.behavior.strugglingIndicators.push(elementType);
    }

    // Detect success patterns
    if (this.isSuccessIndicator(elementType, target)) {
      this.behavior.successIndicators.push(elementType);
    }
  }

  private getElementType(element: HTMLElement): string {
    if (element.closest('[data-testid*="opportunity"]')) return 'opportunity_card';
    if (element.closest('button')) return 'button';
    if (element.closest('input')) return 'input';
    if (element.closest('[href]')) return 'link';
    if (element.closest('.filter')) return 'filter';
    if (element.closest('.search')) return 'search';
    if (element.textContent?.toLowerCase().includes('help')) return 'help_related';
    return 'general';
  }

  private isStruggleIndicator(elementType: string, target: HTMLElement): boolean {
    const searchAttempts = this.behavior.interactionTypes.filter(t => t === 'search').length;
    const opportunityViews = this.behavior.interactionTypes.filter(t => t === 'opportunity_card').length;
    
    const strugglingPatterns = [
      // Rapid clicking on same element
      this.behavior.interactionTypes.slice(-3).every(type => type === elementType),
      // Clicking back button repeatedly
      target.textContent?.toLowerCase().includes('back'),
      // Multiple filter changes without results interaction
      elementType === 'filter' && this.behavior.interactionTypes.filter(t => t === 'filter').length > 5,
      // Long time on page without meaningful interaction
      this.behavior.timeOnPage > 300000 && this.behavior.interactionTypes.length < 10,
      // Multiple search attempts with no results (boredom indicator)
      searchAttempts >= 3 && opportunityViews === 0,
      // Quick exit pattern after searching
      elementType === 'navigation' && searchAttempts > 0 && opportunityViews === 0 && this.behavior.timeOnPage < 120000
    ];

    return strugglingPatterns.some(pattern => pattern);
  }

  private isSuccessIndicator(elementType: string, target: HTMLElement): boolean {
    const successPatterns = [
      elementType === 'opportunity_card',
      target.textContent?.toLowerCase().includes('apply'),
      target.textContent?.toLowerCase().includes('download'),
      elementType === 'link' && target.getAttribute('href')?.includes('http')
    ];

    return successPatterns.some(pattern => pattern);
  }

  private trackScroll() {
    const scrolled = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    this.behavior.scrollDepth = Math.max(this.behavior.scrollDepth, (scrolled / maxScroll) * 100);
  }

  private trackFocusChange() {
    if (document.hidden) {
      // User left the page
      this.behavior.strugglingIndicators.push('page_blur');
    }
  }

  private updateMetrics() {
    const now = Date.now();
    this.behavior.sessionDuration = now - this.sessionStart;
    this.behavior.timeOnPage = now - this.pageStart;
    this.behavior.clicksPerMinute = (this.clickTracker / (this.behavior.timeOnPage / 60000)) || 0;
    this.behavior.currentPage = window.location.pathname;
  }

  private generateAdvice(): AssistantAdvice | null {
    const advice = this.analyzeAndAdvise();
    if (advice && this.shouldShowAdvice(advice)) {
      this.adviceHistory.push(advice);
      this.displayAdvice(advice);
      
      // Send behavior analytics to backend
      this.sendBehaviorAnalytics(advice);
      
      return advice;
    }
    return null;
  }

  private async sendBehaviorAnalytics(advice: AssistantAdvice) {
    try {
      await fetch('/api/assistant/track-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          behaviorData: this.behavior,
          adviceGenerated: advice
        })
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  }

  private analyzeAndAdvise(): AssistantAdvice | null {
    const { strugglingIndicators, successIndicators, timeOnPage, clicksPerMinute, currentPage, interactionTypes, sessionDuration } = this.behavior;

    // Advanced pattern recognition - requiring much more data
    const recentClicks = interactionTypes.slice(-20); // Look at more interactions
    const filterClicks = recentClicks.filter(type => type === 'filter').length;
    const searchAttempts = recentClicks.filter(type => type === 'search').length;
    const opportunityViews = recentClicks.filter(type => type === 'opportunity_card').length;
    const totalInteractions = interactionTypes.length;

    // Only provide advice after significant user interaction data
    if (totalInteractions < 10) {
      return null; // Need more data before giving advice
    }

    // Detect search-with-no-results pattern (boredom prevention)
    if (searchAttempts >= 3 && opportunityViews === 0 && timeOnPage > 120000) {
      return {
        type: 'guidance',
        message: "Not finding what you're looking for? Try broadening your search terms or exploring different funding categories.",
        priority: 'medium',
        timing: 'immediate'
      };
    }

    // Quick exit after searches (boredom detected)
    if (searchAttempts >= 2 && timeOnPage < 180000 && clicksPerMinute > 8) {
      return {
        type: 'encouragement',
        message: "Many great opportunities are hidden in unexpected categories. Try exploring 'Education' or 'Health' sectors for broader funding options.",
        priority: 'medium',
        timing: 'immediate'
      };
    }

    // Multiple searches with filter adjustments but no results
    if (searchAttempts >= 4 && filterClicks >= 3 && opportunityViews === 0) {
      return {
        type: 'guidance',
        message: "Having trouble finding matches? Try removing some filters or searching for keywords like 'community development' or 'capacity building'.",
        priority: 'medium',
        timing: 'immediate'
      };
    }

    // Success celebration - only after real achievement
    if (successIndicators.length >= 5 && opportunityViews > 3) {
      return {
        type: 'success_celebration',
        message: "Great progress! You're actively exploring and finding relevant opportunities.",
        priority: 'low',
        timing: 'delayed'
      };
    }

    // Subtle encouragement for exploration
    if (opportunityViews > 0 && timeOnPage > 180000) {
      return {
        type: 'encouragement',
        message: "You're exploring opportunities well. Take your time to find the best matches for your needs.",
        priority: 'low',
        timing: 'delayed'
      };
    }

    // Very extensive struggling pattern - only after serious analysis
    if (strugglingIndicators.length >= 8 && sessionDuration > 900000 && filterClicks > 15 && opportunityViews < 3) {
      return {
        type: 'help_suggestion',
        message: "If you need personalized guidance finding the right opportunities, expert assistance is available.",
        priority: 'medium',
        action: 'open_human_help',
        timing: 'delayed'
      };
    }

    // Extended session with minimal success - very high threshold
    if (sessionDuration > 1200000 && opportunityViews < 2 && searchAttempts > 10) {
      return {
        type: 'guidance',
        message: "Still searching? Sometimes a different approach can help identify the perfect funding opportunities.",
        priority: 'low',
        timing: 'delayed'
      };
    }

    // Page-specific advice (much more subtle)
    return this.getPageSpecificAdvice();
  }

  private getPageSpecificAdvice(): AssistantAdvice | null {
    const { currentPage, timeOnPage, interactionTypes } = this.behavior;
    const totalInteractions = interactionTypes.length;

    // Only provide page-specific advice after significant interaction
    if (totalInteractions < 20) {
      return null;
    }

    switch (currentPage) {
      case '/donor-discovery':
        if (timeOnPage > 300000 && this.behavior.interactionTypes.filter(t => t === 'opportunity_card').length === 0) {
          return {
            type: 'guidance',
            message: "Try exploring the opportunity cards to see detailed funding information.",
            priority: 'low',
            timing: 'delayed'
          };
        }
        break;

      case '/proposals':
        if (timeOnPage > 600000 && totalInteractions > 25) {
          return {
            type: 'encouragement',
            message: "Take your time crafting your proposal. Quality applications increase success rates.",
            priority: 'low',
            timing: 'delayed'
          };
        }
        break;

      case '/funding':
        if (timeOnPage > 240000) {
          return {
            type: 'encouragement',
            message: "Explore different funding categories to discover opportunities that match your goals.",
            priority: 'low',
            timing: 'delayed'
          };
        }
        break;
    }

    return null;
  }

  private shouldShowAdvice(advice: AssistantAdvice): boolean {
    const recentAdvice = this.adviceHistory.slice(-3);
    
    // Don't repeat same type of advice too often
    if (recentAdvice.some(a => a.type === advice.type && a.message === advice.message)) {
      return false;
    }

    // Don't overwhelm with too much advice
    if (recentAdvice.length >= 2 && advice.priority === 'low') {
      return false;
    }

    return true;
  }

  private displayAdvice(advice: AssistantAdvice) {
    const event = new CustomEvent('intelligentAdvice', {
      detail: advice
    });
    window.dispatchEvent(event);
  }

  public analyzeUserBehavior(): UserBehavior {
    return { ...this.behavior };
  }

  public forceAdvice(type: AssistantAdvice['type']): void {
    let message = '';
    let action = '';

    switch (type) {
      case 'help_suggestion':
        message = "Based on your current activity, our human experts could provide valuable guidance. They're standing by to help you succeed!";
        action = 'open_human_help';
        break;
      case 'encouragement':
        message = "You're doing great! Keep exploring the opportunities. Remember, our Expert system learns from your choices to show better matches.";
        break;
    }

    this.displayAdvice({
      type,
      message,
      priority: 'high',
      action,
      timing: 'immediate'
    });
  }

  public setActive(active: boolean) {
    this.isActive = active;
  }

  public resetSession() {
    this.behavior = {
      clicksPerMinute: 0,
      timeOnPage: 0,
      scrollDepth: 0,
      interactionTypes: [],
      currentPage: window.location.pathname,
      sessionDuration: 0,
      strugglingIndicators: [],
      successIndicators: []
    };
    this.clickTracker = 0;
    this.sessionStart = Date.now();
    this.pageStart = Date.now();
    this.adviceHistory = [];
  }
}

// Global instance
export const intelligentAssistant = new IntelligentAssistant();