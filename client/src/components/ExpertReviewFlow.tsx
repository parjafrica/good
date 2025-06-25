import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  FileText, 
  ArrowRight, 
  Star,
  Award,
  Users,
  Target
} from 'lucide-react';

interface ExpertReviewFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proposalTitle: string;
  fundingAmount: string;
}

export const ExpertReviewFlow: React.FC<ExpertReviewFlowProps> = ({
  isOpen,
  onClose,
  onSuccess,
  proposalTitle,
  fundingAmount
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      id: 'intro',
      title: 'Expert Review Process',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Award className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Your Proposal is Ready for Expert Review
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              "{proposalTitle}" • {fundingAmount}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-blue-900 dark:text-blue-100">Expert Team</div>
              <div className="text-blue-700 dark:text-blue-300">5+ Years Experience</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-green-900 dark:text-green-100">Success Rate</div>
              <div className="text-green-700 dark:text-green-300">94% Approved</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="font-medium text-purple-900 dark:text-purple-100">Turnaround</div>
              <div className="text-purple-700 dark:text-purple-300">24-48 Hours</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'process',
      title: 'What Happens Next',
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Expert Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Our funding specialists review your proposal for compliance, clarity, and competitive positioning
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Strategic Enhancement</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Experts enhance language, strengthen arguments, and optimize for funder preferences
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-bold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Final Delivery</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Receive your polished, submission-ready proposal with expert recommendations
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Stay Connected',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Get Notified When Ready
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We'll send you an email when your expert-reviewed proposal is complete
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900 dark:text-blue-100">Expert Guarantee</div>
                  <div className="text-blue-700 dark:text-blue-300">
                    Your proposal will be reviewed by certified grant writers with proven track records
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {steps[currentStep].title}
              </h2>
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={!email || isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit for Expert Review
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};