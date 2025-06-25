import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, FileText, Mail, Bell, MessageSquare,
  DollarSign, Globe, Award, BarChart3, Calendar, Send,
  Eye, Edit, Check, X, Star, Heart, Zap, Target
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeProposals: number;
  completedProposals: number;
  totalRevenue: number;
  conversionRate: number;
  userGrowth: number;
}

interface UserSubmission {
  id: string;
  user_name: string;
  user_email: string;
  submission_type: 'proposal' | 'inquiry' | 'feedback';
  title: string;
  status: 'pending' | 'in_review' | 'completed';
  submitted_at: string;
  priority: 'high' | 'medium' | 'low';
}

const EnhancedAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeProposals: 0,
    completedProposals: 0,
    totalRevenue: 0,
    conversionRate: 0,
    userGrowth: 0
  });
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<UserSubmission | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch submissions
      const submissionsResponse = await fetch('/api/admin/submissions');
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const sendNotification = async (userId: string, message: string) => {
    try {
      await fetch('/api/admin/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          message: message,
          type: 'admin_message'
        })
      });
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: string) => {
    try {
      await fetch(`/api/admin/submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'in_review': return 'text-blue-400 bg-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <Award className="w-8 h-8 text-white" />
                </div>
                Granada OS Admin Command Center
              </h1>
              <p className="text-purple-200 text-lg">
                Empowering funding success through intelligent administration
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotificationModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
              Send Global Notification
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Users',
              value: stats.totalUsers.toLocaleString(),
              change: `+${stats.userGrowth}%`,
              icon: <Users className="w-6 h-6" />,
              color: 'from-blue-500 to-blue-600',
              textColor: 'text-blue-100'
            },
            {
              title: 'Active Proposals',
              value: stats.activeProposals.toLocaleString(),
              change: '+12%',
              icon: <FileText className="w-6 h-6" />,
              color: 'from-green-500 to-green-600',
              textColor: 'text-green-100'
            },
            {
              title: 'Success Rate',
              value: `${stats.conversionRate}%`,
              change: '+8%',
              icon: <TrendingUp className="w-6 h-6" />,
              color: 'from-purple-500 to-purple-600',
              textColor: 'text-purple-100'
            },
            {
              title: 'Platform Revenue',
              value: `$${stats.totalRevenue.toLocaleString()}`,
              change: '+25%',
              icon: <DollarSign className="w-6 h-6" />,
              color: 'from-yellow-500 to-orange-500',
              textColor: 'text-yellow-100'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-white/20 rounded-lg ${stat.textColor}`}>
                  {stat.icon}
                </div>
                <div className={`px-2 py-1 bg-white/20 rounded-full text-xs font-semibold ${stat.textColor}`}>
                  {stat.change}
                </div>
              </div>
              <h3 className="text-white/90 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Submissions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  User Submissions & Requests
                </h2>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm">
                    {submissions.length} Active
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {submissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedSubmission(submission)}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 cursor-pointer hover:bg-slate-700/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-white mb-1">{submission.title}</h3>
                        <p className="text-slate-400 text-sm">{submission.user_name} • {submission.user_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(submission.priority)}`}>
                          {submission.priority}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSubmissionStatus(submission.id, 'in_review');
                          }}
                          className="p-1 bg-blue-500/20 rounded text-blue-400 hover:bg-blue-500/30"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSubmissionStatus(submission.id, 'completed');
                          }}
                          className="p-1 bg-green-500/20 rounded text-green-400 hover:bg-green-500/30"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            sendNotification(submission.id, 'Thank you for your submission. We are reviewing it and will get back to you soon.');
                          }}
                          className="p-1 bg-purple-500/20 rounded text-purple-400 hover:bg-purple-500/30"
                        >
                          <Mail className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {submissions.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Submissions</h3>
                    <p className="text-slate-400">All user requests have been processed</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions & Marketing */}
          <div className="space-y-6">
            {/* Marketing Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Marketing Insights
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-200 text-sm">User Conversion</span>
                    <span className="text-white font-semibold">{stats.conversionRate}%</span>
                  </div>
                  <div className="w-full bg-purple-900/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                      style={{ width: `${stats.conversionRate}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-purple-200 text-sm">User Satisfaction</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-white font-semibold ml-2">4.9/5</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open('/admin/proposals', '_blank')}
                  className="w-full p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Review Proposals
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open('/admin/bots', '_blank')}
                  className="w-full p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Manage Bots
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 transition-all flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics Dashboard
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNotificationModal(true)}
                  className="w-full p-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-yellow-300 transition-all flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Send Notification
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Global Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Send Global Notification</h3>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter your message to all users..."
                className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none resize-none"
              />
              <div className="flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    sendNotification('all', notificationMessage);
                    setShowNotificationModal(false);
                    setNotificationMessage('');
                  }}
                  className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Send to All Users
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;