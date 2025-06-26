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

// Floating Assistant Button (always visible)
export const AssistantFloatingButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const triggerHelpAdvice = () => {
    const event = new CustomEvent('intelligentAdvice', {
      detail: {
        type: 'help_suggestion',
        message: "I'm here to help! Our human experts are available to provide personalized guidance for your funding search. Click below to connect with them instantly.",
        priority: 'high',
        action: 'open_human_help',
        timing: 'immediate'
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-40"
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <button
        onClick={triggerHelpAdvice}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all"
      >
        <Brain className="w-6 h-6" />
      </button>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
          >
            Expert Assistant
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};