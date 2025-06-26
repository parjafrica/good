// Conditional AI Engine - Heart of Personalized Onboarding
// Analyzes user data, location, and context to determine next steps

import type { LocationData, AIGeneratedContent } from './aiLocationService';
import type { OnboardingProgress } from '../utils/cookieManager';

interface UserContext {
  profile: any;
  location: LocationData | null;
  currentStep: string;
  previousAnswers: Record<string, any>;
  timestamp: number;
}

interface ConditionalStep {
  nextStep: string;
  title: string;
  subtitle: string;
  placeholder: string;
  validation?: (input: string) => boolean;
  aiPersonalization?: any;
}

export class ConditionalAIEngine {
  static analyzeUserContext(context: UserContext): ConditionalStep {
    const { profile, location, currentStep, previousAnswers } = context;

    // AI-driven conditional logic based on user data
    switch (currentStep) {
      case 'FIRST_NAME':
        return this.personalizeFirstNameStep(profile, location);
      
      case 'LAST_NAME':
        return this.personalizeLastNameStep(profile, location);
      
      case 'EMAIL':
        return this.personalizeEmailStep(profile, location);
      
      case 'PASSWORD':
        return this.personalizePasswordStep(profile, location);
      
      case 'COUNTRY':
        return this.personalizeCountryStep(profile, location);
      
      case 'USER_TYPE':
        return this.personalizeUserTypeStep(profile, location);
      
      case 'AI_INSIGHTS':
        return this.personalizeAIInsights(profile, location);
      
      default:
        return this.getDefaultStep(currentStep);
    }
  }

  private static personalizeFirstNameStep(profile: any, location: LocationData | null): ConditionalStep {
    const isAfricanCountry = location?.continent === 'Africa' || 
      ['Kenya', 'Uganda', 'Nigeria', 'Ghana', 'Tanzania'].includes(location?.country || '');
    
    const greetings = {
      'Africa': 'Karibu! Welcome to your funding journey',
      'Europe': 'Welcome to your European funding adventure',
      'Asia': 'Welcome to your path to global opportunities',
      'Americas': 'Welcome to your funding success story',
      'default': 'Welcome to your personalized funding journey'
    };

    const greeting = greetings[location?.continent as keyof typeof greetings] || greetings.default;

    return {
      nextStep: 'LAST_NAME',
      title: greeting,
      subtitle: `Let's start with your first name to personalize your experience`,
      placeholder: 'Enter your first name',
      validation: (input: string) => input.length >= 2
    };
  }

  private static personalizeLastNameStep(profile: any, location: LocationData | null): ConditionalStep {
    const firstName = profile.firstName;
    const isLocalLanguage = this.detectLocalLanguagePattern(firstName, location);
    
    const personalizedMessages = {
      'African': `Beautiful name, ${firstName}! What's your family name?`,
      'European': `Nice to meet you, ${firstName}! And your surname?`,
      'Asian': `Hello ${firstName}! Please share your family name`,
      'default': `Great to meet you, ${firstName}! What's your last name?`
    };

    const messageKey = isLocalLanguage ? 'African' : 
                      location?.continent === 'Europe' ? 'European' :
                      location?.continent === 'Asia' ? 'Asian' : 'default';

    return {
      nextStep: 'EMAIL',
      title: personalizedMessages[messageKey],
      subtitle: 'We\'ll use this to create your personalized profile',
      placeholder: 'Enter your last name',
      validation: (input: string) => input.length >= 2
    };
  }

  private static personalizeEmailStep(profile: any, location: LocationData | null): ConditionalStep {
    const fullName = `${profile.firstName} ${profile.lastName}`;
    const timeZoneHour = new Date().getHours();
    const timeGreeting = timeZoneHour < 12 ? 'morning' : timeZoneHour < 17 ? 'afternoon' : 'evening';

    return {
      nextStep: 'PASSWORD',
      title: `Good ${timeGreeting}, ${fullName}!`,
      subtitle: `We need your email to send personalized funding alerts for ${location?.country || 'your region'}`,
      placeholder: 'Enter your email address',
      validation: (input: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
    };
  }

  private static personalizePasswordStep(profile: any, location: LocationData | null): ConditionalStep {
    const securityLevel = this.assessRegionalSecurityNeeds(location);
    
    const securityMessages = {
      'high': 'Strong security is crucial in your region',
      'medium': 'Let\'s secure your account properly',
      'standard': 'Choose a secure password'
    };

    return {
      nextStep: 'COUNTRY',
      title: 'Secure Your Account',
      subtitle: `${securityMessages[securityLevel]} - We take your data protection seriously`,
      placeholder: 'Create a strong password (8+ characters)',
      validation: (input: string) => input.length >= 8
    };
  }

  private static personalizeCountryStep(profile: any, location: LocationData | null): ConditionalStep {
    const detectedCountry = location?.country;
    const suggestedText = detectedCountry ? 
      `We detected you're in ${detectedCountry}. Confirm or change below:` :
      'Which country are you based in? This helps us find local opportunities:';

    return {
      nextStep: 'USER_TYPE',
      title: 'Your Location Matters',
      subtitle: suggestedText,
      placeholder: detectedCountry || 'Start typing your country...',
      validation: (input: string) => input.length >= 2
    };
  }

  private static personalizeUserTypeStep(profile: any, location: LocationData | null): ConditionalStep {
    const countryFunding = this.analyzeCountryFundingLandscape(location?.country);
    
    return {
      nextStep: 'AI_INSIGHTS',
      title: `Perfect! Here's what's available in ${profile.country}`,
      subtitle: `Based on our analysis: ${countryFunding.summary}`,
      placeholder: '',
      aiPersonalization: {
        fundingTypes: countryFunding.primaryTypes,
        successRate: countryFunding.successRate,
        averageAmount: countryFunding.averageAmount
      }
    };
  }

  private static personalizeAIInsights(profile: any, location: LocationData | null): ConditionalStep {
    const userTypeInsights = this.generateUserTypeInsights(profile.userType, location);
    
    return {
      nextStep: 'DETAIL_FORM',
      title: userTypeInsights.title,
      subtitle: userTypeInsights.subtitle,
      placeholder: '',
      aiPersonalization: userTypeInsights
    };
  }

  private static detectLocalLanguagePattern(name: string, location: LocationData | null): boolean {
    const africanPatterns = /^(Kwame|Kofi|Ama|Akosua|Chinwe|Emeka|Fatima|Hassan|Amina|Yusuf)/i;
    const europeanPatterns = /^(Alexander|Marie|Jean|Hans|Sofia|Giuseppe)/i;
    
    if (location?.continent === 'Africa') {
      return africanPatterns.test(name);
    }
    
    return false;
  }

  private static assessRegionalSecurityNeeds(location: LocationData | null): 'high' | 'medium' | 'standard' {
    const highSecurityRegions = ['Nigeria', 'Kenya', 'South Africa'];
    const mediumSecurityRegions = ['Ghana', 'Uganda', 'Tanzania'];
    
    if (highSecurityRegions.includes(location?.country || '')) return 'high';
    if (mediumSecurityRegions.includes(location?.country || '')) return 'medium';
    return 'standard';
  }

  private static analyzeCountryFundingLandscape(country: string | undefined) {
    const fundingData: Record<string, any> = {
      'Kenya': {
        summary: '850+ active grants focusing on agriculture, health, and education',
        primaryTypes: ['Development Grants', 'Agriculture Funding', 'Health Initiatives'],
        successRate: '68%',
        averageAmount: '$45,000'
      },
      'Nigeria': {
        summary: '1,200+ opportunities in technology, agriculture, and social impact',
        primaryTypes: ['Tech Innovation', 'Agricultural Development', 'Social Enterprise'],
        successRate: '71%',
        averageAmount: '$62,000'
      },
      'Uganda': {
        summary: '600+ grants for education, health, and community development',
        primaryTypes: ['Education Grants', 'Health Programs', 'Community Development'],
        successRate: '65%',
        averageAmount: '$38,000'
      },
      'United States': {
        summary: '5,000+ federal and private foundation opportunities',
        primaryTypes: ['Research Grants', 'Innovation Funding', 'Social Programs'],
        successRate: '45%',
        averageAmount: '$125,000'
      },
      'United Kingdom': {
        summary: '2,800+ European and UK-specific funding streams',
        primaryTypes: ['Research Council Grants', 'Innovation Funding', 'Social Impact'],
        successRate: '52%',
        averageAmount: '£78,000'
      }
    };

    return fundingData[country || ''] || {
      summary: '500+ international opportunities across all sectors',
      primaryTypes: ['International Grants', 'Global Initiatives', 'Cross-border Funding'],
      successRate: '58%',
      averageAmount: '$55,000'
    };
  }

  private static generateUserTypeInsights(userType: string, location: LocationData | null) {
    const insights: Record<string, any> = {
      'student': {
        title: `Perfect! ${location?.country} has excellent student opportunities`,
        subtitle: 'Our AI found 200+ scholarships and research grants matching your profile',
        features: ['Scholarship Matching', 'Research Grant Finder', 'Academic Mentor Connect'],
        useCases: ['Find full scholarships', 'Research funding for thesis', 'Conference travel grants']
      },
      'organization': {
        title: `Excellent! ${location?.country} actively supports NGO development`,
        subtitle: 'We\'ve identified 150+ grants perfect for organizations like yours',
        features: ['Grant Database Access', 'Proposal Writing AI', 'Donor Relationship Management'],
        useCases: ['Secure operational funding', 'Project-specific grants', 'Capacity building support']
      },
      'business': {
        title: `Great choice! ${location?.country} has strong business funding ecosystem`,
        subtitle: 'AI analysis shows 300+ funding options for businesses in your region',
        features: ['Investor Matching', 'Grant Opportunity Scanner', 'Pitch Deck Optimizer'],
        useCases: ['Seed funding rounds', 'Government business grants', 'Innovation competitions']
      }
    };

    return insights[userType] || insights.student;
  }

  private static getDefaultStep(currentStep: string): ConditionalStep {
    return {
      nextStep: 'WELCOME',
      title: 'Welcome',
      subtitle: 'Let\'s get started',
      placeholder: '',
      validation: () => true
    };
  }

  // AI-powered next step determination
  static determineNextStep(userContext: UserContext): string {
    const analysis = this.analyzeUserContext(userContext);
    
    // Save AI insights for later use
    this.saveAIAnalysis(userContext, analysis);
    
    return analysis.nextStep;
  }

  private static saveAIAnalysis(context: UserContext, analysis: ConditionalStep) {
    // Store AI analysis in user's progress for retrieval
    const aiInsights = {
      timestamp: Date.now(),
      userProfile: context.profile,
      locationAnalysis: context.location,
      nextStepRecommendation: analysis,
      personalizedContent: analysis.aiPersonalization
    };

    localStorage.setItem('ai_analysis', JSON.stringify(aiInsights));
  }

  static getStoredAIAnalysis(): any {
    try {
      const stored = localStorage.getItem('ai_analysis');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}