import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Check,
  Sparkles,
  Droplets,
  Leaf,
  Flame,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  User,
  Users
} from 'lucide-react';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const themeOptions: ThemeOption[] = [
    {
      id: 'dark',
      name: 'Dark',
      description: 'Professional dark theme',
      icon: <Moon className="w-5 h-5" />,
      preview: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#8b5cf6',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
      }
    },
    {
      id: 'light',
      name: 'Light',
      description: 'Clean light theme',
      icon: <Sun className="w-5 h-5" />,
      preview: {
        primary: '#2563eb',
        secondary: '#1d4ed8',
        accent: '#7c3aed',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)'
      }
    },
    {
      id: 'auto',
      name: 'Auto',
      description: 'Follows system preference',
      icon: <Monitor className="w-5 h-5" />,
      preview: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#8b5cf6',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
      }
    },
    {
      id: 'blue',
      name: 'Ocean Blue',
      description: 'Calming blue tones',
      icon: <Droplets className="w-5 h-5" />,
      preview: {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        accent: '#38bdf8',
        background: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)'
      }
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      description: 'Elegant purple theme',
      icon: <Sparkles className="w-5 h-5" />,
      preview: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7c2d12 100%)'
      }
    },
    {
      id: 'green',
      name: 'Nature Green',
      description: 'Fresh green theme',
      icon: <Leaf className="w-5 h-5" />,
      preview: {
        primary: '#22c55e',
        secondary: '#16a34a',
        accent: '#4ade80',
        background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)'
      }
    },
    {
      id: 'orange',
      name: 'Sunset Orange',
      description: 'Warm orange theme',
      icon: <Flame className="w-5 h-5" />,
      preview: {
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#fb923c',
        background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 50%, #ea580c 100%)'
      }
    }
  ];

  const currentTheme = themeOptions.find(option => option.id === theme);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-200 transition-all"
      >
        <Palette className="w-5 h-5" />
        <span className="hidden sm:inline">Theme</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Theme Selector Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl p-6 z-50 shadow-xl"
            >
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Choose Theme</h3>
                    <p className="text-gray-600 text-sm">Customize your experience</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {themeOptions.slice(0, 4).map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setTheme(option.id);
                        setIsOpen(false);
                      }}
                      className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                        theme === option.id
                          ? 'bg-blue-50 border-blue-300 text-blue-600'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-1 rounded ${theme === option.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {option.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-sm">{option.name}</h4>
                      </div>
                      {theme === option.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="p-1 bg-blue-500 rounded-full"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    navigate('/human-help');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all"
                >
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-green-700 font-semibold">Get Human Help</h4>
                    <p className="text-gray-700 text-sm">Connect with our experts</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;