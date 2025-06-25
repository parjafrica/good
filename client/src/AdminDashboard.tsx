import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Globe,
  Bot,
  Activity,
  CreditCard,
  Settings,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Ban,
  UserCheck,
  DollarSign,
  Eye
} from 'lucide-react';

interface AdminStats {
  users: {
    total: number;
    admins: number;
    students: number;
    ngos: number;
  };
  opportunities: {
    total: number;
    verified: number;
    countries: number;
  };
  bots: {
    total: number;
    active: number;
    total_found: number;
  };
  activity: Array<{
    action_type: string;
    count: number;
    date: string;
  }>;
  credits: Array<{
    total_credits: number;
    transaction_type: string;
  }>;
  system: {
    status: string;
    last_updated: string;
  };
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  sector: string;
  organization_type: string;
  credits: number;
  user_type: string;
  is_active: boolean;
  is_banned: boolean;
  created_at: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  amount_min: number;
  amount_max: number;
  currency: string;
  country: string;
  sector: string;
  source_name: string;
  is_verified: boolean;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8002/api/admin/dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (userFilter) params.append('user_type', userFilter);
      
      const response = await fetch(`http://localhost:8002/api/admin/users?${params}`);
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadOpportunities = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/admin/opportunities');
      const data = await response.json();
      setOpportunities(data.opportunities);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'opportunities') {
      loadOpportunities();
    }
  }, [activeTab, searchTerm, userFilter]);

  const banUser = async (userId: string) => {
    try {
      await fetch(`http://localhost:8002/api/admin/users/${userId}/ban`, {
        method: 'POST'
      });
      loadUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      await fetch(`http://localhost:8002/api/admin/users/${userId}/unban`, {
        method: 'POST'
      });
      loadUsers();
    } catch (error) {
      console.error('Failed to unban user:', error);
    }
  };

  const adjustCredits = async (userId: string, amount: number, reason: string) => {
    try {
      await fetch(`http://localhost:8002/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason })
      });
      loadUsers();
    } catch (error) {
      console.error('Failed to adjust credits:', error);
    }
  };

  const verifyOpportunity = async (opportunityId: string) => {
    try {
      await fetch(`http://localhost:8002/api/admin/opportunities/${opportunityId}/verify`, {
        method: 'POST'
      });
      loadOpportunities();
    } catch (error) {
      console.error('Failed to verify opportunity:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, description: 'Overview & Analytics' },
    { id: 'users', label: 'User Management', icon: Users, description: 'Manage Users & Permissions' },
    { id: 'opportunities', label: 'Opportunities', icon: Globe, description: 'Funding Opportunities' },
    { id: 'bots', label: 'Bot Management', icon: Bot, description: 'Scraping Bots & Automation' },
    { id: 'system', label: 'System Logs', icon: Shield, description: 'System Activity & Security' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Configuration & Preferences' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Granada OS Admin</h1>
            <p className="text-gray-400">System Administration Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${stats?.system.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-400">System {stats?.system.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-3xl font-bold">{stats?.users.total}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="mt-4 flex space-x-4 text-sm">
                      <span className="text-gray-400">Admins: {stats?.users.admins}</span>
                      <span className="text-gray-400">Students: {stats?.users.students}</span>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Opportunities</p>
                        <p className="text-3xl font-bold">{stats?.opportunities.total}</p>
                      </div>
                      <Globe className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="mt-4 flex space-x-4 text-sm">
                      <span className="text-gray-400">Verified: {stats?.opportunities.verified}</span>
                      <span className="text-gray-400">Countries: {stats?.opportunities.countries}</span>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Bots</p>
                        <p className="text-3xl font-bold">{stats?.bots.active}</p>
                      </div>
                      <Bot className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                      Found: {stats?.bots.total_found} opportunities
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">System Health</p>
                        <p className="text-3xl font-bold text-green-500">Healthy</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {stats?.activity.slice(0, 10).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700">
                        <div>
                          <span className="font-medium">{activity.action_type.replace('_', ' ')}</span>
                          <span className="text-gray-400 ml-2">{activity.count} times</span>
                        </div>
                        <span className="text-gray-400 text-sm">{activity.date}</span>
                      </div>
                    ))}
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
                  <h2 className="text-3xl font-bold">User Management</h2>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">All Users</option>
                      <option value="admin">Admins</option>
                      <option value="student">Students</option>
                      <option value="donor">NGOs</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Credits</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium">{user.first_name} {user.last_name}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.user_type === 'admin' ? 'bg-red-900 text-red-300' :
                              user.user_type === 'student' ? 'bg-blue-900 text-blue-300' :
                              'bg-green-900 text-green-300'
                            }`}>
                              {user.user_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">{user.credits}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {user.is_banned ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                              <span className={user.is_banned ? 'text-red-400' : 'text-green-400'}>
                                {user.is_banned ? 'Banned' : 'Active'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {user.is_banned ? (
                                <button
                                  onClick={() => unbanUser(user.id)}
                                  className="p-1 text-green-400 hover:bg-green-900 rounded"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => banUser(user.id)}
                                  className="p-1 text-red-400 hover:bg-red-900 rounded"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => adjustCredits(user.id, 100, 'Admin bonus')}
                                className="p-1 text-blue-400 hover:bg-blue-900 rounded"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <h2 className="text-3xl font-bold">Funding Opportunities</h2>
                
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {opportunities.slice(0, 20).map((opp) => (
                        <tr key={opp.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium">{opp.title}</div>
                              <div className="text-sm text-gray-400">{opp.country} • {opp.sector}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{opp.source_name}</td>
                          <td className="px-6 py-4">
                            {opp.amount_min && opp.amount_max ? (
                              <span className="text-sm">
                                {opp.currency} {opp.amount_min.toLocaleString()} - {opp.amount_max.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not specified</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {opp.is_verified ? (
                              <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {!opp.is_verified && (
                                <button
                                  onClick={() => verifyOpportunity(opp.id)}
                                  className="p-1 text-green-400 hover:bg-green-900 rounded"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-1 text-blue-400 hover:bg-blue-900 rounded">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;