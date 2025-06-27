import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { 
  User, 
  FileText, 
  Mic,
  Video,
  Briefcase,
  Target,
  Award,
  Users,
  TrendingUp,
  MessageCircle,
  Play,
  Download,
  Share,
  Edit,
  Save,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Globe
} from 'lucide-react';

interface CVSection {
  id: string;
  title: string;
  content: string;
  aiSuggestions: string[];
}

export default function CareerSuite() {
  const [activeTab, setActiveTab] = useState('cv');
  const [cvSections, setCvSections] = useState<CVSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [interviewMode, setInterviewMode] = useState('practice');
  const { user } = useAuth();

  const careerTools = [
    {
      id: 'cv',
      title: 'CV Builder',
      subtitle: 'Professional resume creation',
      icon: FileText,
      color: 'from-blue-500 to-purple-500',
      description: 'AI-powered CV optimization for your sector'
    },
    {
      id: 'interview',
      title: 'Interview Coach',
      subtitle: 'Practice with AI interviewer',
      icon: Mic,
      color: 'from-green-500 to-teal-500',
      description: 'Realistic interview simulations'
    },
    {
      id: 'portfolio',
      title: 'Portfolio Builder',
      subtitle: 'Showcase your work',
      icon: Briefcase,
      color: 'from-orange-500 to-red-500',
      description: 'Professional project galleries'
    },
    {
      id: 'network',
      title: 'Network Builder',
      subtitle: 'Connect with professionals',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      description: 'Strategic relationship mapping'
    }
  ];

  const cvSectionTemplates = [
    { id: 'personal', title: 'Personal Information', required: true },
    { id: 'summary', title: 'Professional Summary', required: true },
    { id: 'experience', title: 'Work Experience', required: true },
    { id: 'education', title: 'Education', required: true },
    { id: 'skills', title: 'Skills & Competencies', required: true },
    { id: 'achievements', title: 'Key Achievements', required: false },
    { id: 'certifications', title: 'Certifications', required: false },
    { id: 'languages', title: 'Languages', required: false },
    { id: 'volunteer', title: 'Volunteer Experience', required: false },
    { id: 'references', title: 'References', required: false }
  ];

  const interviewQuestions = {
    general: [
      "Tell me about yourself and your background.",
      "Why are you interested in this position?",
      "What are your greatest strengths?",
      "Describe a challenging situation you've overcome.",
      "Where do you see yourself in 5 years?"
    ],
    ngo: [
      "Why do you want to work in the nonprofit sector?",
      "How do you handle working with limited resources?",
      "Describe your experience with community engagement.",
      "How do you measure impact in your work?",
      "Tell me about a time you advocated for a cause."
    ],
    technical: [
      "Explain a technical project you've led.",
      "How do you stay updated with industry trends?",
      "Describe your problem-solving approach.",
      "How do you handle technical challenges?",
      "What tools and technologies do you prefer?"
    ]
  };

  useEffect(() => {
    // Initialize CV sections
    const initialSections = cvSectionTemplates.map(template => ({
      id: template.id,
      title: template.title,
      content: '',
      aiSuggestions: []
    }));
    setCvSections(initialSections);
  }, []);

  const generateAISuggestions = async (sectionId: string, content: string) => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suggestions = {
      summary: [
        "Dedicated development professional with 5+ years of experience in East Africa",
        "Results-driven program manager specializing in sustainable development initiatives",
        "Passionate advocate for social change with proven track record in community engagement"
      ],
      experience: [
        "Led cross-functional team of 12 members",
        "Implemented data-driven monitoring systems",
        "Secured $2.3M in funding through strategic partnerships"
      ],
      skills: [
        "Project Management (PMP Certified)",
        "Stakeholder Engagement",
        "Data Analysis & Reporting",
        "Grant Writing & Fundraising",
        "Community Mobilization"
      ]
    };

    setCvSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, aiSuggestions: suggestions[sectionId as keyof typeof suggestions] || [] }
        : section
    ));
    
    setIsGenerating(false);
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    setCvSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, content }
        : section
    ));
  };

  const renderCVBuilder = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Professional CV Builder</h2>
          <p className="text-gray-400">Create a compelling resume for the development sector</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center">
            <Share className="w-4 h-4 mr-2" />
            Share Link
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CV Sections */}
        <div className="lg:col-span-2 space-y-4">
          {cvSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => generateAISuggestions(section.id, section.content)}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm flex items-center"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    AI Enhance
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <textarea
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder={`Enter your ${section.title.toLowerCase()}...`}
                rows={4}
                value={section.content}
                onChange={(e) => updateSectionContent(section.id, e.target.value)}
              />

              {/* AI Suggestions */}
              {section.aiSuggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-purple-400 mb-2">AI Suggestions:</h4>
                  <div className="space-y-2">
                    {section.aiSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateSectionContent(section.id, suggestion)}
                        className="block w-full text-left p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CV Preview */}
        <div className="bg-white text-black rounded-xl p-6 h-fit">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Live Preview</h3>
          <div className="space-y-4 text-sm">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold">{user?.firstName || 'Your Name'}</h2>
              <p className="text-gray-600">Professional in Development Sector</p>
              <p className="text-gray-600">Uganda | your.email@example.com</p>
            </div>
            
            {cvSections.filter(s => s.content).map(section => (
              <div key={section.id} className="border-b border-gray-200 pb-3">
                <h4 className="font-semibold text-gray-800 mb-1">{section.title}</h4>
                <p className="text-gray-700 text-xs">{section.content.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInterviewCoach = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">AI Interview Coach</h2>
        <p className="text-gray-400">Practice interviews with realistic AI simulation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(interviewQuestions).map(([category, questions]) => (
          <motion.button
            key={category}
            onClick={() => setInterviewMode(category)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-xl border text-left transition-all ${
              interviewMode === category
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <h3 className="font-semibold mb-2 capitalize">{category} Interview</h3>
            <p className="text-sm text-gray-400">{questions.length} practice questions</p>
            <div className="mt-3 flex items-center text-green-400 text-sm">
              <Play className="w-4 h-4 mr-1" />
              Start Practice
            </div>
          </motion.button>
        ))}
      </div>

      {/* Interview Simulation */}
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Video className="w-16 h-16 text-white" />
        </div>
        
        <h3 className="text-xl font-semibold mb-4">Ready to start your {interviewMode} interview?</h3>
        <p className="text-gray-400 mb-6">
          Our AI interviewer will ask you questions and provide real-time feedback on your responses.
        </p>
        
        <div className="flex justify-center space-x-4">
          <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center">
            <Mic className="w-5 h-5 mr-2" />
            Start Voice Interview
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Text Interview
          </button>
        </div>
        
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            15-30 minutes
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1" />
            AI Feedback
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Performance Tracking
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cv':
        return renderCVBuilder();
      case 'interview':
        return renderInterviewCoach();
      case 'portfolio':
        return <div className="text-center py-20">Portfolio Builder - Coming Soon</div>;
      case 'network':
        return <div className="text-center py-20">Network Builder - Coming Soon</div>;
      default:
        return renderCVBuilder();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Career Suite</h1>
            <p className="text-xl text-gray-300">
              Professional development tools for the modern workforce
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-xl p-2 flex space-x-2">
              {careerTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                    activeTab === tool.id
                      ? 'bg-gradient-to-r ' + tool.color + ' text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tool.icon className="w-5 h-5" />
                  <span className="font-medium">{tool.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Content */}
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderActiveTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}