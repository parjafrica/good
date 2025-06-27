import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { 
  Lightbulb, 
  FileText, 
  Palette, 
  Globe, 
  Rocket,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  Users,
  Briefcase,
  Heart,
  Zap,
  Star
} from 'lucide-react';

export default function GenesisEngine() {
  const [currentStep, setCurrentStep] = useState(0);
  const [ideaData, setIdeaData] = useState({
    concept: '',
    mission: '',
    sector: '',
    location: '',
    targetAudience: '',
    fundingNeeds: '',
    timeline: '',
    team: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const genesisSteps = [
    {
      id: 'incubator',
      title: 'Idea Incubator',
      subtitle: 'Transform your vision into reality',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      description: 'Capture and refine your core concept with AI guidance'
    },
    {
      id: 'foundry',
      title: 'Document Foundry',
      subtitle: 'Create professional documentation',
      icon: FileText,
      color: 'from-blue-500 to-purple-500',
      description: 'Generate policies, bylaws, and legal documents'
    },
    {
      id: 'brand',
      title: 'Brand Forge',
      subtitle: 'Design your visual identity',
      icon: Palette,
      color: 'from-pink-500 to-rose-500',
      description: 'Create logos, color schemes, and brand guidelines'
    },
    {
      id: 'digital',
      title: 'Digital Pipeline',
      subtitle: 'Build your online presence',
      icon: Globe,
      color: 'from-green-500 to-teal-500',
      description: 'Design websites, social media, and digital assets'
    },
    {
      id: 'launch',
      title: 'Launch Ready',
      subtitle: 'Deploy your organization',
      icon: Rocket,
      color: 'from-purple-500 to-indigo-500',
      description: 'Finalize everything and go live'
    }
  ];

  const sectorOptions = [
    { value: 'education', label: 'Education & Training', icon: '📚' },
    { value: 'healthcare', label: 'Healthcare & Medicine', icon: '🏥' },
    { value: 'environment', label: 'Environment & Climate', icon: '🌱' },
    { value: 'technology', label: 'Technology & Innovation', icon: '💻' },
    { value: 'social', label: 'Social Services', icon: '🤝' },
    { value: 'economic', label: 'Economic Development', icon: '💼' },
    { value: 'arts', label: 'Arts & Culture', icon: '🎨' },
    { value: 'sports', label: 'Sports & Recreation', icon: '⚽' }
  ];

  const handleStepComplete = async (stepData: any) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIdeaData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < genesisSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
    
    setIsProcessing(false);
  };

  const renderIdeaIncubator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">What's Your Big Idea?</h2>
        <p className="text-gray-400">Describe your vision and let our AI help you refine it</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Core Concept</label>
          <textarea
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Describe your idea in your own words..."
            rows={4}
            value={ideaData.concept}
            onChange={(e) => setIdeaData(prev => ({ ...prev, concept: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Sector</label>
            <div className="grid grid-cols-2 gap-3">
              {sectorOptions.map((sector) => (
                <button
                  key={sector.value}
                  onClick={() => setIdeaData(prev => ({ ...prev, sector: sector.value }))}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    ideaData.sector === sector.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-lg mb-1">{sector.icon}</div>
                  <div className="text-sm font-medium">{sector.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Location</label>
              <input
                type="text"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Where will you operate?"
                value={ideaData.location}
                onChange={(e) => setIdeaData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <input
                type="text"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Who will you serve?"
                value={ideaData.targetAudience}
                onChange={(e) => setIdeaData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => handleStepComplete({ 
            concept: ideaData.concept,
            sector: ideaData.sector,
            location: ideaData.location,
            targetAudience: ideaData.targetAudience
          })}
          disabled={!ideaData.concept || !ideaData.sector || isProcessing}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              AI is analyzing your idea...
            </>
          ) : (
            <>
              Refine with AI
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );

  const renderDocumentFoundry = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Build Your Foundation</h2>
        <p className="text-gray-400">Generate essential documents for your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Mission Statement', icon: Target, desc: 'AI-crafted mission and vision' },
          { title: 'Organizational Bylaws', icon: FileText, desc: 'Legal structure and governance' },
          { title: 'Policy Framework', icon: CheckCircle, desc: 'Operating policies and procedures' },
          { title: 'Strategic Plan', icon: Briefcase, desc: '3-year roadmap and objectives' }
        ].map((doc, index) => (
          <motion.div
            key={doc.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-colors group cursor-pointer"
          >
            <doc.icon className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">{doc.title}</h3>
            <p className="text-gray-300 text-sm">{doc.desc}</p>
            <div className="mt-4 flex items-center text-blue-400 text-sm">
              <Sparkles className="w-4 h-4 mr-1" />
              AI Generated
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => handleStepComplete({})}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center"
      >
        Generate Documents
        <ArrowRight className="w-5 h-5 ml-2" />
      </button>
    </motion.div>
  );

  const renderBrandForge = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Create Your Brand</h2>
        <p className="text-gray-400">Design a professional visual identity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Logo Design', icon: Star, color: 'pink' },
          { title: 'Color Palette', icon: Palette, color: 'purple' },
          { title: 'Typography', icon: FileText, color: 'blue' },
          { title: 'Brand Guidelines', icon: CheckCircle, color: 'green' },
          { title: 'Letterhead', icon: FileText, color: 'yellow' },
          { title: 'Business Cards', icon: Briefcase, color: 'red' }
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-pink-500/30 transition-colors group cursor-pointer"
          >
            <item.icon className="w-8 h-8 text-pink-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold mb-2">{item.title}</h3>
            <div className="w-full h-24 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-lg border border-pink-500/30"></div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => handleStepComplete({})}
        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 rounded-lg text-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-all flex items-center justify-center"
      >
        Generate Brand Assets
        <ArrowRight className="w-5 h-5 ml-2" />
      </button>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderIdeaIncubator();
      case 1:
        return renderDocumentFoundry();
      case 2:
        return renderBrandForge();
      case 3:
        return <div className="text-center">Digital Pipeline - Coming Soon</div>;
      case 4:
        return <div className="text-center">Launch Ready - Coming Soon</div>;
      default:
        return renderIdeaIncubator();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Genesis Engine
            </h1>
            <p className="text-xl text-gray-300">
              Transform your idea into a complete organization
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12 overflow-x-auto">
            <div className="flex items-center space-x-4">
              {genesisSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ 
                      scale: index === currentStep ? 1.1 : index < currentStep ? 1 : 0.8,
                      opacity: index <= currentStep ? 1 : 0.5
                    }}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      index === currentStep
                        ? 'border-blue-500 bg-blue-500/10'
                        : index < currentStep
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 bg-gray-800/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gradient-to-r ${step.color}`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-center">{step.title}</span>
                  </motion.div>
                  
                  {index < genesisSteps.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-gray-600 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {renderCurrentStep()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}