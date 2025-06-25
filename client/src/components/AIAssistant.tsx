import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Lightbulb, 
  FileText, 
  Search, 
  TrendingUp,
  Zap,
  MessageCircle,
  Sparkles,
  Brain,
  Target
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AICapability {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  examples: string[];
}

const ExpertAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);

  const capabilities: AICapability[] = [
    {
      id: 'proposal-writing',
      title: 'Proposal Writing',
      description: 'Get help crafting compelling grant proposals',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      examples: [
        'Help me write an executive summary for my education project',
        'Improve the methodology section of my proposal',
        'Generate a budget narrative for a $50k grant'
      ]
    },
    {
      id: 'donor-matching',
      title: 'Donor Matching',
      description: 'Find funding opportunities that match your mission',
      icon: <Search className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      examples: [
        'Find donors interested in youth development programs',
        'What grants are available for climate change projects?',
        'Show me foundations that fund education in Africa'
      ]
    },
    {
      id: 'project-analysis',
      title: 'Project Analysis',
      description: 'Analyze project performance and get insights',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      examples: [
        'Analyze the performance of my health project',
        'What are the key risks for my upcoming initiative?',
        'How can I improve my project completion rate?'
      ]
    },
    {
      id: 'strategic-planning',
      title: 'Strategic Planning',
      description: 'Develop strategies and theories of change',
      icon: <Target className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
      examples: [
        'Help me create a theory of change for education',
        'What indicators should I use for impact measurement?',
        'Design a logic model for my community project'
      ]
    }
  ];

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: "Hello! I'm Granada AI, your intelligent assistant for impact-driven work. I can help you with proposal writing, finding funding opportunities, analyzing projects, and strategic planning. What would you like to work on today?",
        timestamp: new Date(),
        suggestions: [
          'Help me write a proposal',
          'Find funding opportunities',
          'Analyze my project performance',
          'Create a strategic plan'
        ]
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
        suggestions: generateSuggestions(inputMessage)
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('proposal') || lowerInput.includes('grant')) {
      return "I'd be happy to help you with your proposal! For effective grant writing, I recommend starting with a clear problem statement, followed by specific objectives and a detailed methodology. Would you like me to help you draft a specific section, or would you prefer guidance on the overall structure?";
    }
    
    if (lowerInput.includes('funding') || lowerInput.includes('donor')) {
      return "I can help you identify relevant funding opportunities! Based on your organization's focus areas, I'll search through our database of donors and grants. Could you tell me more about your project's sector, target beneficiaries, and geographic focus?";
    }
    
    if (lowerInput.includes('project') || lowerInput.includes('performance')) {
      return "Project analysis is one of my strengths! I can help you evaluate project performance, identify bottlenecks, and suggest improvements. Would you like me to analyze a specific project's metrics, or are you looking for general performance insights across your portfolio?";
    }
    
    if (lowerInput.includes('strategy') || lowerInput.includes('planning')) {
      return "Strategic planning is crucial for impact! I can help you develop theories of change, create logic models, and design monitoring frameworks. What type of strategic planning support do you need - organizational strategy, project design, or impact measurement?";
    }
    
    return "That's an interesting question! I'm here to help with all aspects of your impact work. Could you provide more details about what you're trying to achieve? I can assist with proposal writing, funding research, project analysis, strategic planning, and much more.";
  };

  const generateSuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('proposal')) {
      return [
        'Help me write an executive summary',
        'Review my methodology section',
        'Create a budget template',
        'Improve my impact narrative'
      ];
    }
    
    if (lowerInput.includes('funding')) {
      return [
        'Show me education grants',
        'Find health-focused donors',
        'Search for climate funding',
        'Identify local foundations'
      ];
    }
    
    return [
      'Tell me more about Granada features',
      'Help me get started with proposals',
      'Show me project templates',
      'Explain impact measurement'
    ];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real implementation, this would start/stop speech recognition
    console.log('Voice input:', isListening ? 'stopped' : 'started');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Granada AI Assistant
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Your intelligent partner for impact-driven work
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Capabilities Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Capabilities</h3>
            {capabilities.map((capability) => (
              <motion.div
                key={capability.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedCapability(
                  selectedCapability === capability.id ? null : capability.id
                )}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  selectedCapability === capability.id
                    ? 'bg-white shadow-lg border-blue-200'
                    : 'bg-white/50 hover:bg-white hover:shadow-md border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${capability.color}`}>
                    <div className="text-white">
                      {capability.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{capability.title}</h4>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{capability.description}</p>
                
                <AnimatePresence>
                  {selectedCapability === capability.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-xs font-medium text-gray-700 mb-2">Try asking:</p>
                      {capability.examples.map((example, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSuggestionClick(example)}
                          className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          "{example}"
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Granada AI</h3>
                    <p className="text-sm text-gray-500">Online and ready to help</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } rounded-2xl p-4`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        
                        {message.suggestions && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-gray-600">Suggestions:</p>
                            {message.suggestions.map((suggestion, index) => (
                              <motion.button
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left p-2 text-xs bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                              >
                                {suggestion}
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-gray-500">Granada AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about your impact work..."
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleListening}
                    className={`p-3 rounded-xl transition-colors ${
                      isListening 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ExpertAssistant;