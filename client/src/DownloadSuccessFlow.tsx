import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  Target
} from 'lucide-react';

interface DownloadSuccessFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onExpertReview: () => void;
  proposalTitle: string;
  fundingAmount: string;
}

export const DownloadSuccessFlow: React.FC<DownloadSuccessFlowProps> = ({
  isOpen,
  onClose,
  onExpertReview,
  proposalTitle,
  fundingAmount
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextSteps = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert Review Available",
      description: "Get your proposal reviewed by certified grant specialists",
      action: "Send for Expert Review",
      color: "from-blue-500 to-purple-600",
      onClick: onExpertReview
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Application Strategy",
      description: "Learn advanced submission techniques and funder preferences",
      action: "View Strategy Guide",
      color: "from-green-500 to-emerald-600",
      onClick: () => {}
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Success Tracking",
      description: "Track your applications and get insights on approval rates",
      action: "Start Tracking",
      color: "from-orange-500 to-red-600",
      onClick: () => {}
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full"
      >
        {/* Header */}
        <div className="p-8 text-center border-b border-gray-200 dark:border-gray-700">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Draft Successfully Downloaded!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            "{proposalTitle}" • {fundingAmount}
          </p>
        </div>

        {/* Success Stats */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">$2.4M</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Secured This Month</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">48hrs</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Review Time</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Maximize Your Success Rate
          </h3>
          
          <div className="space-y-4">
            {nextSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer ${
                  index === 0 ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
                }`}
                onClick={step.onClick}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {step.title}
                      {index === 0 && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-full">
                          RECOMMENDED
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {step.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Expert Testimonial */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "Expert review increased our funding success rate by 73%. The specialist insights made all the difference."
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  — Sarah Chen, Program Director
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Close
          </button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExpertReview}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Send for Expert Review
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};