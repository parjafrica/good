import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Bot, Send, ArrowRight, Sparkles } from 'lucide-react';

interface UserProfile {
  name?: string;
  email?: string;
  userType?: string;
  // Student fields
  educationLevel?: string;
  fieldOfStudy?: string;
  goals?: string[];
  // Organization fields
  organizationType?: string;
  organizationName?: string;
  position?: string;
  focusAreas?: string[];
  // Common fields
  country?: string;
  fundingExperience?: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  options?: string[];
  inputType?: 'text' | 'select' | 'multiselect';
}

// Define conversation flow
const conversationFlow = [
  {
    id: 'welcome',
    message: "Welcome to Granada OS! I'm your funding expert, and I'll help you find the perfect funding opportunities. Let's start by getting to know you better. What's your name?",
    field: 'name',
    inputType: 'text'
  },
  {
    id: 'email',
    message: "Thanks {name}! I'll need your email to send you matching funding opportunities. What's your email address?",
    field: 'email',
    inputType: 'text'
  },
  {
    id: 'userType',
    message: "Now, are you seeking funding as an individual student or representing an organization?",
    field: 'userType',
    inputType: 'select',
    options: [
      'Individual Student (Scholarships & Educational Grants)',
      'Organization (Institutional Funding)'
    ]
  },
  // Student Path
  {
    id: 'studentLevel',
    message: "What level of education are you pursuing?",
    field: 'educationLevel',
    inputType: 'select',
    condition: (profile: any) => profile.userType?.includes('Individual Student'),
    options: [
      'High School Graduate (Undergraduate)',
      'Undergraduate Student',
      'Graduate Student (Masters)',
      'PhD/Doctoral Student',
      'Postdoctoral Researcher',
      'Vocational/Technical Training'
    ]
  },
  {
    id: 'fieldOfStudy',
    message: "What field of study are you interested in or currently pursuing?",
    field: 'fieldOfStudy',
    inputType: 'select',
    condition: (profile: any) => profile.userType?.includes('Individual Student'),
    options: [
      'STEM (Science, Technology, Engineering, Mathematics)',
      'Medicine & Health Sciences',
      'Business & Economics',
      'Social Sciences & Public Policy',
      'Arts & Humanities',
      'Education & Teaching',
      'Agriculture & Environmental Sciences',
      'Engineering & Technology',
      'Law & Legal Studies',
      'Other'
    ]
  },
  {
    id: 'studentCountry',
    message: "Which country are you from or where do you plan to study?",
    field: 'country',
    inputType: 'text',
    condition: (profile: any) => profile.userType?.includes('Individual Student')
  },
  {
    id: 'studentGoals',
    message: "What are your main academic/career goals? Select all that apply:",
    field: 'goals',
    inputType: 'multiselect',
    condition: (profile: any) => profile.userType?.includes('Individual Student'),
    options: [
      'Complete degree program',
      'Conduct research',
      'Study abroad',
      'Professional development',
      'Start a business/startup',
      'Community service',
      'Environmental impact',
      'Social justice work',
      'Healthcare advancement',
      'Technology innovation'
    ]
  },
  // Organization Path
  {
    id: 'organizationType',
    message: "What type of organization do you represent?",
    field: 'organizationType',
    inputType: 'select',
    condition: (profile: any) => profile.userType?.includes('Organization'),
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
    inputType: 'text',
    condition: (profile: any) => profile.userType?.includes('Organization')
  },
  {
    id: 'position',
    message: "What's your role at {organizationName}?",
    field: 'position',
    inputType: 'text',
    condition: (profile: any) => profile.userType?.includes('Organization')
  },
  {
    id: 'organizationCountry',
    message: "Which country is your organization based in?",
    field: 'country',
    inputType: 'text',
    condition: (profile: any) => profile.userType?.includes('Organization')
  },
  {
    id: 'focusAreas',
    message: "What are your main focus areas? Select all that apply:",
    field: 'focusAreas',
    inputType: 'multiselect',
    condition: (profile: any) => profile.userType?.includes('Organization'),
    options: [
      'Education',
      'Healthcare',
      'Environment',
      'Agriculture',
      'Technology',
      'Social Justice',
      'Economic Development',
      'Arts & Culture',
      'Research & Innovation',
      'Human Rights',
      'Community Development',
      'Youth Programs',
      'Women Empowerment',
      'Climate Change',
      'Poverty Alleviation'
    ]
  },
  // Common final steps
  {
    id: 'fundingExperience',
    message: "How would you describe your experience with grant applications?",
    field: 'fundingExperience',
    inputType: 'select',
    options: [
      'Complete beginner - never applied before',
      'Some experience - applied to a few grants',
      'Experienced - regularly apply for funding',
      'Expert - very successful track record'
    ]
  },
  {
    id: 'complete',
    message: "Perfect! I now have everything I need to find the best funding opportunities for you. Let's get started!",
    field: 'complete',
    inputType: 'complete'
  }
];

export default function OnboardPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
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
      setMessages(prev => prev.some(msg => msg.content === processedContent) ? prev : [...prev, newMessage]);
      setIsTyping(false);
    }, 1000);
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

  const processMessageTemplate = (message: string): string => {
    let processed = message;
    Object.entries(userProfile).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (typeof value === 'string') {
        processed = processed.replace(new RegExp(placeholder, 'g'), value);
      }
    });
    return processed;
  };

  const findNextStep = (currentStepIndex: number, profile: UserProfile): number => {
    for (let i = currentStepIndex + 1; i < conversationFlow.length; i++) {
      const step = conversationFlow[i];
      if (!step.condition || step.condition(profile)) {
        return i;
      }
    }
    return conversationFlow.length;
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
    const nextStep = findNextStep(currentStep, newProfileData);
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
      // Auto-advance for single select options
      setTimeout(() => {
        const newProfileData = { ...userProfile };
        newProfileData[currentFlow.field as keyof UserProfile] = option as any;
        
        addUserMessage(option);
        setUserProfile(newProfileData);

        // Move to next step
        const nextStep = findNextStep(currentStep, newProfileData);
        if (nextStep < conversationFlow.length) {
          setCurrentStep(nextStep);
          setTimeout(() => {
            addBotMessage(conversationFlow[nextStep].message, nextStep);
          }, 1500);
        }

        // Reset inputs
        setCurrentInput('');
        setSelectedOptions([]);
      }, 500);
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
            <div className="flex items-start space-x-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 text-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentInput(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSubmit()}
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

          {currentFlow.inputType === 'multiselect' && (
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={selectedOptions.length === 0}
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