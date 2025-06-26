import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Target, 
  FileText, 
  DollarSign, 
  FileCheck, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building,
  Shield,
  Gem,
  Home,
  GraduationCap,
  BookOpen,
  Search,
  Award,
  Users
} from 'lucide-react';
import { useAuth } from '.././contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
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
    { id: 'ai-assistant', label: 'Professional Help', icon: Users, path: '/human-help' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const ngoNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/' },
    { id: 'donor-discovery', label: 'Donor Discovery', icon: Target, path: '/donor-discovery' },
    { id: 'proposal-generator', label: 'Professional Proposal', icon: Sparkles, path: '/proposal-generator' },
    { id: 'proposals', label: 'Proposals', icon: FileText, path: '/proposals' },
    { id: 'ngo-pipeline', label: 'NGO Pipeline', icon: Building, path: '/ngo-pipeline' },
    { id: 'funding', label: 'Funding', icon: DollarSign, path: '/funding' },
    { id: 'documents', label: 'Documents', icon: FileCheck, path: '/documents' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' },
    { id: 'human-help', label: 'Professional Help', icon: Users, path: '/human-help' },
    { id: 'credits', label: 'Credits', icon: Gem, path: '/credits' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  // Choose navigation items based on user type
  const navigationItems = isStudent ? studentNavigationItems : ngoNavigationItems;

  // Add admin dashboard for superusers
  const allItems = user?.is_superuser 
    ? [...navigationItems, { id: 'admin', label: 'Admin', icon: Shield, path: '/admin' }]
    : navigationItems;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 overflow-y-auto hidden md:block"
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {allItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Profile */}
        {!collapsed && user && (
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
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;