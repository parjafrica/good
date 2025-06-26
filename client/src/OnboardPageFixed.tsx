import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'wouter';
import { aiLocationService } from '@/services/aiLocationService';
import { ConditionalAIEngine } from '@/services/conditionalAIEngine';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  userType: 'student' | 'organization' | 'business' | '';
  educationLevel?: string;
  fieldOfStudy?: string;
  organizationType?: string;
  organizationName?: string;
  businessType?: string;
  businessName?: string;
  yearsOfExperience?: string;
  teamSize?: string;
  currentRole?: string;
  interests?: string[];
}

interface LocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  currency: string;
  continent: string;
  language: string;
  confidence: number;
}

const STEPS = {
  FIRST_NAME: 'first_name',
  LAST_NAME: 'last_name',
  EMAIL: 'email',
  PASSWORD: 'password',
  COUNTRY: 'country',
  USER_TYPE: 'user_type',
  AI_INSIGHTS: 'ai_insights',
  STUDENT_DETAILS: 'student_details',
  ORGANIZATION_DETAILS: 'organization_details',
  BUSINESS_DETAILS: 'business_details',
  SUCCESS_STORIES: 'success_stories',
  COMPLETION: 'completion'
};

const successStories = [
  { name: "Maria Santos", type: "Student", achievement: "Secured $25,000 scholarship", amount: "$25K", quote: "The expert system found opportunities I never knew existed!", image: "🎓", color: "from-blue-500 to-purple-500" },
  { name: "EcoTech Solutions", type: "Startup", achievement: "Raised $500,000 in seed funding", amount: "$500K", quote: "Granada OS connected us with the perfect investors for our climate tech.", image: "🌱", color: "from-green-500 to-teal-500" },
  { name: "Hope Foundation", type: "NGO", achievement: "Granted $150,000 for education programs", amount: "$150K", quote: "The AI matching system transformed our grant application success rate.", image: "❤️", color: "from-red-500 to-pink-500" }
];

export default function OnboardPageFixed() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.FIRST_NAME);
  const [currentInput, setCurrentInput] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    userType: '',
    interests: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [aiContent, setAiContent] = useState<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const countries = [
    'Kenya', 'Uganda', 'Tanzania', 'Ethiopia', 'Rwanda', 'Burundi', 'South Sudan', 'Somalia', 'Eritrea', 'Djibouti',
    'Nigeria', 'Ghana', 'South Africa', 'Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Chad',
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway',
    'China', 'Japan', 'India', 'Australia', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru'
  ];

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(currentInput.toLowerCase())
  );

  // Location detection
  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      const location = await aiLocationService.detectUserLocation();
      setUserLocation(location);
      
      if (location) {
        const content = await aiLocationService.generateLocalizedContent(location, userProfile.userType || 'student');
        setAiContent(content);
      }
    } catch (error) {
      console.warn('Location detection failed:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Enhanced Input Component that prevents cursor jumping and supports Enter key
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
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (onKeyPress) {
          onKeyPress(e);
        } else {
          handleNext();
        }
      }
    };
    
    return (
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className={`w-full px-6 py-4 bg-white/10 border-2 border-transparent rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 text-lg ${className}`}
        autoComplete="off"
        spellCheck={false}
      />
    );
  };

  // Enhanced Mobile-Friendly Success Stories Footer
  const SuccessStoriesFooter = () => {
    const stories = aiContent?.successStories || successStories;
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
      }, 4000);
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
              <div className="flex items-center space-x-4 flex-1">
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
                
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm md:text-base truncate">
                    💰 {currentStory.amount} - {currentStory.name}
                  </div>
                  <div className="text-xs md:text-sm text-white/80 truncate">
                    📍 {userLocation?.country} • {currentStory.achievement}
                  </div>
                </div>
              </div>
              
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

  const updateProfile = (key: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!currentInput.trim() && currentStep !== STEPS.USER_TYPE) {
      setError('This field is required');
      return;
    }
    
    setError('');
    
    switch (currentStep) {
      case STEPS.FIRST_NAME:
        updateProfile('firstName', currentInput);
        setCurrentStep(STEPS.LAST_NAME);
        break;
      case STEPS.LAST_NAME:
        updateProfile('lastName', currentInput);
        setCurrentStep(STEPS.EMAIL);
        break;
      case STEPS.EMAIL:
        updateProfile('email', currentInput);
        setCurrentStep(STEPS.PASSWORD);
        break;
      case STEPS.PASSWORD:
        updateProfile('password', currentInput);
        setCurrentStep(STEPS.COUNTRY);
        break;
      case STEPS.COUNTRY:
        updateProfile('country', currentInput);
        setCurrentStep(STEPS.USER_TYPE);
        break;
      default:
        break;
    }
    
    setCurrentInput('');
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

  const getCurrentStepData = () => {
    return ConditionalAIEngine.analyzeUserContext({
      profile: userProfile,
      location: userLocation,
      currentStep,
      previousAnswers: userProfile,
      timestamp: Date.now()
    });
  };

  const stepData = getCurrentStepData();

  // Mobile-optimized form input component
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
      className="text-center max-w-md mx-auto px-4"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 mb-6 text-sm md:text-base">{subtitle}</p>
      
      <div className="relative">
        <motion.div
          className="bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 p-6 md:p-8 rounded-2xl backdrop-blur-sm relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
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
              <EnhancedInput
                value={value}
                onChange={(newValue) => {
                  setCurrentInput(newValue);
                  if (isCountry) {
                    setShowCountryDropdown(true);
                  }
                }}
                placeholder={placeholder}
                type={type}
                autoFocus={true}
              />
              
              {showToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
            
            {isCountry && showCountryDropdown && filteredCountries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 max-h-48 overflow-y-auto z-50"
              >
                {filteredCountries.slice(0, 8).map((country) => (
                  <button
                    key={country}
                    onClick={() => handleCountrySelect(country)}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                  >
                    {country}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-3"
            >
              {error}
            </motion.p>
          )}
          
          <motion.button
            onClick={handleNext}
            disabled={!currentInput.trim()}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 pb-32">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {currentStep === STEPS.FIRST_NAME && (
            <AnimatedFormInput
              key="first_name"
              title={stepData.title}
              subtitle={stepData.subtitle}
              placeholder={stepData.placeholder}
              value={currentInput}
            />
          )}

          {currentStep === STEPS.LAST_NAME && (
            <AnimatedFormInput
              key="last_name"
              title={stepData.title}
              subtitle={stepData.subtitle}
              placeholder={stepData.placeholder}
              value={currentInput}
            />
          )}

          {currentStep === STEPS.EMAIL && (
            <AnimatedFormInput
              key="email"
              title={stepData.title}
              subtitle={stepData.subtitle}
              placeholder={stepData.placeholder}
              value={currentInput}
              type="email"
            />
          )}

          {currentStep === STEPS.PASSWORD && (
            <AnimatedFormInput
              key="password"
              title={stepData.title}
              subtitle={stepData.subtitle}
              placeholder={stepData.placeholder}
              value={currentInput}
              type={showPassword ? "text" : "password"}
              showToggle={true}
            />
          )}

          {currentStep === STEPS.COUNTRY && (
            <AnimatedFormInput
              key="country"
              title={stepData.title}
              subtitle={stepData.subtitle}
              placeholder={stepData.placeholder}
              value={currentInput}
              isCountry={true}
            />
          )}

          {currentStep === STEPS.USER_TYPE && (
            <motion.div
              key="user_type"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-md mx-auto px-4"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Choose Your Path</h2>
              <p className="text-gray-400 mb-8 text-sm md:text-base">Select the option that best describes you</p>
              
              <div className="space-y-4">
                {[
                  { type: 'student' as const, title: '🎓 Student/Individual', desc: 'Scholarships, grants, research funding' },
                  { type: 'organization' as const, title: '🏛️ Non-Profit/NGO', desc: 'Program grants, project funding' },
                  { type: 'business' as const, title: '🚀 Business/Startup', desc: 'Investment, business grants, loans' }
                ].map((option) => (
                  <motion.button
                    key={option.type}
                    onClick={() => handleUserTypeSelect(option.type)}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-left hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-white font-semibold text-lg">{option.title}</div>
                    <div className="text-white/70 text-sm mt-1">{option.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden md:block">
          <AnimatedReviews />
        </div>
      </div>

      <SuccessStoriesFooter />
    </div>
  );
}