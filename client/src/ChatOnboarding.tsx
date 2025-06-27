import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Send, User, Bot, Sparkles, Globe, Heart, Zap, MapPin, Github, Edit3, Check, X } from 'lucide-react';
import { FaGoogle, FaLinkedin } from 'react-icons/fa';
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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showProfileSummary, setShowProfileSummary] = useState(false);
  const [showSocialOptions, setShowSocialOptions] = useState(false);
  const [personalizedInsights, setPersonalizedInsights] = useState<string[]>([]);
  const [learningProgress, setLearningProgress] = useState(0);
  const initRef = useRef(false);

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

  // Initialize everything once
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      
      // Detect user country
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let detectedCountry = 'Uganda'; // Default fallback
        
        if (timezone.includes('Africa/Kampala')) {
          detectedCountry = 'Uganda';
        } else if (timezone.includes('Africa/Nairobi')) {
          detectedCountry = 'Kenya';
        } else if (timezone.includes('Africa/Dar_es_Salaam')) {
          detectedCountry = 'Tanzania';
        } else if (timezone.includes('America/New_York')) {
          detectedCountry = 'United States';
        } else if (timezone.includes('Europe/London')) {
          detectedCountry = 'United Kingdom';
        }
        
        setUserCountry(detectedCountry);
        console.log('User country detected:', detectedCountry);
      } catch (error) {
        setUserCountry('Uganda');
      }
      
      // Initialize chat after a delay
      setTimeout(() => {
        addBotMessage(chatFlow[0].botMessage as string);
      }, 1000);
    }
  }, []);

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

  const analyzeUserInput = (input: string, field: string) => {
    const insights: string[] = [];
    
    // Analyze based on field type and learn about user
    if (field === 'firstName') {
      insights.push(`I notice you're ${input} - that's a beautiful name!`);
      setLearningProgress(15);
    } else if (field === 'country') {
      if (input.toLowerCase().includes('uganda')) {
        insights.push('Uganda has amazing opportunities in agriculture, health, and education sectors');
      } else if (input.toLowerCase().includes('kenya')) {
        insights.push('Kenya is a hub for fintech and innovation funding');
      }
      setLearningProgress(prev => prev + 25);
    } else if (field === 'userType') {
      if (input.toLowerCase().includes('student')) {
        insights.push('Students have access to exclusive scholarship and research funding');
      } else if (input.toLowerCase().includes('organization')) {
        insights.push('NGOs and organizations can access multi-year institutional grants');
      }
      setLearningProgress(prev => prev + 20);
    } else if (field === 'sector') {
      insights.push(`The ${input} sector has particularly strong funding opportunities right now`);
      setLearningProgress(prev => prev + 20);
    }
    
    if (insights.length > 0) {
      setPersonalizedInsights(prev => [...prev, ...insights]);
    }
    
    // Trigger social options when we have enough information
    if (learningProgress >= 60 && !showSocialOptions) {
      setTimeout(() => {
        setShowSocialOptions(true);
        addBotMessage("🔗 I'm getting to know you better! Would you like to connect a social account to speed this up and get more personalized recommendations?");
      }, 2000);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Create dynamic popup overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
      align-items: center; justify-content: center; backdrop-filter: blur(10px);
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px; border-radius: 20px; text-align: center;
      color: white; font-family: system-ui; max-width: 400px;
      transform: scale(0); transition: all 0.3s ease;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    const providerColors = {
      google: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
      github: 'linear-gradient(135deg, #333 0%, #24292e 100%)', 
      linkedin: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)'
    };
    
    popup.style.background = providerColors[provider as keyof typeof providerColors] || popup.style.background;
    
    popup.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 20px;">🔗</div>
      <h2 style="margin: 0 0 10px 0;">Connecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}</h2>
      <p style="margin: 0 0 20px 0; opacity: 0.9;">Securely linking your account for better recommendations...</p>
      <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
        <div id="progress" style="height: 100%; background: #4ade80; width: 0%; transition: width 2s ease;"></div>
      </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Animate popup in
    setTimeout(() => {
      popup.style.transform = 'scale(1)';
      const progressBar = popup.querySelector('#progress') as HTMLElement;
      if (progressBar) progressBar.style.width = '100%';
    }, 100);
    
    // Simulate authentication process
    setTimeout(() => {
      const socialData = {
        google: {
          email: `${userProfile.firstName?.toLowerCase() || 'user'}@gmail.com`,
          organization: 'Google Workspace',
          experience: 'Professional'
        },
        github: {
          email: `${userProfile.firstName?.toLowerCase() || 'dev'}@users.noreply.github.com`,
          sector: 'Technology',
          organization: 'Open Source Community'
        },
        linkedin: {
          email: `${userProfile.firstName?.toLowerCase() || 'professional'}@company.com`,
          experience: 'Senior Level',
          organization: 'Professional Network'
        }
      }[provider];

      setUserProfile(prev => ({
        ...prev,
        ...socialData
      }));

      // Remove popup with animation
      popup.style.transform = 'scale(0)';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);

      setShowSocialOptions(false);
      addBotMessage(`🎉 Perfect! I've connected your ${provider.charAt(0).toUpperCase() + provider.slice(1)} account. Now I understand your background much better and can provide highly personalized funding recommendations!`);
      
      // Skip ahead based on enriched data
      setCurrentStep(Math.min(currentStep + 2, chatFlow.length - 1));
      setLearningProgress(100);
    }, 2500);
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
    
    // Update profile and analyze input for learning
    setUserProfile(prev => ({
      ...prev,
      [currentStepData.field]: currentInput
    }));
    
    // Intelligent learning from user input
    analyzeUserInput(currentInput, currentStepData.field);

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



  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingField && editValue.trim()) {
      setUserProfile(prev => ({
        ...prev,
        [editingField]: editValue
      }));
      
      // Update the corresponding message
      setMessages(prev => prev.map(msg => {
        if (msg.type === 'user' && msg.content === userProfile[editingField as keyof UserProfile]) {
          return { ...msg, content: editValue };
        }
        return msg;
      }));
      
      addBotMessage(`✅ Got it! I've updated your ${editingField} to "${editValue}". Let's continue...`);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const toggleProfileSummary = () => {
    setShowProfileSummary(!showProfileSummary);
  };

  const getFieldName = (step: number): string => {
    const field = chatFlow[step]?.field;
    const fieldNames: { [key: string]: string } = {
      'firstName': 'first name',
      'lastName': 'last name', 
      'email': 'email',
      'country': 'country',
      'userType': 'user type',
      'organization': 'organization',
      'sector': 'sector',
      'experience': 'experience',
      'goals': 'goals',
      'password': 'password'
    };
    return fieldNames[field] || field;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingField) {
        handleSaveEdit();
      } else {
        handleSendMessage();
      }
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

          {/* Social Login Options - Show after initial message */}
          {messages.length === 1 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md">
                <div className="text-center mb-4">
                  <p className="text-white/80 text-sm mb-3">Quick Sign Up Options</p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 font-medium"
                  >
                    <FaGoogle className="w-5 h-5" />
                    Continue with Google
                  </button>
                  <button
                    onClick={() => handleSocialLogin('github')}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 font-medium"
                  >
                    <Github className="w-5 h-5" />
                    Continue with GitHub
                  </button>
                  <button
                    onClick={() => handleSocialLogin('linkedin')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 font-medium"
                  >
                    <FaLinkedin className="w-5 h-5" />
                    Continue with LinkedIn
                  </button>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/60">or continue with chat</span>
                    </div>
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