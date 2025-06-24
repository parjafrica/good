import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HumanHelpButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showLabel?: boolean;
}

const HumanHelpButton: React.FC<HumanHelpButtonProps> = ({ 
  position = 'bottom-right',
  showLabel = true
}) => {
  const navigate = useNavigate();

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-20 right-6';
      case 'bottom-left':
        return 'bottom-20 left-6';
      case 'top-right':
        return 'top-20 right-6';
      case 'top-left':
        return 'top-20 left-6';
      default:
        return 'bottom-20 right-6';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-40 block`}>
      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/human-help')}
        className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg text-white"
      >
        <Users className="w-5 h-5" />
        {showLabel && <span className="font-medium hidden sm:inline">Human Help</span>}
      </motion.button>
    </div>
  );
};

export default HumanHelpButton;