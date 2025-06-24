import React from 'react';
import { motion } from 'framer-motion';
import { Send, ExternalLink } from 'lucide-react';
import InteractiveTooltip from '../shared/InteractiveTooltip';

interface ApplyButtonProps {
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const ApplyButton: React.FC<ApplyButtonProps> = ({
  onClick,
  className = '',
  variant = 'secondary', // Changed default to secondary
  size = 'md',
  showTooltip = false
}) => {
  const getButtonClasses = () => {
    let baseClasses = 'flex-1 flex items-center justify-center space-x-2 rounded-lg transition-all';
    
    if (size === 'sm') {
      baseClasses += ' py-1 px-3 text-sm';
    } else if (size === 'md') {
      baseClasses += ' py-2 px-4';
    } else if (size === 'lg') {
      baseClasses += ' py-3 px-6 text-lg';
    }
    
    if (variant === 'primary') {
      baseClasses += ' bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg';
    } else {
      // Secondary style
      baseClasses += ' bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30';
    }
    
    return `${baseClasses} ${className}`;
  };

  const button = (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={getButtonClasses()}
    >
      <Send className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>Apply</span>
      {variant === 'primary' && <ExternalLink className="w-3 h-3" />}
    </motion.button>
  );

  if (showTooltip) {
    return (
      <InteractiveTooltip
        content={
          <p>Start your application process with multiple options: direct application, AI-generated proposal, or expert assistance.</p>
        }
        title="Apply for Funding"
      >
        {button}
      </InteractiveTooltip>
    );
  }
  
  return button;
};

export default ApplyButton;