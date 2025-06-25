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
import { useTheme, Theme } from './contexts/ThemeContext';

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

  const handleContactClick = (type: 'whatsapp1' | 'whatsapp2' | 'email') => {
    switch (type) {
      case 'whatsapp1':
        window.open('https://wa.me/27822923504', '_blank');
        break;
      case 'whatsapp2':
        window.open('https://wa.me/211922709131', '_blank');
        break;
      case 'email':
        window.open('mailto:info@granada.to', '_blank');
        break;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
      >
        <Users className="w-5 h-5" />
        <span className="hidden sm:inline">Human</span>
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

            {/* Contact & Theme Selector Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-full right-0 mt-2 w-96 bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 z-50 shadow-2xl"
            >
              {/* Contact Section */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Get Human Help</h3>
                    <p className="text-slate-400 text-sm">Connect with our support team</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleContactClick('whatsapp1')}
                    className="w-full flex items-center space-x-4 p-4 bg-green-600/20 border border-green-500/30 rounded-xl hover:bg-green-600/30 transition-all group"
                  >
                    <div className="p-2 bg-green-600 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-green-400 font-semibold">WhatsApp Support</h4>
                      <p className="text-slate-300 text-sm">+27 82 292 3504</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleContactClick('whatsapp2')}
                    className="w-full flex items-center space-x-4 p-4 bg-green-600/20 border border-green-500/30 rounded-xl hover:bg-green-600/30 transition-all group"
                  >
                    <div className="p-2 bg-green-600 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-green-400 font-semibold">WhatsApp Alternative</h4>
                      <p className="text-slate-300 text-sm">+211 922 709 131</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleContactClick('email')}
                    className="w-full flex items-center space-x-4 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-all group"
                  >
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-blue-400 font-semibold">Email Support</h4>
                      <p className="text-slate-300 text-sm">info@granada.to</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                </div>
              </div>

              {/* Theme Section */}
              <div className="border-t border-slate-700/50 pt-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Palette className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Choose Theme</h3>
                    <p className="text-slate-400 text-sm">Customize your experience</p>
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
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600/50'
                      }`}
                    >
                      <div className={`p-1 rounded ${theme === option.id ? 'bg-blue-600/30' : 'bg-slate-600/50'}`}>
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

                <div className="mt-4 p-3 bg-slate-700/30 rounded-xl">
                  <p className="text-slate-400 text-xs text-center">
                    <strong className="text-slate-300">Available 24/7:</strong> Get instant help via WhatsApp or email
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;