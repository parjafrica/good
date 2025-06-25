import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Settings, 
  Plus,
  Sparkles,
  Gem,
  X,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Trash2,
  Shield,
  Flag,
  MapPin,
  LogOut,
  Menu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSelector from '../ThemeSelector';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import { realDonorSearchEngine } from '../../services/realDonorSearchEngine';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userCountry, setUserCountry] = useState<string>('');
  const [countryFlag, setCountryFlag] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Load notifications
    loadNotifications();
    
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe(updatedNotifications => {
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    });
    
    // Detect user's country
    detectUserCountry();
    
    return () => unsubscribe();
  }, [isAuthenticated]);

  const detectUserCountry = async () => {
    try {
      // Get country from search engine (which has better fallbacks)
      const country = realDonorSearchEngine.getUserCountry();
      if (country) {
        setUserCountry(country);
        const countryCode = realDonorSearchEngine.getCountryCode(country);
        setCountryFlag(realDonorSearchEngine.getFlagEmoji(countryCode));
        return;
      }
      
      // If search engine doesn't have country yet, try direct detection
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.country_name && data.country_code) {
        setUserCountry(data.country_name);
        setCountryFlag(getFlagEmoji(data.country_code));
      } else {
        // Fallback to default
        setDefaultCountry();
      }
    } catch (error) {
      console.warn('Country detection failed, using default:', error);
      // Fallback to default country
      setDefaultCountry();
    }
  };

  const setDefaultCountry = () => {
    setUserCountry('Global');
    setCountryFlag('🌍');
  };

  const getFlagEmoji = (countryCode: string) => {
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch (error) {
      console.warn('Error generating flag emoji:', error);
      return '🌍'; // Fallback to world emoji
    }
  };

  const loadNotifications = async () => {
    try {
      const notifications = await notificationService.getNotifications();
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'deadline':
        return <Calendar className="w-4 h-4 text-orange-400" />;
      case 'info':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    // No need to update state manually as we're subscribed to changes
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  const deleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setShowNotifications(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-white to-blue-50 shadow-sm z-50 border-b border-gray-200"
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Granada</span>
        </motion.button>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Right Side - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Country Flag */}
          {countryFlag && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <span className="text-lg" role="img" aria-label={`Flag of ${userCountry}`}>
                {countryFlag}
              </span>
              <span className="text-gray-700 text-sm hidden sm:inline">{userCountry}</span>
            </div>
          )}

          {/* Admin Link for Superusers */}
          {user?.is_superuser && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 border border-red-200 text-red-600 rounded-lg hover:bg-red-200 transition-all"
            >
              <Shield className="w-4 h-4" />
              <span className="font-medium">Admin</span>
            </motion.button>
          )}

          {/* Credits Display */}
          {user && (
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/credits')}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg cursor-pointer hover:shadow-md transition-all"
              >
                <Gem className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 font-semibold">{user.credits.toLocaleString()}</span>
                <span className="text-gray-600 text-sm">Credits</span>
              </motion.div>

              {user.isTrialUser && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 border border-blue-200 rounded-lg">
                  <span className="text-blue-600 text-sm">Trial: {user.trialDaysRemaining} days left</span>
                </div>
              )}
            </div>
          )}

          {/* Theme Selector */}
          <ThemeSelector />

          {/* New Proposal Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/proposal-generator')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">New Proposal</span>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowNotifications(false)}
                  className="fixed inset-0 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-w-[90vw]"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={markAllAsRead}
                            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                          >
                            Mark all read
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setShowNotifications(false)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            whileHover={{ backgroundColor: 'rgba(243, 244, 246, 1)' }}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 cursor-pointer transition-colors relative group ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className={`font-medium ${
                                    notification.read ? 'text-gray-700' : 'text-gray-900'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                </div>
                                <p className={`text-sm ${
                                  notification.read ? 'text-gray-500' : 'text-gray-700'
                                }`}>
                                  {notification.message}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-4 right-4" />
                                )}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          navigate('/notifications');
                          setShowNotifications(false);
                        }}
                        className="w-full py-2 text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
                      >
                        View All Notifications
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
            </motion.button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowUserMenu(false)}
                  className="fixed inset-0 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Log Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-b border-gray-200 shadow-md"
        >
          <div className="p-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.fullName || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Credits */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center space-x-2">
                <Gem className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-700 font-medium">{user?.credits.toLocaleString()} Credits</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  navigate('/credits');
                  setShowMobileMenu(false);
                }}
                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm"
              >
                Buy More
              </motion.button>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate('/proposal-generator');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all"
              >
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-medium">Create Proposal</span>
              </button>
              
              <button
                onClick={() => {
                  navigate('/donor-discovery');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-all"
              >
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-purple-700 font-medium">Find Donors</span>
              </button>
              
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Settings</span>
              </button>
              
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-all"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;