import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  ChevronRight, 
  Lightbulb, 
  Gem, 
  Users, 
  MessageCircle,
  ArrowRight,
  ExternalLink,
  Phone
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '.././contexts/AuthContext';

interface GuideStep {
  title: string;
  content: React.ReactNode;
  image?: string;
}

interface GuideConfig {
  [path: string]: {
    title: string;
    steps: GuideStep[];
  };
}

const UserGuide: React.FC = () => {
  const location = useLocation();
  const { user, deductCredits } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState<Record<string, boolean>>({});
  const [showPulse, setShowPulse] = useState(false);

  // Define guides for different pages
  const guides: GuideConfig = {
    '/donor-discovery': {
      title: 'Donor Discovery Guide',
      steps: [
        {
          title: 'Welcome to Donor Discovery',
          content: (
            <div>
              <p className="mb-3">This powerful tool helps you find funding opportunities that match your organization's mission and goals.</p>
              <p>Use the search bar to find donors by keyword, sector, or location. Apply filters to narrow down results.</p>
            </div>
          )
        },
        {
          title: 'AI-Powered Search',
          content: (
            <div>
              <p className="mb-3">Enable <span className="text-purple-400 font-medium">AI Enhanced</span> search to get better matches tailored to your organization's profile.</p>
              <p className="mb-3">This uses 15 credits but provides significantly better results and higher match scores.</p>
              <div className="flex items-center space-x-2 p-2 bg-purple-600/20 rounded-lg">
                <Lightbulb className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400">AI search finds opportunities that exact keyword matching might miss!</span>
              </div>
            </div>
          )
        },
        {
          title: 'Understanding Results',
          content: (
            <div>
              <p className="mb-3">Each opportunity shows:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li><span className="text-green-400 font-medium">Match Score</span> - How well it fits your profile</li>
                <li><span className="text-blue-400 font-medium">Funding Range</span> - Available grant amounts</li>
                <li><span className="text-orange-400 font-medium">Deadline</span> - When applications are due</li>
                <li><span className="text-yellow-400 font-medium">Bookmark</span> - Save opportunities for later</li>
              </ul>
              <p>Click <span className="text-blue-400 font-medium">View Details</span> to see full information or <span className="text-green-400 font-medium">Apply</span> to go directly to the application.</p>
            </div>
          )
        },
        {
          title: 'Need Help?',
          content: (
            <div>
              <p className="mb-3">Our team of funding experts can help you identify the best opportunities and develop winning proposals.</p>
              <div className="p-3 bg-green-600/20 border border-green-500/30 rounded-lg mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Gem className="w-5 h-5 text-green-400" />
                  <h4 className="text-green-400 font-medium">Human Expert Assistance</h4>
                </div>
                <p className="text-sm text-slate-300 mb-2">Get personalized help from our funding experts for just 50 credits.</p>
                <button 
                  onClick={() => {
                    if (deductCredits(50)) {
                      window.open('https://wa.me/27822923504', '_blank');
                    } else {
                      alert('Insufficient credits. Please purchase more credits to use this service.');
                    }
                  }}
                  className="w-full py-2 bg-green-600/30 text-green-400 rounded-lg hover:bg-green-600/40 transition-all flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Get Expert Help (50 Credits)</span>
                </button>
              </div>
            </div>
          )
        }
      ]
    },
    '/proposal-generator': {
      title: 'Expert Proposal Generator Guide',
      steps: [
        {
          title: 'Welcome to Expert Proposal Generator',
          content: (
            <div>
              <p className="mb-3">Create professional grant proposals in minutes using our expert-powered generator.</p>
              <p>You can input information through text, voice recordings, or document uploads.</p>
            </div>
          )
        },
        {
          title: 'Multiple Input Methods',
          content: (
            <div>
              <p className="mb-3">Choose the input method that works best for you:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li><span className="text-green-400 font-medium">Voice Recording</span> - Speak your ideas naturally</li>
                <li><span className="text-blue-400 font-medium">Document Upload</span> - Use existing materials</li>
                <li><span className="text-purple-400 font-medium">Text Description</span> - Type your project details</li>
              </ul>
              <p className="text-sm text-slate-400">The more information you provide, the better your proposal will be!</p>
            </div>
          )
        },
        {
          title: 'Generating Your Proposal',
          content: (
            <div>
              <p className="mb-3">Click <span className="text-purple-400 font-medium">Generate Proposal</span> to create a comprehensive, professional document that includes:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>Executive Summary</li>
                <li>Problem Statement</li>
                <li>Project Objectives</li>
                <li>Methodology</li>
                <li>Budget Overview</li>
                <li>Expected Outcomes</li>
                <li>Monitoring & Evaluation Plan</li>
              </ul>
              <p className="text-sm text-slate-400">Each generation costs 5 credits and takes about 30 seconds.</p>
            </div>
          )
        },
        {
          title: 'Expert Assistance',
          content: (
            <div>
              <p className="mb-3">Need help refining your proposal or targeting specific donors?</p>
              <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h4 className="text-blue-400 font-medium">Professional Review Service</h4>
                </div>
                <p className="text-sm text-slate-300 mb-2">Our grant experts can review your proposal and provide detailed feedback to increase your chances of success.</p>
                <button 
                  onClick={() => {
                    if (deductCredits(50)) {
                      window.open('https://wa.me/27822923504', '_blank');
                    } else {
                      alert('Insufficient credits. Please purchase more credits to use this service.');
                    }
                  }}
                  className="w-full py-2 bg-blue-600/30 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-all flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Request Expert Review (50 Credits)</span>
                </button>
              </div>
            </div>
          )
        }
      ]
    },
    '/funding': {
      title: 'Funding Management Guide',
      steps: [
        {
          title: 'Welcome to Funding Management',
          content: (
            <div>
              <p className="mb-3">Track and manage your grant portfolio from application to disbursement.</p>
              <p>Monitor your success rates, upcoming deadlines, and funding pipeline.</p>
            </div>
          )
        },
        {
          title: 'Managing Your Grants',
          content: (
            <div>
              <p className="mb-3">The Grants tab shows all your funding applications and their status:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li><span className="text-yellow-400 font-medium">Pending</span> - Awaiting decision</li>
                <li><span className="text-green-400 font-medium">Approved</span> - Funding secured</li>
                <li><span className="text-blue-400 font-medium">Disbursed</span> - Funds received</li>
                <li><span className="text-red-400 font-medium">Rejected</span> - Application unsuccessful</li>
              </ul>
              <p>Click on any grant to see detailed information and manage implementation progress.</p>
            </div>
          )
        },
        {
          title: 'Funding Pipeline',
          content: (
            <div>
              <p className="mb-3">The Pipeline tab helps you visualize your funding journey from application to disbursement.</p>
              <p className="mb-3">Track the progress of each opportunity and identify bottlenecks in your funding process.</p>
              <div className="flex items-center space-x-2 p-2 bg-blue-600/20 rounded-lg">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Aim to have opportunities at every stage of the pipeline for consistent funding!</span>
              </div>
            </div>
          )
        },
        {
          title: 'Need Funding Strategy Help?',
          content: (
            <div>
              <p className="mb-3">Our funding experts can help you develop a comprehensive funding strategy tailored to your organization's needs.</p>
              <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Gem className="w-5 h-5 text-purple-400" />
                  <h4 className="text-purple-400 font-medium">Funding Strategy Consultation</h4>
                </div>
                <p className="text-sm text-slate-300 mb-2">Get personalized advice on diversifying your funding sources and maximizing your success rate.</p>
                <button 
                  onClick={() => {
                    if (deductCredits(50)) {
                      window.open('https://wa.me/27822923504', '_blank');
                    } else {
                      alert('Insufficient credits. Please purchase more credits to use this service.');
                    }
                  }}
                  className="w-full py-2 bg-purple-600/30 text-purple-400 rounded-lg hover:bg-purple-600/40 transition-all flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Schedule Consultation (50 Credits)</span>
                </button>
              </div>
            </div>
          )
        }
      ]
    }
  };

  // Check if there's a guide for the current path
  const currentGuide = guides[location.pathname];
  
  useEffect(() => {
    // Check if user has seen this guide before
    const savedGuides = localStorage.getItem('granada_seen_guides');
    if (savedGuides) {
      setHasSeenGuide(JSON.parse(savedGuides));
    }
    
    // Show pulse animation if user hasn't seen this guide
    if (currentGuide && !hasSeenGuide[location.pathname]) {
      setShowPulse(true);
    } else {
      setShowPulse(false);
    }
  }, [location.pathname]);

  const markGuideAsSeen = () => {
    if (currentGuide) {
      const updatedGuides = { ...hasSeenGuide, [location.pathname]: true };
      setHasSeenGuide(updatedGuides);
      localStorage.setItem('granada_seen_guides', JSON.stringify(updatedGuides));
      setShowPulse(false);
    }
  };

  const handleOpenGuide = () => {
    setIsOpen(true);
    setCurrentStep(0);
    markGuideAsSeen();
  };

  const handleCloseGuide = () => {
    setIsOpen(false);
  };

  const handleNextStep = () => {
    if (currentGuide && currentStep < currentGuide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!currentGuide) return null;

  return (
    <>
      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpenGuide}
        className="fixed bottom-6 right-6 z-40 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg"
      >
        <HelpCircle className="w-6 h-6 text-white" />
        {showPulse && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </motion.button>

      {/* Guide Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseGuide}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                <h3 className="text-xl font-bold text-white">{currentGuide.title}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={handleCloseGuide}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    {currentGuide.steps[currentStep].title}
                  </h4>
                  <div className="text-slate-300">
                    {currentGuide.steps[currentStep].content}
                  </div>
                </div>
                
                {/* Step Indicators */}
                <div className="flex justify-center space-x-2 mb-4">
                  {currentGuide.steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-blue-500' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex justify-between p-5 border-t border-slate-700/50">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <span>{currentStep === currentGuide.steps.length - 1 ? 'Finish' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserGuide;