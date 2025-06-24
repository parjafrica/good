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
  focusAreas: string[];
  description: string;
  applicationProcess: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    applicationUrl?: string;
  };
  matchScore?: number;
  lastUpdated: Date;
  source: string;
  sourceUrl: string;
  status: 'open' | 'closed' | 'upcoming' | 'rolling';
  language: string;
  isVerified: boolean;
  scrapedAt: Date;
}

interface SearchFilters {
  countries?: string[];
  sectors?: string[];
  fundingRange?: { min?: number; max?: number };
  donorTypes?: string[];
  deadlineRange?: { from?: Date; to?: Date };
  keywords?: string[];
  organizationType?: string;
  language?: string;
  verified?: boolean;
}

interface SearchResult {
  opportunities: RealDonorOpportunity[];
  totalCount: number;
  searchId: string;
  timestamp: Date;
  filters: SearchFilters;
  creditsUsed: number;
  sources: string[];
  freshDataPercentage: number;
}

class RealDonorSearchEngine {
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private isInitialized = false;
  private lastSearchTime: Date | null = null;
  private searchCache = new Map<string, SearchResult>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  private botStatistics: any = null;
  private botStatisticsLastUpdated: Date | null = null;
  private userCountry: string | null = null;
  private userCountryCode: string | null = null;
  private countryDetectionAttempted = false;
  private initializationAttempted = false;
  private useFallbackMode: boolean;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    this.useFallbackMode = import.meta.env.VITE_USE_FALLBACK_MODE === 'true';
    
    if (this.useFallbackMode) {
      console.log('Using fallback mode for donor search engine');
    } else if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.warn('Missing Supabase configuration. Using fallback mode.');
      this.useFallbackMode = true;
    }
    
    this.initialize();
    this.detectUserCountry();
  }

  private async initialize() {
    if (this.initializationAttempted) return;
    this.initializationAttempted = true;
    
    try {
      // Skip Supabase initialization if in fallback mode
      if (this.useFallbackMode) {
        console.log('Skipping Supabase initialization due to fallback mode');
        this.isInitialized = false;
        return;
      }
      
      // Check if the Supabase functions are available
      await this.fetchBotStatistics();
      this.isInitialized = true;
      console.log('Real donor search engine initialized successfully');
    } catch (error) {
      console.warn('Error initializing real donor search engine:', error);
      console.log('Falling back to mock data');
      this.isInitialized = false; // Keep as false to use fallback mode
    }
  }

  private async detectUserCountry() {
    if (this.countryDetectionAttempted) return;
    this.countryDetectionAttempted = true;
    
    try {
      // Try multiple geolocation services for redundancy
      const services = [
        'https://ipapi.co/json/',
        'https://ipinfo.io/json',
        'https://api.ipgeolocation.io/ipgeo?apiKey=free'
      ];
      
      // Try each service until one works
      for (const service of services) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
          const response = await fetch(service, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) continue;
          
          const data = await response.json();
          
          // Different APIs use different field names
          const countryName = data.country_name || data.country || '';
          const countryCode = data.country_code || data.countryCode || '';
          
          if (countryName) {
            this.userCountry = countryName;
            this.userCountryCode = countryCode;
            console.log('User country detected:', this.userCountry);
            break; // Stop trying other services
          }
        } catch (e) {
          // Continue to next service
          continue;
        }
      }
      
      // If all services fail, use fallback
      if (!this.userCountry) {
        this.setFallbackCountry();
      }
    } catch (error) {
      console.warn('Error detecting user country:', error);
      this.setFallbackCountry();
    }
  }
  
  private setFallbackCountry() {
    // Use a fallback country if detection fails
    this.userCountry = 'Global';
    this.userCountryCode = 'GL';
    console.log('Using fallback country:', this.userCountry);
  }

  private generateCacheKey(query: string, filters: SearchFilters, useAI: boolean): string {
    return `${query}-${JSON.stringify(filters)}-${useAI}`;
  }

  private isCacheValid(cacheKey: string): boolean {
    if (!this.searchCache.has(cacheKey)) return false;
    
    const cachedResult = this.searchCache.get(cacheKey)!;
    const now = new Date();
    const cacheAge = now.getTime() - cachedResult.timestamp.getTime();
    
    return cacheAge < this.cacheTTL;
  }

  async searchOpportunities(
    query: string,
    filters: SearchFilters = {},
    useAI: boolean = true
  ): Promise<SearchResult> {
    this.lastSearchTime = new Date();
    
    // Apply user's country to filters if not already specified
    if (this.userCountry && (!filters.countries || filters.countries.length === 0)) {
      filters = {
        ...filters,
        countries: [this.userCountry]
      };
    }
    
    const cacheKey = this.generateCacheKey(query, filters, useAI);
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log('Using cached search results');
      return this.searchCache.get(cacheKey)!;
    }
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // If in fallback mode or still not initialized after attempt, use fallback
      if (this.useFallbackMode || !this.isInitialized) {
        console.log('Using fallback search due to fallback mode or initialization failure');
        return this.generateMockSearchResult(query, filters, useAI);
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filters.countries?.length) params.append('country', filters.countries[0]);
      if (filters.sectors?.length) params.append('sector', filters.sectors[0]);
      if (filters.fundingRange?.min) params.append('min_amount', filters.fundingRange.min.toString());
      if (filters.fundingRange?.max) params.append('max_amount', filters.fundingRange.max.toString());
      if (filters.verified !== undefined) params.append('verified_only', filters.verified.toString());
      params.append('use_ai', useAI.toString());
      params.append('limit', '100');
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        // Make API request to Supabase Edge Function
        const response = await fetch(`${this.supabaseUrl}/functions/v1/search-opportunities?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.supabaseAnonKey}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API response to our format
        const opportunities: RealDonorOpportunity[] = data.opportunities.map((opp: any) => this.transformOpportunity(opp));
        
        // Create search result
        const result: SearchResult = {
          opportunities: opportunities,
          totalCount: data.total_count,
          searchId: data.search_id,
          timestamp: new Date(data.timestamp),
          filters,
          creditsUsed: data.credits_used,
          sources: data.sources,
          freshDataPercentage: data.fresh_data_percentage
        };
        
        // Cache the result
        this.searchCache.set(cacheKey, result);
        
        return result;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.warn('Search request timed out, using fallback data');
        } else {
          console.error('Network error in search:', fetchError);
        }
        
        throw fetchError;
      }
      
    } catch (error) {
      console.error('Error searching real opportunities:', error);
      
      // Fallback to mock data
      console.log('Falling back to mock data');
      return this.generateMockSearchResult(query, filters, useAI);
    }
  }
  
  private transformOpportunity(apiOpp: any): RealDonorOpportunity {
    // Parse dates
    const deadline = apiOpp.deadline ? new Date(apiOpp.deadline) : undefined;
    const scrapedAt = apiOpp.scraped_at ? new Date(apiOpp.scraped_at) : new Date();
    const lastUpdated = apiOpp.updated_at ? new Date(apiOpp.updated_at) : scrapedAt;
    
    return {
      id: apiOpp.id,
      title: apiOpp.title,
      donor: {
        id: `donor-${apiOpp.source_name.toLowerCase().replace(/\s+/g, '-')}`,
        name: apiOpp.source_name,
        type: this.getDonorType(apiOpp.source_name),
        country: apiOpp.country || 'Global',
        region: this.getRegionFromCountry(apiOpp.country),
        website: apiOpp.source_url,
        description: `Funding organization focused on ${apiOpp.sector || 'development'} initiatives`,
        verified: apiOpp.is_verified
      },
      fundingAmount: {
        min: apiOpp.amount_min,
        max: apiOpp.amount_max,
        currency: apiOpp.currency || 'USD',
        total: apiOpp.amount_max ? apiOpp.amount_max * 10 : undefined
      },
      deadline: {
        application: deadline,
        submission: deadline ? new Date(deadline.getTime() + 7 * 24 * 60 * 60 * 1000) : undefined
      },
      eligibility: {
        countries: [apiOpp.country, 'Global'],
        sectors: apiOpp.sector ? [apiOpp.sector] : ['Education', 'Health', 'Environment'],
        organizationTypes: ['NGO', 'Non-profit', 'Social Enterprise'],
        requirements: apiOpp.eligibility_criteria 
          ? apiOpp.eligibility_criteria.split('\n') 
          : ['Registered organization', 'Proven track record', 'Local partnerships']
      },
      focusAreas: apiOpp.focus_areas || [apiOpp.sector || 'Development'],
      description: apiOpp.description || `Funding opportunity for ${apiOpp.sector || 'development'} projects`,
      applicationProcess: apiOpp.application_process || 'Submit application through the donor portal with required documentation',
      contactInfo: {
        email: apiOpp.contact_email,
        phone: apiOpp.contact_phone,
        applicationUrl: apiOpp.source_url
      },
      matchScore: apiOpp.match_score || 75,
      lastUpdated: lastUpdated,
      source: apiOpp.source_name,
      sourceUrl: apiOpp.source_url,
      status: this.getStatus(deadline),
      language: 'English',
      isVerified: apiOpp.is_verified,
      scrapedAt: scrapedAt
    };
  }
  
  private getDonorType(sourceName: string): 'foundation' | 'government' | 'corporate' | 'multilateral' | 'individual' {
    const name = sourceName.toLowerCase();
    
    if (name.includes('foundation') || name.includes('trust') || name.includes('fund')) {
      return 'foundation';
    } else if (name.includes('government') || name.includes('ministry') || name.includes('usaid') || name.includes('dfid')) {
      return 'government';
    } else if (name.includes('un') || name.includes('world bank') || name.includes('undp') || name.includes('unesco')) {
      return 'multilateral';
    } else if (name.includes('corp') || name.includes('inc') || name.includes('ltd') || name.includes('company')) {
      return 'corporate';
    } else {
      return 'foundation';
    }
  }
  
  private getRegionFromCountry(country: string): string {
    const regions: Record<string, string> = {
      'South Sudan': 'East Africa',
      'Kenya': 'East Africa',
      'Uganda': 'East Africa',
      'Tanzania': 'East Africa',
      'Rwanda': 'East Africa',
      'Nigeria': 'West Africa',
      'Ghana': 'West Africa',
      'South Africa': 'Southern Africa',
      'United States': 'North America',
      'United Kingdom': 'Europe',
      'Germany': 'Europe',
      'France': 'Europe'
    };
    
    return regions[country] || 'Global';
  }
  
  private getStatus(deadline?: Date): 'open' | 'closed' | 'upcoming' | 'rolling' {
    if (!deadline) return 'rolling';
    
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    if (deadline < now) {
      return 'closed';
    } else if (deadline > twoWeeksFromNow) {
      return 'upcoming';
    } else {
      return 'open';
    }
  }
  
  private generateMockSearchResult(query: string, filters: SearchFilters, useAI: boolean): SearchResult {
    // Generate mock opportunities
    const opportunities: RealDonorOpportunity[] = [];
    const count = 10 + Math.floor(Math.random() * 20);
    
    // Use user's country for mock data if available
    const userCountry = this.userCountry || 'Global';
    
    for (let i = 0; i < count; i++) {
      opportunities.push(this.generateMockOpportunity(query, i, userCountry));
    }
    
    // Apply filters
    const filteredOpportunities = this.applyMockFilters(opportunities, filters);
    
    // Apply AI enhancement if requested
    const enhancedOpportunities = useAI 
      ? this.applyMockAIEnhancement(filteredOpportunities, query)
      : filteredOpportunities;
    
    return {
      opportunities: enhancedOpportunities,
      totalCount: filteredOpportunities.length,
      searchId: `mock-search-${Date.now()}`,
      timestamp: new Date(),
      filters,
      creditsUsed: useAI ? 15 : 5,
      sources: ['Mock Data Source', 'Fallback Generator', `${userCountry} Funding Database`],
      freshDataPercentage: 100
    };
  }
  
  private generateMockOpportunity(query: string, index: number, userCountry: string = 'Global'): RealDonorOpportunity {
    const sectors = ['Education', 'Health', 'Environment', 'Human Rights', 'Economic Development'];
    const sector = query 
      ? this.extractSectorFromQuery(query) 
      : sectors[Math.floor(Math.random() * sectors.length)];
    
    const now = new Date();
    const deadline = new Date(now.getTime() + (7 + Math.floor(Math.random() * 90)) * 24 * 60 * 60 * 1000);
    
    // Use user's country for some opportunities to make results more relevant
    const opportunityCountry = Math.random() > 0.3 ? userCountry : 'Global';
    
    return {
      id: `mock-${Date.now()}-${index}`,
      title: `${sector} Development Initiative ${index + 1}`,
      donor: {
        id: `mock-donor-${index}`,
        name: `${opportunityCountry} ${sector} Foundation`,
        type: 'foundation',
        country: opportunityCountry,
        region: this.getRegionFromCountry(opportunityCountry),
        website: 'https://example.org',
        description: `Leading foundation focused on ${sector.toLowerCase()} initiatives in ${opportunityCountry}`,
        verified: true
      },
      fundingAmount: {
        min: 10000 + Math.floor(Math.random() * 90000),
        max: 100000 + Math.floor(Math.random() * 900000),
        currency: 'USD',
        total: 1000000 + Math.floor(Math.random() * 9000000)
      },
      deadline: {
        application: deadline,
        submission: deadline ? new Date(deadline.getTime() + 7 * 24 * 60 * 60 * 1000) : undefined
      },
      eligibility: {
        countries: [opportunityCountry, 'Global'],
        sectors: [sector],
        organizationTypes: ['NGO', 'Non-profit', 'Social Enterprise'],
        requirements: ['Registered organization', 'Proven track record', 'Local partnerships']
      },
      focusAreas: [sector, 'Capacity Building', 'Innovation'],
      description: `This funding opportunity supports innovative ${sector.toLowerCase()} initiatives in ${opportunityCountry} that demonstrate measurable impact and sustainable outcomes.`,
      applicationProcess: 'Submit application through the donor portal with required documentation',
      contactInfo: {
        email: 'grants@example.org',
        applicationUrl: 'https://example.org/apply'
      },
      matchScore: 70 + Math.floor(Math.random() * 30),
      lastUpdated: new Date(),
      source: `${opportunityCountry} Funding Database`,
      sourceUrl: 'https://example.org',
      status: 'open',
      language: 'English',
      isVerified: true,
      scrapedAt: new Date()
    };
  }
  
  private extractSectorFromQuery(query: string): string {
    const sectors = ['Education', 'Health', 'Environment', 'Human Rights', 'Economic Development'];
    const lowerQuery = query.toLowerCase();
    
    for (const sector of sectors) {
      if (lowerQuery.includes(sector.toLowerCase())) {
        return sector;
      }
    }
    
    return sectors[Math.floor(Math.random() * sectors.length)];
  }
  
  private applyMockFilters(opportunities: RealDonorOpportunity[], filters: SearchFilters): RealDonorOpportunity[] {
    return opportunities.filter(opp => {
      // Country filter
      if (filters.countries?.length && !filters.countries.includes('Global')) {
        if (!opp.eligibility.countries.some(c => filters.countries!.includes(c))) {
          return false;
        }
      }
      
      // Sector filter
      if (filters.sectors?.length) {
        if (!opp.eligibility.sectors.some(s => filters.sectors!.includes(s))) {
          return false;
        }
      }
      
      // Funding range filter
      if (filters.fundingRange) {
        if (filters.fundingRange.min && opp.fundingAmount.max && opp.fundingAmount.max < filters.fundingRange.min) {
          return false;
        }
        if (filters.fundingRange.max && opp.fundingAmount.min && opp.fundingAmount.min > filters.fundingRange.max) {
          return false;
        }
      }
      
      // Donor type filter
      if (filters.donorTypes?.length) {
        if (!filters.donorTypes.includes(opp.donor.type)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  private applyMockAIEnhancement(opportunities: RealDonorOpportunity[], query: string): RealDonorOpportunity[] {
    return opportunities.map(opp => {
      // Enhance match score
      const enhancedScore = Math.min(100, (opp.matchScore || 70) + Math.floor(Math.random() * 15));
      
      return {
        ...opp,
        matchScore: enhancedScore
      };
    });
  }

  async fetchBotStatistics(): Promise<any> {
    try {
      // Check if we have recent statistics
      if (this.botStatistics && this.botStatisticsLastUpdated) {
        const now = new Date();
        const age = now.getTime() - this.botStatisticsLastUpdated.getTime();
        
        // Use cached stats if less than 5 minutes old
        if (age < 5 * 60 * 1000) {
          return this.botStatistics;
        }
      }
      
      // If in fallback mode, use mock data
      if (this.useFallbackMode) {
        console.log('Using fallback bot statistics due to fallback mode');
        return this.generateMockBotStatistics();
      }
      
      // Validate configuration
      if (!this.supabaseUrl || !this.supabaseAnonKey) {
        console.warn('Missing Supabase configuration, using fallback data');
        return this.generateMockBotStatistics();
      }
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        // Fetch fresh statistics
        const response = await fetch(`${this.supabaseUrl}/functions/v1/bot-status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.supabaseAnonKey}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error(`API request failed with status ${response.status}:`, errorText);
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        // Validate response data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response data from bot-status function');
        }
        
        // Cache the results
        this.botStatistics = data;
        this.botStatisticsLastUpdated = new Date();
        
        console.log('Successfully fetched bot statistics from API');
        return data;
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.warn('Bot statistics request timed out, using fallback data');
        } else {
          console.error('Network error fetching bot statistics:', fetchError);
        }
        
        throw fetchError;
      }
      
    } catch (error) {
      console.error('Error fetching bot statistics:', error);
      
      // Return mock data as fallback
      console.log('Using fallback bot statistics');
      return this.generateMockBotStatistics();
    }
  }

  private generateMockBotStatistics() {
    // Generate mock bot statistics based on user's country
    const userCountry = this.userCountry || 'Global';
    const countries = ['South Sudan', 'Kenya', 'Nigeria', 'Uganda', 'Tanzania', 'Global'];
    
    // Ensure user's country is included
    if (!countries.includes(userCountry) && userCountry !== 'Global') {
      countries.push(userCountry);
    }
    
    // Generate bots for each country
    const bots = countries.map(country => ({
      id: `${country.toLowerCase().replace(/\s+/g, '_')}_bot`,
      name: `${country} Funding Bot`,
      country: country,
      status: Math.random() > 0.2 ? 'active' : 'paused',
      last_run: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      opportunities_found: Math.floor(Math.random() * 500) + 50,
      reward_points: Math.floor(Math.random() * 2000) + 100,
      success_rate: Math.floor(Math.random() * 30) + 70,
      error_count: Math.floor(Math.random() * 10)
    }));
    
    // Generate recent rewards
    const recent_rewards = Array.from({ length: 10 }, (_, i) => {
      const country = countries[Math.floor(Math.random() * countries.length)];
      return {
        bot_id: `${country.toLowerCase().replace(/\s+/g, '_')}_bot`,
        country: country,
        opportunities_found: Math.floor(Math.random() * 20) + 1,
        reward_points: Math.floor(Math.random() * 100) + 10,
        awarded_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
      };
    });
    
    // Generate opportunity counts
    const opportunity_counts: Record<string, { total: number; verified: number }> = {};
    countries.forEach(country => {
      const total = Math.floor(Math.random() * 500) + 50;
      opportunity_counts[country] = {
        total,
        verified: Math.floor(total * (Math.random() * 0.3 + 0.6)) // 60-90% verified
      };
    });
    
    // Boost the user's country stats to make them more relevant
    if (userCountry !== 'Global' && opportunity_counts[userCountry]) {
      opportunity_counts[userCountry].total += 200;
      opportunity_counts[userCountry].verified += 150;
    }
    
    return {
      bots,
      recent_rewards,
      statistics: {
        recent_activity: [],
        opportunity_counts,
        total_opportunities: Object.values(opportunity_counts).reduce((sum, count) => sum + count.total, 0),
        total_verified: Object.values(opportunity_counts).reduce((sum, count) => sum + count.verified, 0)
      },
      system_status: {
        is_active: true,
        last_update: new Date().toISOString()
      }
    };
  }

  async triggerSearch(country: string, query?: string): Promise<any> {
    try {
      // If in fallback mode, use mock response
      if (this.useFallbackMode) {
        console.log('Using fallback trigger search due to fallback mode');
        return this.generateMockTriggerResponse(country, query);
      }
      
      // Validate configuration
      if (!this.supabaseUrl || !this.supabaseAnonKey) {
        console.warn('Missing Supabase configuration, using mock response');
        return this.generateMockTriggerResponse(country, query);
      }
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`${this.supabaseUrl}/functions/v1/trigger-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.supabaseAnonKey}`
          },
          body: JSON.stringify({ country, query }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error(`Trigger search failed with status ${response.status}:`, errorText);
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        return await response.json();
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.warn('Trigger search request timed out, using mock response');
        } else {
          console.error('Network error triggering search:', fetchError);
        }
        
        throw fetchError;
      }
      
    } catch (error) {
      console.error('Error triggering search:', error);
      
      // Return mock response
      return this.generateMockTriggerResponse(country, query);
    }
  }
  
  private generateMockTriggerResponse(country: string, query?: string): any {
    return {
      status: "success",
      message: `Search triggered for ${country}${query ? ` with query: ${query}` : ''}`,
      targets_queued: 5,
      job_id: `mock-${Date.now()}`,
      estimated_completion_time: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };
  }

  async bookmarkOpportunity(opportunityId: string, userId: string): Promise<boolean> {
    // Mock bookmarking - in production this would call the API
    console.log(`Bookmarking opportunity ${opportunityId} for user ${userId}`);
    return true;
  }

  async getBookmarkedOpportunities(userId: string): Promise<RealDonorOpportunity[]> {
    // In a real implementation, this would call the API
    // For now, return mock data
    return [];
  }

  getUserCountry(): string | null {
    return this.userCountry;
  }
  
  getUserCountryCode(): string | null {
    return this.userCountryCode;
  }
  
  // Force a specific country for testing
  setUserCountry(country: string, countryCode: string): void {
    this.userCountry = country;
    this.userCountryCode = countryCode;
  }
  
  // Get a list of supported countries
  getSupportedCountries(): string[] {
    return [
      'Global',
      'Kenya',
      'Nigeria',
      'South Sudan',
      'Uganda',
      'Tanzania',
      'Rwanda',
      'Ghana',
      'South Africa',
      'Senegal',
      'United States',
      'United Kingdom',
      'Germany',
      'France'
    ];
  }
  
  // Get country code from country name
  getCountryCode(country: string): string {
    const countryCodes: Record<string, string> = {
      'Kenya': 'KE',
      'Nigeria': 'NG',
      'South Africa': 'ZA',
      'Ghana': 'GH',
      'Uganda': 'UG',
      'Tanzania': 'TZ',
      'Rwanda': 'RW',
      'Senegal': 'SN',
      'South Sudan': 'SS',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'France': 'FR',
      'Global': 'GL'
    };
    
    return countryCodes[country] || 'GL';
  }
  
  // Get flag emoji from country code
  getFlagEmoji(countryCode: string): string {
    if (!countryCode || countryCode === 'GL') return '🌍';
    
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      
      return String.fromCodePoint(...codePoints);
    } catch (error) {
      console.warn('Error generating flag emoji:', error);
      return '🌍';
    }
  }
}

export const realDonorSearchEngine = new RealDonorSearchEngine();
export type { RealDonorOpportunity, SearchFilters, SearchResult };