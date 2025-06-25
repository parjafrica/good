import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Phone, 
  Mail, 
  ExternalLink, 
  ArrowLeft,
  Gem,
  HelpCircle,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Target,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HumanHelpPage: React.FC = () => {
  const { user, deductCredits } = useAuth();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [messageText, setMessageText] = useState('');

  const handleContactClick = (type: 'whatsapp1' | 'whatsapp2' | 'email', cost: number) => {
    if (deductCredits(cost)) {
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
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } else {
      alert('Insufficient credits. Please purchase more credits to use this service.');
    }
  };

  const handleSubmitMessage = () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!selectedOption) {
      alert('Please select a help category');
      return;
    }

    if (deductCredits(50)) {
      // In a real app, this would send the message to the support team
      setShowSuccessMessage(true);
      setMessageText('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } else {
      alert('Insufficient credits. Please purchase more credits to use this service.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Human Expert Help</h1>
            <p className="text-gray-700">Get personalized assistance from our team of experts</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>
      </motion.div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 p-4 bg-green-100 border border-green-200 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Your request has been sent successfully! Our team will contact you shortly.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Contact Options */}
        <div className="md:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Options</h2>
            <p className="text-gray-700 mb-6">
              Choose your preferred way to get in touch with our expert team.
            </p>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleContactClick('whatsapp1', 50)}
                className="w-full flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all group"
              >
                <div className="p-2 bg-green-500 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-gray-800 font-semibold">WhatsApp Support</h4>
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-100 rounded-lg">
                      <Gem className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-700">50</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">+27 82 292 3504</p>
                </div>
                <ExternalLink className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleContactClick('whatsapp2', 50)}
                className="w-full flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all group"
              >
                <div className="p-2 bg-green-500 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-gray-800 font-semibold">Alternative WhatsApp</h4>
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-100 rounded-lg">
                      <Gem className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-700">50</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">+211 922 709 131</p>
                </div>
                <ExternalLink className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleContactClick('email', 25)}
                className="w-full flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all group"
              >
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-gray-800 font-semibold">Email Support</h4>
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 rounded-lg">
                      <Gem className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-700">25</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">info@granada.to</p>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h4 className="text-gray-800 font-medium">Support Hours</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Our team is available 24/7 to assist you with any questions or needs.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Credits</h2>
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <Gem className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{user?.credits}</p>
                  <p className="text-gray-600 text-sm">Available Credits</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/credits')}
                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm hover:bg-emerald-200 transition-all"
              >
                Buy More
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Message Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Send a Message</h2>
          <p className="text-gray-700 mb-6">
            Describe what you need help with and our experts will get back to you quickly.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Select Help Category</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedOption('proposal')}
                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${
                    selectedOption === 'proposal'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Proposal Writing</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedOption('funding')}
                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${
                    selectedOption === 'funding'
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <span>Funding Search</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedOption('project')}
                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${
                    selectedOption === 'project'
                      ? 'bg-purple-50 border-purple-300 text-purple-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Project Management</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedOption('technical')}
                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${
                    selectedOption === 'technical'
                      ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Technical Support</span>
                </motion.button>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message</label>
              <textarea
                id="message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what you need help with in detail..."
              ></textarea>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <Gem className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-medium">50 credits will be deducted</span>
              </div>
              <span className="text-gray-600 text-sm">Current balance: {user?.credits} credits</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitMessage}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Send Message to Expert (50 Credits)</span>
            </motion.button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <h3 className="text-gray-800 font-medium mb-2">What to Expect</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Response within 24 hours (usually much faster)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Personalized assistance from experts in your field</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Follow-up support to ensure your issue is resolved</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HumanHelpPage;