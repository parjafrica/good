import React from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import InteractiveTooltip from '../shared/InteractiveTooltip';

interface ViewDetailsButtonProps {
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const ViewDetailsButton: React.FC<ViewDetailsButtonProps> = ({
  onClick,
  className = '',
  variant = 'secondary',
  size = 'md',
  showTooltip = false
}) => {
  const getButtonClasses = () => {
    let baseClasses = 'flex items-center justify-center space-x-2 rounded-lg transition-all';
    
    // Size classes
    if (size === 'sm') {
      baseClasses += ' py-1 px-3 text-sm';
    } else if (size === 'md') {
      baseClasses += ' py-2 px-4';
    } else if (size === 'lg') {
      baseClasses += ' py-3 px-6 text-lg';
    }
    
    // Variant classes
    if (variant === 'primary') {
      baseClasses += ' bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg';
    } else {
      baseClasses += ' bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30';
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
      <Eye className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>View Details</span>
    </motion.button>
  );

  if (showTooltip) {
    return (
      <InteractiveTooltip
        content={
          <p>View complete information about this opportunity, including eligibility criteria, application process, and contact details.</p>
        }
        title="Opportunity Details"
      >
        {button}
      </InteractiveTooltip>
    );
  }

  return button;
};

export default ViewDetailsButton;