import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, MessageCircle, HelpCircle, Star, ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssistantAdvice {
  type: 'encouragement' | 'guidance' | 'help_suggestion' | 'success_celebration' | 'warning';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: string;
  timing: 'immediate' | 'delayed' | 'on_exit';
}

export const IntelligentAssistantUI: React.FC = () => {
  const [currentAdvice, setCurrentAdvice] = useState<AssistantAdvice | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAdvice = (event: CustomEvent<AssistantAdvice>) => {
      const advice = event.detail;
      
      // Don't show if user dismissed recent advice
      if (dismissed && advice.priority !== 'urgent') return;

      setCurrentAdvice(advice);
      
      if (advice.timing === 'immediate') {
        setIsVisible(true);
      } else if (advice.timing === 'delayed') {
        setTimeout(() => setIsVisible(true), 3000);
      }
    };

    window.addEventListener('intelligentAdvice', handleAdvice as EventListener);
    
    return () => {
      window.removeEventListener('intelligentAdvice', handleAdvice as EventListener);
    };
  }, [dismissed]);

  const handleAction = () => {
    if (currentAdvice?.action === 'open_human_help') {
      navigate('/human-help');
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    
    // Reset dismissed state after 5 minutes
    setTimeout(() => setDismissed(false), 300000);
  };

  const getIcon = () => {
    switch (currentAdvice?.type) {
      case 'encouragement':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'guidance':
        return <Brain className="w-5 h-5 text-blue-500" />;
      case 'help_suggestion':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'success_celebration':
        return <Star className="w-5 h-5 text-green-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getColors = () => {
    switch (currentAdvice?.type) {
      case 'encouragement':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'guidance':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'help_suggestion':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'success_celebration':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  if (!currentAdvice || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <div className={`bg-gradient-to-br ${getColors()} backdrop-blur-lg border rounded-xl p-4 shadow-xl`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getIcon()}
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                Expert Assistant
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
            {currentAdvice.message}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            {currentAdvice.action && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAction}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
              >
                <Users className="w-4 h-4" />
                Get Human Help
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDismiss}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              Got it
            </motion.button>
          </div>

          {/* Pulse indicator for high priority */}
          {currentAdvice.priority === 'high' && (
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Floating Assistant Button (only shows after extensive interaction)
export const AssistantFloatingButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Only show the button after the user has been on the site for a while
    const timer = setTimeout(() => {
      // Check if user has had enough interactions to warrant showing the button
      const userInteractions = JSON.parse(localStorage.getItem('userInteractions') || '0');
      if (userInteractions > 50) {
        setShouldShow(true);
      }
    }, 600000); // 10 minutes minimum before showing

    return () => clearTimeout(timer);
  }, []);

  const triggerSubtleAdvice = () => {
    const event = new CustomEvent('intelligentAdvice', {
      detail: {
        type: 'guidance',
        message: "Still exploring? Sometimes a fresh perspective can help identify new opportunities.",
        priority: 'low',
        timing: 'delayed'
      }
    });
    window.dispatchEvent(event);
  };

  if (!shouldShow) return null;

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-40"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2 }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <button
        onClick={triggerSubtleAdvice}
        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all opacity-70 hover:opacity-100"
      >
        <Brain className="w-5 h-5" />
      </button>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
          >
            Insights
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};