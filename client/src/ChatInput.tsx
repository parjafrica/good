import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Eye, EyeOff, ChevronDown } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'select';
  options?: string[];
  disabled?: boolean;
  isTyping?: boolean;
}

export default function ChatInput({ 
  onSubmit, 
  placeholder = "Type your message...", 
  type = 'text',
  options = [],
  disabled = false,
  isTyping = false
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (type === 'select' && value) {
      const filtered = options.filter(option => 
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [value, options, type]);

  const handleSubmit = (selectedValue?: string) => {
    const submitValue = selectedValue || value;
    if (submitValue.trim()) {
      onSubmit(submitValue.trim());
      setValue('');
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (type === 'select') {
    return (
      <div className="relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-gray-500 rounded-2xl"
              disabled={disabled || isTyping}
            />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <AnimatePresence>
            {isOpen && filteredOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 shadow-xl max-h-60 overflow-y-auto"
              >
                {filteredOptions.map((option, index) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSubmit(option)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    {option}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2"
    >
      <div className="flex-1 relative">
        <input
          type={type === 'password' && !showPassword ? 'password' : 'text'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-gray-500"
          disabled={disabled || isTyping}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      <motion.button
        onClick={() => handleSubmit()}
        disabled={!value.trim() || disabled || isTyping}
        className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Send className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}