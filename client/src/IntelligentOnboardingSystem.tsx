import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronDown, Search, Phone, MessageCircle, Globe, Users, Building, GraduationCap } from 'lucide-react';
import { useLocation } from 'wouter';
import { intelligentOnboarding, type UserProfileData } from '@/services/intelligentOnboardingEngine';
import { errorHandler } from '@/services/errorHandlingSystem';

const successStories = [
  { name: "Sarah Mwangi", type: "Student", achievement: "Full Scholarship to Oxford", amount: "$45K", quote: "Granada OS found scholarships I never knew existed!", image: "🎓", color: "from-blue-500 to-purple-500", location: "Kenya" },
  { name: "Green Impact NGO", type: "Organization", achievement: "Climate Project Funding", amount: "$250K", quote: "Connected us with EU grants perfectly matched to our mission.", image: "🌱", color: "from-green-500 to-teal-500", location: "Uganda" },
  { name: "TechStart Africa", type: "Business", achievement: "Series A Funding", amount: "$1.2M", quote: "The AI matching system transformed our investor outreach.", image: "🚀", color: "from-orange-500 to-red-500", location: "Nigeria" },
  { name: "Hope Foundation", type: "NGO", achievement: "Education Program Grant", amount: "$180K", quote: "Expert guidance helped us secure funding in just 3 weeks.", image: "❤️", color: "from-red-500 to-pink-500", location: "Tanzania" },
  { name: "Maria Santos", type: "Student", achievement: "Research Grant", amount: "$35K", quote: "Found perfect match for my renewable energy research.", image: "⚡", color: "from-yellow-500 to-orange-500", location: "Ethiopia" },
  { name: "Innovation Hub", type: "Business", achievement: "Government Grant", amount: "$500K", quote: "Secured major funding for our fintech platform.", image: "💰", color: "from-purple-500 to-blue-500", location: "Rwanda" }
];

export default function IntelligentOnboardingSystem() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(intelligentOnboarding.getNextStep());
  const [currentInput, setCurrentInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize error handling system
  useEffect(() => {
    errorHandler.setupGlobalErrorHandlers();
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current && currentStep) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Detect user location for personalization
  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      // Try to get location from browser API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            // Use reverse geocoding service
            const locationData = {
              country: 'Uganda', // Fallback
              countryCode: 'UG',
              latitude,
              longitude,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            setUserLocation(locationData);
          },
          () => {
            // Fallback to timezone-based detection
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const locationData = {
              country: timezone.includes('Africa') ? 'Uganda' : 'United States',
              countryCode: timezone.includes('Africa') ? 'UG' : 'US',
              timezone
            };
            setUserLocation(locationData);
          }
        );
      }
    } catch (error) {
      console.warn('Location detection failed:', error);
    }
  };

  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    setError('');
    
    if (currentStep?.type === 'select' && currentStep.options) {
      setShowDropdown(value.length > 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = async () => {
    if (!currentInput.trim() && currentStep?.required) {
      setError('This field is required');
      return;
    }

    try {
      setError('');
      
      // Update user profile with current input
      if (currentStep) {
        intelligentOnboarding.updateUserProfile(currentStep.id, currentInput);
      }

      // Move to next step
      const hasNext = intelligentOnboarding.advanceStep();
      if (hasNext) {
        setCurrentStep(intelligentOnboarding.getNextStep());
        setCurrentInput('');
        setShowDropdown(false);
      } else {
        // Onboarding complete - save to database
        await completeOnboarding();
      }
    } catch (error) {
      errorHandler.handleError(error as Error, {
        errorType: 'system',
        severity: 'medium'
      });
    }
  };

  const handleOptionSelect = (option: string) => {
    setCurrentInput(option);
    setShowDropdown(false);
    setTimeout(() => handleNext(), 100);
  };

  const completeOnboarding = async () => {
    setIsProcessing(true);
    try {
      const profile = intelligentOnboarding.getCurrentProfile();
      
      // Save comprehensive profile to database
      const response = await fetch('/api/users/comprehensive-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          operatingSystem: navigator.platform,
          browserType: navigator.userAgent.split(' ')[0],
          userAgent: navigator.userAgent,
          locationData: userLocation,
          onboardingCompleted: true,
          profileCompleteness: intelligentOnboarding.getCompletionPercentage()
        }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Redirect based on user type
      const userType = profile.userType;
      if (userType === 'student') {
        setLocation('/student-dashboard');
      } else if (userType === 'business') {
        setLocation('/business-dashboard');
      } else {
        setLocation('/dashboard');
      }
    } catch (error) {
      errorHandler.handleError(error as Error, {
        errorType: 'system',
        severity: 'high'
      });
      setIsProcessing(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'linkedin') => {
    try {
      // For now, collect the data and show placeholder
      alert(`Social login with ${provider} will be implemented. Please continue with email registration for now.`);
    } catch (error) {
      errorHandler.handleError(error as Error, {
        errorType: 'authentication',
        severity: 'medium'
      });
    }
  };

  // Enhanced Success Stories Footer with location awareness
  const SuccessStoriesFooter = () => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
      }, 4000);
      return () => clearInterval(interval);
    }, []);

    const currentStory = successStories[currentStoryIndex];
    
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
                  {currentStory.image}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm md:text-base truncate">
                    💰 {currentStory.amount} - {currentStory.name}
                  </div>
                  <div className="text-xs md:text-sm text-white/80 truncate">
                    📍 {currentStory.location} • {currentStory.achievement}
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
            {successStories.map((_, index) => (
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

  // Enhanced Input Component with Enter key support
  const EnhancedInput = () => {
    const isPhoneStep = currentStep?.id.includes('phone') || currentStep?.id.includes('Phone');
    const isEmailStep = currentStep?.type === 'email';
    const isPasswordStep = currentStep?.type === 'password';
    
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type={isPasswordStep && !showPassword ? 'password' : isEmailStep ? 'email' : 'text'}
          value={currentInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={currentStep?.placeholder}
          className="w-full px-6 py-4 bg-white/10 border-2 border-transparent rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 text-lg"
          autoComplete="off"
          spellCheck={false}
        />
        
        {isPasswordStep && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        
        {isPhoneStep && (
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/60 flex items-center">
            <Phone size={16} className="mr-2" />
            <span className="text-sm">+{userLocation?.countryCode === 'UG' ? '256' : '1'}</span>
          </div>
        )}
      </div>
    );
  };

  // Main Form Component
  const AnimatedFormStep = () => {
    if (!currentStep) return null;

    return (
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-md mx-auto px-4"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentStep.title}</h2>
        <p className="text-gray-400 mb-6 text-sm md:text-base">{currentStep.subtitle}</p>
        
        {currentStep.contextualMessage && (
          <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <p className="text-blue-200 text-sm">{currentStep.contextualMessage}</p>
          </div>
        )}
        
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
              {currentStep.type === 'select' ? (
                <div className="relative">
                  <EnhancedInput />
                  
                  {showDropdown && currentStep.options && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 max-h-48 overflow-y-auto z-50"
                    >
                      {currentStep.options
                        .filter(option => option.toLowerCase().includes(currentInput.toLowerCase()))
                        .slice(0, 8)
                        .map((option) => (
                          <button
                            key={option}
                            onClick={() => handleOptionSelect(option)}
                            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                          >
                            {option}
                          </button>
                        ))}
                    </motion.div>
                  )}
                </div>
              ) : currentStep.type === 'multiselect' ? (
                <div className="space-y-2">
                  {currentStep.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        const current = currentInput.split(',').filter(Boolean);
                        const exists = current.includes(option);
                        if (exists) {
                          const updated = current.filter(item => item !== option);
                          setCurrentInput(updated.join(','));
                        } else {
                          setCurrentInput([...current, option].join(','));
                        }
                      }}
                      className={`w-full p-3 rounded-lg border border-white/20 text-left transition-all ${
                        currentInput.includes(option) 
                          ? 'bg-blue-500/30 border-blue-400/50 text-white' 
                          : 'bg-white/10 hover:bg-white/20 text-white/80'
                      }`}
                    >
                      <span className="flex items-center">
                        <span className="mr-3">
                          {currentInput.includes(option) ? '✓' : '○'}
                        </span>
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <EnhancedInput />
              )}
              
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
                disabled={!currentInput.trim() && currentStep.required}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
          
          {/* Social Login Options - shown strategically */}
          {intelligentOnboarding.shouldShowSocialLogins() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-white/60">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex justify-center py-2 px-4 border border-white/20 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-sm">Google</span>
                </button>
                <button
                  onClick={() => handleSocialLogin('github')}
                  className="w-full flex justify-center py-2 px-4 border border-white/20 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-sm">GitHub</span>
                </button>
                <button
                  onClick={() => handleSocialLogin('linkedin')}
                  className="w-full flex justify-center py-2 px-4 border border-white/20 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-sm">LinkedIn</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="mt-6">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${intelligentOnboarding.getCompletionPercentage()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-white/60 text-xs mt-2">
            {intelligentOnboarding.getCompletionPercentage()}% complete
          </p>
        </div>
      </motion.div>
    );
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">Creating Your Personalized Experience</h2>
          <p className="text-white/70">Setting up your AI-powered funding dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 pb-32">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <AnimatedFormStep />
        </AnimatePresence>
      </div>

      <SuccessStoriesFooter />
    </div>
  );
}