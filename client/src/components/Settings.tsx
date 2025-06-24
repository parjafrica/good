import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Eye,
  EyeOff,
  Gem,
  Plus,
  Trash2,
  Edit,
  Monitor,
  Sun,
  Moon,
  Sparkles,
  Droplets,
  Leaf,
  Flame
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface APIKey {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'deepseek' | 'dalle';
  key: string;
  isActive: boolean;
  createdAt: Date;
}

const Settings: React.FC = () => {
  const { user, updateCredits } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'OpenAI GPT-4',
      provider: 'openai',
      key: 'sk-proj-abc123...xyz789',
      isActive: true,
      createdAt: new Date()
    }
  ]);
  const [newApiKey, setNewApiKey] = useState({ name: '', provider: 'openai' as const, key: '' });
  const [showAddApiKey, setShowAddApiKey] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    organization: user?.organization?.name || '',
    sector: user?.organization?.sector || '',
    country: user?.organization?.country || '',
    website: '',
    phone: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    fundingAlerts: true,
    proposalReminders: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building },
    { id: 'billing', label: 'Billing & Credits', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'AI Providers', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  const themeOptions = [
    { id: 'dark', name: 'Dark', description: 'Professional dark theme', icon: Moon },
    { id: 'light', name: 'Light', description: 'Clean light theme', icon: Sun },
    { id: 'auto', name: 'Auto', description: 'Follows system preference', icon: Monitor },
    { id: 'blue', name: 'Ocean Blue', description: 'Calming blue tones', icon: Droplets },
    { id: 'purple', name: 'Royal Purple', description: 'Elegant purple theme', icon: Sparkles },
    { id: 'green', name: 'Nature Green', description: 'Fresh green theme', icon: Leaf },
    { id: 'orange', name: 'Sunset Orange', description: 'Warm orange theme', icon: Flame }
  ];

  const handleSaveProfile = () => {
    // In production, this would update the user profile via API
    console.log('Saving profile:', profileData);
    alert('Profile updated successfully!');
  };

  const handleAddApiKey = () => {
    if (!newApiKey.name || !newApiKey.key) {
      alert('Please fill in all fields');
      return;
    }

    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      provider: newApiKey.provider,
      key: newApiKey.key,
      isActive: true,
      createdAt: new Date()
    };

    setApiKeys(prev => [...prev, apiKey]);
    setNewApiKey({ name: '', provider: 'openai', key: '' });
    setShowAddApiKey(false);
    alert('API key added successfully!');
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const deleteApiKey = (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
    }
  };

  const toggleApiKeyStatus = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, isActive: !key.isActive } : key
    ));
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'text-green-400 bg-green-400/20';
      case 'gemini': return 'text-blue-400 bg-blue-400/20';
      case 'deepseek': return 'text-purple-400 bg-purple-400/20';
      case 'dalle': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </motion.button>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Organization Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Organization Name</label>
                <input
                  type="text"
                  value={profileData.organization}
                  onChange={(e) => setProfileData(prev => ({ ...prev, organization: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">Sector</label>
                <select
                  value={profileData.sector}
                  onChange={(e) => setProfileData(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Sector</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Environment">Environment</option>
                  <option value="Human Rights">Human Rights</option>
                  <option value="Economic Development">Economic Development</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">Country</label>
                <input
                  type="text"
                  value={profileData.country}
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Billing & Credits</h3>
            
            {/* Current Credits */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Gem className="w-8 h-8 text-emerald-400" />
                  <div>
                    <h4 className="text-2xl font-bold text-white">{user?.credits.toLocaleString()}</h4>
                    <p className="text-slate-400">Credits Available</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => window.location.href = '/credits'}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Buy More Credits
                </motion.button>
              </div>
            </div>

            {/* Credit Usage */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">Credit Usage This Month</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">AI Proposal Generation</span>
                  <span className="text-white font-medium">45 credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Donor Searches</span>
                  <span className="text-white font-medium">180 credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Application Submissions</span>
                  <span className="text-white font-medium">90 credits</span>
                </div>
                <div className="border-t border-slate-600 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Total Used</span>
                    <span className="text-white font-bold">315 credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {key === 'emailNotifications' && 'Receive notifications via email'}
                      {key === 'pushNotifications' && 'Browser push notifications'}
                      {key === 'weeklyReports' && 'Weekly summary reports'}
                      {key === 'fundingAlerts' && 'New funding opportunity alerts'}
                      {key === 'proposalReminders' && 'Proposal deadline reminders'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotificationSettings(prev => ({ 
                        ...prev, 
                        [key]: e.target.checked 
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">AI Provider API Keys</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowAddApiKey(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add API Key</span>
              </motion.button>
            </div>

            {/* Add API Key Form */}
            {showAddApiKey && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-700/30 rounded-xl p-6 space-y-4"
              >
                <h4 className="text-lg font-bold text-white">Add New API Key</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Provider</label>
                    <select
                      value={newApiKey.provider}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, provider: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="deepseek">DeepSeek</option>
                      <option value="dalle">DALL-E</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., OpenAI GPT-4"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">API Key</label>
                  <input
                    type="password"
                    value={newApiKey.key}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleAddApiKey}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Add API Key
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowAddApiKey(false)}
                    className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* API Keys List */}
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="bg-slate-700/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getProviderColor(apiKey.provider)}`}>
                        {apiKey.provider.toUpperCase()}
                      </div>
                      <h4 className="text-white font-medium">{apiKey.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${apiKey.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => toggleApiKeyVisibility(apiKey.id)}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showApiKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => toggleApiKeyStatus(apiKey.id)}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          apiKey.isActive 
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                            : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        }`}
                      >
                        {apiKey.isActive ? 'Disable' : 'Enable'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span>
                      Key: {showApiKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                    </span>
                    <span>•</span>
                    <span>Added {apiKey.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Appearance Settings</h3>
            
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-6">Theme Selection</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themeOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme(option.id as Theme)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      theme === option.id
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                        : 'bg-slate-600/30 border-slate-500/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        theme === option.id ? 'bg-blue-600/30' : 'bg-slate-700/50'
                      }`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <h5 className="font-semibold">{option.name}</h5>
                    </div>
                    <p className="text-sm opacity-70">{option.description}</p>
                    {theme === option.id && (
                      <div className="mt-3 flex items-center space-x-2 text-blue-400">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-xs font-medium">Active</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> Your theme preference is automatically saved and will be applied across all your sessions.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <div className="p-3 bg-slate-600/20 rounded-xl">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-300">Manage your account and preferences</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 space-y-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            {renderTabContent()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;