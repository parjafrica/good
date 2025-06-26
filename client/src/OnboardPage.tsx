import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Bot, User, Sparkles, ArrowRight } from 'lucide-react';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
  inputType?: 'text' | 'select' | 'multiselect';
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  organizationType: string;
  organizationName: string;
  position: string;
  country: string;
  focusSectors: string[];
  fundingExperience: string;
  annualBudget: string;
  primaryGoals: string[];
  currentProjects: string;
  challenges: string;
}

const conversationFlow: Array<{
  id: string;
  message: string;
  field: string | null;
  inputType: 'text' | 'select' | 'multiselect' | 'complete';
  options?: string[];
}> = [
  {
    id: 'welcome',
    message: "Hello! I'm here to help you connect with the right funding opportunities. Let's start by getting to know you and your organization. What's your first name?",
    field: 'firstName',
    inputType: 'text'
  },
  {
    id: 'lastName',
    message: "Thank you, {firstName}. And your last name?",
    field: 'lastName',
    inputType: 'text'
  },
  {
    id: 'email',
    message: "Thanks. I'll need your email to send you matching funding opportunities. What's your email address?",
    field: 'email',
    inputType: 'text'
  },
  {
    id: 'organizationType',
    message: "Now let's discuss your organization. What type of organization do you work with?",
    field: 'organizationType',
    inputType: 'select',
    options: [
      'Non-Profit Organization',
      'NGO',
      'Community Based Organization',
      'Faith-Based Organization',
      'Social Enterprise',
      'Educational Institution',
      'Healthcare Organization',
      'Research Institution',
      'Government Agency',
      'Other'
    ]
  },
  {
    id: 'organizationName',
    message: "What's the name of your organization?",
    field: 'organizationName',
    inputType: 'text'
  },
  {
    id: 'position',
    message: "What's your role at {organizationName}?",
    field: 'position',
    inputType: 'text'
  },
  {
    id: 'country',
    message: "Which country is your organization based in?",
    field: 'country',
    inputType: 'select',
    options: [
      'Kenya', 'Uganda', 'South Sudan', 'Tanzania', 'Rwanda', 'Burundi', 'Ethiopia', 'Somalia',
      'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands',
      'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Other'
    ]
  },
  {
    id: 'focusSectors',
    message: "Which sectors does your organization focus on? You can select multiple areas:",
    field: 'focusSectors',
    inputType: 'multiselect',
    options: [
      'Health & Medical',
      'Education',
      'Environment',
      'Agriculture',
      'Water & Sanitation',
      'Human Rights',
      'Women & Gender',
      'Youth Development',
      'Community Development',
      'Emergency Relief',
      'Poverty Alleviation',
      'Technology & Innovation'
    ]
  },
  {
    id: 'fundingExperience',
    message: "How would you describe your experience with securing funding?",
    field: 'fundingExperience',
    inputType: 'select',
    options: [
      'Beginner (0-2 years)',
      'Intermediate (3-5 years)',
      'Advanced (6-10 years)',
      'Expert (10+ years)'
    ]
  },
  {
    id: 'annualBudget',
    message: "What's your organization's approximate annual budget range?",
    field: 'annualBudget',
    inputType: 'select',
    options: [
      'Under $10,000',
      '$10,000 - $50,000',
      '$50,000 - $100,000',
      '$100,000 - $500,000',
      '$500,000 - $1M',
      'Over $1M'
    ]
  },
  {
    id: 'primaryGoals',
    message: "What are your primary funding goals? Select all that apply:",
    field: 'primaryGoals',
    inputType: 'multiselect',
    options: [
      'Start new programs',
      'Expand existing programs',
      'Infrastructure development',
      'Capacity building',
      'Research projects',
      'Emergency response',
      'Sustainability initiatives',
      'Technology adoption'
    ]
  },
  {
    id: 'currentProjects',
    message: "Tell me about your current projects and initiatives. What are you working on?",
    field: 'currentProjects',
    inputType: 'text'
  },
  {
    id: 'challenges',
    message: "What are the main challenges you face when seeking funding? This helps me understand how to better assist you.",
    field: 'challenges',
    inputType: 'text'
  },
  {
    id: 'complete',
    message: "Thank you, {firstName}. I now have a complete picture of your organization and funding needs. Based on your work in {focusSectors} and {fundingExperience} experience level, I've identified several matching opportunities in our database. Let's get you started with your personalized dashboard.",
    field: null,
    inputType: 'complete'
  }
];

export default function OnboardPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    organizationType: '',
    organizationName: '',
    position: '',
    country: '',
    focusSectors: [],
    fundingExperience: '',
    annualBudget: '',
    primaryGoals: [],
    currentProjects: '',
    challenges: ''
  });
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start conversation only once using ref to prevent React StrictMode double execution
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      addBotMessage(conversationFlow[0].message, 0);
    }
  }, []);

  const addBotMessage = (content: string, stepIndex?: number) => {
    setIsTyping(true);
    setTimeout(() => {
      const processedContent = processMessageTemplate(content);
      const flowStep = conversationFlow[stepIndex ?? currentStep];
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: processedContent,
        timestamp: new Date(),
        options: flowStep?.options,
        inputType: flowStep?.inputType as 'text' | 'select' | 'multiselect'
      };
      
      // Check for duplicate messages to prevent React StrictMode issues
      setMessages(prev => {
        const isDuplicate = prev.some(msg => 
          msg.type === 'bot' && 
          msg.content === processedContent && 
          Math.abs(Date.now() - msg.timestamp.getTime()) < 5000 // Within 5 seconds
        );
        
        if (isDuplicate) {
          return prev; // Don't add duplicate
        }
        
        return [...prev, newMessage];
      });
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random typing delay
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processMessageTemplate = (message: string) => {
    let processed = message;
    Object.entries(userProfile).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        processed = processed.replace(`{${key}}`, value.join(', '));
      } else {
        processed = processed.replace(`{${key}}`, value || '');
      }
    });
    return processed;
  };

  const handleSubmit = () => {
    if (!currentInput.trim() && selectedOptions.length === 0) return;

    const currentFlow = conversationFlow[currentStep];
    let responseText = '';
    let newProfileData = { ...userProfile };

    if (currentFlow.inputType === 'multiselect') {
      responseText = selectedOptions.join(', ');
      newProfileData[currentFlow.field as keyof UserProfile] = selectedOptions as any;
    } else if (currentFlow.inputType === 'select') {
      responseText = currentInput;
      newProfileData[currentFlow.field as keyof UserProfile] = currentInput as any;
    } else if (currentFlow.inputType === 'text') {
      responseText = currentInput;
      newProfileData[currentFlow.field as keyof UserProfile] = currentInput as any;
    }

    if (responseText) {
      addUserMessage(responseText);
      setUserProfile(newProfileData);
    }

    // Move to next step
    const nextStep = currentStep + 1;
    if (nextStep < conversationFlow.length) {
      setCurrentStep(nextStep);
      setTimeout(() => {
        addBotMessage(conversationFlow[nextStep].message, nextStep);
      }, 1500);
    }

    // Reset inputs
    setCurrentInput('');
    setSelectedOptions([]);
  };

  const handleOptionSelect = (option: string) => {
    const currentFlow = conversationFlow[currentStep];
    if (currentFlow.inputType === 'multiselect') {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    } else {
      setCurrentInput(option);
    }
  };

  const handleComplete = () => {
    console.log('Onboarding completed:', userProfile);
    navigate('/dashboard');
  };

  const currentFlow = conversationFlow[currentStep];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-400 mr-2" />
          <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Granada OS Setup
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-2xl ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message */}
              <div className={`rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Options for bot messages */}
                {message.type === 'bot' && message.options && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionSelect(option)}
                        className={`block w-full text-left px-3 py-2 rounded-lg border transition-all ${
                          (currentFlow.inputType === 'multiselect' && selectedOptions.includes(option)) ||
                          (currentFlow.inputType === 'select' && currentInput === option)
                            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-sm">{option}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentFlow && currentStep < conversationFlow.length - 1 && (
        <div className="border-t border-gray-800 p-4">
          {currentFlow.inputType === 'text' && (
            <div className="flex space-x-3">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Type your response..."
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
              />
              <Button
                onClick={handleSubmit}
                disabled={!currentInput.trim()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {(currentFlow.inputType === 'select' || currentFlow.inputType === 'multiselect') && (
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={
                  (currentFlow.inputType === 'select' && !currentInput) ||
                  (currentFlow.inputType === 'multiselect' && selectedOptions.length === 0)
                }
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Completion */}
      {currentStep === conversationFlow.length - 1 && (
        <div className="border-t border-gray-800 p-4">
          <div className="flex justify-center">
            <Button
              onClick={handleComplete}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8 py-3"
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}