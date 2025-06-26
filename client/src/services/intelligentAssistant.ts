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
    const strugglingPatterns = [
      // Rapid clicking on same element
      this.behavior.interactionTypes.slice(-3).every(type => type === elementType),
      // Clicking back button repeatedly
      target.textContent?.toLowerCase().includes('back'),
      // Multiple filter changes without results interaction
      elementType === 'filter' && this.behavior.interactionTypes.filter(t => t === 'filter').length > 5,
      // Long time on page without meaningful interaction
      this.behavior.timeOnPage > 300000 && this.behavior.interactionTypes.length < 10,
      // Multiple search attempts
      this.behavior.interactionTypes.filter(t => t === 'search').length > 3
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
          userId: 'demo_user',
          behaviorData: this.behavior,
          adviceGenerated: advice
        })
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  }

  private analyzeAndAdvise(): AssistantAdvice | null {
    const { strugglingIndicators, successIndicators, timeOnPage, clicksPerMinute, currentPage, interactionTypes } = this.behavior;

    // Advanced pattern recognition
    const recentClicks = interactionTypes.slice(-10);
    const filterClicks = recentClicks.filter(type => type === 'filter').length;
    const searchAttempts = recentClicks.filter(type => type === 'search').length;
    const opportunityViews = recentClicks.filter(type => type === 'opportunity_card').length;

    // Success celebration - specific achievements
    if (successIndicators.length >= 3 && opportunityViews > 0) {
      return {
        type: 'success_celebration',
        message: "Excellent! You're actively exploring opportunities. You've found some great matches. Consider reaching out to our human experts for application strategy advice!",
        priority: 'medium',
        action: 'open_human_help',
        timing: 'immediate'
      };
    }

    // Struggling with filters - specific help
    if (filterClicks > 5 && opportunityViews === 0) {
      return {
        type: 'help_suggestion',
        message: "I see you're adjusting filters but haven't found the right opportunities yet. Our Expert team can help you identify the perfect funding matches for your specific needs.",
        priority: 'high',
        action: 'open_human_help',
        timing: 'immediate'
      };
    }

    // Multiple searches without success
    if (searchAttempts > 3 && opportunityViews < 2) {
      return {
        type: 'help_suggestion',
        message: "Having trouble finding what you're looking for? Our human experts know exactly which funders are actively accepting applications in your sector right now.",
        priority: 'high',
        action: 'open_human_help',
        timing: 'immediate'
      };
    }

    // High engagement but no applications
    if (opportunityViews > 5 && timeOnPage > 300000 && !successIndicators.includes('apply')) {
      return {
        type: 'guidance',
        message: "You've been exploring extensively! Our Expert team can help you shortlist the best opportunities and craft winning applications. They've helped thousands secure funding.",
        priority: 'high',
        action: 'open_human_help',
        timing: 'immediate'
      };
    }

    // Quick exit pattern
    if (timeOnPage < 60000 && clicksPerMinute > 10) {
      return {
        type: 'encouragement',
        message: "New to funding searches? Our Expert assistants can guide you step-by-step to find opportunities that match your organization perfectly.",
        priority: 'medium',
        action: 'open_human_help',
        timing: 'delayed'
      };
    }

    // General struggling - personalized
    if (strugglingIndicators.length >= 2) {
      return {
        type: 'help_suggestion',
        message: "Every organization's funding journey is unique. Our Expert team specializes in matching NGOs, students, and businesses with the right opportunities. Let them help accelerate your success!",
        priority: 'high',
        action: 'open_human_help',
        timing: 'immediate'
      };
    }

    // Extended session encouragement
    if (timeOnPage > 600000) {
      return {
        type: 'encouragement',
        message: "You're dedicated to finding the right funding! Our Expert team can save you time by identifying the highest-probability opportunities for your specific situation.",
        priority: 'medium',
        action: 'open_human_help',
        timing: 'delayed'
      };
    }

    // Page-specific advice
    return this.getPageSpecificAdvice();
  }

  private getPageSpecificAdvice(): AssistantAdvice | null {
    const { currentPage, timeOnPage } = this.behavior;

    switch (currentPage) {
      case '/donor-discovery':
        if (timeOnPage > 120000 && this.behavior.interactionTypes.filter(t => t === 'opportunity_card').length === 0) {
          return {
            type: 'guidance',
            message: "Try clicking on any funding opportunity card to see detailed information. Our Expert system has pre-selected the best matches for you!",
            priority: 'medium',
            timing: 'immediate'
          };
        }
        break;

      case '/proposals':
        if (timeOnPage > 90000) {
          return {
            type: 'help_suggestion',
            message: "Need help crafting the perfect proposal? Our human experts specialize in grant writing and can review your work. Click 'Human Help' to get started!",
            priority: 'high',
            action: 'open_human_help',
            timing: 'immediate'
          };
        }
        break;

      case '/funding':
        return {
          type: 'encouragement',
          message: "You're in the right place to find funding! Our Expert algorithms have identified opportunities matching your profile. Need personal guidance? Connect with our human team!",
          priority: 'medium',
          timing: 'delayed'
        };
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