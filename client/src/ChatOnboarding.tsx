import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Send, User, Bot, Sparkles, Globe, Heart, Zap, MapPin } from 'lucide-react';
import FloatingReviews from './FloatingReviews';

// Comprehensive country list with geo-location priority
const COUNTRIES = [
  // East Africa (Priority based on geo-location)
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Ethiopia', 'Burundi', 'South Sudan',
  // West Africa
  'Nigeria', 'Ghana', 'Senegal', 'Mali', 'Burkina Faso', 'Ivory Coast', 'Guinea', 'Benin', 'Togo', 'Sierra Leone', 'Liberia', 'Mauritania', 'Niger', 'Gambia', 'Guinea-Bissau', 'Cape Verde',
  // North Africa
  'Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan',
  // Southern Africa
  'South Africa', 'Zimbabwe', 'Botswana', 'Namibia', 'Zambia', 'Malawi', 'Mozambique', 'Angola', 'Swaziland', 'Lesotho', 'Madagascar', 'Mauritius', 'Seychelles', 'Comoros',
  // Central Africa
  'Democratic Republic of Congo', 'Cameroon', 'Chad', 'Central African Republic', 'Republic of Congo', 'Gabon', 'Equatorial Guinea', 'São Tomé and Príncipe',
  // Europe
  'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Portugal', 'Greece', 'Ireland', 'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Slovakia', 'Slovenia', 'Luxembourg', 'Malta', 'Cyprus', 'Estonia', 'Latvia', 'Lithuania',
  // North America
  'United States', 'Canada', 'Mexico',
  // Asia
  'China', 'India', 'Japan', 'South Korea', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'Malaysia', 'Singapore', 'Bangladesh', 'Pakistan', 'Sri Lanka', 'Myanmar', 'Cambodia', 'Laos', 'Nepal', 'Bhutan', 'Maldives', 'Afghanistan', 'Iran', 'Iraq', 'Turkey', 'Israel', 'Palestine', 'Jordan', 'Lebanon', 'Syria', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen',
  // South America
  'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname', 'French Guiana',
  // Oceania
  'Australia', 'New Zealand', 'Papua New Guinea', 'Fiji', 'Solomon Islands', 'Vanuatu', 'Samoa', 'Tonga', 'Kiribati', 'Palau', 'Marshall Islands', 'Micronesia', 'Nauru', 'Tuvalu'
];

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
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
    id: 'welcome',
    botMessage: "👋 Hi there! I'm your personal funding expert. I'm here to help you discover amazing opportunities. What's your first name?",
    field: 'firstName',
    validation: (value: string) => value.length >= 2
  },
  {
    id: 'lastName',
    botMessage: (firstName: string) => `Nice to meet you, ${firstName}! 🌟 What's your last name?`,
    field: 'lastName',
    validation: (value: string) => value.length >= 2
  },
  {
    id: 'email',
    botMessage: "Perfect! Now I need your email address to create your account. 📧",
    field: 'email',
    validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  {
    id: 'password',
    botMessage: "Great! Let's secure your account with a password (minimum 8 characters). 🔐",
    field: 'password',
    validation: (value: string) => value.length >= 8,
    isPassword: true
  },
  {
    id: 'userType',
    botMessage: "Awesome! Now, which best describes you? 🎯",
    field: 'userType',
    options: ['Student', 'Non-profit Organization', 'Business/Startup', 'Individual Researcher'],
    validation: (value: string) => {
      const normalizedValue = value.toLowerCase().trim();
      const validOptions = ['student', 'non-profit organization', 'business/startup', 'individual researcher', 'organization', 'business', 'startup', 'researcher', 'nonprofit'];
      return validOptions.some(option => normalizedValue.includes(option)) || value.length >= 3;
    }
  },
  {
    id: 'country',
    botMessage: "Excellent choice! Which country are you based in? 🌍",
    field: 'country',
    isCountryField: true,
    validation: (value: string) => value.length >= 2
  },
  {
    id: 'goals',
    botMessage: "Almost done! What are your main funding goals? (e.g., education, research, business growth) 💡",
    field: 'goals',
    validation: (value: string) => value.length >= 10
  }
];

const successStories = [
  { name: "Sarah K.", amount: "$45K", type: "Education Grant", country: "Kenya" },
  { name: "TechHub", amount: "$200K", type: "Startup Funding", country: "Uganda" },
  { name: "Dr. Ahmed", amount: "$80K", type: "Research Grant", country: "Ethiopia" },
  { name: "GreenFarm", amount: "$120K", type: "Agriculture Grant", country: "Tanzania" }
];

export default function ChatOnboarding() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [currentStory, setCurrentStory] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [userCountry, setUserCountry] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Rotate success stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory(prev => (prev + 1) % successStories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Detect user country for geo-located suggestions
  useEffect(() => {
    const detectUserCountry = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Africa/Kampala') || timezone.includes('Africa/Nairobi')) {
          setUserCountry('Uganda');
        } else if (timezone.includes('Africa/Nairobi')) {
          setUserCountry('Kenya');
        } else if (timezone.includes('Africa/Dar_es_Salaam')) {
          setUserCountry('Tanzania');
        } else if (timezone.includes('America/New_York')) {
          setUserCountry('United States');
        } else if (timezone.includes('Europe/London')) {
          setUserCountry('United Kingdom');
        } else {
          setUserCountry('Uganda'); // Default fallback
        }
        console.log('User country detected:', userCountry);
      } catch (error) {
        setUserCountry('Uganda'); // Safe fallback
      }
    };
    detectUserCountry();
  }, []);

  // Initialize chat (only once)
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      setTimeout(() => {
        addBotMessage(chatFlow[0].botMessage as string);
      }, 1000);
    }
  }, [initialized]);

  // Smart country filtering with geo-location priority
  const filterCountries = (input: string): string[] => {
    const searchTerm = input.toLowerCase().trim();
    if (!searchTerm) {
      // Return geo-located suggestions first when no input
      const geoSuggestions = [userCountry];
      const nearby = userCountry === 'Uganda' 
        ? ['Kenya', 'Tanzania', 'Rwanda', 'Ethiopia'] 
        : userCountry === 'Kenya'
        ? ['Uganda', 'Tanzania', 'Ethiopia', 'Rwanda']
        : ['Uganda', 'Kenya', 'Tanzania', 'Nigeria', 'Ghana'];
      
      return [...geoSuggestions, ...nearby, ...COUNTRIES.filter(c => !geoSuggestions.includes(c) && !nearby.includes(c))].slice(0, 8);
    }
    
    // Filter countries based on input, prioritizing geo-location
    const exactMatches = COUNTRIES.filter(country => 
      country.toLowerCase().startsWith(searchTerm)
    );
    const partialMatches = COUNTRIES.filter(country => 
      country.toLowerCase().includes(searchTerm) && !country.toLowerCase().startsWith(searchTerm)
    );
    
    // Prioritize user's detected country if it matches
    const prioritized = [];
    if (userCountry.toLowerCase().includes(searchTerm)) {
      prioritized.push(userCountry);
    }
    
    return [...prioritized, ...exactMatches, ...partialMatches]
      .filter((country, index, self) => self.indexOf(country) === index)
      .slice(0, 6);
  };

  // Handle country input changes
  const handleCountryInput = (value: string) => {
    setCurrentInput(value);
    const suggestions = filterCountries(value);
    setCountrySuggestions(suggestions);
    setShowCountrySuggestions(suggestions.length > 0 && value.length > 0);
  };

  const addBotMessage = (content: string, typing = true) => {
    if (typing) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}-${Math.random()}`,
          type: 'bot',
          content,
          timestamp: new Date()
        }]);
        setIsTyping(false);
        
        // Show options if current step has them
        if (chatFlow[currentStep]?.options) {
          setShowOptions(true);
        }
      }, 1500);
    } else {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}-${Math.random()}`,
        type: 'bot',
        content,
        timestamp: new Date()
      }]);
    }
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}-${Math.random()}`,
      type: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    const currentStepData = chatFlow[currentStep];
    if (!currentStepData.validation(currentInput)) {
      addBotMessage("Hmm, that doesn't look quite right. Could you try again? 🤔", false);
      return;
    }

    // Add user message
    addUserMessage(currentInput);
    
    // Update profile
    setUserProfile(prev => ({
      ...prev,
      [currentStepData.field]: currentInput
    }));

    setCurrentInput('');
    setShowOptions(false);

    // Move to next step
    if (currentStep < chatFlow.length - 1) {
      setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        const nextStepData = chatFlow[nextStep];
        let botMessage = nextStepData.botMessage;
        
        if (typeof botMessage === 'function') {
          botMessage = botMessage(userProfile.firstName || '');
        }
        
        addBotMessage(botMessage as string);
      }, 500);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const handleOptionSelect = (option: string) => {
    setCurrentInput(option);
    setTimeout(() => handleSendMessage(), 100);
  };

  const completeOnboarding = async () => {
    addBotMessage("🎉 Perfect! I'm setting up your personalized dashboard with opportunities tailored just for you...", false);
    
    try {
      const response = await fetch('/api/users/comprehensive-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userProfile,
          onboardingCompleted: true,
          deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
        })
      });

      if (response.ok) {
        setTimeout(() => {
          const userType = userProfile.userType?.toLowerCase();
          if (userType?.includes('student')) {
            setLocation('/student-dashboard');
          } else if (userType?.includes('business')) {
            setLocation('/business-dashboard');
          } else {
            setLocation('/dashboard');
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      addBotMessage("Oops! Something went wrong. Let me try again... 🔄", false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative">
      {/* Floating Reviews */}
      <FloatingReviews />
      
      {/* Success Stories Sidebar */}
      <div className="hidden lg:block w-80 p-6 border-r border-white/10">
        <div className="sticky top-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-semibold">Recent Success Stories</h3>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{successStories[currentStory].name}</p>
                      <p className="text-green-400 text-sm">{successStories[currentStory].country}</p>
                    </div>
                  </div>
                  <p className="text-white text-sm mb-2">{successStories[currentStory].type}</p>
                  <p className="text-2xl font-bold text-green-400">{successStories[currentStory].amount}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Globe className="w-4 h-4" />
                <span>Available in 50+ countries</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Zap className="w-4 h-4" />
                <span>$2.5B+ in funding discovered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold">Funding Expert</h1>
              <p className="text-white/70 text-sm">Your personal grant discovery assistant</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-lg ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                      : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                  }`}>
                    <p>{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3 max-w-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Options */}
          {showOptions && chatFlow[currentStep]?.options && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex flex-wrap gap-2 max-w-lg ml-11">
                {chatFlow[currentStep].options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 hover:scale-105"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              type={chatFlow[currentStep]?.isPassword ? 'password' : 'text'}
              value={currentInput}
              onChange={(e) => {
                const value = e.target.value;
                if (chatFlow[currentStep]?.isCountryField) {
                  handleCountryInput(value);
                } else {
                  setCurrentInput(value);
                  setShowCountrySuggestions(false);
                }
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (chatFlow[currentStep]?.isCountryField && !currentInput) {
                  const initialSuggestions = filterCountries('');
                  setCountrySuggestions(initialSuggestions);
                  setShowCountrySuggestions(true);
                }
              }}
              onBlur={() => {
                // Hide suggestions after a short delay to allow clicking
                setTimeout(() => setShowCountrySuggestions(false), 200);
              }}
              placeholder={chatFlow[currentStep]?.isCountryField ? `Type your country (detected: ${userCountry})...` : "Type your message..."}
              className="flex-1 bg-white/10 backdrop-blur-md text-white placeholder-white/50 px-4 py-3 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isTyping || showOptions}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || isTyping}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Country Suggestions Dropdown */}
          {showCountrySuggestions && chatFlow[currentStep]?.isCountryField && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto mt-2"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 max-h-48 overflow-y-auto">
                {countrySuggestions.map((country, index) => (
                  <button
                    key={`${country}-${index}`}
                    onClick={() => {
                      setCurrentInput(country);
                      setShowCountrySuggestions(false);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 flex items-center gap-3 border-b border-white/10 last:border-b-0"
                  >
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>{country}</span>
                    {country === userCountry && (
                      <span className="ml-auto text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded-full">
                        Your Location
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}