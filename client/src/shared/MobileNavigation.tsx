import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  BarChart3, 
  Target, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Settings,
  Sparkles,
  Building,
  Shield,
  User,
  Gem,
  Home,
  GraduationCap,
  BookOpen,
  Search,
  Award,
  Users
} from 'lucide-react';
import { useAuth } from '.././contexts/AuthContext';

const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is a student
  const isStudent = user?.userType === 'student';

  // Different navigation items based on user type
  const studentNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'scholarships', label: 'Scholarships', icon: Award, path: '/scholarships' },
    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/courses' },
    { id: 'research', label: 'Research', icon: Search, path: '/research' },
    { id: 'human-help', label: 'Professional Help', icon: Users, path: '/human-help' },
  ];

  const ngoNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'donor-discovery', label: 'Donors', icon: Target, path: '/donor-discovery' },
    { id: 'proposal-generator', label: 'Proposals', icon: Sparkles, path: '/proposal-generator' },
    { id: 'funding', label: 'Funding', icon: DollarSign, path: '/funding' },
    { id: 'human-help', label: 'Professional Help', icon: Users, path: '/human-help' },
  ];

  // Choose navigation items based on user type
  const navigationItems = isStudent ? studentNavigationItems : ngoNavigationItems;

  // Add admin dashboard for superusers
  const allItems = user?.is_superuser 
    ? [...navigationItems, { id: 'admin', label: 'Admin', icon: Shield, path: '/admin' }]
    : navigationItems;

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  // Bottom tab navigation for mobile
  const renderBottomNav = () => {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40 md:hidden">
        <div className="flex justify-around items-center h-16">
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNavigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="p-3 bg-white rounded-full shadow-lg"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </motion.button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Granada</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                  {allItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>
                
                {/* User Profile */}
                {user && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : user.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium truncate">{user.fullName || user.email || 'User'}</p>
                        <p className="text-gray-500 text-sm">
                          {user.is_superuser ? 'Administrator' : isStudent ? 'Student' : 'Executive Director'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between p-3 bg-gray-100 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Gem className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 font-medium">{user.credits}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          handleNavigate('/credits');
                        }}
                        className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-sm hover:bg-emerald-200 transition-all"
                      >
                        Buy Credits
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Navigation for Mobile */}
      {renderBottomNav()}
    </>
  );
};

export default MobileNavigation;