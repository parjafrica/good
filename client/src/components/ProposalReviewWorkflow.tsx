import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Clock, Send, Mail, User, FileText, 
  Star, Heart, Trophy, Sparkles, ArrowRight, Bell,
  MessageSquare, Edit3, Download, Check
} from 'lucide-react';

interface ProposalReviewWorkflowProps {
  proposalId: string;
  status: 'generating' | 'pending_review' | 'under_review' | 'completed' | 'sent';
  onStatusChange: (status: string) => void;
}

const ProposalReviewWorkflow: React.FC<ProposalReviewWorkflowProps> = ({ 
  proposalId, 
  status, 
  onStatusChange 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const steps = [
    {
      id: 'generating',
      title: 'AI is crafting your proposal',
      description: 'Our intelligent system is creating a tailored proposal based on your information',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'blue',
      encouragement: 'Amazing work! Your expertise is being transformed into a compelling proposal.'
    },
    {
      id: 'pending_review', 
      title: 'Sent to expert review team',
      description: 'Your proposal is now with our experienced grant writers for final polish',
      icon: <User className="w-6 h-6" />,
      color: 'purple',
      encouragement: 'Excellent! Our experts are adding their magic touch to maximize your success.'
    },
    {
      id: 'under_review',
      title: 'Expert review in progress',
      description: 'Professional grant writers are enhancing your proposal for maximum impact',
      icon: <Edit3 className="w-6 h-6" />,
      color: 'yellow',
      encouragement: 'Outstanding! Your proposal is being refined by industry professionals.'
    },
    {
      id: 'completed',
      title: 'Review complete - Ready for you!',
      description: 'Your enhanced proposal is ready for download and submission',
      icon: <Trophy className="w-6 h-6" />,
      color: 'green',
      encouragement: 'Congratulations! Your proposal is now optimized for success.'
    }
  ];

  useEffect(() => {
    const stepIndex = steps.findIndex(step => step.id === status);
    setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
  }, [status]);

  const handleEmailNotification = async () => {
    try {
      await fetch('/api/proposal/request-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_id: proposalId,
          email: userEmail,
          notification_type: 'completion'
        })
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Notification request failed:', error);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
      green: 'bg-green-500/20 border-green-500/30 text-green-300'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4"
        >
          <Heart className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Your Proposal Journey
        </h2>
        <p className="text-slate-400">
          We're making your funding dreams come true, step by step
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-6 mb-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${
              index <= currentStep 
                ? getColorClasses(step.color)
                : 'bg-slate-700/30 border-slate-600/30 text-slate-400'
            }`}
          >
            {/* Step Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              index < currentStep 
                ? 'bg-green-500 text-white'
                : index === currentStep
                ? `bg-${step.color}-500 text-white`
                : 'bg-slate-600 text-slate-400'
            }`}>
              {index < currentStep ? (
                <CheckCircle className="w-6 h-6" />
              ) : index === currentStep ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  {step.icon}
                </motion.div>
              ) : (
                step.icon
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${
                index <= currentStep ? 'text-white' : 'text-slate-400'
              }`}>
                {step.title}
              </h3>
              <p className={`text-sm mb-2 ${
                index <= currentStep ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {step.description}
              </p>
              
              {/* Encouragement Message */}
              {index === currentStep && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-lg p-3 mt-3"
                >
                  <p className="text-pink-200 text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    {step.encouragement}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Progress Line */}
            {index < steps.length - 1 && (
              <div className={`absolute left-10 top-16 w-0.5 h-8 ${
                index < currentStep ? 'bg-green-500' : 'bg-slate-600'
              }`} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Email Notification Section */}
      {(status === 'pending_review' || status === 'under_review') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Stay in the loop!</h3>
              <p className="text-slate-400 text-sm">Get notified when your proposal is ready</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="email"
              placeholder="your.email@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEmailNotification}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Notify Me
            </motion.button>
          </div>

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
            >
              <p className="text-green-200 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                Perfect! We'll email you the moment your proposal is ready.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Completion Actions */}
      {status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4"
            >
              <Trophy className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">
              🎉 Your Proposal is Ready!
            </h3>
            <p className="text-green-200">
              Expertly crafted and optimized for maximum funding success
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Proposal
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              <Send className="w-5 h-5" />
              Submit Application
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Motivational Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Your success is our mission - we're here every step of the way!</span>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProposalReviewWorkflow;