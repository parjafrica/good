import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isClicked: boolean;
  clickCount: number;
  messageUrl?: string;
  relatedId?: string;
  relatedType?: string;
  timestamp: Date;
}

interface NotificationCenterProps {
  userId?: string;
  showCount?: boolean;
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  userId = 'demo-user', 
  showCount = true, 
  className = '' 
}) => {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      title: 'New Funding Opportunity',
      message: 'Gates Foundation $2M health initiative matches your organization profile',
      type: 'success',
      priority: 'high',
      isRead: false,
      isClicked: false,
      clickCount: 0,
      messageUrl: '/donor-discovery',
      relatedType: 'opportunity',
      timestamp: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
    },
    {
      id: 'notif-2', 
      title: 'Proposal Review Complete',
      message: 'Your education project proposal has been reviewed and optimized',
      type: 'info',
      priority: 'medium',
      isRead: false,
      isClicked: false,
      clickCount: 0,
      messageUrl: '/proposals',
      relatedType: 'proposal',
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: 'notif-3',
      title: 'Application Deadline Approaching',
      message: 'USAID Digital Literacy Grant deadline in 3 days',
      type: 'warning',
      priority: 'high',
      isRead: false,
      isClicked: false,
      clickCount: 0,
      messageUrl: '/donor-discovery',
      relatedType: 'deadline',
      timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    },
    {
      id: 'notif-4',
      title: 'Expert Review Available',
      message: 'Professional grant writer has reviewed your climate action proposal',
      type: 'success',
      priority: 'medium',
      isRead: true,
      isClicked: false,
      clickCount: 0,
      messageUrl: '/proposals',
      relatedType: 'review',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as clicked and read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id 
        ? { ...n, isClicked: true, isRead: true, clickCount: n.clickCount + 1 }
        : n
    );
    setNotifications(updatedNotifications);

    // Track click in database
    try {
      await fetch(`/api/notifications/${notification.id}/clicked`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error tracking notification click:', error);
    }

    // Navigate to message URL if provided
    if (notification.messageUrl) {
      setIsOpen(false);
      setLocation(notification.messageUrl);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <X className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': case 'urgent': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      default: return 'border-l-blue-500';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {showCount && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-96 max-w-[90vw] bg-white rounded-xl shadow-xl border border-gray-200 z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-sm text-blue-600 font-medium">
                      ({unreadCount} new)
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        } transition-colors`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2 ml-2">
                                {notification.isClicked && (
                                  <span className="text-xs text-green-600 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Viewed
                                  </span>
                                )}
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-medium ${
                                  notification.priority === 'high' || notification.priority === 'urgent'
                                    ? 'text-red-600'
                                    : notification.priority === 'medium'
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                                }`}>
                                  {notification.priority.toUpperCase()}
                                </span>
                                {notification.messageUrl && (
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setLocation('/notifications');
                    }}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;