import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, FileText, Send } from 'lucide-react';

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
  if (!isOpen) return null;

  const handleDirectApplication = () => {
    if (applicationUrl) {
      window.open(applicationUrl, '_blank');
    }
    onClose();
  };

  return (
    <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Send className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Apply for Funding</h2>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{opportunityTitle}</h3>
          <p className="text-blue-400 font-medium">{donorName}</p>
        </div>
        
        <p className="text-slate-300 text-sm">
          Choose how you'd like to proceed with your application:
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {applicationUrl && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDirectApplication}
            className="w-full flex items-center justify-between p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <ExternalLink className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="text-blue-400 font-medium">Direct Application</div>
                <div className="text-slate-400 text-sm">Apply directly on their website</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGenerateProposal}
          className="w-full flex items-center justify-between p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-all group"
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <div className="text-purple-400 font-medium">Generate Proposal</div>
              <div className="text-slate-400 text-sm">Create a tailored proposal with AI</div>
            </div>
          </div>
          <FileText className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <p className="text-slate-400 text-xs text-center">
          We'll help you create the best application possible
        </p>
      </div>
    </div>
  );
};

export default ApplyModal;

