import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bot, 
  Send, 
  User, 
  MapPin, 
  Building, 
  Heart, 
  GraduationCap,
  Briefcase,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Target,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  country?: string;
  sector?: string;
  organizationType?: string;
  interests?: string;
  experience?: string;
  fundingNeeds?: string;
}

const InteractiveLanding: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const conversationFlow = [
    {
      question: "Hello! I'm Granada AI, your funding opportunity assistant. What's your first name?",
      field: 'firstName',
      type: 'text'
    },
    {
      question: "Nice to meet you, {firstName}! What's your last name?",
      field: 'lastName',
      type: 'text'
    },
    {
      question: "What's your email address? I'll use this to create your personalized account.",
      field: 'email',
      type: 'email'
    },
    {
      question: "Which country are you based in? This helps me find relevant funding opportunities.",
      field: 'country',
      type: 'select',
      options: ['Kenya', 'Uganda', 'South Sudan', 'Tanzania', 'Rwanda', 'Ethiopia', 'Other']
    },
    {
      question: "What sector does your organization focus on?",
      field: 'sector',
      type: 'select',
      options: ['Education', 'Health', 'Environment', 'Agriculture', 'Technology', 'Community Development', 'Women Empowerment', 'Youth Development']
    },
    {
      question: "What type of organization are you?",
      field: 'organizationType',
      type: 'select',
      options: ['Small NGO', 'Large NGO', 'University/Research', 'Social Enterprise', 'Community Group', 'Individual Researcher']
    },
    {
      question: "What are your main areas of interest? (separate with commas)",
      field: 'interests',
      type: 'text'
    },
    {
      question: "How much funding are you typically looking for?",
      field: 'fundingNeeds',
      type: 'select',
      options: ['Under $10K', '$10K - $50K', '$50K - $100K', '$100K - $500K', '$500K+']
    }
  ];

  const createUserMutation = useMutation({
    mutationFn: async (profile: UserProfile) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          hashedPassword: 'temp_password', // Will be replaced with proper auth
          userType: 'donor'
        })
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: (data) => {
      // Store user ID for personalization
      localStorage.setItem('userId', data.user.id);
      navigate('/dashboard');
    }
  });

  const startConversation = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'bot',
      content: "Welcome to Granada OS! I'm here to help you discover personalized funding opportunities. Let me ask you a few questions to create your profile.",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setTimeout(() => askNextQuestion(), 1000);
  };

  const askNextQuestion = () => {
    if (currentStep < conversationFlow.length) {
      setIsTyping(true);
      setTimeout(() => {
        const step = conversationFlow[currentStep];
        let questionText = step.question;
        
        // Replace placeholders with user data
        Object.keys(userProfile).forEach(key => {
          questionText = questionText.replace(`{${key}}`, userProfile[key as keyof UserProfile] || '');
        });

        const botMessage: Message = {
          id: `step-${currentStep}`,
          type: 'bot',
          content: questionText,
          timestamp: new Date(),
          options: step.options
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } else {
      completeProfile();
    }
  };

  const handleUserResponse = (response: string) => {
    
    const userMessage: Message = {
      id: `user-${currentStep}`,
      type: 'user',
      content: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Update user profile
    const currentField = conversationFlow[currentStep].field;
    setUserProfile(prev => ({
      ...prev,
      [currentField]: response
    }));
    
    setCurrentStep(prev => prev + 1);
    setCurrentInput('');
    
    setTimeout(() => askNextQuestion(), 500);
  };

  const completeProfile = () => {
    setIsTyping(true);
    setTimeout(() => {
      const completionMessage: Message = {
        id: 'completion',
        type: 'bot',
        content: `Perfect! I've created your personalized profile. Based on your information, I'll show you funding opportunities specifically matched to ${userProfile.sector} organizations in ${userProfile.country}. Let me take you to your dashboard!`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
      setIsTyping(false);
      
      // Create user profile in database
      setTimeout(() => {
        createUserMutation.mutate(userProfile);
      }, 2000);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (currentInput.trim()) {
      handleUserResponse(currentInput);
    }
  };

  const handleOptionClick = (option: string) => {
    handleUserResponse(option);
  };

  const currentQuestion = conversationFlow[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Granada AI Assistant</h1>
              <p className="text-sm text-white/70">Personalizing your funding journey</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/20 text-white'
                  } rounded-xl p-3 backdrop-blur-sm`}>
                    {message.type === 'bot' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs font-medium">Granada AI</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Options */}
                    {message.options && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {message.options.map((option) => (
                          <Button
                            key={option}
                            variant="outline"
                            size="sm"
                            onClick={() => handleOptionClick(option)}
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-white" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {currentStep < conversationFlow.length && !currentQuestion?.options && (
            <div className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your response..."
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                type={currentQuestion?.type || 'text'}
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!currentInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-2">
              <span>Progress</span>
              <span>{currentStep}/{conversationFlow.length}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / conversationFlow.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveLanding;