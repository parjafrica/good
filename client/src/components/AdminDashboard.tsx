import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Filter,
  Bell,
  BarChart3,
  PieChart,
  Globe,
  Zap,
  Shield,
  Database,
  UserPlus,
  FileText,
  Bot,
  Mail,
  CreditCard,
  Star,
  Award,
  Calendar,
  MapPin,
  Building,
  Hash,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import AdminBusinessTools from './AdminBusinessTools';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdminStats {
  totalUsers: number;
  totalProposals: number;
  totalOpportunities: number;
  totalCredits: number;
  activeUsers: number;
  pendingReviews: number;
  successRate: number;
  revenue: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  credits: number;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

interface Proposal {
  id: string;
  title: string;
  user_name: string;
  user_email: string;
  opportunity_title: string;
  funder_name: string;
  amount: string;
  submitted_at: string;
  status: string;
  content: any;
}

interface Activity {
  id: string;
  type: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: stats = {
    totalUsers: 0,
    totalProposals: 0,
    totalOpportunities: 0,
    totalCredits: 0,
    activeUsers: 0,
    pendingReviews: 0,
    successRate: 0,
    revenue: 0
  }, refetch: refetchStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000,
  });

  // Fetch users
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    refetchInterval: 15000,
  });

  // Fetch proposals
  const { data: proposals = [], refetch: refetchProposals } = useQuery({
    queryKey: ['/api/admin/proposals/pending'],
    refetchInterval: 10000,
  });

  // Fetch activities
  const { data: activities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['/api/admin/activities'],
    refetchInterval: 5000,
  });

  // Fetch opportunities
  const { data: opportunities = [], refetch: refetchOpportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    refetchInterval: 30000,
  });

  // User actions
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: string; updates: Partial<User> }) => {
      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData.updates),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowUserModal(false);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const refreshAllData = () => {
    refetchStats();
    refetchUsers();
    refetchProposals();
    refetchActivities();
    refetchOpportunities();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-500 bg-green-900/30';
      case 'pending': return 'text-yellow-500 bg-yellow-900/30';
      case 'suspended': return 'text-red-500 bg-red-900/30';
      case 'completed': return 'text-blue-500 bg-blue-900/30';
      default: return 'text-gray-500 bg-gray-900/30';
    }
  };

  const StatCard = ({ title, value, icon, change, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <TrendingUp className="w-4 h-4" />
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Granada OS Administration Panel</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshAllData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'proposals', label: 'Proposals', icon: FileText },
            { id: 'opportunities', label: 'Opportunities', icon: Target },
            { id: 'bots', label: 'Bots', icon: Bot },
            { id: 'business', label: 'Business Tools', icon: Briefcase },
            { id: 'analytics', label: 'Analytics', icon: PieChart },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={users.length}
                  icon={<Users className="w-6 h-6 text-blue-500" />}
                  color="bg-blue-900/30"
                  change={12}
                />
                <StatCard
                  title="Active Proposals"
                  value={proposals.length}
                  icon={<FileText className="w-6 h-6 text-green-500" />}
                  color="bg-green-900/30"
                  change={8}
                />
                <StatCard
                  title="Opportunities"
                  value={opportunities.length}
                  icon={<Target className="w-6 h-6 text-purple-500" />}
                  color="bg-purple-900/30"
                  change={-3}
                />
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(stats.revenue || 15847)}
                  icon={<DollarSign className="w-6 h-6 text-yellow-500" />}
                  color="bg-yellow-900/30"
                  change={25}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {activities.slice(0, 10).map((activity: Activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.action}</p>
                          <p className="text-gray-400 text-xs">{activity.user} • {activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    System Health
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Database</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-400 text-sm">Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">API Services</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-400 text-sm">Operational</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Bot Manager</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-yellow-400 text-sm">Monitoring</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Expert Review</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-400 text-sm">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* User Management Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">User Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credits</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {users.slice(0, 10).map((user: User) => (
                        <tr key={user.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-gray-400 text-sm">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'active')}`}>
                              {user.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white">{user.credits || 0}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(user.lastLogin || user.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'proposals' && (
            <motion.div
              key="proposals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">Proposal Management</h2>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Proposal</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {proposals.map((proposal: Proposal) => (
                        <tr key={proposal.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white font-medium">{proposal.title}</p>
                              <p className="text-gray-400 text-sm">{proposal.opportunity_title}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white">{proposal.user_name}</p>
                              <p className="text-gray-400 text-sm">{proposal.user_email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                              {proposal.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(proposal.submitted_at)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'opportunities' && (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">Funding Opportunities</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {opportunities.slice(0, 12).map((opportunity: any) => (
                  <div key={opportunity.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-white font-medium line-clamp-2">{opportunity.title}</h3>
                        {opportunity.isVerified && (
                          <div className="flex items-center gap-1 text-green-400">
                            <Award className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {opportunity.sourceName}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {opportunity.country}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-green-400">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">
                            {opportunity.currency} {opportunity.amountMin?.toLocaleString()} - {opportunity.amountMax?.toLocaleString()}
                          </span>
                        </div>
                        <a
                          href={opportunity.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'business' && (
            <motion.div
              key="business"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminBusinessTools />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Credits</label>
                <input
                  type="number"
                  value={selectedUser.credits}
                  onChange={(e) => setSelectedUser({...selectedUser, credits: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateUserMutation.mutate({ id: selectedUser.id, updates: selectedUser })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;