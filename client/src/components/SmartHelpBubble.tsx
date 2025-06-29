import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaTimes, FaLightbulb, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
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

  // Get the most relevant tip
  const getRelevantTip = (): HelpTip | null => {
    if (tips.length === 0) return null;
    return tips[0]; // For now, return the first tip
  };

  // Set up the help bubble
  useEffect(() => {
    const tip = getRelevantTip();
    if (!tip) return;

    setCurrentTip(tip);

    // Handle auto-trigger tips
    if (tip.trigger === 'auto') {
      const delay = tip.delay || 1000;
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }

    // Handle element-based triggers
    if (elementId) {
      const element = document.getElementById(elementId);
      if (!element) return;

      const handleShow = () => setIsVisible(true);
      const handleHide = () => setIsVisible(false);

      switch (tip.trigger) {
        case 'hover':
          element.addEventListener('mouseenter', handleShow);
          element.addEventListener('mouseleave', handleHide);
          return () => {
            element.removeEventListener('mouseenter', handleShow);
            element.removeEventListener('mouseleave', handleHide);
          };
        case 'click':
          element.addEventListener('click', handleShow);
          return () => element.removeEventListener('click', handleShow);
        case 'focus':
          element.addEventListener('focus', handleShow);
          element.addEventListener('blur', handleHide);
          return () => {
            element.removeEventListener('focus', handleShow);
            element.removeEventListener('blur', handleHide);
          };
      }
    }
  }, [elementId, tips]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'tip': return <FaLightbulb className="text-yellow-500" />;
      case 'warning': return <FaExclamationTriangle className="text-orange-500" />;
      case 'success': return <FaCheckCircle className="text-green-500" />;
      default: return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'tip': return 'bg-yellow-50 border-yellow-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  if (!currentTip) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30,
            duration: 0.3 
          }}
          className={`fixed z-50 ${className}`}
          style={{
            top: elementId ? undefined : '50%',
            left: elementId ? undefined : '50%',
            transform: elementId ? undefined : 'translate(-50%, -50%)',
            maxWidth: '320px',
            minWidth: '280px'
          }}
        >
          <Card className={`shadow-lg border-2 ${getBackgroundColor(currentTip.type)} backdrop-blur-sm`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(currentTip.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {currentTip.title}
                    </h4>
                    <button
                      onClick={() => setIsVisible(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    {currentTip.content}
                  </p>
                  {currentTip.actions && currentTip.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentTip.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={action.primary ? "default" : "outline"}
                          onClick={() => {
                            action.action();
                            setIsVisible(false);
                          }}
                          className="text-xs"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}