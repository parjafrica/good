import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Target, 
  FileText, 
  DollarSign, 
  Bot,
  Gem,
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TourStep {
  title: string;
  description: React.ReactNode;
  image?: string;
  path?: string;
  buttonText?: string;
  elementId?: string; // ID of the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right'; // Position of the tooltip
}

interface TourGuide {
  id: string;
  title: string;
  steps: TourStep[];
}

const OnboardingTour: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentGuide, setCurrentGuide] = useState<TourGuide | null>(null);
  const [showTourButton, setShowTourButton] = useState(false);
  const [hasSeenGuides, setHasSeenGuides] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const tourRef = useRef<HTMLDivElement>(null);

  // Define guides for different pages
  const guides: Record<string, TourGuide> = {
    '/': {
      id: 'dashboard',
      title: 'Dashboard Tour',
      steps: [
        {
          title: 'Welcome to Granada!',
          description: (
            <div>
              <p className="mb-3">Your all-in-one platform for finding funding, creating proposals, and managing your impact projects.</p>
              <p>Let's take a quick tour to help you get started.</p>
            </div>
          )
        },
        {
          title: 'Dashboard Overview',
          description: (
            <div>
              <p className="mb-3">This is your dashboard where you can see all your key metrics and recent activity.</p>
              <p>Click on any card to dive deeper into that section.</p>
            </div>
          ),
          elementId: 'dashboard-stats'
        },
        {
          title: 'Quick Actions',
          description: (
            <div>
              <p className="mb-3">Use these quick actions to jump to common tasks like creating proposals or finding donors.</p>
            </div>
          ),
          elementId: 'quick-actions'
        }
      ]
    },
    '/donor-discovery': {
      id: 'donor-discovery',
      title: 'Donor Discovery Guide',
      steps: [
        {
          title: 'Discover Funding Opportunities',
          description: (
            <div>
              <p className="mb-3">Use our AI-powered Donor Discovery to find funding opportunities that match your organization's mission.</p>
              <p>Our system continuously scans hundreds of sources to bring you the most relevant and up-to-date opportunities.</p>
            </div>
          ),
          elementId: 'search-section'
        },
        {
          title: 'AI-Enhanced Search',
          description: (
            <div>
              <p className="mb-3">Enable <span className="text-purple-400 font-medium">AI Enhanced</span> search to get better matches tailored to your organization's profile.</p>
              <p className="mb-3">This uses 15 credits but provides significantly better results and higher match scores.</p>
              <div className="flex items-center space-x-2 p-2 bg-purple-600/20 rounded-lg">
                <Info className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400">AI search finds opportunities that exact keyword matching might miss!</span>
              </div>
            </div>
          ),
          elementId: 'ai-enhanced-toggle'
        },
        {
          title: 'Opportunity Details',
          description: (
            <div>
              <p className="mb-3">Click "View Details" to see complete information about any opportunity.</p>
              <p>You can also bookmark opportunities to save them for later.</p>
            </div>
          ),
          elementId: 'opportunity-card'
        }
      ]
    },
    '/proposal-generator': {
      id: 'proposal-generator',
      title: 'AI Proposal Generator Guide',
      steps: [
        {
          title: 'Create Professional Proposals',
          description: (
            <div>
              <p className="mb-3">Our AI Proposal Generator helps you create compelling grant proposals in minutes.</p>
              <p>Simply describe your project, and our AI will generate a comprehensive proposal tailored to your needs.</p>
            </div>
          ),
          elementId: 'proposal-input'
        },
        {
          title: 'Multiple Input Methods',
          description: (
            <div>
              <p className="mb-3">You can provide information through:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li><span className="text-green-400 font-medium">Voice Recording</span> - Speak your ideas naturally</li>
                <li><span className="text-blue-400 font-medium">Document Upload</span> - Use existing materials</li>
                <li><span className="text-purple-400 font-medium">Text Description</span> - Type your project details</li>
              </ul>
            </div>
          ),
          elementId: 'input-methods'
        }
      ]
    },
    '/credits': {
      id: 'credits',
      title: 'Credits System Guide',
      steps: [
        {
          title: 'Granada Credits System',
          description: (
            <div>
              <p className="mb-3">Credits power all AI features in Granada, from proposal generation to donor matching.</p>
              <p>Purchase credits to unlock the full potential of our platform.</p>
            </div>
          ),
          elementId: 'credits-header'
        },
        {
          title: 'Credit Usage',
          description: (
            <div>
              <p className="mb-3">Different features require different amounts of credits:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li><span className="text-purple-400 font-medium">AI Proposal Generation</span>: 5 credits</li>
                <li><span className="text-blue-400 font-medium">AI-Enhanced Search</span>: 15 credits</li>
                <li><span className="text-green-400 font-medium">Expert Assistance</span>: 50 credits</li>
              </ul>
            </div>
          ),
          elementId: 'credit-usage'
        },
        {
          title: 'Choose Your Package',
          description: (
            <div>
              <p className="mb-3">Select the credit package that best fits your needs.</p>
              <p>Larger packages offer better value with bonus credits and additional features.</p>
            </div>
          ),
          elementId: 'credit-packages'
        }
      ]
    }
  };

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('granada_onboarding_completed');
    const seenGuides = localStorage.getItem('granada_seen_guides');
    
    if (seenGuides) {
      setHasSeenGuides(JSON.parse(seenGuides));
    }
    
    // Check if there's a guide for the current path
    const pathGuide = guides[location.pathname];
    
    if (pathGuide) {
      setCurrentGuide(pathGuide);
      
      // Show tour button if user hasn't seen this guide
      if (!hasCompletedOnboarding || !hasSeenGuides[pathGuide.id]) {
        setShowTourButton(true);
        
        // Auto-show tour for first-time users after a short delay
        if (!hasCompletedOnboarding && !hasSeenGuides[pathGuide.id]) {
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 1500);
          
          return () => clearTimeout(timer);
        }
      }
    } else {
      setShowTourButton(false);
      setCurrentGuide(null);
    }
  }, [location.pathname]);

  // Handle clicking outside the tour modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tourRef.current && !tourRef.current.contains(event.target as Node)) {
        // Don't close if clicking on a highlighted element
        const target = event.target as HTMLElement;
        if (target.classList.contains('tour-highlight')) {
          return;
        }
        completeTour();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const markGuideAsSeen = () => {
    if (currentGuide) {
      const updatedGuides = { ...hasSeenGuides, [currentGuide.id]: true };
      setHasSeenGuides(updatedGuides);
      localStorage.setItem('granada_seen_guides', JSON.stringify(updatedGuides));
      setShowTourButton(false);
    }
  };

  const handleNext = () => {
    if (currentGuide && currentStep < currentGuide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    markGuideAsSeen();
  };

  const handleOpenGuide = () => {
    setIsVisible(true);
    setCurrentStep(0);
  };

  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path);
    }
    handleNext();
  };

  // If no current guide, don't render anything
  if (!currentGuide) return null;

  return (
    <>
      {/* Help Button - Only show if there's a guide for this page and user hasn't seen it */}
      {showTourButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpenGuide}
          className="fixed bottom-20 right-6 z-40 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg"
        >
          <HelpCircle className="w-6 h-6 text-white" />
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </motion.button>
      )}

      {/* Tour Overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Tour Modal */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tourRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed z-50 pointer-events-auto"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                <h3 className="text-xl font-bold text-white">{currentGuide.title}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={completeTour}
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
                    {currentGuide.steps[currentStep].description}
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
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={completeTour}
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
                >
                  Skip
                </motion.button>
                
                {currentGuide.steps[currentStep].path ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleNavigate(currentGuide.steps[currentStep].path)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <span>{currentGuide.steps[currentStep].buttonText || 'Try It'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <span>{currentStep === currentGuide.steps.length - 1 ? 'Finish' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Element Highlights */}
      <AnimatePresence>
        {isVisible && currentGuide.steps[currentStep].elementId && (
          <HighlightElement 
            elementId={currentGuide.steps[currentStep].elementId} 
            position={currentGuide.steps[currentStep].position || 'bottom'}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Component to highlight a specific element
const HighlightElement: React.FC<{ 
  elementId: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}> = ({ elementId, position }) => {
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateElementRect = () => {
      const element = document.getElementById(elementId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setElementRect(rect);
        
        // Add highlight class to the element
        element.classList.add('tour-highlight');
        
        // Scroll element into view if needed
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    updateElementRect();
    
    // Update rect on resize and periodically to handle dynamic content
    window.addEventListener('resize', updateElementRect);
    const interval = setInterval(updateElementRect, 500);
    
    return () => {
      // Remove highlight class when component unmounts
      const element = document.getElementById(elementId);
      if (element) {
        element.classList.remove('tour-highlight');
      }
      window.removeEventListener('resize', updateElementRect);
      clearInterval(interval);
    };
  }, [elementId, windowSize]);

  if (!elementRect) return null;

  // Calculate position for the highlight indicator
  const getPosition = () => {
    // Adjust position based on screen size
    const isMobile = window.innerWidth < 768;
    
    switch (position) {
      case 'top':
        return {
          top: Math.max(10, elementRect.top - 10),
          left: elementRect.left + elementRect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: Math.min(window.innerHeight - 50, elementRect.bottom + 10),
          left: elementRect.left + elementRect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return isMobile ? {
          // On mobile, position below instead of to the left
          top: elementRect.bottom + 10,
          left: elementRect.left + elementRect.width / 2,
          transform: 'translate(-50%, 0)'
        } : {
          top: elementRect.top + elementRect.height / 2,
          left: Math.max(10, elementRect.left - 10),
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return isMobile ? {
          // On mobile, position below instead of to the right
          top: elementRect.bottom + 10,
          left: elementRect.left + elementRect.width / 2,
          transform: 'translate(-50%, 0)'
        } : {
          top: elementRect.top + elementRect.height / 2,
          left: Math.min(window.innerWidth - 50, elementRect.right + 10),
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: Math.min(window.innerHeight - 50, elementRect.bottom + 10),
          left: elementRect.left + elementRect.width / 2,
          transform: 'translate(-50%, 0)'
        };
    }
  };

  const positionStyle = getPosition();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed z-50 pointer-events-none"
      style={{
        width: elementRect.width + 10,
        height: elementRect.height + 10,
        top: elementRect.top - 5,
        left: elementRect.left - 5,
      }}
    >
      <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute"
        style={positionStyle}
      >
        <ArrowRight className="w-6 h-6 text-blue-500" style={{
          transform: position === 'left' ? 'rotate(180deg)' : 
                     position === 'top' ? 'rotate(270deg)' : 
                     position === 'bottom' ? 'rotate(90deg)' : 'rotate(0deg)'
        }} />
      </motion.div>
    </motion.div>
  );
};

export default OnboardingTour;