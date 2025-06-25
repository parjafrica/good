import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Mail, 
  Bell, 
  X,
  Send,
  Star,
  Eye,
  FileText,
  Download,
  ArrowRight,
  Sparkles,
  Award,
  Target
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

interface ExpertReviewFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proposalTitle: string;
  fundingAmount: string;
}

const ExpertReviewFlow: React.FC<ExpertReviewFlowProps> = ({
  isOpen,
  onClose,
  onSuccess,
  proposalTitle,
  fundingAmount
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [notificationType, setNotificationType] = useState('completion');

  // Submit for expert review mutation
  const submitMutation = useMutation({
    mutationFn: async (data: { email: string; notificationType: string }) => {
      const response = await fetch('/api/proposal/request-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_id: 'temp_id', // Will be replaced with actual ID
          email: data.email,
          notification_type: data.notificationType
        })
      });
      if (!response.ok) throw new Error('Failed to submit for review');
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep(5); // Move to success step
    },
    onError: (error) => {
      console.error('Submit error:', error);
    }
  });

  const handleSubmit = () => {
    if (!email.trim()) return;
    submitMutation.mutate({ email, notificationType });
  };

  const steps = [
    {
      title: 'Expert Review Process',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Award className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready for Expert Review
            </h3>
            <p className="text-gray-300 mb-2">"{proposalTitle}"</p>
            <p className="text-blue-400 font-medium">{fundingAmount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              Our certified grant writing experts will review your proposal for quality, 
              compliance, and winning potential within 24-48 hours.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Review Timeline',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Expected Timeline</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <div>
                <p className="text-white font-medium">Initial Review</p>
                <p className="text-gray-400 text-sm">2-4 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <div>
                <p className="text-white font-medium">Detailed Analysis</p>
                <p className="text-gray-400 text-sm">12-24 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <div>
                <p className="text-white font-medium">Final Review & Delivery</p>
                <p className="text-gray-400 text-sm">24-48 hours</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Expert Qualifications',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Users className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Our Expert Team</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <Star className="w-8 h-8 text-yellow-500 mb-2" />
              <h4 className="text-white font-medium mb-1">Certified Professionals</h4>
              <p className="text-gray-400 text-sm">Grant Writing Professional (GWP) certified experts</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <Target className="w-8 h-8 text-red-500 mb-2" />
              <h4 className="text-white font-medium mb-1">Proven Track Record</h4>
              <p className="text-gray-400 text-sm">$50M+ in successful grant awards</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <Eye className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="text-white font-medium mb-1">Sector Expertise</h4>
              <p className="text-gray-400 text-sm">Specialized knowledge across all funding sectors</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <FileText className="w-8 h-8 text-purple-500 mb-2" />
              <h4 className="text-white font-medium mb-1">Quality Assurance</h4>
              <p className="text-gray-400 text-sm">Multi-tier review process for excellence</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Notification Preferences',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
            <p className="text-gray-400">We'll keep you informed throughout the review process</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notification Preferences
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                  <input
                    type="radio"
                    name="notificationType"
                    value="completion"
                    checked={notificationType === 'completion'}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="text-white font-medium">Completion Only</p>
                    <p className="text-gray-400 text-sm">Notify me only when review is complete</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                  <input
                    type="radio"
                    name="notificationType"
                    value="progress"
                    checked={notificationType === 'progress'}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="text-white font-medium">Progress Updates</p>
                    <p className="text-gray-400 text-sm">Notify me at each review milestone</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Submit for Review',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Send className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to Submit
            </h3>
            <p className="text-gray-300 mb-4">
              Your proposal will be sent to our expert review team immediately.
            </p>
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Email:</strong> {email}<br />
                <strong>Notifications:</strong> {notificationType === 'completion' ? 'Completion Only' : 'Progress Updates'}
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Submission Successful',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Successfully Submitted!
            </h3>
            <p className="text-gray-300 mb-4">
              Your proposal has been submitted for expert review. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <p className="text-green-300 text-sm">
                Expected completion: 24-48 hours<br />
                You'll be notified at: {email}
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Expert Review Process</h2>
            <p className="text-gray-400 text-sm">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex gap-3">
            {currentStep < steps.length - 2 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
            
            {currentStep === steps.length - 2 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !email.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit for Expert Review
                  </>
                )}
              </motion.button>
            )}
            
            {currentStep === steps.length - 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSuccess}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Continue
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpertReviewFlow;