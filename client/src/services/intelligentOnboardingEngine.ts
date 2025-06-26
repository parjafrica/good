/**
 * Intelligent Onboarding Engine for Granada OS
 * Strategically collects comprehensive user information and payment preferences
 * Uses advanced timing and context analysis to maximize data collection
 */

export interface UserProfileData {
  // Basic Information - Critical
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  userType: 'student' | 'organization' | 'business' | '';
  
  // Contact Information - Strategic Collection
  primaryPhoneNumber?: string;
  whatsappNumber?: string;
  telegramHandle?: string;
  countryCode?: string;
  alternateEmail?: string;
  linkedinProfile?: string;
  twitterHandle?: string;
  facebookProfile?: string;
  personalWebsite?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // Demographics - Enhanced
  age?: number;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  timezone?: string;
  language?: string;
  preferredLanguage?: string;
  
  // Student-specific comprehensive fields
  educationLevel?: string;
  fieldOfStudy?: string;
  currentInstitution?: string;
  institutionCountry?: string;
  studentId?: string;
  graduationYear?: string;
  currentYear?: string;
  gpa?: string;
  academicAchievements?: string[];
  researchInterests?: string[];
  extracurricularActivities?: string[];
  scholarshipsReceived?: string[];
  mentorName?: string;
  mentorContact?: string;
  parentGuardianName?: string;
  parentGuardianPhone?: string;
  parentGuardianEmail?: string;
  financialNeed?: string;
  partTimeWork?: boolean;
  workExperience?: string;
  careerGoals?: string[];
  
  // Organization comprehensive fields
  organizationType?: string;
  organizationName?: string;
  organizationLegalName?: string;
  organizationSize?: string;
  organizationBudget?: string;
  yearsInOperation?: string;
  organizationMission?: string;
  organizationVision?: string;
  targetBeneficiaries?: string[];
  organizationRegistrationNumber?: string;
  taxExemptStatus?: string;
  organizationPhone?: string;
  organizationEmail?: string;
  organizationWebsite?: string;
  organizationAddress?: string;
  mainPrograms?: string[];
  position?: string;
  responsibilities?: string[];
  organizationAchievements?: string[];
  partnerOrganizations?: string[];
  
  // Business comprehensive fields
  businessType?: string;
  businessName?: string;
  businessLegalName?: string;
  businessStage?: string;
  industry?: string;
  subIndustry?: string;
  businessModel?: string;
  teamSize?: string;
  fullTimeEmployees?: number;
  partTimeEmployees?: number;
  contractors?: number;
  annualRevenue?: string;
  monthlyRevenue?: string;
  businessRegistrationNumber?: string;
  businessLicense?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessAddress?: string;
  businessDescription?: string;
  valueProposition?: string;
  targetMarket?: string;
  competitiveAdvantage?: string;
  mainProducts?: string[];
  mainServices?: string[];
  keyPartners?: string[];
  businessAchievements?: string[];
  intellectualProperty?: string[];
  
  // Financial & Payment Preferences - Strategic
  preferredPaymentMethod?: 'mobile_money' | 'bank_transfer' | 'credit_card' | 'paypal' | 'crypto';
  mobileMoneyprovider?: string;
  mobileMoneyNumber?: string;
  bankName?: string;
  bankCountry?: string;
  bankAccountType?: string;
  monthlyBudget?: string;
  fundingGoals?: string[];
  urgencyLevel?: 'immediate' | 'within_month' | 'within_quarter' | 'flexible';
  previousGrantExperience?: boolean;
  fundingAmountNeeded?: string;
  willingness_to_pay?: string;
  budgetConstraints?: string;
  
  // Interests and Goals - Personalization
  interests?: string[];
  primaryGoals?: string[];
  
  // System and Behavioral Data
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  operatingSystem?: string;
  browserType?: string;
  referralSource?: string;
  referralCode?: string;
  marketingConsent?: boolean;
  newsletterSubscription?: boolean;
  dataProcessingConsent?: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  placeholder: string;
  type: 'text' | 'email' | 'password' | 'select' | 'multiselect' | 'payment_preference' | 'financial_goals';
  required: boolean;
  options?: string[];
  validation?: (value: string) => boolean;
  contextualMessage?: string;
  showWhen?: (profile: Partial<UserProfileData>) => boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export class IntelligentOnboardingEngine {
  private static instance: IntelligentOnboardingEngine;
  private userProfile: Partial<UserProfileData> = {};
  private currentStepIndex = 0;
  private engagementMetrics = {
    timeStarted: Date.now(),
    stepsCompleted: 0,
    backtrackCount: 0,
    hesitationTime: 0,
    engagementScore: 0
  };

  static getInstance(): IntelligentOnboardingEngine {
    if (!IntelligentOnboardingEngine.instance) {
      IntelligentOnboardingEngine.instance = new IntelligentOnboardingEngine();
    }
    return IntelligentOnboardingEngine.instance;
  }

  private generateDynamicSteps(): OnboardingStep[] {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'firstName',
        title: 'Welcome to Granada OS! 👋',
        subtitle: 'Let\'s start with your first name',
        placeholder: 'Enter your first name',
        type: 'text',
        required: true,
        priority: 'critical'
      },
      {
        id: 'lastName',
        title: 'Nice to meet you! ✨',
        subtitle: 'What\'s your last name?',
        placeholder: 'Enter your last name',
        type: 'text',
        required: true,
        priority: 'critical'
      },
      {
        id: 'email',
        title: 'Your Digital Gateway 📧',
        subtitle: 'We\'ll use this to send you funding opportunities',
        placeholder: 'Enter your email address',
        type: 'email',
        required: true,
        priority: 'critical'
      },
      {
        id: 'password',
        title: 'Secure Your Account 🔐',
        subtitle: 'Create a strong password to protect your funding journey',
        placeholder: 'Create a secure password',
        type: 'password',
        required: true,
        priority: 'critical'
      },
      {
        id: 'country',
        title: 'Where Are You Based? 🌍',
        subtitle: 'This helps us find region-specific funding opportunities',
        placeholder: 'Select your country',
        type: 'select',
        required: true,
        priority: 'critical',
        options: ['Kenya', 'Uganda', 'Tanzania', 'Nigeria', 'Ghana', 'South Africa', 'United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia']
      },
      {
        id: 'userType',
        title: 'Choose Your Path 🚀',
        subtitle: 'This determines what opportunities we show you',
        placeholder: 'Select your category',
        type: 'select',
        required: true,
        priority: 'critical',
        options: ['student', 'organization', 'business']
      }
    ];

    // Add contextual steps based on user type
    const contextualSteps = this.generateContextualSteps();
    
    // Add payment preference steps at strategic moments
    const paymentSteps = this.generatePaymentSteps();
    
    // Add financial goal steps
    const financialSteps = this.generateFinancialSteps();

    return [...baseSteps, ...contextualSteps, ...paymentSteps, ...financialSteps];
  }

  private generateContextualSteps(): OnboardingStep[] {
    const steps: OnboardingStep[] = [];

    // Student-specific steps
    steps.push({
      id: 'educationLevel',
      title: 'Your Academic Journey 🎓',
      subtitle: 'This helps us find scholarships at your level',
      placeholder: 'Select your education level',
      type: 'select',
      required: false,
      priority: 'high',
      options: ['High School', 'Undergraduate', 'Graduate', 'PhD', 'Postdoc'],
      showWhen: (profile) => profile.userType === 'student'
    });

    steps.push({
      id: 'fieldOfStudy',
      title: 'Your Field of Study 📚',
      subtitle: 'We\'ll match you with field-specific funding',
      placeholder: 'e.g., Computer Science, Medicine, Engineering',
      type: 'text',
      required: false,
      priority: 'high',
      showWhen: (profile) => profile.userType === 'student'
    });

    // Organization-specific steps
    steps.push({
      id: 'organizationType',
      title: 'Organization Type 🏛️',
      subtitle: 'Different types qualify for different grants',
      placeholder: 'Select organization type',
      type: 'select',
      required: false,
      priority: 'high',
      options: ['NGO', 'Non-Profit', 'Community Group', 'Research Institution', 'Foundation'],
      showWhen: (profile) => profile.userType === 'organization'
    });

    steps.push({
      id: 'organizationName',
      title: 'Organization Name 🏢',
      subtitle: 'We\'ll verify your organization for better opportunities',
      placeholder: 'Enter your organization name',
      type: 'text',
      required: false,
      priority: 'high',
      showWhen: (profile) => profile.userType === 'organization'
    });

    // Business-specific steps
    steps.push({
      id: 'businessStage',
      title: 'Business Stage 🚀',
      subtitle: 'Different stages have different funding options',
      placeholder: 'Select your business stage',
      type: 'select',
      required: false,
      priority: 'high',
      options: ['Idea Stage', 'Pre-Revenue', 'Early Revenue', 'Growth Stage', 'Established'],
      showWhen: (profile) => profile.userType === 'business'
    });

    steps.push({
      id: 'industry',
      title: 'Your Industry 🏭',
      subtitle: 'Industry-specific grants are often the most lucrative',
      placeholder: 'e.g., Technology, Healthcare, Agriculture',
      type: 'text',
      required: false,
      priority: 'high',
      showWhen: (profile) => profile.userType === 'business'
    });

    return steps;
  }

  private generatePaymentSteps(): OnboardingStep[] {
    return [
      {
        id: 'paymentPreference',
        title: 'How Would You Prefer to Pay? 💳',
        subtitle: 'We offer multiple secure payment options to make funding accessible. This helps us provide the best payment experience for your region.',
        placeholder: 'Select preferred payment method',
        type: 'payment_preference',
        required: false,
        priority: 'medium',
        options: ['Mobile Money (M-Pesa, Airtel)', 'Bank Transfer', 'Credit/Debit Card', 'PayPal', 'Cryptocurrency'],
        contextualMessage: 'Knowing your payment preference helps us streamline your experience when you\'re ready to invest in premium features.'
      },
      {
        id: 'monthlyBudget',
        title: 'Investment Capacity 💰',
        subtitle: 'This helps us recommend the right service tier for you. All amounts are confidential and help us personalize your experience.',
        placeholder: 'Select your monthly budget range',
        type: 'select',
        required: false,
        priority: 'medium',
        options: ['$10-50', '$50-100', '$100-300', '$300-500', '$500+', 'Prefer not to say'],
        contextualMessage: 'Understanding your budget helps us show you the most cost-effective funding opportunities and service packages.'
      }
    ];
  }

  private generateFinancialSteps(): OnboardingStep[] {
    return [
      {
        id: 'fundingGoals',
        title: 'Your Funding Goals 🎯',
        subtitle: 'What are you hoping to achieve? This helps our AI prioritize opportunities for you.',
        placeholder: 'Select all that apply',
        type: 'multiselect',
        required: false,
        priority: 'high',
        options: [
          'Education/Tuition funding',
          'Research project funding',
          'Business startup capital',
          'Non-profit program funding',
          'Equipment/Infrastructure',
          'Emergency financial support',
          'Capacity building',
          'International expansion'
        ]
      },
      {
        id: 'urgencyLevel',
        title: 'Timeline for Funding ⏰',
        subtitle: 'When do you need funding? This affects which opportunities we prioritize for you.',
        placeholder: 'Select your timeline',
        type: 'select',
        required: false,
        priority: 'medium',
        options: ['Immediately (within 1 month)', 'Within 3 months', 'Within 6 months', 'Within 1 year', 'Flexible timeline']
      },
      {
        id: 'previousExperience',
        title: 'Funding Experience 📈',
        subtitle: 'Have you applied for grants or funding before? This helps us calibrate our recommendations.',
        placeholder: 'Select your experience level',
        type: 'select',
        required: false,
        priority: 'low',
        options: ['Never applied before', 'Applied but unsuccessful', 'Some success with small grants', 'Successfully secured major funding', 'Experienced fundraiser']
      }
    ];
  }

  public getNextStep(): OnboardingStep | null {
    const allSteps = this.generateDynamicSteps();
    const availableSteps = allSteps.filter(step => {
      if (!step.showWhen) return true;
      return step.showWhen(this.userProfile);
    });

    if (this.currentStepIndex >= availableSteps.length) {
      return null; // Onboarding complete
    }

    return availableSteps[this.currentStepIndex];
  }

  public updateUserProfile(stepId: string, value: any): void {
    this.userProfile[stepId as keyof UserProfileData] = value;
    this.engagementMetrics.stepsCompleted++;
    this.calculateEngagementScore();
  }

  public advanceStep(): boolean {
    this.currentStepIndex++;
    const nextStep = this.getNextStep();
    return nextStep !== null;
  }

  public goBackStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.engagementMetrics.backtrackCount++;
    }
  }

  private calculateEngagementScore(): void {
    const timeSpent = Date.now() - this.engagementMetrics.timeStarted;
    const minutesSpent = timeSpent / (1000 * 60);
    const stepsPerMinute = this.engagementMetrics.stepsCompleted / Math.max(minutesSpent, 1);
    
    // Higher score for optimal pace (not too fast, not too slow)
    let paceScore = 0;
    if (stepsPerMinute >= 0.5 && stepsPerMinute <= 2) {
      paceScore = 100;
    } else if (stepsPerMinute > 2) {
      paceScore = 70; // Too fast, might be rushing
    } else {
      paceScore = 50; // Too slow, might be distracted
    }

    // Penalty for backtracking
    const backtrackPenalty = this.engagementMetrics.backtrackCount * 10;
    
    this.engagementMetrics.engagementScore = Math.max(0, paceScore - backtrackPenalty);
  }

  public getEngagementInsights(): {
    score: number;
    shouldShowPaymentQuestion: boolean;
    shouldShowUrgencyQuestion: boolean;
    readyForAdvancedQuestions: boolean;
  } {
    const score = this.engagementMetrics.engagementScore;
    const stepsCompleted = this.engagementMetrics.stepsCompleted;
    
    return {
      score,
      shouldShowPaymentQuestion: score > 60 && stepsCompleted >= 4,
      shouldShowUrgencyQuestion: score > 50 && stepsCompleted >= 6,
      readyForAdvancedQuestions: score > 70 && stepsCompleted >= 5
    };
  }

  public getCurrentProfile(): Partial<UserProfileData> {
    return { ...this.userProfile };
  }

  public getCompletionPercentage(): number {
    const totalPossibleSteps = this.generateDynamicSteps().filter(step => {
      if (!step.showWhen) return true;
      return step.showWhen(this.userProfile);
    }).length;
    
    return Math.round((this.engagementMetrics.stepsCompleted / totalPossibleSteps) * 100);
  }

  public shouldShowSocialLogins(): boolean {
    // Show social logins after basic info is collected and engagement is good
    return this.engagementMetrics.stepsCompleted >= 3 && this.engagementMetrics.engagementScore > 50;
  }

  public generatePersonalizedMessage(): string {
    const profile = this.userProfile;
    const insights = this.getEngagementInsights();
    
    if (profile.userType === 'student') {
      return `Perfect! As a ${profile.educationLevel || 'student'} in ${profile.fieldOfStudy || 'your field'}, we'll find scholarships and grants specifically for you in ${profile.country}.`;
    } else if (profile.userType === 'organization') {
      return `Excellent! We'll help ${profile.organizationName || 'your organization'} find grants that match your mission and size.`;
    } else if (profile.userType === 'business') {
      return `Great! We'll connect your ${profile.businessStage || 'business'} in ${profile.industry || 'your industry'} with the right investors and grants.`;
    }
    
    return `Welcome ${profile.firstName}! We're building your personalized funding dashboard.`;
  }

  public reset(): void {
    this.userProfile = {};
    this.currentStepIndex = 0;
    this.engagementMetrics = {
      timeStarted: Date.now(),
      stepsCompleted: 0,
      backtrackCount: 0,
      hesitationTime: 0,
      engagementScore: 0
    };
  }
}

export const intelligentOnboarding = IntelligentOnboardingEngine.getInstance();