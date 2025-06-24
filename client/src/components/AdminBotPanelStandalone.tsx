import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Trash2, 
  Eye, 
  Activity, 
  Camera, 
  Target, 
  Zap,
  Shield,
  Clock,
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Monitor
} from 'lucide-react';

interface BotConfig {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'error';
  url: string;
  priority: number;
  stealth: boolean;
  humanBehavior: boolean;
  screenshotMode: boolean;
  lastRun?: string;
  totalOpportunities: number;
  totalRewardPoints: number;
  successRate: number;
}

interface URLTarget {
  id: string;
  url: string;
  name: string;
  priority: number;
  type: string;
  isActive: boolean;
  addedAt: string;
}

const AdminBotPanelStandalone: React.FC = () => {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [urlTargets, setUrlTargets] = useState<URLTarget[]>([]);
  const [systemStatus, setSystemStatus] = useState('idle');
  const [newUrl, setNewUrl] = useState('');
  const [newUrlName, setNewUrlName] = useState('');
  const [newUrlPriority, setNewUrlPriority] = useState(5);
  const [globalSettings, setGlobalSettings] = useState({
    stealthMode: true,
    humanBehavior: true,
    screenshotThreshold: 70,
    maxConcurrentBots: 3,
    delayBetweenRequests: 2000
  });

  useEffect(() => {
    loadBotStatus();
    loadUrlTargets();
    const interval = setInterval(loadBotStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadBotStatus = async () => {
    try {
      setBots([
        {
          id: 'bot-1',
          name: 'Grants.gov Bot',
          status: 'active',
          url: 'https://www.grants.gov/',
          priority: 10,
          stealth: true,
          humanBehavior: true,
          screenshotMode: true,
          lastRun: '2 minutes ago',
          totalOpportunities: 45,
          totalRewardPoints: 1850,
          successRate: 92
        },
        {
          id: 'bot-2', 
          name: 'GrantSpace Bot',
          status: 'active',
          url: 'https://www.grantspace.org/',
          priority: 9,
          stealth: true,
          humanBehavior: true,
          screenshotMode: true,
          lastRun: '5 minutes ago',
          totalOpportunities: 38,
          totalRewardPoints: 1620,
          successRate: 89
        },
        {
          id: 'bot-3',
          name: 'EU Funding Bot',
          status: 'paused',
          url: 'https://ec.europa.eu/info/funding-tenders_en',
          priority: 8,
          stealth: true,
          humanBehavior: true,
          screenshotMode: false,
          lastRun: '1 hour ago',
          totalOpportunities: 22,
          totalRewardPoints: 980,
          successRate: 76
        }
      ]);
    } catch (error) {
      console.error('Error loading bot status:', error);
    }
  };

  const loadUrlTargets = async () => {
    try {
      const response = await fetch('/api/admin/search-targets');
      const data = await response.json();
      
      if (data.targets && data.targets.length > 0) {
        const formattedTargets = data.targets.map((target: any) => ({
          id: target.id.toString(),
          url: target.url,
          name: target.name,
          priority: target.priority,
          type: target.type,
          isActive: target.is_active || target.isActive,
          addedAt: target.created_at || target.addedAt
        }));
        setUrlTargets(formattedTargets);
      } else {
        // Use static data when API doesn't return targets
        setUrlTargets([
          {
            id: '1',
            url: 'https://www.grants.gov/',
            name: 'US Federal Grants Portal',
            priority: 10,
            type: 'government',
            isActive: true,
            addedAt: '2025-06-24T10:00:00Z'
          },
          {
            id: '2',
            url: 'https://www.grantspace.org/',
            name: 'Foundation Directory',
            priority: 9,
            type: 'foundation',
            isActive: true,
            addedAt: '2025-06-24T10:05:00Z'
          },
          {
            id: '3',
            url: 'https://ec.europa.eu/info/funding-tenders_en',
            name: 'EU Funding Portal',
            priority: 8,
            type: 'government',
            isActive: true,
            addedAt: '2025-06-24T10:10:00Z'
          },
          {
            id: '4',
            url: 'https://reliefweb.int/',
            name: 'ReliefWeb Humanitarian',
            priority: 7,
            type: 'humanitarian',
            isActive: true,
            addedAt: '2025-06-24T10:15:00Z'
          },
          {
            id: '5',
            url: 'https://www.usaid.gov/partnership-opportunities',
            name: 'USAID Opportunities',
            priority: 6,
            type: 'development',
            isActive: true,
            addedAt: '2025-06-24T10:20:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading URL targets:', error);
      setUrlTargets([]);
    }
  };

  const addUrlTarget = async () => {
    if (!newUrl || !newUrlName) return;
    
    try {
      const response = await fetch('/api/admin/add-url-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl,
          name: newUrlName,
          priority: newUrlPriority,
          type: 'custom'
        })
      });
      
      if (response.ok) {
        setNewUrl('');
        setNewUrlName('');
        setNewUrlPriority(5);
        loadUrlTargets();
      } else {
        // Add locally if API fails
        const newTarget = {
          id: (urlTargets.length + 1).toString(),
          url: newUrl,
          name: newUrlName,
          priority: newUrlPriority,
          type: 'custom',
          isActive: true,
          addedAt: new Date().toISOString()
        };
        setUrlTargets([...urlTargets, newTarget]);
        setNewUrl('');
        setNewUrlName('');
        setNewUrlPriority(5);
      }
    } catch (error) {
      console.error('Error adding URL target:', error);
    }
  };

  const toggleBot = async (botId: string, action: 'start' | 'pause') => {
    try {
      await fetch(`/api/admin/bot/${botId}/${action}`, { method: 'POST' });
      loadBotStatus();
    } catch (error) {
      console.error(`Error ${action}ing bot:`, error);
    }
  };

  const runAllBots = async () => {
    setSystemStatus('running');
    try {
      const response = await fetch('/api/run-intelligent-bots', { method: 'POST' });
      const result = await response.json();
      console.log('Bot system started:', result);
    } catch (error) {
      console.error('Error starting bot system:', error);
    } finally {
      setTimeout(() => setSystemStatus('idle'), 5000);
    }
  };

  const updateGlobalSettings = async () => {
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalSettings)
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'paused': return 'text-yellow-400 bg-yellow-400/20';
      case 'error': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bot System Admin Panel</h1>
          <p className="text-slate-300">Manage intelligent bots with human-like behavior and AI integration</p>
        </div>

        {/* Global Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Active Bots</span>
                <span className="text-green-400 font-semibold">{bots.filter(b => b.status === 'active').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Opportunities</span>
                <span className="text-blue-400 font-semibold">{bots.reduce((sum, b) => sum + b.totalOpportunities, 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Reward Points</span>
                <span className="text-purple-400 font-semibold">{bots.reduce((sum, b) => sum + b.totalRewardPoints, 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">URL Targets</span>
                <span className="text-orange-400 font-semibold">{urlTargets.length}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-green-400" />
              Global Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Stealth Mode</span>
                <input
                  type="checkbox"
                  checked={globalSettings.stealthMode}
                  onChange={(e) => setGlobalSettings({...globalSettings, stealthMode: e.target.checked})}
                  className="rounded bg-slate-700 border-slate-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Human Behavior</span>
                <input
                  type="checkbox"
                  checked={globalSettings.humanBehavior}
                  onChange={(e) => setGlobalSettings({...globalSettings, humanBehavior: e.target.checked})}
                  className="rounded bg-slate-700 border-slate-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Screenshot Threshold</span>
                <input
                  type="number"
                  value={globalSettings.screenshotThreshold}
                  onChange={(e) => setGlobalSettings({...globalSettings, screenshotThreshold: parseInt(e.target.value)})}
                  className="w-16 px-2 py-1 rounded bg-slate-700 border-slate-600 text-white text-sm"
                  min="0"
                  max="100"
                />
              </label>
            </div>
            <button
              onClick={updateGlobalSettings}
              className="w-full mt-4 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
            >
              Update Settings
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={runAllBots}
                disabled={systemStatus === 'running'}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
              >
                {systemStatus === 'running' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run All Bots</span>
                  </>
                )}
              </button>
              <button
                onClick={loadBotStatus}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bot Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Bot className="w-6 h-6 mr-2 text-purple-400" />
            Active Bots
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {bots.map((bot) => (
              <div key={bot.id} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">{bot.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bot.status)}`}>
                      {bot.status}
                    </span>
                    <button
                      onClick={() => toggleBot(bot.id, bot.status === 'active' ? 'pause' : 'start')}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {bot.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">URL:</span>
                    <span className="text-blue-400 truncate ml-2">{new URL(bot.url).hostname}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Priority:</span>
                    <span className="text-white">{bot.priority}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Opportunities:</span>
                    <span className="text-green-400">{bot.totalOpportunities}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Points:</span>
                    <span className="text-purple-400">{bot.totalRewardPoints}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Success Rate:</span>
                    <span className="text-yellow-400">{bot.successRate}%</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-600">
                  {bot.stealth && <Shield className="w-4 h-4 text-green-400" title="Stealth Mode" />}
                  {bot.humanBehavior && <Activity className="w-4 h-4 text-blue-400" title="Human Behavior" />}
                  {bot.screenshotMode && <Camera className="w-4 h-4 text-purple-400" title="Screenshot Mode" />}
                  <span className="text-xs text-slate-400 ml-auto">{bot.lastRun}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* URL Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-orange-400" />
            URL Targets ({urlTargets.length})
          </h3>
          
          {/* Add New URL */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">Add New URL Target</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="url"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder-slate-400"
              />
              <input
                type="text"
                placeholder="Display Name"
                value={newUrlName}
                onChange={(e) => setNewUrlName(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder-slate-400"
              />
              <input
                type="number"
                placeholder="Priority (1-10)"
                value={newUrlPriority}
                onChange={(e) => setNewUrlPriority(parseInt(e.target.value))}
                min="1"
                max="10"
                className="px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder-slate-400"
              />
              <button
                onClick={addUrlTarget}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add URL</span>
              </button>
            </div>
          </div>
          
          {/* URL List */}
          <div className="space-y-3">
            {urlTargets.map((target) => (
              <div key={target.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <div>
                      <h5 className="font-semibold text-white">{target.name}</h5>
                      <p className="text-sm text-slate-400">{target.url}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-400">Priority: {target.priority}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${target.isActive ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'}`}>
                    {target.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-slate-500">{target.type}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminBotPanelStandalone;