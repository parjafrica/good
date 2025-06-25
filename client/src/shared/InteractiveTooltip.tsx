import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Lightbulb, Gem } from 'lucide-react';

interface InteractiveTooltipProps {
  content: React.ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showGem?: boolean;
  gemCost?: number;
  children: React.ReactNode;
}

const InteractiveTooltip: React.FC<InteractiveTooltipProps> = ({
  content,
  title,
  position = 'top',
  showGem = false,
  gemCost,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'top-full mt-2 left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 transform -translate-y-1/2';
      default:
        return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div className="relative inline-block">
      <div 
        ref={triggerRef}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-help"
      >
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-50 w-64 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-xl ${getPositionStyles()}`}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {title && (
                    <h4 className="text-white font-medium">{title}</h4>
                  )}
                  {!title && (
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Tip</span>
                    </div>
                  )}
                  {showGem && gemCost && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-600/20 rounded-lg">
                      <Gem className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400">{gemCost}</span>
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setIsVisible(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>
              <div className="text-slate-300 text-sm">
                {content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveTooltip;