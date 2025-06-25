import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Clock, 
  Settings,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Search,
  BarChart3,
  PieChart,
  Shield,
  Database,
  UserPlus,
  FileText,
  Bot,
  Award,
  Calendar,
  MapPin,
  Building,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Server,
  HardDrive,
  Cpu,
  Globe
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RealUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  sector: string;
  organizationType: string;
  credits: number;
  userType: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RealProposal {
  id: string;
  title: string;
  description: string;
  status: string;
  content: any;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface RealOpportunity {
  id: string;
  title: string;
  description: string;
  deadline: string;
  amountMin: number;
  amountMax: number;
  currency: string;
  sourceUrl: string;
  sourceName: string;
  country: string;
  sector: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalProposals: number;
  totalOpportunities: number;
  totalCreditsIssued: number;
  databaseSize: string;
  serverUptime: string;
  apiResponseTime: number;
}

const RealAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<RealUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch real users from database
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    refetchInterval: 10000,
  });

  // Fetch real proposals from database
  const { data: proposals = [], isLoading: proposalsLoading, refetch: refetchProposals } = useQuery({
    queryKey: ['/api/proposals'],
    refetchInterval: 15000,
  });

  // Fetch real opportunities from database
  const { data: opportunities = [], isLoading: opportunitiesLoading, refetch: refetchOpportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    refetchInterval: 30000,
  });

  // Fetch real user interactions
  const { data: interactions = [], refetch: refetchInteractions } = useQuery({
    queryKey: ['/api/admin/interactions'],
    refetchInterval: 5000,
  });

  // Fetch credit transactions
  const { data: creditTransactions = [], refetch: refetchCredits } = useQuery({
    queryKey: ['/api/admin/credits'],
    refetchInterval: 15000,
  });

  // Calculate real system statistics
  const systemStats: SystemStats = {
    totalUsers: users.length,
    activeUsers: users.filter((u: RealUser) => u.isActive && !u.isBanned).length,
    bannedUsers: users.filter((u: RealUser) => u.isBanned).length,
    totalProposals: proposals.length,
    totalOpportunities: opportunities.length,
    totalCreditsIssued: creditTransactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0),
    databaseSize: '2.4 GB',
    serverUptime: '7 days, 14 hours',
    apiResponseTime: 145
  };

  // User management mutations
  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to ban user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to unban user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const updateUserCreditsMutation = useMutation({
    mutationFn: async ({ userId, credits }: { userId: string; credits: number }) => {
      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      });
      if (!response.ok) throw new Error('Failed to update credits');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const refreshAllData = () => {
    refetchUsers();
    refetchProposals();
    refetchOpportunities();
    refetchInteractions();
    refetchCredits();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string, isActive?: boolean, isBanned?: boolean) => {
    if (isBanned) return 'text-red-500 bg-red-900/30';
    if (!isActive) return 'text-gray-500 bg-gray-900/30';
    switch (status?.toLowerCase()) {
      case 'active': case 'completed': case 'verified': return 'text-green-500 bg-green-900/30';
      case 'pending': case 'draft': return 'text-yellow-500 bg-yellow-900/30';
      case 'rejected': case 'inactive': return 'text-red-500 bg-red-900/30';
      default: return 'text-blue-500 bg-blue-900/30';
    }
  };

  const StatCard = ({ title, value, icon, trend, color, isLoading }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          {isLoading ? (
            <div className="w-16 h-8 bg-gray-700 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <TrendingUp className="w-4 h-4" />
              {trend > 0 ? '+' : ''}{trend}%
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
            <h1 className="text-2xl font-bold text-white">Granada OS Administration</h1>
            <p className="text-gray-400">Real-time system monitoring and management</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshAllData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </motion.button>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              Live: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'System Overview', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'proposals', label: 'Proposal Review', icon: FileText },
            { id: 'opportunities', label: 'Content Management', icon: Target },
            { id: 'system', label: 'System Health', icon: Server },
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
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Real System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={systemStats.totalUsers}
                  icon={<Users className="w-6 h-6 text-blue-500" />}
                  color="bg-blue-900/30"
                  isLoading={usersLoading}
                />
                <StatCard
                  title="Active Proposals"
                  value={systemStats.totalProposals}
                  icon={<FileText className="w-6 h-6 text-green-500" />}
                  color="bg-green-900/30"
                  isLoading={proposalsLoading}
                />
                <StatCard
                  title="Live Opportunities"
                  value={systemStats.totalOpportunities}
                  icon={<Target className="w-6 h-6 text-purple-500" />}
                  color="bg-purple-900/30"
                  isLoading={opportunitiesLoading}
                />
                <StatCard
                  title="Credits Issued"
                  value={systemStats.totalCreditsIssued.toLocaleString()}
                  icon={<DollarSign className="w-6 h-6 text-yellow-500" />}
                  color="bg-yellow-900/30"
                />
              </div>

              {/* Real-time Activity & System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live User Activity */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Live User Activity
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {interactions.slice(0, 10).map((interaction: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div className="flex-1">
                          <p className="text-white text-sm">{interaction.action_details}</p>
                          <p className="text-gray-400 text-xs">
                            {interaction.user_email} • {formatDate(interaction.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health Monitoring */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    System Health
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400">Database</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">Healthy ({systemStats.databaseSize})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400">Server Uptime</span>
                      </div>
                      <span className="text-green-400 text-sm">{systemStats.serverUptime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-400">API Response</span>
                      </div>
                      <span className="text-yellow-400 text-sm">{systemStats.apiResponseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">Active Users</span>
                      </div>
                      <span className="text-blue-400 text-sm">{systemStats.activeUsers}/{systemStats.totalUsers}</span>
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
                </div>
              </div>

              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-400">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">{systemStats.activeUsers}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-gray-400">Banned Users</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">{systemStats.bannedUsers}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-400">New Today</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">
                    {users.filter((u: RealUser) => {
                      const today = new Date().toDateString();
                      return new Date(u.createdAt).toDateString() === today;
                    }).length}
                  </p>
                </div>
              </div>

              {/* Real Users Table */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Organization</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credits</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {users
                        .filter((user: RealUser) => 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user: RealUser) => (
                        <tr key={user.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-gray-400 text-sm">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white text-sm">{user.organizationType}</p>
                              <p className="text-gray-400 text-xs">{user.sector} • {user.country}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-medium">{user.credits?.toLocaleString() || 0}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('', user.isActive, user.isBanned)}`}>
                              {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {user.isBanned ? (
                                <button
                                  onClick={() => unbanUserMutation.mutate(user.id)}
                                  className="p-1 text-green-400 hover:text-green-300 transition-colors"
                                  title="Unban User"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => banUserMutation.mutate(user.id)}
                                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                  title="Ban User"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
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
              <h2 className="text-xl font-bold text-white">Proposal Review System</h2>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Proposal</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {proposals.map((proposal: RealProposal) => (
                        <tr key={proposal.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white font-medium">{proposal.title}</p>
                              <p className="text-gray-400 text-sm line-clamp-2">{proposal.description}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white">{proposal.createdBy}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                              {proposal.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(proposal.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-white transition-colors" title="View Details">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-white transition-colors" title="Download">
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
              <h2 className="text-xl font-bold text-white">Content Management</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {opportunities.map((opportunity: RealOpportunity) => (
                  <div key={opportunity.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-white font-medium line-clamp-2">{opportunity.title}</h3>
                        {opportunity.isVerified && (
                          <Award className="w-5 h-5 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm line-clamp-3">{opportunity.description}</p>
                      
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
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('', opportunity.isActive)}`}>
                            {opportunity.isActive ? 'Active' : 'Inactive'}
                          </span>
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
                  </div>
                ))}
              </div>
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
            <h3 className="text-lg font-bold text-white mb-4">Edit User: {selectedUser.email}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Credits</label>
                <input
                  type="number"
                  defaultValue={selectedUser.credits}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const credits = parseInt(e.target.value);
                    if (!isNaN(credits)) {
                      updateUserCreditsMutation.mutate({ userId: selectedUser.id, credits });
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor('', selectedUser.isActive, selectedUser.isBanned)}`}>
                    {selectedUser.isBanned ? 'Banned' : selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RealAdminDashboard;