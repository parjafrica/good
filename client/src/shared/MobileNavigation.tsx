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
  Users,
  Brain,
  Zap,
  Briefcase,
  Microscope,
  Bot,
  Cpu,
  Server,
  Library,
  Network,
  Database,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '.././contexts/AuthContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  badge?: string;
  children?: MenuItem[];
}

const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ai-engines']));
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is a student
  const isStudent = user?.userType === 'student';

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // AI Engines Menu Structure (90% Python FastAPI)
  const aiEnginesMenu: MenuItem = {
    id: 'ai-engines',
    label: 'AI Engines',
    icon: Brain,
    badge: '90%',
    children: [
      { id: 'orchestrator', label: 'Orchestrator', icon: Cpu, path: '/orchestrator', badge: '8000' },
      { id: 'genesis', label: 'Genesis', icon: Zap, path: '/genesis', badge: '8002' },
      { id: 'career', label: 'Career', icon: Briefcase, path: '/career', badge: '8003' },
      { id: 'academic', label: 'Academic', icon: Microscope, path: '/academic', badge: '8004' },
      { id: 'bots', label: 'Bots', icon: Bot, path: '/bots', badge: '8001' }
    ]
  };

  // Core Platform Menu
  const corePlatformMenu: MenuItem = {
    id: 'core-platform',
    label: 'Platform',
    icon: Server,
    children: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
      { id: 'donor-discovery', label: 'Donors', icon: Target, path: '/donor-discovery' },
      { id: 'proposals', label: 'Proposals', icon: FileText, path: '/proposals' },
      { id: 'funding', label: 'Funding', icon: DollarSign, path: '/funding' }
    ]
  };

  // Academic Suite Menu
  const academicSuiteMenu: MenuItem = {
    id: 'academic-suite',
    label: 'Academic',
    icon: Library,
    children: [
      { id: 'literature', label: 'Literature', icon: BookOpen, path: '/academic?tab=literature' },
      { id: 'research', label: 'Research', icon: Search, path: '/academic?tab=research' },
      { id: 'writing', label: 'Writing', icon: FileText, path: '/academic?tab=writing' },
      { id: 'citations', label: 'Citations', icon: Award, path: '/academic?tab=citations' }
    ]
  };

  // System Menu
  const systemMenu: MenuItem = {
    id: 'system',
    label: 'System',
    icon: Settings,
    children: [
      { id: 'health', label: 'Health', icon: Network, path: '/health' },
      { id: 'database', label: 'Database', icon: Database, path: '/database' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
      { id: 'credits', label: 'Credits', icon: Gem, path: '/credits' }
    ]
  };

  // Student navigation structure
  const studentNavigationStructure = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'scholarships', label: 'Scholarships', icon: Award, path: '/scholarships' },
    academicSuiteMenu,
    { id: 'career', label: 'Career', icon: Briefcase, path: '/career' },
    { id: 'human-help', label: 'Help', icon: Users, path: '/human-help' }
  ];

  // Organization navigation structure
  const organizationNavigationStructure = [
    aiEnginesMenu,
    corePlatformMenu,
    academicSuiteMenu,
    systemMenu,
    { id: 'human-help', label: 'Help', icon: Users, path: '/human-help' }
  ];

  // Choose navigation structure based on user type
  const navigationStructure = isStudent ? studentNavigationStructure : organizationNavigationStructure;

  // Add admin for superusers
  const allMenuItems = user?.is_superuser 
    ? [...navigationStructure, { id: 'admin', label: 'Admin', icon: Shield, path: '/admin' }]
    : navigationStructure;

  // Bottom tab navigation items (simplified for mobile)
  const bottomNavItems = isStudent ? [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/' },
    { id: 'scholarships', label: 'Scholarships', icon: Award, path: '/scholarships' },
    { id: 'academic', label: 'Research', icon: BookOpen, path: '/academic' },
    { id: 'career', label: 'Career', icon: Briefcase, path: '/career' },
    { id: 'menu', label: 'Menu', icon: Menu, action: 'menu' }
  ] : [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/' },
    { id: 'donor-discovery', label: 'Donors', icon: Target, path: '/donor-discovery' },
    { id: 'genesis', label: 'Genesis', icon: Zap, path: '/genesis' },
    { id: 'proposals', label: 'Proposals', icon: FileText, path: '/proposals' },
    { id: 'menu', label: 'Menu', icon: Menu, action: 'menu' }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleBottomNavAction = (item: any) => {
    if (item.action === 'menu') {
      setIsOpen(true);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const isActive = item.path && location.pathname === item.path;
    
    return (
      <div key={item.id} className="w-full">
        <motion.button
          whileHover={{ scale: 1.01, x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.id);
            } else if (item.path) {
              handleNavigate(item.path);
            }
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
            depth > 0 ? 'ml-4 text-sm' : ''
          } ${
            isActive 
              ? 'bg-blue-50 text-blue-600 border border-blue-100' 
              : hasChildren 
                ? 'text-gray-800 hover:text-gray-900 hover:bg-gray-50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <item.icon className={`flex-shrink-0 ${depth > 0 ? 'w-4 h-4' : 'w-5 h-5'}`} />
          
          <span className="font-medium truncate flex-1 text-left">
            {item.label}
          </span>
          
          {item.badge && (
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              item.badge === '90%' 
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-600'
            }`}>
              {item.badge}
            </span>
          )}
          
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          )}
        </motion.button>
        
        {/* Children */}
        {hasChildren && (
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="ml-2 mt-1 space-y-1">
              {item.children?.map((child) => renderMenuItem(child, depth + 1))}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  // Bottom tab navigation for mobile
  const renderBottomNav = () => {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40 md:hidden safe-area-inset">
        <div className="flex justify-around items-center h-16 px-2">
          {bottomNavItems.map((item) => {
            const isActive = item.path && location.pathname === item.path;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleBottomNavAction(item)}
                className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs truncate">{item.label}</span>
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
              className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-50 md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-900">Granada OS</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">FastAPI</span>
                        <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded font-medium">
                          90%
                        </span>
                      </div>
                    </div>
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
                <nav className="flex-1 px-3 py-4 space-y-2">
                  {allMenuItems.map((item) => renderMenuItem(item))}
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