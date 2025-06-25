import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle,
  Loader,
  Gem,
  Users,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '.././contexts/AuthContext';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityTitle: string;
  donorName: string;
  applicationUrl?: string;
  onGenerateProposal: () => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  opportunityTitle,
  donorName,
  applicationUrl,
  onGenerateProposal
}) => {
  const { user, deductCredits } = useAuth();
  const [step, setStep] = useState<'options' | 'applying' | 'success'>('options');
  const [selectedOption, setSelectedOption] = useState<'direct' | 'ai' | 'expert' | null>(null);

  const handleApply = () => {
    if (selectedOption === 'direct' && applicationUrl) {
      setStep('applying');
      
      // Simulate application process
      setTimeout(() => {
        window.open(applicationUrl, '_blank');
        setStep('success');
      }, 1500);
    } else if (selectedOption === 'ai') {
      onGenerateProposal();
      onClose();
    } else if (selectedOption === 'expert') {
      if (deductCredits(50)) {
        window.open('https://wa.me/27822923504', '_blank');
        onClose();
      } else {
        alert('Insufficient credits. Please purchase more credits to use this service.');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Apply for Funding</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-slate-400 mt-1">{opportunityTitle}</p>
              <p className="text-blue-400 text-sm">{donorName}</p>
            </div>
            
            {/* Content */}
            <div className="p-5">
              {step === 'options' && (
                <div className="space-y-4">
                  <p className="text-slate-300 mb-4">Choose how you'd like to apply for this opportunity:</p>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedOption('direct')}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                      selectedOption === 'direct'
                        ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                        : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedOption === 'direct' ? 'bg-blue-600/30' : 'bg-slate-600/50'
                    }`}>
                      <Send className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium">Direct Application</h4>
                      <p className="text-sm opacity-80">Apply directly on the donor's website</p>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedOption('expert')}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                      selectedOption === 'expert'
                        ? 'bg-purple-600/20 border-purple-500/30 text-purple-400'
                        : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedOption === 'expert' ? 'bg-purple-600/30' : 'bg-slate-600/50'
                    }`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">Expert Proposal Generator</h4>
                        <div className="flex items-center space-x-1 px-2 py-0.5 bg-purple-600/20 rounded-lg">
                          <Gem className="w-3 h-3 text-purple-400" />
                          <span className="text-xs text-purple-400">5</span>
                        </div>
                      </div>
                      <p className="text-sm opacity-80">Generate a tailored proposal in minutes</p>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedOption('expert')}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                      selectedOption === 'expert'
                        ? 'bg-green-600/20 border-green-500/30 text-green-400'
                        : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedOption === 'expert' ? 'bg-green-600/30' : 'bg-slate-600/50'
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">Expert Assistance</h4>
                        <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-600/20 rounded-lg">
                          <Gem className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">50</span>
                        </div>
                      </div>
                      <p className="text-sm opacity-80">Get help from our funding experts</p>
                    </div>
                  </motion.button>
                  
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={handleApply}
                      disabled={!selectedOption}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </motion.button>
                  </div>
                </div>
              )}
              
              {step === 'applying' && (
                <div className="text-center py-8">
                  <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">Preparing Your Application</h4>
                  <p className="text-slate-400">Please wait while we redirect you to the application page...</p>
                </div>
              )}
              
              {step === 'success' && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">Application Started</h4>
                  <p className="text-slate-400 mb-6">You've been redirected to the donor's application page.</p>
                  
                  <div className="space-y-4">
                    <p className="text-slate-300">Need help with your application?</p>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        if (deductCredits(50)) {
                          window.open('https://wa.me/27822923504', '_blank');
                          onClose();
                        } else {
                          alert('Insufficient credits. Please purchase more credits to use this service.');
                        }
                      }}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-600/30 transition-all mx-auto"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Get Expert Help (50 Credits)</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApplyModal;