import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  Save,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UserSettings {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    location: string;
    bio: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    currency: string;
  };
  notifications: {
    emailNotifications: boolean;
    proposalUpdates: boolean;
    fundingAlerts: boolean;
    weeklyDigest: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareAnalytics: boolean;
    cookiePreferences: string;
  };
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  // Fetch user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    initialData: {
      profile: {
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: '',
        organization: '',
        location: '',
        bio: ''
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        currency: 'USD'
      },
      notifications: {
        emailNotifications: true,
        proposalUpdates: true,
        fundingAlerts: true,
        weeklyDigest: false,
        marketingEmails: false
      },
      privacy: {
        profileVisible: true,
        shareAnalytics: true,
        cookiePreferences: 'essential'
      }
    } as UserSettings
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
    },
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/export-data', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to export data');
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    updateSettingsMutation.mutate(newSettings);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'data', label: 'Data Management', icon: FileText },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full p-4 text-left flex items-center gap-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={settings.profile.fullName}
                            onChange={(e) => updateSettings('profile', 'fullName', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={settings.profile.email}
                              onChange={(e) => updateSettings('profile', 'email', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              value={settings.profile.phone}
                              onChange={(e) => updateSettings('profile', 'phone', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Organization
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={settings.profile.organization}
                              onChange={(e) => updateSettings('profile', 'organization', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={settings.profile.location}
                              onChange={(e) => updateSettings('profile', 'location', e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Bio
                          </label>
                          <textarea
                            value={settings.profile.bio}
                            onChange={(e) => updateSettings('profile', 'bio', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">Preferences</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Theme
                          </label>
                          <div className="flex gap-4">
                            {[
                              { value: 'light', label: 'Light', icon: Sun },
                              { value: 'dark', label: 'Dark', icon: Moon },
                              { value: 'system', label: 'System', icon: Monitor }
                            ].map((theme) => (
                              <button
                                key={theme.value}
                                onClick={() => updateSettings('preferences', 'theme', theme.value)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                                  settings.preferences.theme === theme.value
                                    ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                <theme.icon className="w-4 h-4" />
                                {theme.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Language
                            </label>
                            <select
                              value={settings.preferences.language}
                              onChange={(e) => updateSettings('preferences', 'language', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="en">English</option>
                              <option value="es">Español</option>
                              <option value="fr">Français</option>
                              <option value="de">Deutsch</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Currency
                            </label>
                            <select
                              value={settings.preferences.currency}
                              onChange={(e) => updateSettings('preferences', 'currency', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                              <option value="JPY">JPY (¥)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                      <div className="space-y-4">
                        {Object.entries(settings.notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div>
                              <h3 className="text-white font-medium">
                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                                {key === 'proposalUpdates' && 'Get notified when your proposals are reviewed'}
                                {key === 'fundingAlerts' && 'Receive alerts for new funding opportunities'}
                                {key === 'weeklyDigest' && 'Weekly summary of activity and opportunities'}
                                {key === 'marketingEmails' && 'Promotional emails and feature updates'}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => updateSettings('notifications', key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">Privacy & Security</h2>
                      <div className="space-y-4">
                        {Object.entries(settings.privacy).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div>
                              <h3 className="text-white font-medium">
                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {key === 'profileVisible' && 'Make your profile visible to other users'}
                                {key === 'shareAnalytics' && 'Help improve our service by sharing usage analytics'}
                                {key === 'cookiePreferences' && 'Manage your cookie preferences'}
                              </p>
                            </div>
                            {typeof value === 'boolean' ? (
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) => updateSettings('privacy', key, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            ) : (
                              <select
                                value={value}
                                onChange={(e) => updateSettings('privacy', key, e.target.value)}
                                className="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                              >
                                <option value="essential">Essential Only</option>
                                <option value="functional">Functional</option>
                                <option value="all">All Cookies</option>
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Management Tab */}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-700 rounded-lg">
                          <h3 className="text-white font-medium mb-2">Export Your Data</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Download a copy of all your data including proposals, settings, and activity history.
                          </p>
                          <button
                            onClick={() => exportDataMutation.mutate()}
                            disabled={exportDataMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                            {exportDataMutation.isPending ? 'Exporting...' : 'Export Data'}
                          </button>
                        </div>

                        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                          <h3 className="text-red-400 font-medium mb-2">Delete Account</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={updateSettingsMutation.isPending}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;