// Cookie Management for Onboarding Progress
export interface OnboardingProgress {
  currentStep: string;
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    userType: 'student' | 'organization' | 'business';
    educationLevel?: string;
    fieldOfStudy?: string;
    organizationType?: string;
    businessType?: string;
    teamSize?: string;
    organizationName?: string;
    businessName?: string;
    businessStage?: string;
  };
  userLocation: {
    country: string;
    countryCode: string;
    continent: string;
    timezone: string;
  } | null;
  timestamp: number;
}

export class CookieManager {
  private static COOKIE_NAME = 'granada_onboarding_progress';
  private static EXPIRES_DAYS = 30;

  static saveProgress(progress: Partial<OnboardingProgress>): void {
    try {
      const existingProgress = this.loadProgress();
      const updatedProgress = {
        ...existingProgress,
        ...progress,
        timestamp: Date.now()
      };

      const cookieValue = encodeURIComponent(JSON.stringify(updatedProgress));
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + (this.EXPIRES_DAYS * 24 * 60 * 60 * 1000));
      
      document.cookie = `${this.COOKIE_NAME}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      
      // Also save to localStorage as backup
      localStorage.setItem(this.COOKIE_NAME, JSON.stringify(updatedProgress));
    } catch (error) {
      console.warn('Failed to save onboarding progress:', error);
    }
  }

  static loadProgress(): OnboardingProgress | null {
    try {
      // Try loading from cookie first
      const cookies = document.cookie.split(';');
      const progressCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${this.COOKIE_NAME}=`)
      );

      if (progressCookie) {
        const cookieValue = progressCookie.split('=')[1];
        const decodedValue = decodeURIComponent(cookieValue);
        const progress = JSON.parse(decodedValue);
        
        // Check if progress is not too old (30 days)
        if (Date.now() - progress.timestamp < this.EXPIRES_DAYS * 24 * 60 * 60 * 1000) {
          return progress;
        }
      }

      // Fallback to localStorage
      const localProgress = localStorage.getItem(this.COOKIE_NAME);
      if (localProgress) {
        const progress = JSON.parse(localProgress);
        if (Date.now() - progress.timestamp < this.EXPIRES_DAYS * 24 * 60 * 60 * 1000) {
          return progress;
        }
      }

      return null;
    } catch (error) {
      console.warn('Failed to load onboarding progress:', error);
      return null;
    }
  }

  static clearProgress(): void {
    try {
      document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      localStorage.removeItem(this.COOKIE_NAME);
    } catch (error) {
      console.warn('Failed to clear onboarding progress:', error);
    }
  }

  static hasProgress(): boolean {
    const progress = this.loadProgress();
    return progress !== null && progress.userProfile && Object.keys(progress.userProfile).length > 0;
  }

  static getResumeMessage(): string {
    const progress = this.loadProgress();
    if (!progress) return '';

    const { userProfile, currentStep } = progress;
    const timeDiff = Date.now() - progress.timestamp;
    const hoursSinceLastVisit = Math.floor(timeDiff / (1000 * 60 * 60));
    
    let timeMessage = '';
    if (hoursSinceLastVisit < 1) {
      timeMessage = 'a few minutes ago';
    } else if (hoursSinceLastVisit < 24) {
      timeMessage = `${hoursSinceLastVisit} hour${hoursSinceLastVisit > 1 ? 's' : ''} ago`;
    } else {
      const daysSince = Math.floor(hoursSinceLastVisit / 24);
      timeMessage = `${daysSince} day${daysSince > 1 ? 's' : ''} ago`;
    }

    if (userProfile.firstName) {
      return `Welcome back, ${userProfile.firstName}! You started your registration ${timeMessage}. Would you like to continue where you left off?`;
    }

    return `You have an incomplete registration from ${timeMessage}. Would you like to continue?`;
  }
}