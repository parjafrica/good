import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, X, Lightbulb, AlertTriangle, HelpCircle, 
  Sparkles, ArrowRight, Eye, MousePointer, Target,
  Zap, TrendingUp
} from 'lucide-react';
import { AIInsight, AIAction } from '../services/aiEngine';

interface AIGuidancePopupProps {
  insight: AIInsight | null;
  onAction: (action: AIAction) => void;
  onDismiss: () => void;
}

const AIGuidancePopup: React.FC<AIGuidancePopupProps> = ({ 
  insight, 
  onAction, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    if (insight) {
      setIsVisible(true);
      setAnimationPhase('entering');
      
      // Transition to visible after entry animation
      const timer = setTimeout(() => {
        setAnimationPhase('visible');
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setAnimationPhase('exiting');
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [insight]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'guidance': return <Lightbulb className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'suggestion': return <Sparkles className="w-5 h-5" />;
      case 'help_offer': return <HelpCircle className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'from-red-500 to-orange-500';
    
    switch (type) {
      case 'guidance': return 'from-blue-500 to-purple-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'suggestion': return 'from-green-500 to-blue-500';
      case 'help_offer': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleActionClick = (action: AIAction) => {
    if (action.type === 'dismiss') {
      onDismiss();
    } else {
      onAction(action);
    }
  };

  // Debug logging to see what insights are being received
  useEffect(() => {
    if (insight) {
      console.log('AI Insight received for popup:', insight);
    }
  }, [insight]);

  if (!insight) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ pointerEvents: animationPhase === 'exiting' ? 'none' : 'auto' }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black"
          onClick={onDismiss}
        />

        {/* Popup Container */}
        <motion.div
          initial={{ 
            scale: 0.8, 
            opacity: 0, 
            y: 50,
            rotateX: -15 
          }}
          animate={{ 
            scale: animationPhase === 'entering' ? [0.8, 1.05, 1] : 1,
            opacity: 1, 
            y: 0,
            rotateX: 0 
          }}
          exit={{ 
            scale: 0.9, 
            opacity: 0, 
            y: 20,
            rotateX: 10 
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.5 
          }}
          className="relative max-w-md w-full"
        >
          {/* Glow Effect */}
          <div 
            className={`absolute -inset-2 bg-gradient-to-r ${getInsightColor(insight.type, insight.priority)} rounded-2xl blur-xl opacity-30 animate-pulse`}
          />
          
          {/* Main Card */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${getInsightColor(insight.type, insight.priority)} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      rotate: animationPhase === 'entering' ? [0, 360] : 0,
                      scale: animationPhase === 'visible' ? [1, 1.1, 1] : 1 
                    }}
                    transition={{ 
                      duration: animationPhase === 'entering' ? 0.8 : 2,
                      repeat: animationPhase === 'visible' ? Infinity : 0,
                      repeatType: "reverse" 
                    }}
                    className="p-2 bg-white/20 rounded-xl text-white"
                  >
                    {getInsightIcon(insight.type)}
                  </motion.div>
                  
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {insight.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                      <Target className="w-3 h-3" />
                      <span>Expert Confidence: {Math.round(insight.metadata.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onDismiss}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {insight.message}
              </p>

              {/* Metadata */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Detection:</strong> {insight.metadata.reasoning}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Impact: {Math.round(insight.metadata.estimatedImpact * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Priority: {insight.priority}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {insight.actions.length > 0 && (
                <div className="space-y-3">
                  {insight.actions.map((action, index) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleActionClick(action)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left group ${
                        action.type === 'dismiss'
                          ? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                          : `border-transparent bg-gradient-to-r ${getInsightColor(insight.type, insight.priority)} text-white hover:shadow-lg`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{action.label}</span>
                        <ArrowRight 
                          className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                            action.type === 'dismiss' ? 'opacity-50' : ''
                          }`} 
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom indicator */}
            <div className="h-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent" />
          </div>

          {/* Floating indicators */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute -top-4 -right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600"
          >
            <Eye className="w-4 h-4 text-blue-500" />
          </motion.div>

          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "linear" 
            }}
            className="absolute -bottom-4 -left-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600"
          >
            <MousePointer className="w-4 h-4 text-purple-500" />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIGuidancePopup;