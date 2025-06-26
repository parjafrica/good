import React, { useEffect } from 'react';
import { 
  Brain, X, Lightbulb, AlertTriangle, HelpCircle, 
  Sparkles, ArrowRight
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
  // Debug logging to see what insights are being received
  useEffect(() => {
    if (insight) {
      console.log('AI Insight received for popup:', insight);
    } else {
      console.log('No insight provided to popup');
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

  if (!insight) {
    console.log('AIGuidancePopup: No insight, returning null');
    return null;
  }

  console.log('AIGuidancePopup: Rendering popup with insight:', insight);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Popup Container */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getInsightColor(insight.type, insight.priority)} p-4`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {getInsightIcon(insight.type)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{insight.title}</h3>
                <p className="text-xs opacity-80 capitalize">{insight.type} • {insight.priority} priority</p>
              </div>
            </div>
            <button 
              onClick={onDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {insight.message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            {insight.actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  action.type === 'dismiss'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : `bg-gradient-to-r ${getInsightColor(insight.type, insight.priority)} text-white hover:shadow-lg hover:scale-105`
                }`}
              >
                {action.label}
                {action.type !== 'dismiss' && <ArrowRight className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Metadata */}
          {insight.metadata && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Confidence: {Math.round(insight.metadata.confidence * 100)}%</span>
                <span>Impact: {Math.round(insight.metadata.estimatedImpact * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGuidancePopup;