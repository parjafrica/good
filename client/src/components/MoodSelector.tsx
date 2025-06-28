import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMoodTheme } from './MoodThemeProvider';
import { 
  Zap, 
  Target, 
  Leaf, 
  Palette, 
  Briefcase, 
  Shield,
  Brain,
  Settings,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const moodOptions = [
  {
    name: 'energetic',
    label: 'Energetic',
    icon: Zap,
    description: 'Ready to take on challenges',
    color: '#FF6B35',
    gradient: 'from-orange-400 to-red-500'
  },
  {
    name: 'focused',
    label: 'Focused',
    icon: Target,
    description: 'Deep work and concentration',
    color: '#2563EB',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    name: 'calm',
    label: 'Calm',
    icon: Leaf,
    description: 'Peaceful and relaxed',
    color: '#10B981',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    name: 'creative',
    label: 'Creative',
    icon: Palette,
    description: 'Innovative and imaginative',
    color: '#8B5CF6',
    gradient: 'from-purple-400 to-pink-500'
  },
  {
    name: 'professional',
    label: 'Professional',
    icon: Briefcase,
    description: 'Business-focused and formal',
    color: '#1E40AF',
    gradient: 'from-indigo-500 to-blue-700'
  },
  {
    name: 'stressed',
    label: 'Need Support',
    icon: Shield,
    description: 'Supportive and calming interface',
    color: '#6B7280',
    gradient: 'from-gray-400 to-gray-600'
  }
];

interface MoodSelectorProps {
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ 
  compact = false, 
  showLabel = true,
  className = ""
}) => {
  const { currentMood, setExplicitMood, isLoading } = useMoodTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const currentMoodOption = moodOptions.find(option => option.name === currentMood);

  const handleMoodSelect = async (mood: string) => {
    setIsDetecting(true);
    try {
      await setExplicitMood(mood);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to set mood:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      // Trigger auto-detection by not passing explicit mood
      await setExplicitMood(undefined as any);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to auto-detect mood:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading || isDetecting}
        >
          {currentMoodOption && (
            <currentMoodOption.icon 
              className="w-4 h-4" 
              style={{ color: currentMoodOption.color }}
            />
          )}
          {showLabel && (
            <span className="text-sm font-medium">
              {currentMoodOption?.label || 'Select Mood'}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Choose Your Mood
                </h3>
                
                <div className="space-y-2">
                  {moodOptions.map((option) => (
                    <motion.button
                      key={option.name}
                      onClick={() => handleMoodSelect(option.name)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        currentMood === option.name
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isDetecting}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${option.gradient}`}>
                        <option.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                      {currentMood === option.name && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    onClick={handleAutoDetect}
                    className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isDetecting}
                  >
                    <Brain className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isDetecting ? 'Detecting...' : 'Auto-Detect'}
                    </span>
                    <Sparkles className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full mood selector card
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Mood
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adapt your interface to match your current state
          </p>
        </div>
        <motion.button
          onClick={handleAutoDetect}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isDetecting}
        >
          <Brain className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isDetecting ? 'Detecting...' : 'Auto-Detect'}
          </span>
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {moodOptions.map((option) => (
          <motion.button
            key={option.name}
            onClick={() => handleMoodSelect(option.name)}
            className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
              currentMood === option.name
                ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                : 'hover:scale-105'
            }`}
            style={{
              background: currentMood === option.name 
                ? `linear-gradient(135deg, ${option.color}20, ${option.color}10)`
                : 'transparent',
              ringColor: currentMood === option.name ? option.color : 'transparent'
            }}
            whileHover={{ scale: currentMood === option.name ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isDetecting}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-3 rounded-full bg-gradient-to-r ${option.gradient}`}>
                <option.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            </div>
            
            {currentMood === option.name && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2"
              >
                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {currentMoodOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          style={{
            background: `linear-gradient(135deg, ${currentMoodOption.color}10, ${currentMoodOption.color}05)`
          }}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${currentMoodOption.gradient}`}>
              <currentMoodOption.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                You're feeling {currentMoodOption.label.toLowerCase()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Interface adapted for {currentMoodOption.description.toLowerCase()}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};