interface MouseEvent {
  x: number;
  y: number;
  timestamp: number;
  velocity: number;
  acceleration: number;
  target: string;
  type: 'move' | 'click' | 'hover' | 'leave';
}

interface ScrollEvent {
  scrollY: number;
  scrollX: number;
  timestamp: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right';
  target: string;
}

interface KeyboardEvent {
  key: string;
  timestamp: number;
  duration: number;
  target: string;
  type: 'keydown' | 'keyup' | 'typing';
}

interface FocusEvent {
  element: string;
  timestamp: number;
  duration: number;
  type: 'focus' | 'blur';
}

interface ClickPattern {
  element: string;
  position: { x: number; y: number };
  timestamp: number;
  sequence: number;
  hoverTime: number;
}

interface BehaviorMetrics {
  sessionDuration: number;
  mouseDistance: number;
  scrollDistance: number;
  clickCount: number;
  keystrokeCount: number;
  hesitationTime: number;
  backtrackingCount: number;
  averageTaskTime: number;
  frustrationScore: number;
  engagementScore: number;
  confidenceScore: number;
}

interface UserIntent {
  primary: string;
  secondary: string[];
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  strugglingWith: string[];
  nextLikelyAction: string;
  timeToGoal: number;
}

class RealTimeAnalytics {
  private mouseEvents: MouseEvent[] = [];
  private scrollEvents: ScrollEvent[] = [];
  private keyboardEvents: KeyboardEvent[] = [];
  private focusEvents: FocusEvent[] = [];
  private clickPatterns: ClickPattern[] = [];
  private sessionStart: number = Date.now();
  private lastMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private lastScrollPosition: { x: number; y: number } = { x: 0, y: 0 };
  private currentElement: string = '';
  private hoverStartTime: number = 0;
  private analyticsQueue: any[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private onInsightCallback: ((insight: any) => void) | null = null;

  constructor() {
    this.initializeTracking();
    this.startProcessing();
  }

  private initializeTracking() {
    // Mouse movement tracking
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    // Scroll tracking
    document.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

    // Keyboard tracking
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Focus tracking
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));

    // Page visibility
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Touch events for mobile
    document.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleMouseMove(event: Event) {
    const e = event as MouseEvent;
    const now = performance.now();
    const velocity = this.calculateVelocity(
      { x: e.clientX, y: e.clientY },
      this.lastMousePosition,
      now
    );

    const mouseEvent: MouseEvent = {
      x: e.clientX,
      y: e.clientY,
      timestamp: now,
      velocity: velocity,
      acceleration: this.calculateAcceleration(velocity),
      target: this.getElementPath(e.target as Element),
      type: 'move'
    };

    this.mouseEvents.push(mouseEvent);
    this.lastMousePosition = { x: e.clientX, y: e.clientY };

    // Keep only last 1000 events for performance
    if (this.mouseEvents.length > 1000) {
      this.mouseEvents = this.mouseEvents.slice(-1000);
    }

    this.queueAnalysis('mouse_move', mouseEvent);
  }

  private handleClick(event: Event) {
    const e = event as MouseEvent;
    const now = performance.now();
    const element = this.getElementPath(e.target as Element);

    const clickPattern: ClickPattern = {
      element: element,
      position: { x: e.clientX, y: e.clientY },
      timestamp: now,
      sequence: this.clickPatterns.length + 1,
      hoverTime: this.hoverStartTime ? now - this.hoverStartTime : 0
    };

    this.clickPatterns.push(clickPattern);
    this.queueAnalysis('click', clickPattern);
  }

  private handleScroll(event: Event) {
    const now = performance.now();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    const velocity = this.calculateScrollVelocity(
      { x: scrollX, y: scrollY },
      this.lastScrollPosition,
      now
    );

    const direction = this.getScrollDirection(scrollY, this.lastScrollPosition.y);

    const scrollEvent: ScrollEvent = {
      scrollY: scrollY,
      scrollX: scrollX,
      timestamp: now,
      velocity: velocity,
      direction: direction,
      target: this.getElementPath(event.target as Element)
    };

    this.scrollEvents.push(scrollEvent);
    this.lastScrollPosition = { x: scrollX, y: scrollY };

    if (this.scrollEvents.length > 500) {
      this.scrollEvents = this.scrollEvents.slice(-500);
    }

    this.queueAnalysis('scroll', scrollEvent);
  }

  private handleKeyDown(event: Event) {
    const e = event as KeyboardEvent;
    const now = performance.now();

    const keyEvent: KeyboardEvent = {
      key: e.key,
      timestamp: now,
      duration: 0,
      target: this.getElementPath(e.target as Element),
      type: 'keydown'
    };

    this.keyboardEvents.push(keyEvent);
    this.queueAnalysis('keydown', keyEvent);
  }

  private handleKeyUp(event: Event) {
    const e = event as KeyboardEvent;
    const now = performance.now();

    // Find matching keydown event to calculate duration
    const keydownEvent = this.keyboardEvents
      .reverse()
      .find(evt => evt.key === e.key && evt.type === 'keydown' && evt.duration === 0);

    if (keydownEvent) {
      keydownEvent.duration = now - keydownEvent.timestamp;
    }

    this.queueAnalysis('keyup', { key: e.key, timestamp: now });
  }

  private handleFocusIn(event: Event) {
    const now = performance.now();
    const element = this.getElementPath(event.target as Element);

    this.focusEvents.push({
      element: element,
      timestamp: now,
      duration: 0,
      type: 'focus'
    });

    this.currentElement = element;
    this.queueAnalysis('focus', { element, timestamp: now });
  }

  private handleFocusOut(event: Event) {
    const now = performance.now();
    const element = this.getElementPath(event.target as Element);

    // Update duration for the last focus event
    const lastFocus = this.focusEvents[this.focusEvents.length - 1];
    if (lastFocus && lastFocus.type === 'focus' && lastFocus.element === element) {
      lastFocus.duration = now - lastFocus.timestamp;
    }

    this.focusEvents.push({
      element: element,
      timestamp: now,
      duration: 0,
      type: 'blur'
    });

    this.queueAnalysis('blur', { element, timestamp: now });
  }

  private handleMouseEnter(event: Event) {
    this.hoverStartTime = performance.now();
    const element = this.getElementPath(event.target as Element);
    this.queueAnalysis('hover_start', { element, timestamp: this.hoverStartTime });
  }

  private handleMouseLeave(event: Event) {
    const now = performance.now();
    const element = this.getElementPath(event.target as Element);
    const hoverDuration = this.hoverStartTime ? now - this.hoverStartTime : 0;
    
    this.queueAnalysis('hover_end', { 
      element, 
      timestamp: now, 
      duration: hoverDuration 
    });
    
    this.hoverStartTime = 0;
  }

  private handleVisibilityChange() {
    const now = performance.now();
    const isVisible = !document.hidden;
    
    this.queueAnalysis('visibility_change', { 
      visible: isVisible, 
      timestamp: now 
    });
  }

  private handleTouchStart(event: Event) {
    const e = event as TouchEvent;
    const touch = e.touches[0];
    const now = performance.now();

    this.queueAnalysis('touch_start', {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now,
      target: this.getElementPath(e.target as Element)
    });
  }

  private handleTouchMove(event: Event) {
    const e = event as TouchEvent;
    const touch = e.touches[0];
    const now = performance.now();

    this.queueAnalysis('touch_move', {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now,
      target: this.getElementPath(e.target as Element)
    });
  }

  private handleTouchEnd(event: Event) {
    const now = performance.now();

    this.queueAnalysis('touch_end', {
      timestamp: now,
      target: this.getElementPath(event.target as Element)
    });
  }

  private calculateVelocity(current: { x: number; y: number }, previous: { x: number; y: number }, timeDiff: number): number {
    const distance = Math.sqrt(
      Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2)
    );
    return timeDiff > 0 ? distance / timeDiff : 0;
  }

  private calculateAcceleration(currentVelocity: number): number {
    const previousEvent = this.mouseEvents[this.mouseEvents.length - 1];
    if (!previousEvent) return 0;
    
    const timeDiff = performance.now() - previousEvent.timestamp;
    return timeDiff > 0 ? (currentVelocity - previousEvent.velocity) / timeDiff : 0;
  }

  private calculateScrollVelocity(current: { x: number; y: number }, previous: { x: number; y: number }, timeDiff: number): number {
    const distance = Math.abs(current.y - previous.y) + Math.abs(current.x - previous.x);
    return timeDiff > 0 ? distance / timeDiff : 0;
  }

  private getScrollDirection(currentY: number, previousY: number): 'up' | 'down' | 'left' | 'right' {
    if (currentY > previousY) return 'down';
    if (currentY < previousY) return 'up';
    return 'down'; // default
  }

  private getElementPath(element: Element): string {
    if (!element) return 'unknown';
    
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        selector += `.${current.className.toString().replace(/\s+/g, '.')}`;
      }
      
      path.unshift(selector);
      current = current.parentElement as Element;
    }
    
    return path.join(' > ');
  }

  private queueAnalysis(type: string, data: any) {
    this.analyticsQueue.push({
      type,
      data,
      timestamp: performance.now(),
      sessionTime: performance.now() - this.sessionStart
    });

    // Process immediately if queue gets large
    if (this.analyticsQueue.length > 50) {
      this.processAnalytics();
    }
  }

  private startProcessing() {
    // Process analytics every 2 seconds
    this.processingInterval = setInterval(() => {
      this.processAnalytics();
    }, 2000);
  }

  private async processAnalytics() {
    if (this.analyticsQueue.length === 0) return;

    const batch = this.analyticsQueue.splice(0);
    const metrics = this.calculateBehaviorMetrics();
    const intent = this.predictUserIntent();

    const analysis = {
      timestamp: Date.now(),
      sessionDuration: performance.now() - this.sessionStart,
      events: batch,
      metrics,
      intent,
      patterns: this.detectPatterns(),
      anomalies: this.detectAnomalies(),
      recommendations: this.generateRecommendations(metrics, intent)
    };

    // Send to AI engine for processing
    this.sendToAIEngine(analysis);
  }

  private calculateBehaviorMetrics(): BehaviorMetrics {
    const sessionDuration = performance.now() - this.sessionStart;
    
    // Calculate mouse distance
    const mouseDistance = this.mouseEvents.reduce((total, event, index) => {
      if (index === 0) return 0;
      const prev = this.mouseEvents[index - 1];
      return total + Math.sqrt(
        Math.pow(event.x - prev.x, 2) + Math.pow(event.y - prev.y, 2)
      );
    }, 0);

    // Calculate scroll distance
    const scrollDistance = this.scrollEvents.reduce((total, event, index) => {
      if (index === 0) return 0;
      const prev = this.scrollEvents[index - 1];
      return total + Math.abs(event.scrollY - prev.scrollY);
    }, 0);

    // Calculate hesitation (mouse stops)
    const hesitationTime = this.mouseEvents.filter(event => event.velocity < 10).length * 16.67; // ~60fps

    // Calculate frustration score based on erratic movements, backtracking, etc.
    const frustrationScore = this.calculateFrustrationScore();
    
    // Calculate engagement score based on interaction patterns
    const engagementScore = this.calculateEngagementScore();
    
    // Calculate confidence score based on decisiveness of actions
    const confidenceScore = this.calculateConfidenceScore();

    return {
      sessionDuration,
      mouseDistance,
      scrollDistance,
      clickCount: this.clickPatterns.length,
      keystrokeCount: this.keyboardEvents.length,
      hesitationTime,
      backtrackingCount: this.detectBacktracking(),
      averageTaskTime: this.calculateAverageTaskTime(),
      frustrationScore,
      engagementScore,
      confidenceScore
    };
  }

  private calculateFrustrationScore(): number {
    let score = 0;
    
    // High velocity mouse movements indicate frustration
    const highVelocityMoves = this.mouseEvents.filter(e => e.velocity > 1000).length;
    score += highVelocityMoves * 0.1;
    
    // Rapid clicking in same area
    const rapidClicks = this.detectRapidClicking();
    score += rapidClicks * 0.2;
    
    // Excessive scrolling without interaction
    const excessiveScrolling = this.scrollEvents.length > 100 ? 1 : 0;
    score += excessiveScrolling * 0.3;
    
    return Math.min(score, 1); // Cap at 1.0
  }

  private calculateEngagementScore(): number {
    let score = 0;
    
    // Regular interaction patterns
    const interactionFrequency = (this.clickPatterns.length + this.keyboardEvents.length) / (performance.now() - this.sessionStart) * 1000;
    score += Math.min(interactionFrequency * 0.1, 0.4);
    
    // Time spent on elements
    const focusTime = this.focusEvents.reduce((total, event) => total + event.duration, 0);
    score += Math.min(focusTime / 10000, 0.3); // Normalize to 0-0.3
    
    // Scroll patterns indicate reading
    const readingScore = this.detectReadingPatterns();
    score += readingScore * 0.3;
    
    return Math.min(score, 1);
  }

  private calculateConfidenceScore(): number {
    let score = 1; // Start with full confidence
    
    // Hesitation reduces confidence
    const hesitationRatio = this.mouseEvents.filter(e => e.velocity < 10).length / this.mouseEvents.length;
    score -= hesitationRatio * 0.3;
    
    // Backtracking reduces confidence
    const backtrackingRatio = this.detectBacktracking() / Math.max(this.clickPatterns.length, 1);
    score -= backtrackingRatio * 0.4;
    
    // Multiple attempts at same task
    const retryAttempts = this.detectRetryAttempts();
    score -= retryAttempts * 0.1;
    
    return Math.max(score, 0);
  }

  private predictUserIntent(): UserIntent {
    const recentClicks = this.clickPatterns.slice(-10);
    const recentFocus = this.focusEvents.slice(-5);
    
    // Analyze clicked elements to predict intent
    const elementTypes = recentClicks.map(click => {
      if (click.element.includes('search')) return 'searching';
      if (click.element.includes('filter')) return 'filtering';
      if (click.element.includes('button')) return 'action';
      if (click.element.includes('link')) return 'navigation';
      return 'exploration';
    });

    const primaryIntent = this.getMostFrequent(elementTypes) || 'exploration';
    
    // Calculate urgency based on behavior patterns
    const urgency = this.calculateUrgency();
    
    // Identify what user might be struggling with
    const strugglingWith = this.identifyStruggles();
    
    return {
      primary: primaryIntent,
      secondary: elementTypes.slice(-3),
      confidence: this.calculateIntentConfidence(elementTypes),
      urgency,
      strugglingWith,
      nextLikelyAction: this.predictNextAction(primaryIntent),
      timeToGoal: this.estimateTimeToGoal()
    };
  }

  private calculateUrgency(): 'low' | 'medium' | 'high' | 'critical' {
    const metrics = this.calculateBehaviorMetrics();
    
    if (metrics.frustrationScore > 0.7) return 'critical';
    if (metrics.frustrationScore > 0.5) return 'high';
    if (metrics.frustrationScore > 0.3) return 'medium';
    return 'low';
  }

  private identifyStruggles(): string[] {
    const struggles = [];
    
    if (this.detectBacktracking() > 3) struggles.push('navigation');
    if (this.detectRapidClicking() > 2) struggles.push('interface_confusion');
    if (this.scrollEvents.length > 50 && this.clickPatterns.length < 5) struggles.push('finding_content');
    if (this.keyboardEvents.length > 20 && this.clickPatterns.length < 3) struggles.push('form_completion');
    
    return struggles;
  }

  private detectPatterns(): any {
    return {
      mousePatterns: this.detectMousePatterns(),
      scrollPatterns: this.detectScrollPatterns(),
      clickPatterns: this.detectClickPatterns(),
      typingPatterns: this.detectTypingPatterns()
    };
  }

  private detectAnomalies(): any[] {
    const anomalies = [];
    
    // Detect unusually fast mouse movements
    const fastMoves = this.mouseEvents.filter(e => e.velocity > 2000);
    if (fastMoves.length > 5) {
      anomalies.push({ type: 'erratic_mouse', count: fastMoves.length });
    }
    
    // Detect stuck scrolling
    const sameScrolls = this.scrollEvents.filter((e, i, arr) => 
      i > 0 && Math.abs(e.scrollY - arr[i-1].scrollY) < 5
    );
    if (sameScrolls.length > 10) {
      anomalies.push({ type: 'stuck_scrolling', count: sameScrolls.length });
    }
    
    return anomalies;
  }

  private generateRecommendations(metrics: BehaviorMetrics, intent: UserIntent): string[] {
    const recommendations = [];
    
    if (metrics.frustrationScore > 0.5) {
      recommendations.push('offer_help');
    }
    
    if (intent.strugglingWith.includes('navigation')) {
      recommendations.push('show_navigation_tour');
    }
    
    if (intent.strugglingWith.includes('finding_content')) {
      recommendations.push('suggest_search_terms');
    }
    
    if (metrics.engagementScore < 0.3) {
      recommendations.push('show_engaging_content');
    }
    
    return recommendations;
  }

  private async sendToAIEngine(analysis: any) {
    try {
      const response = await fetch('/api/ai/analyze-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysis)
      });
      
      if (response.ok) {
        const insight = await response.json();
        if (this.onInsightCallback) {
          this.onInsightCallback(insight);
        }
      }
    } catch (error) {
      console.error('Failed to send analytics to AI engine:', error);
    }
  }

  // Utility methods for pattern detection
  private detectBacktracking(): number {
    // Implementation for detecting backtracking behavior
    return 0;
  }

  private detectRapidClicking(): number {
    // Implementation for detecting rapid clicking
    return 0;
  }

  private detectReadingPatterns(): number {
    // Implementation for detecting reading patterns
    return 0.5;
  }

  private detectRetryAttempts(): number {
    // Implementation for detecting retry attempts
    return 0;
  }

  private getMostFrequent(arr: string[]): string {
    if (arr.length === 0) return '';
    
    const frequency = arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  private calculateIntentConfidence(elementTypes: string[]): number {
    if (elementTypes.length === 0) return 0;
    
    const mostFrequent = this.getMostFrequent(elementTypes);
    const frequency = elementTypes.filter(type => type === mostFrequent).length;
    
    return frequency / elementTypes.length;
  }

  private predictNextAction(primaryIntent: string): string {
    const actionMap: Record<string, string> = {
      'searching': 'refine_search',
      'filtering': 'apply_filters',
      'action': 'complete_task',
      'navigation': 'explore_section',
      'exploration': 'focus_content'
    };
    
    return actionMap[primaryIntent] || 'continue_exploration';
  }

  private estimateTimeToGoal(): number {
    // Estimate based on current behavior patterns
    const avgTaskTime = this.calculateAverageTaskTime();
    return avgTaskTime > 0 ? avgTaskTime * 1.5 : 30000; // 30 seconds default
  }

  private calculateAverageTaskTime(): number {
    if (this.clickPatterns.length < 2) return 0;
    
    const timeBetweenActions = this.clickPatterns.slice(1).map((click, index) => 
      click.timestamp - this.clickPatterns[index].timestamp
    );
    
    return timeBetweenActions.reduce((sum, time) => sum + time, 0) / timeBetweenActions.length;
  }

  private detectMousePatterns(): any {
    // Implementation for mouse pattern detection
    return {};
  }

  private detectScrollPatterns(): any {
    // Implementation for scroll pattern detection
    return {};
  }

  private detectClickPatterns(): any {
    // Implementation for click pattern detection
    return {};
  }

  private detectTypingPatterns(): any {
    // Implementation for typing pattern detection
    return {};
  }

  public onInsight(callback: (insight: any) => void) {
    this.onInsightCallback = callback;
  }

  public getSessionMetrics(): BehaviorMetrics {
    return this.calculateBehaviorMetrics();
  }

  public getUserIntent(): UserIntent {
    return this.predictUserIntent();
  }

  public destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    // Remove all event listeners
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('click', this.handleClick.bind(this));
    document.removeEventListener('scroll', this.handleScroll.bind(this));
    // ... remove other listeners
  }
}

export default RealTimeAnalytics;