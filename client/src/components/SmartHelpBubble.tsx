import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaTimes, FaLightbulb, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  type: 'tip' | 'warning' | 'info' | 'success';
  trigger: 'hover' | 'click' | 'auto' | 'focus';
  position: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

interface SmartHelpBubbleProps {
  elementId?: string;
  tips: HelpTip[];
  context?: string;
  userProgress?: number;
  className?: string;
}

export default function SmartHelpBubble({ 
  elementId, 
  tips, 
  context = 'general',
  userProgress = 0,
  className = '' 
}: SmartHelpBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState<HelpTip | null>(null);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  // Smart tip selection based on context and user progress
  const getRelevantTip = (): HelpTip | null => {
    if (tips.length === 0) return null;

    // Filter tips based on user progress and context
    const relevantTips = tips.filter(tip => {
      // Show beginner tips for users with low progress
      if (userProgress < 30 && tip.type === 'info') return true;
      // Show advanced tips for experienced users
      if (userProgress > 70 && tip.type === 'tip') return true;
      // Always show warnings and success messages
      if (tip.type === 'warning' || tip.type === 'success') return true;
      return true;
    });

    // Select tip based on priority: warning > success > tip > info
    const prioritizedTips = relevantTips.sort((a, b) => {
      const priority = { warning: 4, success: 3, tip: 2, info: 1 };
      return priority[b.type] - priority[a.type];
    });

    return prioritizedTips[0] || null;
  };

  // Calculate optimal position for bubble
  const calculatePosition = () => {
    if (!targetRef.current || !currentTip) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const bubbleRect = bubbleRef.current?.getBoundingClientRect();
    
    if (!bubbleRect) return;

    let x = 0, y = 0;

    switch (currentTip.position) {
      case 'top':
        x = targetRect.left + (targetRect.width / 2) - (bubbleRect.width / 2);
        y = targetRect.top - bubbleRect.height - 10;
        break;
      case 'bottom':
        x = targetRect.left + (targetRect.width / 2) - (bubbleRect.width / 2);
        y = targetRect.bottom + 10;
        break;
      case 'left':
        x = targetRect.left - bubbleRect.width - 10;
        y = targetRect.top + (targetRect.height / 2) - (bubbleRect.height / 2);
        break;
      case 'right':
        x = targetRect.right + 10;
        y = targetRect.top + (targetRect.height / 2) - (bubbleRect.height / 2);
        break;
    }

    // Ensure bubble stays within viewport
    const padding = 10;
    x = Math.max(padding, Math.min(x, window.innerWidth - bubbleRect.width - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - bubbleRect.height - padding));

    setPosition({ x, y });
  };

  // Setup event listeners and trigger logic
  useEffect(() => {
    if (elementId) {
      targetRef.current = document.getElementById(elementId);
    }

    const tip = getRelevantTip();
    if (!tip) return;

    setCurrentTip(tip);

    // Handle different trigger types
    const handleTrigger = () => {
      if (!hasBeenShown || tip.trigger === 'auto') {
        setIsVisible(true);
        setHasBeenShown(true);
      }
    };

    const handleMouseEnter = () => {
      if (tip.trigger === 'hover') {
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      if (tip.trigger === 'hover') {
        setIsVisible(false);
      }
    };

    const handleClick = () => {
      if (tip.trigger === 'click') {
        setIsVisible(!isVisible);
      }
    };

    const handleFocus = () => {
      if (tip.trigger === 'focus') {
        setIsVisible(true);
      }
    };

    const handleBlur = () => {
      if (tip.trigger === 'focus') {
        setIsVisible(false);
      }
    };

    // Auto-trigger with delay
    if (tip.trigger === 'auto' && !hasBeenShown) {
      const timer = setTimeout(handleTrigger, tip.delay || 3000);
      return () => clearTimeout(timer);
    }

    // Setup event listeners for target element
    if (targetRef.current) {
      const element = targetRef.current;
      
      if (tip.trigger === 'hover') {
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
      }
      
      if (tip.trigger === 'click') {
        element.addEventListener('click', handleClick);
      }
      
      if (tip.trigger === 'focus') {
        element.addEventListener('focus', handleFocus);
        element.addEventListener('blur', handleBlur);
      }

      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('click', handleClick);
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      };
    }
  }, [elementId, tips, hasBeenShown, userProgress, context]);

  // Update position when bubble becomes visible
  useEffect(() => {
    if (isVisible && currentTip) {
      calculatePosition();
      
      // Recalculate on window resize
      const handleResize = () => calculatePosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isVisible, currentTip]);

  const getIconByType = (type: string) => {
    switch (type) {
      case 'tip': return <FaLightbulb className="text-blue-500" />;
      case 'warning': return <FaQuestionCircle className="text-orange-500" />;
      case 'success': return <FaCheckCircle className="text-green-500" />;
      default: return <FaQuestionCircle className="text-gray-500" />;
    }
  };

  const getColorByType = (type: string) => {
    switch (type) {
      case 'tip': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (!currentTip) return null;

  return (
    <>
      {/* Floating Help Icon for clickable triggers */}
      {currentTip.trigger === 'click' && !elementId && (
        <motion.button
          onClick={() => setIsVisible(!isVisible)}
          className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white z-50 ${className}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaQuestionCircle size={24} />
        </motion.button>
      )}

      {/* Help Bubble */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={bubbleRef}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50"
            style={{
              left: elementId ? position.x : 'auto',
              top: elementId ? position.y : 'auto',
              bottom: !elementId ? '6rem' : 'auto',
              right: !elementId ? '1.5rem' : 'auto'
            }}
          >
            <Card className={`max-w-sm shadow-xl border-2 ${getColorByType(currentTip.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIconByType(currentTip.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {currentTip.title}
                      </h4>
                      <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {currentTip.content}
                    </p>
                    
                    {/* Action Buttons */}
                    {currentTip.actions && currentTip.actions.length > 0 && (
                      <div className="flex space-x-2">
                        {currentTip.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant={action.primary ? "default" : "outline"}
                            onClick={action.action}
                            className="text-xs"
                          >
                            {action.label}
                            {action.primary && <FaArrowRight className="ml-1" size={10} />}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Arrow pointer for positioned bubbles */}
                {elementId && (
                  <div 
                    className={`absolute w-3 h-3 bg-white border transform rotate-45 ${
                      currentTip.position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r' :
                      currentTip.position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l' :
                      currentTip.position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2 border-t border-r' :
                      'left-[-6px] top-1/2 -translate-y-1/2 border-b border-l'
                    } ${getColorByType(currentTip.type).includes('blue') ? 'border-blue-200' :
                        getColorByType(currentTip.type).includes('orange') ? 'border-orange-200' :
                        getColorByType(currentTip.type).includes('green') ? 'border-green-200' :
                        'border-gray-200'}`}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}