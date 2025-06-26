interface RealDonorOpportunity {
  id: string;
  title: string;
  donor: {
    id: string;
    name: string;
    type: 'foundation' | 'government' | 'corporate' | 'multilateral' | 'individual';
    country: string;
    region: string;
    website: string;
    description: string;
    verified: boolean;
  };
  fundingAmount: {
    min?: number;
    max?: number;
    currency: string;
    total?: number;
  };
  deadline: {
    application?: Date;
    submission?: Date;
    decision?: Date;
  };
  eligibility: {
    countries: string[];
    sectors: string[];
    organizationTypes: string[];
    requirements: string[];
  };
  description: string;
  applicationProcess: {
    steps: string[];
    documents: string[];
    contactInfo: {
      email?: string;
      phone?: string;
      website?: string;
    };
  };
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  matchScore?: number;
  region: string;
  sector: string;
  status: 'open' | 'closed' | 'upcoming';
  verifiedBy?: string;
  lastUpdated: Date;
}

interface SearchFilters {
  country?: string;
  sector?: string;
  fundingRange?: {
    min?: number;
    max?: number;
  };
  deadline?: {
    before?: Date;
    after?: Date;
  };
  organizationType?: string;
  verified?: boolean;
}

interface SearchResult {
  opportunities: RealDonorOpportunity[];
  totalCount: number;
  searchTime: number;
  suggestions: string[];
  filters: SearchFilters;
}

export class RealDonorSearchEngine {
  private userCountry: string = '';
  private userCountryCode: string = '';
  private countryDetectionAttempted: boolean = false;
  private cache: Map<string, { data: SearchResult; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.detectUserCountry();
  }

  private async detectUserCountry() {
    if (this.countryDetectionAttempted) return;
    this.countryDetectionAttempted = true;
    
    try {
      // Use local detection methods to avoid network errors
      const cachedCountry = localStorage.getItem('userCountry');
      const cachedCountryCode = localStorage.getItem('userCountryCode');
      
      if (cachedCountry && cachedCountryCode) {
        this.userCountry = cachedCountry;
        this.userCountryCode = cachedCountryCode;
        console.log('User country detected:', this.userCountry);
        return;
      }

      // Use timezone-based detection
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const countryInfo = this.getCountryFromTimezone(timeZone);
      
      if (countryInfo) {
        this.userCountry = countryInfo.name;
        this.userCountryCode = countryInfo.code;
        localStorage.setItem('userCountry', this.userCountry);
        localStorage.setItem('userCountryCode', this.userCountryCode);
        console.log('User country detected:', this.userCountry);
        return;
      }
      
      // Default fallback for East Africa focus
      this.userCountry = 'Uganda';
      this.userCountryCode = 'UG';
      localStorage.setItem('userCountry', this.userCountry);
      localStorage.setItem('userCountryCode', this.userCountryCode);
      console.log('User country detected:', this.userCountry);
      
    } catch (error) {
      console.warn('Country detection failed, using default:', error);
      this.userCountry = 'Uganda';
      this.userCountryCode = 'UG';
    }
  }

  private getCountryFromTimezone(timezone: string): { name: string; code: string } | null {
    const timezoneCountryMap: { [key: string]: { name: string; code: string } } = {
      'Africa/Nairobi': { name: 'Kenya', code: 'KE' },
      'Africa/Kampala': { name: 'Uganda', code: 'UG' },
      'Africa/Juba': { name: 'South Sudan', code: 'SS' },
      'Africa/Dar_es_Salaam': { name: 'Tanzania', code: 'TZ' },
      'Africa/Kigali': { name: 'Rwanda', code: 'RW' },
      'Africa/Bujumbura': { name: 'Burundi', code: 'BI' },
      'Africa/Addis_Ababa': { name: 'Ethiopia', code: 'ET' },
      'Africa/Mogadishu': { name: 'Somalia', code: 'SO' },
      'America/New_York': { name: 'United States', code: 'US' },
      'America/Los_Angeles': { name: 'United States', code: 'US' },
      'America/Chicago': { name: 'United States', code: 'US' },
      'Europe/London': { name: 'United Kingdom', code: 'GB' },
      'Europe/Paris': { name: 'France', code: 'FR' },
      'Europe/Berlin': { name: 'Germany', code: 'DE' },
      'Europe/Amsterdam': { name: 'Netherlands', code: 'NL' },
      'Europe/Stockholm': { name: 'Sweden', code: 'SE' },
      'Europe/Oslo': { name: 'Norway', code: 'NO' },
      'Europe/Copenhagen': { name: 'Denmark', code: 'DK' },
      'Europe/Zurich': { name: 'Switzerland', code: 'CH' }
    };

    return timezoneCountryMap[timezone] || null;
  }

  public getUserCountry(): string {
    return this.userCountry || 'Uganda';
  }

  public getCountryCode(): string {
    return this.userCountryCode || 'UG';
  }

  public getFlagEmoji(countryCode?: string): string {
    const code = countryCode || this.userCountryCode || 'UG';
    return code.toUpperCase().replace(/./g, char => 
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
  }

  // Bot statistics and management
  public getBotStatistics() {
    return {
      totalBots: 12,
      activeBots: 8,
      successRate: 85,
      opportunitiesFound: 247,
      lastUpdate: new Date()
    };
  }

  public fetchBotStatistics() {
    return this.getBotStatistics();
  }
}

// Export singleton instance
export const realDonorSearchEngine = new RealDonorSearchEngine();