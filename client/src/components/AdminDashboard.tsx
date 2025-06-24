import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Database, 
  Bot, 
  RefreshCw, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Award,
  TrendingUp,
  Download,
  Settings,
  Globe,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  BarChart3,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminStats, BotStatus, BotReward } from '../types';
import { realDonorSearchEngine } from '../services/realDonorSearchEngine';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [botStatistics, setBotStatistics] = useState<any | null>(null);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user?.is_superuser) {
      // Redirect to dashboard if not admin
      window.location.href = '/';
      return;
    }

    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch bot statistics
      const botStats = await realDonorSearchEngine.fetchBotStatistics();
      setBotStatistics(botStats);

      // Create admin stats from bot statistics
      const adminStats: AdminStats = {
        users: {
          total: 125,
          active: 87,
          admins: 3
        },
        opportunities: {
          total: botStats.statistics.total_opportunities || 0,
          verified: botStats.statistics.total_verified || 0,
          countries: Object.keys(botStats.statistics.opportunity_counts || {}).length
        },
        bots: {
          total: botStats.bots?.length || 0,
          active: botStats.bots?.filter((b: any) => b.status === 'active').length || 0,
          totalFinds: botStats.bots?.reduce((sum: number, bot: any) => sum + (bot.opportunities_found || 0), 0) || 0
        },
        system: {
          uptime: 99.8,
          lastUpdate: new Date(botStats.system_status?.last_update || Date.now()),
          status: 'healthy'
        }
      };

      setStats(adminStats);
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleTriggerSearch = async () => {
    if (!selectedBot) return;
    
    try {
      setIsSearching(true);
      setSearchResult(null);
      
      const botCountry = botStatistics?.bots.find((b: any) => b.id === selectedBot)?.country;
      if (!botCountry) throw new Error('Bot country not found');
      
      const result = await realDonorSearchEngine.triggerSearch(
        botCountry,
        searchQuery || undefined
      );
      
      setSearchResult(result);
      
      // Refresh statistics after a delay
      setTimeout(() => {
        loadDashboardData();
      }, 3000);
    } catch (err) {
      console.error('Error triggering search:', err);
      setSearchResult({ error: 'Failed to trigger search' });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'paused': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'error': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'maintenance': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'healthy': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      default: return 'text-slate-400 bg-slate-400/20 border-slate-400/30';
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-blue-400 text-sm font-medium">{stats?.users.active} active</div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.users.total}</h3>
          <p className="text-slate-400">Total Users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-600/20 rounded-xl">
              <Database className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-green-400 text-sm font-medium">{stats?.opportunities.countries} countries</div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.opportunities.total.toLocaleString()}</h3>
          <p className="text-slate-400">Funding Opportunities</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-purple-400 text-sm font-medium">{stats?.bots.active} active</div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.bots.total}</h3>
          <p className="text-slate-400">Search Bots</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-600/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(stats?.system.status || 'healthy')}`}>
              {stats?.system.status.toUpperCase()}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.system.uptime}%</h3>
          <p className="text-slate-400">System Uptime</p>
        </motion.div>
      </div>

      {/* Bot Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Search Bot Status</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>

        <div className="space-y-4">
          {botStatistics?.bots.map((bot: any) => (
            <motion.div
              key={bot.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedBot(selectedBot === bot.id ? null : bot.id)}
              className={`p-4 bg-slate-700/30 rounded-lg cursor-pointer transition-all ${
                selectedBot === bot.id ? 'border border-blue-500/50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(bot.status)}`}>
                    {bot.status.toUpperCase()}
                  </div>
                  <h4 className="text-white font-medium">{bot.name}</h4>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-xs">
                    <Database className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-400">{bot.opportunities_found}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <Award className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400">{bot.reward_points}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div>Country: {bot.country}</div>
                <div>Last run: {formatDate(bot.last_run)}</div>
              </div>

              {/* Expanded content when selected */}
              {selectedBot === bot.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-600/50"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <h5 className="text-white font-medium">Trigger Manual Search</h5>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Optional search query..."
                        className="w-full px-4 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={handleTriggerSearch}
                      disabled={isSearching}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSearching ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 inline mr-2" />
                          Trigger Search
                        </>
                      )}
                    </motion.button>
                  </div>

                  {searchResult && (
                    <div className={`p-3 rounded-lg text-sm mt-3 ${
                      searchResult.error 
                        ? 'bg-red-600/20 border border-red-500/30 text-red-400' 
                        : 'bg-green-600/20 border border-green-500/30 text-green-400'
                    }`}>
                      {searchResult.error ? (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{searchResult.error}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>{searchResult.message}</span>
                          </div>
                          <div className="text-xs">
                            Queued {searchResult.targets_queued} targets. Results will be available soon.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <div className="p-3 bg-slate-600/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm">Success Rate</span>
                        <span className="text-green-400 font-medium">{bot.success_rate}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full" 
                          style={{ width: `${bot.success_rate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-600/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Errors</span>
                        <span className="text-red-400 font-medium">{bot.error_count}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-600/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Status</span>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            bot.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                          }`}></span>
                          <span className="text-white text-sm">{bot.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="flex-1 py-2 bg-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Configure
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="flex-1 py-2 bg-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
                    >
                      {bot.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 inline mr-2" />
                          Pause Bot
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 inline mr-2" />
                          Activate Bot
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-6">Recent Bot Activity</h3>
        
        <div className="space-y-4">
          {botStatistics?.recent_rewards.slice(0, 5).map((reward: any, index: number) => (
            <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">{reward.bot_id}</span>
                </div>
                <span className="text-yellow-400 font-medium">+{reward.reward_points} points</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div>Found {reward.opportunities_found} opportunities in {reward.country}</div>
                <div>{formatDate(reward.awarded_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Verification Status</h3>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300">Verified Opportunities</span>
            <span className="text-white font-medium">{stats?.opportunities.verified.toLocaleString()}</span>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${stats ? (stats.opportunities.verified / stats.opportunities.total) * 100 : 0}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>{stats ? Math.round((stats.opportunities.verified / stats.opportunities.total) * 100) : 0}%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4">System Health</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 text-sm">Status</span>
                <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(stats?.system.status || 'healthy')}`}>
                  {stats?.system.status.toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 text-sm">Last Update</span>
                <span className="text-white text-sm">{stats?.system.lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 text-sm">Uptime</span>
                <span className="text-green-400 font-medium">{stats?.system.uptime}%</span>
              </div>
            </div>
            
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 text-sm">Active Bots</span>
                <span className="text-blue-400 font-medium">{stats?.bots.active}/{stats?.bots.total}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderBots = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Search Bots Management</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bot</span>
        </motion.button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-white">Active Bots</h4>
          <div className="flex items-center space-x-3">
            <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Countries</option>
              <option>South Sudan</option>
              <option>Kenya</option>
              <option>Nigeria</option>
            </select>
            <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Status</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Error</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {botStatistics?.bots.map((bot: any) => (
            <div key={bot.id} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(bot.status)}`}>
                      {bot.status.toUpperCase()}
                    </div>
                    <h5 className="text-white font-medium">{bot.name}</h5>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>{bot.country}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Database className="w-4 h-4" />
                      <span>{bot.opportunities_found} finds</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>{bot.reward_points} points</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-600/20 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-600/20 rounded-lg transition-colors"
                  >
                    {bot.status === 'active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOpportunities = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Funding Opportunities</h3>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manually</span>
          </motion.button>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search opportunities..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Countries</option>
              <option>South Sudan</option>
              <option>Kenya</option>
              <option>Nigeria</option>
            </select>
            <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Status</option>
              <option>Verified</option>
              <option>Unverified</option>
            </select>
            <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Sources</option>
              <option>UNDP</option>
              <option>World Bank</option>
              <option>USAID</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Title</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Source</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Country</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Scraped</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Sample data - would be populated from API */}
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-3 px-4 text-white">Education Funding Opportunity {i}</td>
                  <td className="py-3 px-4 text-slate-300">UNDP South Sudan</td>
                  <td className="py-3 px-4 text-slate-300">South Sudan</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      i % 2 === 0 ? 'text-green-400 bg-green-400/20 border-green-400/30' : 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
                    }`}>
                      {i % 2 === 0 ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">2 hours ago</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-slate-400 text-sm">
            Showing 1-5 of 156 opportunities
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg">
              1
            </button>
            <button className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all">
              2
            </button>
            <button className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all">
              3
            </button>
            <button className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">User Management</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </motion.button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Roles</option>
              <option>Admins</option>
              <option>Users</option>
            </select>
            <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Credits</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Sample data - would be populated from API */}
              <tr className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="py-3 px-4 text-white">Granada Admin</td>
                <td className="py-3 px-4 text-slate-300">admin@granada.org</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs font-medium border text-red-400 bg-red-400/20 border-red-400/30">
                    ADMIN
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs font-medium border text-green-400 bg-green-400/20 border-green-400/30">
                    ACTIVE
                  </span>
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">1,247</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </tr>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-3 px-4 text-white">User {i}</td>
                  <td className="py-3 px-4 text-slate-300">user{i}@example.com</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs font-medium border text-blue-400 bg-blue-400/20 border-blue-400/30">
                      USER
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs font-medium border text-green-400 bg-green-400/20 border-green-400/30">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">{100 * i}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">System Analytics</h3>
        <div className="flex items-center space-x-3">
          <select className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
          <h4 className="text-lg font-semibold text-white mb-4">Opportunities by Country</h4>
          <div className="h-64 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-16 h-16 text-slate-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-400">Interactive chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
          <h4 className="text-lg font-semibold text-white mb-4">Bot Performance</h4>
          <div className="h-64 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="w-16 h-16 text-slate-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-400">Interactive chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4">System Performance Metrics</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">CPU Usage</span>
              <span className="text-green-400 font-medium">23%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Memory Usage</span>
              <span className="text-yellow-400 font-medium">68%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Disk Usage</span>
              <span className="text-blue-400 font-medium">42%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Loading Admin Dashboard</h3>
          <p className="text-slate-400">Please wait while we fetch the latest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-600/20 rounded-xl">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-300">System monitoring and management</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1 overflow-x-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
          }`}
        >
          Overview
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('bots')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'bots'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
          }`}
        >
          Search Bots
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('opportunities')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'opportunities'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
          }`}
        >
          Opportunities
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'users'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
          }`}
        >
          Users
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'analytics'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
          }`}
        >
          Analytics
        </motion.button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'bots' && renderBots()}
        {activeTab === 'opportunities' && renderOpportunities()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'analytics' && renderAnalytics()}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;