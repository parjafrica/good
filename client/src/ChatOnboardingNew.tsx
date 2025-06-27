import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { User, Bot, Globe, Sparkles, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { FaGoogle, FaLinkedin, FaGithub } from 'react-icons/fa';
import AnimatedReviews from './AnimatedReviews';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

const COUNTRIES = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Ethiopia', 'Nigeria', 'Ghana', 'South Africa',
  'United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia', 'Brazil',
  'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Thailand', 'Philippines'
];

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  country?: string;
  userType?: string;
  organization?: string;
  sector?: string;
  experience?: string;
  goals?: string;
}

const chatFlow = [
  { 
    field: 'firstName', 
    botMessage: "👋 Hi there! I'm here to help you discover amazing funding opportunities. Let's get to know each other first - what should I call you?",
    inputType: 'text' as const,
    placeholder: "Enter your first name..."
  },
  { 
    field: 'lastName', 
    botMessage: "Nice to meet you, {firstName}! What's your last name?",
    inputType: 'text' as const,
    placeholder: "Enter your last name..."
  },
  { 
    field: 'email', 
    botMessage: "Perfect! Now, what's your email address? I'll use this to send you personalized funding matches.",
    inputType: 'text' as const,
    placeholder: "Enter your email address..."
  },
  { 
    field: 'password', 
    botMessage: "Great! Please create a secure password for your account (minimum 8 characters).",
    inputType: 'password' as const,
    placeholder: "Create a secure password..."
  },
  { 
    field: 'country', 
    botMessage: "Excellent! Which country are you based in? This helps me find location-specific funding opportunities.",
    inputType: 'select' as const,
    options: COUNTRIES,
    placeholder: "Select or type your country..."
  },
  { 
    field: 'userType', 
    botMessage: "Perfect! Are you a student, part of an organization, or running a business?",
    inputType: 'select' as const,
    options: ['Student', 'Organization', 'Business'],
    placeholder: "Select your type..."
  },
  { 
    field: 'organization', 
    botMessage: "What's the name of your {userType === 'Student' ? 'university or school' : 'organization'}?",
    inputType: 'text' as const,
    placeholder: "Enter organization name..."
  },
  { 
    field: 'sector', 
    botMessage: "What sector or field are you working in?",
    inputType: 'select' as const,
    options: ['Education', 'Health', 'Technology', 'Environment', 'Agriculture', 'Arts & Culture', 'Social Services', 'Research', 'Other'],
    placeholder: "Select your sector..."
  }
];

export default function ChatOnboardingNew() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isTyping, setIsTyping] = useState(false);
  const [showSocialOptions, setShowSocialOptions] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const processUserInput = (input: string) => {
    if (currentStep >= chatFlow.length) return;

    const currentField = chatFlow[currentStep];
    addUserMessage(input);

    // Update user profile
    setUserProfile(prev => ({
      ...prev,
      [currentField.field]: input
    }));

    // Calculate learning progress
    const progress = ((currentStep + 1) / chatFlow.length) * 100;
    setLearningProgress(progress);

    // Check if we should show social options
    const filledFields = Object.values({...userProfile, [currentField.field]: input}).filter(v => v && v.trim() !== '').length;
    if (progress >= 60 && filledFields >= 3 && !showSocialOptions) {
      setTimeout(() => {
        setShowSocialOptions(true);
        addBotMessage("🔗 I'm getting to know you better! Would you like to connect a social account to speed this up and get more personalized recommendations?");
      }, 2000);
      return;
    }

    // Continue to next step
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        if (currentStep + 1 < chatFlow.length) {
          const nextStep = chatFlow[currentStep + 1];
          let botMessage = nextStep.botMessage;
          
          // Replace placeholders
          Object.entries(userProfile).forEach(([key, value]) => {
            botMessage = botMessage.replace(`{${key}}`, value || '');
          });
          botMessage = botMessage.replace(`{${currentField.field}}`, input);
          
          addBotMessage(botMessage);
          setCurrentStep(currentStep + 1);
        } else {
          // Onboarding complete
          addBotMessage("🎉 Perfect! I have everything I need. Let me create your personalized dashboard with funding opportunities tailored just for you!");
          setTimeout(() => {
            handleOnboardingComplete();
          }, 2000);
        }
      }, 1500);
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    addBotMessage(`🚀 Redirecting you to ${provider.charAt(0).toUpperCase() + provider.slice(1)} for secure authentication...`);
    
    setTimeout(() => {
      window.location.href = `/api/auth/${provider}?redirect=${encodeURIComponent(window.location.href)}`;
    }, 1000);
  };

  const handleOnboardingComplete = async () => {
    try {
      const response = await fetch('/api/users/comprehensive-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      });

      if (response.ok) {
        const data = await response.json();
        setLocation(data.redirectTo || '/dashboard');
      } else {
        addBotMessage("There was an issue setting up your account. Please try again or contact support.");
      }
    } catch (error) {
      addBotMessage("Connection error. Please check your internet and try again.");
    }
  };

  // Initialize
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      
      // Check for OAuth callback parameters first
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth_success') === 'true') {
        const provider = urlParams.get('provider');
        const firstName = urlParams.get('firstName');
        const lastName = urlParams.get('lastName');
        const email = urlParams.get('email');
        const organization = urlParams.get('organization');
        const experience = urlParams.get('experience');
        const sector = urlParams.get('sector');

        setUserProfile(prev => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: lastName || prev.lastName,
          email: email || prev.email,
          organization: organization || prev.organization,
          experience: experience || prev.experience,
          sector: sector || prev.sector
        }));

        setTimeout(() => {
          addBotMessage(`🎉 Perfect! I've connected your ${provider?.charAt(0).toUpperCase()}${provider?.slice(1)} account successfully!`);
          setTimeout(() => {
            addBotMessage("Now I understand your background much better. Let me provide you with highly personalized funding recommendations based on your profile!");
            setLearningProgress(85);
            setCurrentStep(Math.min(currentStep + 2, chatFlow.length - 1));
            setShowSocialOptions(false);
          }, 2000);
        }, 1000);

        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setTimeout(() => {
          addBotMessage(chatFlow[0].botMessage);
        }, 1000);
      }
    }
  }, []);

  const getCurrentInputConfig = () => {
    if (currentStep >= chatFlow.length) return { type: 'text' as const, placeholder: '', options: [] };
    const step = chatFlow[currentStep];
    return {
      type: step.inputType,
      placeholder: step.placeholder,
      options: step.options || []
    };
  };

  const config = getCurrentInputConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      <AnimatedReviews />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: Math.random() * window.innerWidth,
              top: Math.random() * window.innerHeight,
            }}
          />
        ))}
      </div>

      {/* Main chat container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20"
            whileHover={{ scale: 1.05 }}
          >
            <Globe className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Granada OS</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 mt-4"
          >
            Your expert guide to funding opportunities worldwide
          </motion.p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${learningProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-white/60 text-sm mt-2 text-center">
            Learning about you: {Math.round(learningProgress)}%
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-lg ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`rounded-2xl p-4 backdrop-blur-md border ${
                    message.type === 'user'
                      ? 'bg-white/90 text-gray-900 border-white/30 rounded-tr-md'
                      : 'bg-white/10 text-white border-white/20 rounded-tl-md'
                  }`}>
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Social login options */}
          {showSocialOptions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4 text-center">Quick Connect</h3>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaGoogle className="w-4 h-4" />
                    <span>Google</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleSocialLogin('github')}
                    className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaGithub className="w-4 h-4" />
                    <span>GitHub</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleSocialLogin('linkedin')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaLinkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {currentStep < chatFlow.length && !showSocialOptions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ChatInput
              onSubmit={processUserInput}
              type={config.type as 'text' | 'password' | 'select'}
              placeholder={config.placeholder}
              options={config.options}
              disabled={isTyping}
              isTyping={isTyping}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}