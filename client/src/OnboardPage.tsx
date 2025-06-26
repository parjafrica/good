import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowRight, Sparkles, User, Building, DollarSign, CheckCircle, Star, TrendingUp, Globe, Award, Zap, Heart, Coffee, Users, Eye, EyeOff, Shield, Lock, Github, Mail, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiLocationService } from './services/aiLocationService';
import type { LocationData, AIGeneratedContent } from './services/aiLocationService';
import { CookieManager } from './utils/cookieManager';
import type { OnboardingProgress } from './utils/cookieManager';
import { ConditionalAIEngine } from './services/conditionalAIEngine';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  userType: 'student' | 'organization' | 'business';
  educationLevel?: string;
  fieldOfStudy?: string;
  studyCountry?: string;
  organizationType?: string;
  organizationName?: string;
  position?: string;
  organizationCountry?: string;
  businessType?: string;
  businessName?: string;
  businessStage?: string;
  industry?: string;
  businessCountry?: string;
  fundingExperience?: string;
}

const STEPS = {
  WELCOME: 'welcome',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName', 
  EMAIL: 'email',
  PASSWORD: 'password',
  COUNTRY: 'country',
  USER_TYPE: 'userType',
  STUDENT_DETAILS: 'studentDetails',
  ORGANIZATION_DETAILS: 'organizationDetails',
  BUSINESS_DETAILS: 'businessDetails',
  AI_INSIGHTS: 'aiInsights',
  SUCCESS_STORIES: 'successStories',
  COMPLETION: 'completion'
};

const successStories = [
  {
    name: "Sarah Chen",
    type: "MIT Student",
    achievement: "Secured $50,000 scholarship for Computer Science",
    image: "👩‍🎓",
    quote: "Granada OS helped me find scholarships I never knew existed!",
    amount: "$50K",
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Green Valley NGO",
    type: "Environmental Org",
    achievement: "Received $250,000 grant for climate education in Kenya",
    image: "🌱",
    quote: "The AI-powered matching was incredible - we found perfect funders.",
    amount: "$250K",
    color: "from-green-500 to-emerald-500"
  },
  {
    name: "TechStart Solutions",
    type: "Tech Startup",
    achievement: "Raised $2M seed funding through platform connections",
    image: "🚀",
    quote: "From idea to funding in 6 months - Granada OS made it possible.",
    amount: "$2M",
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Maria Rodriguez",
    type: "Medical Student",
    achievement: "Won $75,000 medical research fellowship",
    image: "🩺",
    quote: "The personalized recommendations matched my research perfectly.",
    amount: "$75K",
    color: "from-red-500 to-rose-500"
  },
  {
    name: "African Education Fund",
    type: "Education NGO",
    achievement: "Secured $500,000 for rural school development",
    image: "📚",
    quote: "Granada OS connects us to funders who truly understand our mission.",
    amount: "$500K",
    color: "from-orange-500 to-yellow-500"
  },
  {
    name: "EcoTech Innovations",
    type: "Clean Energy Startup",
    achievement: "Raised $1.5M for sustainable technology development",
    image: "⚡",
    quote: "The platform's network opened doors we couldn't reach alone.",
    amount: "$1.5M",
    color: "from-teal-500 to-green-500"
  }
];

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 
  'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 
  'Denmark', 'Egypt', 'Ethiopia', 'Finland', 'France', 'Germany', 'Ghana', 
  'Greece', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 
  'Japan', 'Jordan', 'Kenya', 'South Korea', 'Lebanon', 'Malaysia', 'Mexico', 
  'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 
  'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 
  'South Africa', 'South Sudan', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 
  'Turkey', 'Uganda', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam'
];

const aiInsights = {
  student: {
    title: "AI-Powered Student Success",
    insights: [
      "Smart scholarship matching based on your academic profile",
      "Deadline tracking with personalized reminders",
      "Essay optimization with AI writing assistance",
      "Interview preparation with expert guidance"
    ],
    useCases: [
      "Find scholarships for specific fields of study",
      "Get matched with international exchange programs",
      "Access research funding opportunities",
      "Connect with mentorship programs"
    ]
  },
  organization: {
    title: "Intelligent Organization Funding",
    insights: [
      "AI analysis of grant requirements vs. your mission",
      "Automated proposal generation and optimization",
      "Funder relationship mapping and insights",
      "Impact measurement and reporting tools"
    ],
    useCases: [
      "Secure funding for community development projects",
      "Find donors for humanitarian initiatives",
      "Access capacity building grants",
      "Connect with corporate social responsibility programs"
    ]
  },
  business: {
    title: "Smart Business Growth Funding",
    insights: [
      "Investor matching based on industry and stage",
      "AI-powered pitch deck optimization",
      "Market analysis and competitive intelligence",
      "Financial projections and modeling assistance"
    ],
    useCases: [
      "Raise seed funding for tech startups",
      "Secure grants for sustainable businesses",
      "Connect with angel investors and VCs",
      "Access government innovation programs"
    ]
  }
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

const validateCountry = (country: string): boolean => {
  return countries.includes(country);
};

export default function OnboardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    userType: 'student'
  });
  const [currentInput, setCurrentInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [aiContent, setAiContent] = useState<AIGeneratedContent | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Initialize onboarding with database-driven progress restoration and AI personalization
  useEffect(() => {
    const initializeOnboarding = async () => {
      try {
        setIsLoadingLocation(true);
        
        // Check for existing progress first - this is the heart of the experience
        const savedProgress = CookieManager.loadProgress();
        if (savedProgress && !hasRestoredProgress) {
          setHasRestoredProgress(true);
          setShowResumePrompt(true);
          
          // Restore complete user state from database/cookies
          if (savedProgress.userProfile) {
            setUserProfile(prev => ({ ...prev, ...savedProgress.userProfile }));
            setCurrentInput(savedProgress.userProfile.firstName || '');
          }
          if (savedProgress.userLocation) {
            setUserLocation(savedProgress.userLocation);
          }
          if (savedProgress.currentStep) {
            setCurrentStep(savedProgress.currentStep as any);
          }
        }

        // AI-powered location detection for personalization
        const location = savedProgress?.userLocation || await aiLocationService.detectLocation();
        setUserLocation(location);
        
        // Generate fully personalized AI content based on complete user profile
        const userType = savedProgress?.userProfile?.userType || 'student';
        const content = await aiLocationService.generateLocalizedContent(location, userType);
        setAiContent(content);

        // Save progress to database for cross-device synchronization
        if (savedProgress) {
          CookieManager.saveProgress({
            currentStep: currentStep,
            userProfile: userProfile,
            userLocation: location,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.warn('Failed to initialize personalized onboarding:', error);
        // Use intelligent fallback with basic personalization
        const fallbackLocation = { country: 'Global', countryCode: 'GL', continent: 'Global', timezone: 'UTC' };
        setUserLocation(fallbackLocation);
        
        const fallbackContent = await aiLocationService.generateLocalizedContent(fallbackLocation, 'student');
        setAiContent(fallbackContent);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    initializeOnboarding();
  }, [hasRestoredProgress]);

  // Auto-rotate success stories continuously using AI-generated content
  useEffect(() => {
    const stories = aiContent?.successStories || successStories;
    const timer = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [aiContent]);

  // Filter countries based on input
  useEffect(() => {
    if (currentStep === STEPS.COUNTRY && currentInput) {
      const filtered = countries.filter(country => 
        country.toLowerCase().includes(currentInput.toLowerCase())
      );
      setFilteredCountries(filtered);
      setShowCountryDropdown(filtered.length > 0);
    } else {
      setShowCountryDropdown(false);
    }
  }, [currentInput, currentStep]);

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    setError('');
    
    // Build updated profile for conditional AI analysis
    const updatedProfile = { ...userProfile };
    if (currentStep === STEPS.FIRST_NAME) updatedProfile.firstName = currentInput;
    if (currentStep === STEPS.LAST_NAME) updatedProfile.lastName = currentInput;
    if (currentStep === STEPS.EMAIL) updatedProfile.email = currentInput;
    if (currentStep === STEPS.PASSWORD) updatedProfile.password = currentInput;
    if (currentStep === STEPS.COUNTRY) updatedProfile.country = currentInput;

    // AI-powered conditional step analysis BEFORE proceeding
    const userContext = {
      profile: updatedProfile,
      location: userLocation,
      currentStep: currentStep,
      previousAnswers: {},
      timestamp: Date.now()
    };

    // Use conditional AI engine to analyze and modify next step
    const conditionalStep = ConditionalAIEngine.analyzeUserContext(userContext);
    
    // Validate current input based on AI-generated validation
    if (conditionalStep.validation && !conditionalStep.validation(currentInput)) {
      setError(`Please provide valid input - ${conditionalStep.subtitle}`);
      return;
    }

    // Standard validation with AI-enhanced error messages
    if (currentStep === STEPS.FIRST_NAME) {
      if (!validateName(currentInput)) {
        setError('Please enter at least 2 characters for your first name');
        return;
      }
      updateProfile('firstName', currentInput);
      setCurrentStep(STEPS.LAST_NAME);
      setCurrentInput('');
    } else if (currentStep === STEPS.LAST_NAME) {
      if (!validateName(currentInput)) {
        setError('Please enter at least 2 characters for your last name');
        return;
      }
      updateProfile('lastName', currentInput);
      setCurrentStep(STEPS.EMAIL);
      setCurrentInput('');
    } else if (currentStep === STEPS.EMAIL) {
      if (!validateEmail(currentInput)) {
        setError('Please enter a valid email address');
        return;
      }
      updateProfile('email', currentInput);
      setCurrentStep(STEPS.PASSWORD);
      setCurrentInput('');
    } else if (currentStep === STEPS.PASSWORD) {
      if (!validatePassword(currentInput)) {
        setError('Password must be at least 8 characters long');
        return;
      }
      updateProfile('password', currentInput);
      setCurrentStep(STEPS.COUNTRY);
      setCurrentInput('');
    } else if (currentStep === STEPS.COUNTRY) {
      if (!validateCountry(currentInput)) {
        setError('Please select a valid country from the list');
        return;
      }
      updateProfile('country', currentInput);
      setCurrentStep(STEPS.USER_TYPE);
      setCurrentInput('');
    }

    // CRITICAL: Save comprehensive data for AI bot training after each step
    const behaviorData = {
      user_id: updatedProfile.email || 'anonymous',
      action: `completed_step_${currentStep}`,
      page: 'onboarding',
      metadata: {
        stepData: currentInput,
        profileSoFar: updatedProfile,
        locationData: userLocation,
        aiAnalysis: conditionalStep,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        timeSpent: Date.now() - (userContext.timestamp || Date.now())
      }
    };

    // Track behavior for AI bot training
    try {
      await fetch('/api/personalization/track-behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(behaviorData)
      });
    } catch (error) {
      console.warn('Behavior tracking failed:', error);
    }

    // Save progress with enhanced data collection
    CookieManager.saveProgress({
      currentStep: currentStep,
      userProfile: updatedProfile,
      userLocation: userLocation,
      timestamp: Date.now()
    });
  };

  const handleCountrySelect = (country: string) => {
    setCurrentInput(country);
    setShowCountryDropdown(false);
    updateProfile('country', country);
    setTimeout(() => {
      setCurrentStep(STEPS.USER_TYPE);
      setCurrentInput('');
    }, 500);
  };

  const handleUserTypeSelect = async (type: 'student' | 'organization' | 'business') => {
    updateProfile('userType', type);
    
    // Regenerate AI content for the selected user type
    if (userLocation) {
      try {
        const content = await aiLocationService.generateLocalizedContent(userLocation, type);
        setAiContent(content);
      } catch (error) {
        console.warn('Failed to regenerate AI content for user type:', error);
      }
    }
    
    setCurrentStep(STEPS.AI_INSIGHTS);
  };

  const proceedToDetails = () => {
    if (userProfile.userType === 'student') {
      setCurrentStep(STEPS.STUDENT_DETAILS);
    } else if (userProfile.userType === 'organization') {
      setCurrentStep(STEPS.ORGANIZATION_DETAILS);
    } else {
      setCurrentStep(STEPS.BUSINESS_DETAILS);
    }
  };

  const handleSelectChange = (field: keyof UserProfile, value: string) => {
    updateProfile(field, value);
  };

  const saveToDatabase = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to save user profile');
      }

      setTimeout(() => {
        if (userProfile.userType === 'student') {
          navigate('/student-dashboard');
        } else if (userProfile.userType === 'business') {
          navigate('/business-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const finishOnboarding = () => {
    setCurrentStep(STEPS.SUCCESS_STORIES);
    setTimeout(() => {
      setCurrentStep(STEPS.COMPLETION);
      saveToDatabase();
    }, 8000);
  };

  const handleSocialLogin = (provider: string) => {
    // Simulate social login - replace with actual implementation
    alert(`Social login with ${provider} will be implemented here`);
  };

  // Enhanced Mobile-Friendly Success Stories Footer with Animations and Visuals
  const SuccessStoriesFooter = () => {
    const stories = aiContent?.successStories || successStories;
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
      }, 4000); // Change every 4 seconds
      return () => clearInterval(interval);
    }, [stories.length]);

    const currentStory = stories[currentStoryIndex];
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 via-blue-900/95 to-green-900/95 backdrop-blur-md z-30 py-4 px-4 border-t border-white/20">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStoryIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between text-white"
            >
              {/* Left side - Story with visual elements */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Animated emoji/visual */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-2xl md:text-3xl flex-shrink-0"
                >
                  {currentStory.image || '🎉'}
                </motion.div>
                
                {/* Story text */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm md:text-base truncate">
                    💰 {currentStory.amount} - {currentStory.name}
                  </div>
                  <div className="text-xs md:text-sm text-white/80 truncate">
                    📍 {(currentStory as any).location || userLocation?.country} • {currentStory.achievement}
                  </div>
                </div>
              </div>
              
              {/* Right side - Happy people animations */}
              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                {['🎊', '👏', '🥳'].map((emoji, index) => (
                  <motion.div
                    key={index}
                    animate={{ 
                      y: [0, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut"
                    }}
                    className="text-lg md:text-xl"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Progress dots */}
          <div className="flex justify-center mt-3 space-x-2">
            {stories.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStoryIndex ? 'bg-white' : 'bg-white/40'
                }`}
                animate={{
                  scale: index === currentStoryIndex ? 1.2 : 1
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Input Component that prevents cursor jumping
  const EnhancedInput = ({ 
    value, 
    onChange, 
    placeholder, 
    type = "text",
    className = "",
    onKeyPress,
    autoFocus = false
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    className?: string;
    onKeyPress?: (e: React.KeyboardEvent) => void;
    autoFocus?: boolean;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Prevent cursor jumping by managing focus properly
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [autoFocus]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    };
    
    return (
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        className={`w-full px-6 py-4 bg-white/10 border-2 border-transparent rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 text-lg ${className}`}
        autoComplete="off"
        spellCheck={false}
      />
    );
  };

  // Improved animated reviews for mobile
  const AnimatedReviews = () => {
    const reviews = [
      { text: "Amazing platform! Got $50K in 2 weeks! 🎉", author: "Sarah K.", rating: 5, emoji: "🌟" },
      { text: "Found perfect grants for my startup 🚀", author: "Mike C.", rating: 5, emoji: "💼" },  
      { text: "Expert help saved me months of work! ⭐", author: "Lisa M.", rating: 5, emoji: "⚡" },
      { text: "Secured $150K for my NGO project! 💰", author: "John D.", rating: 5, emoji: "🎯" },
      { text: "Life-changing funding opportunities! 🙌", author: "Anna B.", rating: 5, emoji: "✨" },
      { text: "Best investment for my business! 📈", author: "David R.", rating: 5, emoji: "🚀" }
    ];
    
    const [visibleReviews, setVisibleReviews] = useState([0, 1, 2]);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setVisibleReviews(prev => prev.map(index => (index + 3) % reviews.length));
      }, 3000);
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {visibleReviews.map((reviewIndex, displayIndex) => {
            const review = reviews[reviewIndex];
            return (
              <motion.div
                key={`${reviewIndex}-${displayIndex}`}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ 
                  duration: 0.6,
                  delay: displayIndex * 0.1,
                  ease: "easeOut"
                }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-start space-x-3">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: displayIndex * 0.5
                    }}
                    className="text-2xl flex-shrink-0"
                  >
                    {review.emoji}
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium leading-relaxed">
                      {review.text}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white/70 text-xs font-medium">
                        {review.author}
                      </span>
                      <div className="flex space-x-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <motion.span
                            key={i}
                            animate={{ 
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.1 + displayIndex * 0.3
                            }}
                            className="text-yellow-400 text-sm"
                          >
                            ⭐
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  // Animated Form Input Component
  const AnimatedFormInput = ({ 
    title, 
    subtitle, 
    placeholder, 
    value, 
    type = "text",
    showToggle = false,
    isCountry = false
  }: {
    title: string;
    subtitle: string;
    placeholder: string;
    value: string;
    type?: string;
    showToggle?: boolean;
    isCountry?: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center max-w-md mx-auto"
    >
      <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 mb-8">{subtitle}</p>
      
      <div className="relative">
        <motion.div
          className="bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 p-8 rounded-2xl backdrop-blur-sm relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Animated border */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(45deg, #8b5cf6, #3b82f6, #10b981, #8b5cf6)',
              backgroundSize: '300% 300%',
              padding: '2px',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <div className="relative">
            <div className="relative">
              <Input
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentInput(e.target.value);
                  if (isCountry) {
                    setShowCountryDropdown(true);
                  }
                }}
                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleNext()}
                placeholder={placeholder}
                type={showToggle && !showPassword ? 'password' : 'text'}
                className="mb-4 bg-gray-800/50 border-gray-600 text-white text-lg p-4 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 pr-12 transition-colors duration-300"
              />
              
              {showToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
            </div>
            
            {/* Country Dropdown */}
            {isCountry && showCountryDropdown && filteredCountries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto"
              >
                {filteredCountries.slice(0, 8).map((country) => (
                  <button
                    key={country}
                    onClick={() => handleCountrySelect(country)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white transition-colors"
                  >
                    {country}
                  </button>
                ))}
              </motion.div>
            )}
            
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mb-4"
              >
                {error}
              </motion.p>
            )}
            
            <Button 
              onClick={handleNext}
              disabled={!currentInput.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-3 text-lg font-semibold"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            {/* Social Login Options */}
            {currentStep === STEPS.EMAIL && (
              <div className="mt-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleSocialLogin('Google')}
                    variant="outline"
                    className="border-gray-600 hover:bg-gray-700"
                  >
                    <Chrome className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleSocialLogin('GitHub')}
                    variant="outline"
                    className="border-gray-600 hover:bg-gray-700"
                  >
                    <Github className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleSocialLogin('Email')}
                    variant="outline"
                    className="border-gray-600 hover:bg-gray-700"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -50,
      transition: { duration: 0.4 }
    }
  };

  const renderWelcome = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-center max-w-4xl mx-auto"
    >
      <div className="mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Sparkles className="w-20 h-20 text-purple-400 mx-auto mb-6" />
        </motion.div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-6">
          Welcome to Granada OS
        </h1>
        <p className="text-2xl text-gray-300 mb-8">
          The world's most intelligent funding discovery platform
        </p>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Join thousands of students, organizations, and businesses who have successfully secured over $500M in funding through our AI-powered platform.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-6 rounded-xl border border-purple-500/30"
        >
          <Zap className="w-8 h-8 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Matching</h3>
          <p className="text-gray-400 text-sm">Our AI analyzes 50,000+ funding opportunities daily to find your perfect matches</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-6 rounded-xl border border-green-500/30"
        >
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">97% Success Rate</h3>
          <p className="text-gray-400 text-sm">Our users are 10x more likely to secure funding compared to traditional methods</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-6 rounded-xl border border-blue-500/30"
        >
          <Globe className="w-8 h-8 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Global Network</h3>
          <p className="text-gray-400 text-sm">Access to 15,000+ funders across 180+ countries worldwide</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center justify-center space-x-8 text-sm text-gray-400 mb-8"
      >
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          2-minute setup
        </div>
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          Personalized AI insights
        </div>
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          Secure & private
        </div>
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          Free to start
        </div>
      </motion.div>

      <Button 
        onClick={() => setCurrentStep(STEPS.FIRST_NAME)}
        size="lg"
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-12 py-4 text-lg font-semibold"
      >
        Begin Your Journey
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  const renderUserTypeSelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-center max-w-5xl mx-auto"
    >
      <h2 className="text-4xl font-bold text-white mb-3">
        Hi {userProfile.firstName}! What's your funding goal?
      </h2>
      <p className="text-gray-400 mb-12 text-lg">Choose your path to unlock personalized AI insights and opportunities</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.button
          whileHover={{ scale: 1.05, y: -10 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleUserTypeSelect('student')}
          className="p-8 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-2 border-purple-500/30 hover:border-purple-400 transition-all text-left group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-purple-800/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <User className="w-16 h-16 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold text-white mb-4">Individual Student</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Unlock scholarships, educational grants, and academic funding opportunities worldwide
          </p>
          <div className="text-left space-y-2">
            <div className="flex items-center text-purple-300 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              $2.3B+ in scholarships available
            </div>
            <div className="flex items-center text-purple-300 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              AI essay optimization
            </div>
            <div className="flex items-center text-purple-300 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Interview preparation
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -10 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleUserTypeSelect('organization')}
          className="p-8 rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 border-2 border-green-500/30 hover:border-green-400 transition-all text-left group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-green-800/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Building className="w-16 h-16 text-green-400 mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold text-white mb-4">Organization</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Access institutional funding for NGOs, non-profits, and community organizations
          </p>
          <div className="text-left space-y-2">
            <div className="flex items-center text-green-300 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              $50B+ in grants available
            </div>
            <div className="flex items-center text-green-300 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              AI proposal generation
            </div>
            <div className="flex items-center text-green-300 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Impact measurement tools
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -10 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleUserTypeSelect('business')}
          className="p-8 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-2 border-blue-500/30 hover:border-blue-400 transition-all text-left group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-800/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <DollarSign className="w-16 h-16 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold text-white mb-4">Business Entity</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Secure funding for startups, SMEs, and enterprises seeking growth capital
          </p>
          <div className="text-left space-y-2">
            <div className="flex items-center text-blue-300 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              $100B+ in investment available
            </div>
            <div className="flex items-center text-blue-300 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Investor matching
            </div>
            <div className="flex items-center text-blue-300 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Pitch deck optimization
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderAIInsights = () => {
    const insights = aiInsights[userProfile.userType];
    const themeColor = userProfile.userType === 'student' ? 'purple' : 
                      userProfile.userType === 'organization' ? 'green' : 'blue';

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-center max-w-4xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-white mb-3">{insights.title}</h2>
        <p className="text-gray-400 mb-12 text-lg">Here's how our AI will supercharge your funding journey</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className={`bg-gradient-to-br from-${themeColor}-600/20 to-${themeColor}-800/20 p-8 rounded-xl border border-${themeColor}-500/30`}>
            <Zap className={`w-12 h-12 text-${themeColor}-400 mx-auto mb-6`} />
            <h3 className="text-xl font-bold text-white mb-4">AI-Powered Features</h3>
            <div className="space-y-3 text-left">
              {insights.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <Star className={`w-4 h-4 text-${themeColor}-400 mr-3 mt-0.5 flex-shrink-0`} />
                  <span className="text-gray-300 text-sm">{insight}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className={`bg-gradient-to-br from-${themeColor}-600/20 to-${themeColor}-800/20 p-8 rounded-xl border border-${themeColor}-500/30`}>
            <Award className={`w-12 h-12 text-${themeColor}-400 mx-auto mb-6`} />
            <h3 className="text-xl font-bold text-white mb-4">Success Use Cases</h3>
            <div className="space-y-3 text-left">
              {insights.useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <CheckCircle className={`w-4 h-4 text-${themeColor}-400 mr-3 mt-0.5 flex-shrink-0`} />
                  <span className="text-gray-300 text-sm">{useCase}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <Button 
          onClick={proceedToDetails}
          size="lg"
          className={`bg-gradient-to-r from-${themeColor}-500 to-blue-500 hover:from-${themeColor}-600 hover:to-blue-600 px-8 py-4 text-lg`}
        >
          Get My Personalized Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    );
  };

  const renderSuccessStories = () => {
    const currentStory = successStories[currentStoryIndex];
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-3xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-white mb-3">Join Our Success Stories</h2>
        <p className="text-gray-400 mb-12 text-lg">While we prepare your personalized experience...</p>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStoryIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm"
          >
            <div className="text-6xl mb-4">{currentStory.image}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{currentStory.name}</h3>
            <p className="text-purple-400 mb-4 font-semibold">{currentStory.type}</p>
            <p className="text-lg text-green-400 mb-4 font-semibold">{currentStory.achievement}</p>
            <p className="text-gray-300 italic">"{currentStory.quote}"</p>
            
            <div className="flex justify-center mt-6 space-x-2">
              {successStories.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStoryIndex ? 'bg-purple-400 w-8' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">$500M+</p>
            <p className="text-gray-400 text-sm">Total Funding Secured</p>
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">25,000+</p>
            <p className="text-gray-400 text-sm">Successful Users</p>
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">4.9/5</p>
            <p className="text-gray-400 text-sm">User Rating</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDetailForm = () => {
    const isStudent = userProfile.userType === 'student';
    const isOrganization = userProfile.userType === 'organization';
    const isBusiness = userProfile.userType === 'business';
    const themeColor = isStudent ? 'purple' : isOrganization ? 'green' : 'blue';

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-center max-w-md mx-auto"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Tell us more about {isStudent ? 'your studies' : isOrganization ? 'your organization' : 'your business'}
        </h2>
        <p className="text-gray-400 mb-8">This helps our AI find the perfect opportunities for you</p>
        
        <div className={`bg-gradient-to-br from-${themeColor}-600/10 to-${themeColor}-800/10 rounded-xl p-8 space-y-6 border border-${themeColor}-500/20`}>
          {isStudent && (
            <>
              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Education Level</label>
                <select
                  value={userProfile.educationLevel || ''}
                  onChange={(e) => handleSelectChange('educationLevel', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="">Select your education level</option>
                  <option value="high-school">High School Graduate</option>
                  <option value="undergraduate">Undergraduate Student</option>
                  <option value="graduate">Graduate Student (Masters)</option>
                  <option value="phd">PhD/Doctoral Student</option>
                  <option value="postdoc">Postdoctoral Researcher</option>
                  <option value="vocational">Vocational/Technical Training</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Field of Study</label>
                <select
                  value={userProfile.fieldOfStudy || ''}
                  onChange={(e) => handleSelectChange('fieldOfStudy', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="">Select your field of study</option>
                  <option value="stem">STEM (Science, Technology, Engineering, Mathematics)</option>
                  <option value="medicine">Medicine & Health Sciences</option>
                  <option value="business">Business & Economics</option>
                  <option value="social-sciences">Social Sciences & Public Policy</option>
                  <option value="arts">Arts & Humanities</option>
                  <option value="education">Education & Teaching</option>
                  <option value="agriculture">Agriculture & Environmental Sciences</option>
                  <option value="engineering">Engineering & Technology</option>
                  <option value="law">Law & Legal Studies</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {isOrganization && (
            <>
              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Organization Type</label>
                <select
                  value={userProfile.organizationType || ''}
                  onChange={(e) => handleSelectChange('organizationType', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="">Select organization type</option>
                  <option value="ngo">NGO</option>
                  <option value="nonprofit">Non-Profit Organization</option>
                  <option value="cbo">Community Based Organization</option>
                  <option value="faith-based">Faith-Based Organization</option>
                  <option value="social-enterprise">Social Enterprise</option>
                  <option value="educational">Educational Institution</option>
                  <option value="healthcare">Healthcare Organization</option>
                  <option value="research">Research Institution</option>
                  <option value="government">Government Agency</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                <Input
                  value={userProfile.organizationName || ''}
                  onChange={(e) => updateProfile('organizationName', e.target.value)}
                  placeholder="Enter your organization name"
                  className="bg-gray-700 border-gray-600 text-white py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Your Position</label>
                <Input
                  value={userProfile.position || ''}
                  onChange={(e) => updateProfile('position', e.target.value)}
                  placeholder="e.g., Executive Director, Program Manager"
                  className="bg-gray-700 border-gray-600 text-white py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </>
          )}

          {isBusiness && (
            <>
              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Business Type</label>
                <select
                  value={userProfile.businessType || ''}
                  onChange={(e) => handleSelectChange('businessType', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select business type</option>
                  <option value="startup">Startup</option>
                  <option value="sme">Small & Medium Enterprise (SME)</option>
                  <option value="corporation">Corporation</option>
                  <option value="social-enterprise">Social Enterprise</option>
                  <option value="cooperative">Cooperative</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole-proprietorship">Sole Proprietorship</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Business Name</label>
                <Input
                  value={userProfile.businessName || ''}
                  onChange={(e) => updateProfile('businessName', e.target.value)}
                  placeholder="Enter your business name"
                  className="bg-gray-700 border-gray-600 text-white py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Business Stage</label>
                <select
                  value={userProfile.businessStage || ''}
                  onChange={(e) => handleSelectChange('businessStage', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select business stage</option>
                  <option value="idea">Idea Stage</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed Stage</option>
                  <option value="early-stage">Early Stage</option>
                  <option value="growth">Growth Stage</option>
                  <option value="established">Established</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Industry</label>
                <select
                  value={userProfile.industry || ''}
                  onChange={(e) => handleSelectChange('industry', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="fintech">FinTech</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail & E-commerce</option>
                  <option value="education">Education</option>
                  <option value="renewable-energy">Renewable Energy</option>
                  <option value="tourism">Tourism & Hospitality</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-left text-sm font-medium text-gray-300 mb-2">Funding Experience</label>
            <select
              value={userProfile.fundingExperience || ''}
              onChange={(e) => handleSelectChange('fundingExperience', e.target.value)}
              className={`w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-${themeColor}-500 focus:ring-2 focus:ring-${themeColor}-500/20`}
            >
              <option value="">Select your experience level</option>
              <option value="beginner">Complete beginner - never applied before</option>
              <option value="some">Some experience - applied to a few grants</option>
              <option value="experienced">Experienced - regularly apply for funding</option>
              <option value="expert">Expert - very successful track record</option>
            </select>
          </div>

          <Button 
            onClick={finishOnboarding}
            className={`w-full py-4 text-lg font-semibold ${
              isStudent ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' :
              isOrganization ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' :
              'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            Launch My AI-Powered Experience
            <Zap className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderCompletion = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center max-w-lg mx-auto"
    >
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="relative">
            <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <Sparkles className="w-6 h-6 text-purple-400 absolute top-0 right-6" />
            </motion.div>
          </div>
        </motion.div>
        <h2 className="text-4xl font-bold text-white mb-4">
          Welcome aboard, {userProfile.firstName}!
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          Your AI-powered funding journey begins now. We're preparing your personalized dashboard with opportunities tailored just for you.
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-8 backdrop-blur-sm border border-gray-700">
        {isProcessing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-6 h-6 text-purple-400" />
              </motion.div>
              <span className="text-gray-300 text-lg">AI is analyzing your profile...</span>
            </div>
            
            <div className="space-y-3 text-left">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center text-green-400"
              >
                <CheckCircle className="w-4 h-4 mr-3" />
                <span className="text-sm">Scanning 50,000+ funding opportunities</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center text-green-400"
              >
                <CheckCircle className="w-4 h-4 mr-3" />
                <span className="text-sm">Personalizing AI recommendations</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex items-center text-green-400"
              >
                <CheckCircle className="w-4 h-4 mr-3" />
                <span className="text-sm">Preparing your dashboard</span>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="text-green-400">
            <CheckCircle className="w-8 h-8 inline mr-3" />
            <span className="text-lg">Setup complete! Redirecting to your dashboard...</span>
          </div>
        )}
        
        {error && (
          <p className="text-red-400 text-sm mt-4">{error}</p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>
      
      {/* Success Stories Footer - only show after welcome screen */}
      {currentStep !== STEPS.WELCOME && <SuccessStoriesFooter />}
      
      <div className="w-full relative z-10">
        <AnimatePresence mode="wait">
          {currentStep === STEPS.WELCOME && renderWelcome()}
          {currentStep === STEPS.FIRST_NAME && (
            <AnimatedFormInput
              title="What's your first name?"
              subtitle="Let's start by getting to know you personally"
              placeholder="Enter your first name"
              value={currentInput}
            />
          )}
          {currentStep === STEPS.LAST_NAME && (
            <AnimatedFormInput
              title={`Nice to meet you, ${userProfile.firstName}!`}
              subtitle="What's your last name?"
              placeholder="Enter your last name"
              value={currentInput}
            />
          )}
          {currentStep === STEPS.EMAIL && (
            <AnimatedFormInput
              title="What's your email address?"
              subtitle="We'll send you personalized funding opportunities and updates"
              placeholder="Enter your email address"
              value={currentInput}
            />
          )}
          {currentStep === STEPS.PASSWORD && (
            <AnimatedFormInput
              title="Create a secure password"
              subtitle="Choose a strong password to protect your account"
              placeholder="Enter your password (min 8 characters)"
              value={currentInput}
              type="password"
              showToggle={true}
            />
          )}
          {currentStep === STEPS.COUNTRY && (
            <AnimatedFormInput
              title="Which country are you from?"
              subtitle="This helps us find location-specific funding opportunities"
              placeholder="Start typing your country..."
              value={currentInput}
              isCountry={true}
            />
          )}
          {currentStep === STEPS.USER_TYPE && renderUserTypeSelection()}
          {currentStep === STEPS.AI_INSIGHTS && renderAIInsights()}
          {(currentStep === STEPS.STUDENT_DETAILS || 
            currentStep === STEPS.ORGANIZATION_DETAILS || 
            currentStep === STEPS.BUSINESS_DETAILS) && renderDetailForm()}
          {currentStep === STEPS.SUCCESS_STORIES && renderSuccessStories()}
          {currentStep === STEPS.COMPLETION && renderCompletion()}
        </AnimatePresence>
      </div>
    </div>
  );
}