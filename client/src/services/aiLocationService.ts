// AI-Powered Location Service with VPN Bypass
// Generates dynamic, localized content using DeepSeek AI

interface LocationData {
  country: string;
  region: string;
  city: string;
  continent: string;
  timezone: string;
  currency: string;
  language: string;
  confidence: number;
}

interface AIGeneratedContent {
  successStories: {
    name: string;
    type: string;
    achievement: string;
    amount: string;
    quote: string;
    image: string;
    color: string;
    location: string;
  }[];
  localOpportunities: {
    title: string;
    organization: string;
    amount: string;
    deadline: string;
    description: string;
  }[];
  culturalInsights: {
    greeting: string;
    currency: string;
    timeFormat: string;
    priorities: string[];
    challenges: string[];
  };
}

class AILocationService {
  private detectionMethods = [
    // Multiple location detection APIs to bypass VPN
    'ipapi.co',
    'ipinfo.io', 
    'geoip-db.com',
    'ip-api.com',
    'ipstack.com'
  ];

  private fallbackCountries = {
    'UTC+3': ['Kenya', 'Uganda', 'Tanzania', 'Ethiopia'],
    'UTC+2': ['South Africa', 'Egypt', 'Botswana'],
    'UTC+1': ['Nigeria', 'Ghana', 'Morocco'],
    'UTC+0': ['United Kingdom', 'Ireland', 'Portugal'],
    'UTC-5': ['United States', 'Canada', 'Mexico'],
    'UTC+8': ['China', 'Singapore', 'Malaysia'],
    'UTC+9': ['Japan', 'South Korea'],
    'UTC+5:30': ['India', 'Sri Lanka'],
  };

  private cache = new Map<string, { data: LocationData; timestamp: number }>();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes

  async detectLocation(): Promise<LocationData> {
    // Try cached result first
    const cached = this.getCachedLocation();
    if (cached) return cached;

    // Multi-method detection to bypass VPN
    const detectionPromises = [
      this.detectViaTimeZone(),
      this.detectViaLanguage(),
      this.detectViaMultipleAPIs(),
      this.detectViaNetworkTiming(),
    ];

    try {
      const results = await Promise.allSettled(detectionPromises);
      const validResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<LocationData>).value);

      if (validResults.length === 0) {
        return this.getFallbackLocation();
      }

      // Use confidence scoring to select best result
      const bestResult = validResults.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      this.cacheLocation(bestResult);
      console.log('User country detected:', bestResult.country);
      return bestResult;
    } catch (error) {
      console.warn('Location detection failed, using fallback:', error);
      return this.getFallbackLocation();
    }
  }

  private async detectViaTimeZone(): Promise<LocationData> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset() / -60;
    const offsetStr = `UTC${offset >= 0 ? '+' : ''}${offset}`;
    
    const possibleCountries = this.fallbackCountries[offsetStr] || ['Unknown'];
    const country = possibleCountries[0];

    return {
      country,
      region: 'Detected via timezone',
      city: 'Unknown',
      continent: this.getContinent(country),
      timezone,
      currency: this.getCurrency(country),
      language: navigator.language.split('-')[0],
      confidence: 0.6
    };
  }

  private async detectViaLanguage(): Promise<LocationData> {
    const language = navigator.language;
    const languageMap = {
      'en-US': 'United States',
      'en-GB': 'United Kingdom', 
      'en-CA': 'Canada',
      'fr': 'France',
      'de': 'Germany',
      'es': 'Spain',
      'pt': 'Portugal',
      'sw': 'Kenya', // Swahili
      'am': 'Ethiopia', // Amharic
      'ar': 'Egypt',
      'zh': 'China',
      'ja': 'Japan',
      'ko': 'South Korea',
      'hi': 'India'
    };

    const country = languageMap[language] || languageMap[language.split('-')[0]] || 'Unknown';

    return {
      country,
      region: 'Detected via language',
      city: 'Unknown',
      continent: this.getContinent(country),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: this.getCurrency(country),
      language: language.split('-')[0],
      confidence: 0.4
    };
  }

  private async detectViaMultipleAPIs(): Promise<LocationData> {
    // Try multiple IP geolocation services
    const apis = [
      'https://ipapi.co/json/',
      'https://ipinfo.io/json',
      'https://api.ipgeolocation.io/ipgeo?apiKey=free'
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          return this.normalizeAPIResponse(data);
        }
      } catch (error) {
        console.warn(`API ${api} failed:`, error);
        continue;
      }
    }

    throw new Error('All IP geolocation APIs failed');
  }

  private async detectViaNetworkTiming(): Promise<LocationData> {
    // Network latency-based detection (approximate)
    const testServers = [
      { url: 'https://www.google.com', region: 'Global', countries: ['United States'] },
      { url: 'https://www.baidu.com', region: 'Asia', countries: ['China', 'Japan', 'South Korea'] },
      { url: 'https://yandex.com', region: 'Europe/Russia', countries: ['Russia', 'Ukraine'] }
    ];

    const latencies = await Promise.all(
      testServers.map(async server => {
        try {
          const start = performance.now();
          await fetch(server.url, { method: 'HEAD', mode: 'no-cors' });
          const latency = performance.now() - start;
          return { ...server, latency };
        } catch {
          return { ...server, latency: Infinity };
        }
      })
    );

    const fastest = latencies.reduce((best, current) => 
      current.latency < best.latency ? current : best
    );

    const country = fastest.countries[0];
    return {
      country,
      region: fastest.region,
      city: 'Unknown',
      continent: this.getContinent(country),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: this.getCurrency(country),
      language: navigator.language.split('-')[0],
      confidence: 0.3
    };
  }

  private normalizeAPIResponse(data: any): LocationData {
    return {
      country: data.country_name || data.country || data.countryName || 'Unknown',
      region: data.region || data.regionName || data.region_name || 'Unknown',
      city: data.city || data.cityName || data.city_name || 'Unknown',
      continent: data.continent || this.getContinent(data.country_name || data.country),
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: data.currency || this.getCurrency(data.country_name || data.country),
      language: navigator.language.split('-')[0],
      confidence: 0.8
    };
  }

  private getCachedLocation(): LocationData | null {
    const cacheKey = 'location_detection';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    return null;
  }

  private cacheLocation(location: LocationData): void {
    const cacheKey = 'location_detection';
    this.cache.set(cacheKey, {
      data: location,
      timestamp: Date.now()
    });
    
    // Also store in localStorage for persistence
    localStorage.setItem('user_location', JSON.stringify({
      ...location,
      timestamp: Date.now()
    }));
  }

  private getFallbackLocation(): LocationData {
    // Try localStorage first
    const stored = localStorage.getItem('user_location');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < this.cacheTimeout) {
          return parsed;
        }
      } catch (error) {
        console.warn('Failed to parse stored location:', error);
      }
    }

    // Ultimate fallback based on timezone
    const offset = new Date().getTimezoneOffset() / -60;
    const offsetStr = `UTC${offset >= 0 ? '+' : ''}${offset}`;
    const possibleCountries = this.fallbackCountries[offsetStr] || ['Kenya']; // Default to Kenya for East Africa
    const country = possibleCountries[0];

    return {
      country,
      region: 'Fallback detection',
      city: 'Unknown',
      continent: this.getContinent(country),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: this.getCurrency(country),
      language: 'en',
      confidence: 0.2
    };
  }

  async generateLocalizedContent(location: LocationData, userType: 'student' | 'organization' | 'business'): Promise<AIGeneratedContent> {
    try {
      // Call AI service to generate localized content
      const response = await fetch('/api/ai/generate-localized-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          userType,
          prompt: `Generate realistic, localized success stories and opportunities for ${userType} users in ${location.country}, ${location.continent}. Include:
          1. 6 diverse success stories with real names, achievements, and funding amounts relevant to ${location.country}
          2. Local funding opportunities available in ${location.region}
          3. Cultural insights and priorities for ${location.country}
          4. Use local currency ${location.currency} for amounts
          5. Consider local challenges and opportunities in ${location.continent}
          6. Make content authentic and region-specific`
        })
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('AI content generation failed');
      }
    } catch (error) {
      console.warn('AI content generation failed, using fallback:', error);
      return this.getFallbackContent(location, userType);
    }
  }

  private getFallbackContent(location: LocationData, userType: string): AIGeneratedContent {
    // Localized fallback content based on detected country
    const isAfrica = ['Kenya', 'Uganda', 'Tanzania', 'Ethiopia', 'Nigeria', 'Ghana', 'South Africa'].includes(location.country);
    const isAsia = ['China', 'Japan', 'India', 'Singapore', 'Malaysia'].includes(location.country);
    const isEurope = ['United Kingdom', 'Germany', 'France', 'Netherlands'].includes(location.country);

    const regionalContent = {
      africa: {
        successStories: [
          {
            name: "Amina Hassan",
            type: "University of Nairobi Student",
            achievement: `Secured ${location.currency} 2.5M scholarship for Agricultural Innovation`,
            amount: `${location.currency} 2.5M`,
            quote: "Granada OS connected me with USAID funding I never knew existed!",
            image: "👩‍🎓",
            color: "from-green-500 to-emerald-500",
            location: location.country
          },
          {
            name: "East Africa Development Initiative",
            type: "NGO",
            achievement: `Received ${location.currency} 15M grant for rural education in ${location.country}`,
            amount: `${location.currency} 15M`,
            quote: "The platform helped us connect with Gates Foundation funding.",
            image: "🌍",
            color: "from-blue-500 to-cyan-500",
            location: location.country
          }
        ]
      },
      asia: {
        successStories: [
          {
            name: "Chen Wei",
            type: "Tech Student",
            achievement: `Won ${location.currency} 500,000 innovation scholarship`,
            amount: `${location.currency} 500K`,
            quote: "AI matching found perfect opportunities for my research!",
            image: "👨‍💻",
            color: "from-purple-500 to-pink-500",
            location: location.country
          }
        ]
      },
      europe: {
        successStories: [
          {
            name: "Sophie Mueller",
            type: "EU Student",
            achievement: `Secured €75,000 Erasmus+ research grant`,
            amount: "€75K",
            quote: "Found perfect European funding matches through Granada OS!",
            image: "🎓",
            color: "from-blue-500 to-purple-500",
            location: location.country
          }
        ]
      }
    };

    const region = isAfrica ? 'africa' : isAsia ? 'asia' : isEurope ? 'europe' : 'africa';
    const content = regionalContent[region];

    return {
      successStories: content.successStories,
      localOpportunities: [
        {
          title: `${location.country} Innovation Fund`,
          organization: "Local Development Agency",
          amount: `${location.currency} 5M`,
          deadline: "Next month",
          description: `Supporting ${userType} projects in ${location.country}`
        }
      ],
      culturalInsights: {
        greeting: this.getLocalGreeting(location.country),
        currency: location.currency,
        timeFormat: this.getTimeFormat(location.country),
        priorities: this.getLocalPriorities(location.country),
        challenges: this.getLocalChallenges(location.country)
      }
    };
  }

  private getContinent(country: string): string {
    const continentMap = {
      'Kenya': 'Africa', 'Uganda': 'Africa', 'Tanzania': 'Africa', 'Ethiopia': 'Africa',
      'Nigeria': 'Africa', 'Ghana': 'Africa', 'South Africa': 'Africa', 'Egypt': 'Africa',
      'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
      'United Kingdom': 'Europe', 'Germany': 'Europe', 'France': 'Europe', 'Spain': 'Europe',
      'China': 'Asia', 'Japan': 'Asia', 'India': 'Asia', 'South Korea': 'Asia'
    };
    return continentMap[country] || 'Unknown';
  }

  private getCurrency(country: string): string {
    const currencyMap = {
      'Kenya': 'KES', 'Uganda': 'UGX', 'Tanzania': 'TZS', 'Ethiopia': 'ETB',
      'Nigeria': 'NGN', 'Ghana': 'GHS', 'South Africa': 'ZAR', 'Egypt': 'EGP',
      'United States': 'USD', 'Canada': 'CAD', 'Mexico': 'MXN',
      'United Kingdom': 'GBP', 'Germany': 'EUR', 'France': 'EUR', 'Spain': 'EUR',
      'China': 'CNY', 'Japan': 'JPY', 'India': 'INR', 'South Korea': 'KRW'
    };
    return currencyMap[country] || 'USD';
  }

  private getLocalGreeting(country: string): string {
    const greetingMap = {
      'Kenya': 'Jambo', 'Uganda': 'Oli otya', 'Tanzania': 'Hujambo',
      'Ethiopia': 'Selam', 'Nigeria': 'Bawo', 'Ghana': 'Akwaaba',
      'France': 'Bonjour', 'Germany': 'Guten Tag', 'Spain': 'Hola',
      'China': 'Ni Hao', 'Japan': 'Konnichiwa', 'India': 'Namaste'
    };
    return greetingMap[country] || 'Hello';
  }

  private getTimeFormat(country: string): string {
    const formatMap = {
      'United States': '12-hour',
      'United Kingdom': '12-hour'
    };
    return formatMap[country] || '24-hour';
  }

  private getLocalPriorities(country: string): string[] {
    const priorityMap = {
      'Kenya': ['Agriculture', 'Education', 'Health', 'Technology'],
      'Uganda': ['Agriculture', 'Health', 'Education', 'Infrastructure'],
      'Nigeria': ['Technology', 'Oil & Gas', 'Agriculture', 'Education'],
      'Germany': ['Technology', 'Manufacturing', 'Renewable Energy', 'Research'],
      'China': ['Technology', 'Manufacturing', 'Infrastructure', 'Education']
    };
    return priorityMap[country] || ['Education', 'Technology', 'Health', 'Environment'];
  }

  private getLocalChallenges(country: string): string[] {
    const challengeMap = {
      'Kenya': ['Rural Development', 'Water Access', 'Youth Employment'],
      'Uganda': ['Infrastructure', 'Health Systems', 'Education Access'],
      'Nigeria': ['Infrastructure', 'Power Supply', 'Security'],
      'Germany': ['Climate Change', 'Digital Transformation', 'Aging Population'],
      'China': ['Environmental Protection', 'Rural-Urban Gap', 'Innovation']
    };
    return challengeMap[country] || ['Development', 'Infrastructure', 'Education'];
  }
}

export const aiLocationService = new AILocationService();
export type { LocationData, AIGeneratedContent };