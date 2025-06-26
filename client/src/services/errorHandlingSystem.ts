/**
 * Advanced Error Handling and User Support System for Granada OS
 * Detects errors, provides user-friendly messages, and guides users to get help
 */

export interface ErrorContext {
  errorType: 'network' | 'validation' | 'authentication' | 'payment' | 'system' | 'api' | 'unknown';
  message: string;
  userFriendlyMessage: string;
  actionSuggestions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  shouldContactSupport: boolean;
  supportChannels: SupportChannel[];
  timestamp: number;
  userAgent: string;
  page: string;
  userId?: string;
  stackTrace?: string;
}

export interface SupportChannel {
  type: 'whatsapp' | 'email' | 'phone' | 'chat' | 'telegram';
  label: string;
  contact: string;
  description: string;
  availability: string;
  preferredFor: string[];
}

export class ErrorHandlingSystem {
  private static instance: ErrorHandlingSystem;
  private errorLog: ErrorContext[] = [];
  private supportChannels: SupportChannel[] = [
    {
      type: 'whatsapp',
      label: 'WhatsApp Support',
      contact: '+256-XXX-XXXXXX',
      description: 'Quick help via WhatsApp - fastest response',
      availability: '24/7',
      preferredFor: ['urgent issues', 'payment problems', 'account access']
    },
    {
      type: 'email',
      label: 'Email Support',
      contact: 'support@granadaos.com',
      description: 'Detailed technical support and documentation',
      availability: 'Business hours',
      preferredFor: ['technical issues', 'feature requests', 'detailed explanations']
    },
    {
      type: 'telegram',
      label: 'Telegram Channel',
      contact: '@GranadaOSSupport',
      description: 'Community support and updates',
      availability: '24/7',
      preferredFor: ['community help', 'tips and tricks', 'announcements']
    },
    {
      type: 'phone',
      label: 'Phone Support',
      contact: '+256-XXX-XXXXXX',
      description: 'Direct phone support for urgent issues',
      availability: '9 AM - 6 PM EAT',
      preferredFor: ['urgent issues', 'complex problems', 'business accounts']
    }
  ];

  static getInstance(): ErrorHandlingSystem {
    if (!ErrorHandlingSystem.instance) {
      ErrorHandlingSystem.instance = new ErrorHandlingSystem();
    }
    return ErrorHandlingSystem.instance;
  }

  public handleError(error: Error | string, context?: Partial<ErrorContext>): ErrorContext {
    const errorContext = this.analyzeError(error, context);
    this.errorLog.push(errorContext);
    
    // Send error to backend for tracking
    this.logErrorToBackend(errorContext);
    
    // Show user-friendly notification
    this.showUserNotification(errorContext);
    
    return errorContext;
  }

  private analyzeError(error: Error | string, context?: Partial<ErrorContext>): ErrorContext {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'object' ? error.stack : undefined;
    
    let errorType: ErrorContext['errorType'] = 'unknown';
    let userFriendlyMessage = 'Something went wrong. Please try again.';
    let actionSuggestions: string[] = ['Refresh the page', 'Check your internet connection'];
    let severity: ErrorContext['severity'] = 'medium';
    let shouldContactSupport = false;
    let relevantChannels: SupportChannel[] = [];

    // Network errors
    if (this.isNetworkError(errorMessage)) {
      errorType = 'network';
      userFriendlyMessage = 'Connection problem detected. Please check your internet connection.';
      actionSuggestions = [
        'Check your internet connection',
        'Try refreshing the page',
        'Switch to mobile data if using WiFi',
        'Contact support if the problem persists'
      ];
      severity = 'high';
      shouldContactSupport = true;
      relevantChannels = this.supportChannels.filter(c => 
        c.preferredFor.includes('urgent issues') || c.type === 'whatsapp'
      );
    }
    
    // Authentication errors
    else if (this.isAuthenticationError(errorMessage)) {
      errorType = 'authentication';
      userFriendlyMessage = 'Login issue detected. You may need to sign in again.';
      actionSuggestions = [
        'Try logging out and logging back in',
        'Clear your browser cache',
        'Check if your account is still active',
        'Reset your password if needed'
      ];
      severity = 'high';
      shouldContactSupport = true;
      relevantChannels = this.supportChannels.filter(c => 
        c.preferredFor.includes('account access')
      );
    }
    
    // Payment errors
    else if (this.isPaymentError(errorMessage)) {
      errorType = 'payment';
      userFriendlyMessage = 'Payment processing issue. Your card was not charged.';
      actionSuggestions = [
        'Verify your payment details',
        'Try a different payment method',
        'Check if your card is valid and has sufficient funds',
        'Contact your bank if the issue persists'
      ];
      severity = 'high';
      shouldContactSupport = true;
      relevantChannels = this.supportChannels.filter(c => 
        c.preferredFor.includes('payment problems')
      );
    }
    
    // Validation errors
    else if (this.isValidationError(errorMessage)) {
      errorType = 'validation';
      userFriendlyMessage = 'Please check your input and try again.';
      actionSuggestions = [
        'Review the form for any missing or invalid information',
        'Make sure all required fields are filled',
        'Check email format and phone number format'
      ];
      severity = 'low';
      shouldContactSupport = false;
    }
    
    // API errors
    else if (this.isAPIError(errorMessage)) {
      errorType = 'api';
      userFriendlyMessage = 'Our servers are experiencing issues. We\'re working to fix this.';
      actionSuggestions = [
        'Please try again in a few minutes',
        'The issue is on our end, not yours',
        'Contact support if this continues for more than 10 minutes'
      ];
      severity = 'high';
      shouldContactSupport = true;
      relevantChannels = this.supportChannels.filter(c => 
        c.preferredFor.includes('technical issues')
      );
    }
    
    // System errors
    else if (this.isSystemError(errorMessage)) {
      errorType = 'system';
      userFriendlyMessage = 'A technical issue occurred. Our team has been notified.';
      actionSuggestions = [
        'Please try refreshing the page',
        'If the problem persists, contact our support team',
        'Include details about what you were doing when this happened'
      ];
      severity = 'critical';
      shouldContactSupport = true;
      relevantChannels = this.supportChannels;
    }

    return {
      errorType,
      message: errorMessage,
      userFriendlyMessage,
      actionSuggestions,
      severity,
      shouldContactSupport,
      supportChannels: relevantChannels,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      page: window.location.pathname,
      userId: context?.userId,
      stackTrace,
      ...context
    };
  }

  private isNetworkError(message: string): boolean {
    const networkKeywords = [
      'network error', 'fetch failed', 'connection refused', 'timeout',
      'offline', 'no internet', 'connection lost', 'dns', 'unreachable'
    ];
    return networkKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isAuthenticationError(message: string): boolean {
    const authKeywords = [
      'unauthorized', '401', 'authentication', 'login', 'session expired',
      'access denied', 'forbidden', '403', 'token', 'credentials'
    ];
    return authKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isPaymentError(message: string): boolean {
    const paymentKeywords = [
      'payment', 'card', 'declined', 'insufficient funds', 'expired',
      'billing', 'charge', 'transaction', 'stripe', 'payment failed'
    ];
    return paymentKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isValidationError(message: string): boolean {
    const validationKeywords = [
      'validation', 'required', 'invalid', 'format', 'email',
      'phone', 'password', 'field', 'missing', 'empty'
    ];
    return validationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isAPIError(message: string): boolean {
    const apiKeywords = [
      '500', '502', '503', '504', 'server error', 'internal error',
      'service unavailable', 'gateway', 'api error'
    ];
    return apiKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isSystemError(message: string): boolean {
    const systemKeywords = [
      'system error', 'fatal', 'crash', 'unexpected', 'null reference',
      'undefined', 'memory', 'stack overflow', 'critical'
    ];
    return systemKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private async logErrorToBackend(errorContext: ErrorContext): Promise<void> {
    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorContext)
      });
    } catch (error) {
      console.error('Failed to log error to backend:', error);
    }
  }

  private showUserNotification(errorContext: ErrorContext): void {
    // Create a user-friendly error notification
    const notification = this.createErrorNotification(errorContext);
    document.body.appendChild(notification);
    
    // Auto-remove after delay based on severity
    const delay = errorContext.severity === 'critical' ? 15000 : 
                  errorContext.severity === 'high' ? 10000 : 5000;
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, delay);
  }

  private createErrorNotification(errorContext: ErrorContext): HTMLElement {
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 max-w-md bg-white border-l-4 rounded-lg shadow-lg z-50 p-4
      ${errorContext.severity === 'critical' ? 'border-red-500' : 
        errorContext.severity === 'high' ? 'border-orange-500' : 
        errorContext.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'}
    `;
    
    const severityColor = errorContext.severity === 'critical' ? 'text-red-600' : 
                         errorContext.severity === 'high' ? 'text-orange-600' : 
                         errorContext.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600';
    
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 ${severityColor}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-semibold text-gray-900">
            ${errorContext.severity === 'critical' ? 'Critical Error' : 
              errorContext.severity === 'high' ? 'Error Detected' : 
              errorContext.severity === 'medium' ? 'Issue Found' : 'Notice'}
          </h3>
          <p class="text-sm text-gray-700 mt-1">${errorContext.userFriendlyMessage}</p>
          <div class="mt-2">
            <details class="text-xs">
              <summary class="cursor-pointer text-gray-600 hover:text-gray-800">What can I do?</summary>
              <ul class="mt-1 list-disc list-inside text-gray-600">
                ${errorContext.actionSuggestions.map(suggestion => 
                  `<li>${suggestion}</li>`
                ).join('')}
              </ul>
            </details>
          </div>
          ${errorContext.shouldContactSupport ? `
            <div class="mt-3 border-t pt-2">
              <p class="text-xs text-gray-600 mb-2">Need help? Contact our support team:</p>
              <div class="flex flex-wrap gap-1">
                ${errorContext.supportChannels.map(channel => `
                  <button onclick="window.open('${this.getSupportLink(channel)}', '_blank')" 
                          class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200">
                    ${channel.label}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="ml-4 flex-shrink-0">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  class="text-gray-400 hover:text-gray-600">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    return notification;
  }

  private getSupportLink(channel: SupportChannel): string {
    switch (channel.type) {
      case 'whatsapp':
        return `https://wa.me/${channel.contact.replace(/[^0-9]/g, '')}?text=Hi, I need help with Granada OS. Error occurred on ${window.location.pathname}`;
      case 'email':
        return `mailto:${channel.contact}?subject=Granada OS Support Request&body=Hi, I need help with an issue on ${window.location.pathname}`;
      case 'telegram':
        return `https://t.me/${channel.contact.replace('@', '')}`;
      case 'phone':
        return `tel:${channel.contact}`;
      default:
        return '#';
    }
  }

  public getErrorHistory(): ErrorContext[] {
    return [...this.errorLog];
  }

  public clearErrorHistory(): void {
    this.errorLog = [];
  }

  public exportErrorLog(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }

  // Global error handler setup
  public setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason || 'Unhandled promise rejection', {
        errorType: 'system',
        severity: 'high'
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event.message, {
        errorType: 'system',
        severity: 'high',
        stackTrace: event.error?.stack
      });
    });

    // Handle network errors for fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.handleError(`HTTP ${response.status}: ${response.statusText}`, {
            errorType: response.status >= 500 ? 'api' : 'network',
            severity: response.status >= 500 ? 'high' : 'medium'
          });
        }
        return response;
      } catch (error) {
        this.handleError(error as Error, {
          errorType: 'network',
          severity: 'high'
        });
        throw error;
      }
    };
  }
}

export const errorHandler = ErrorHandlingSystem.getInstance();