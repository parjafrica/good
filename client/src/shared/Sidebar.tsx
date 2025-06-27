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
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building,
  Shield,
  Gem,
  Home,
  GraduationCap,
  BookOpen,
  Search,
  Award,
  Users,
  Lightbulb,
  Briefcase,
  Brain,
  Zap,
  Microscope,
  Library,
  PenTool,
  Bot,
  GitBranch,
  Server,
  Database,
  Cpu,
  Network
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['ai-engines']));

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
    label: 'AI Engines (FastAPI)',
    icon: Brain,
    badge: '90%',
    children: [
      {
        id: 'master-orchestrator',
        label: 'Master Orchestrator',
        icon: Cpu,
        path: '/orchestrator',
        badge: '8000'
      },
      {
        id: 'genesis-engine',
        label: 'Genesis Engine',
        icon: Zap,
        path: '/genesis',
        badge: '8002'
      },
      {
        id: 'career-engine',
        label: 'Career Engine',
        icon: Briefcase,
        path: '/career',
        badge: '8003'
      },
      {
        id: 'academic-engine',
        label: 'Academic Engine',
        icon: Microscope,
        path: '/academic',
        badge: '8004'
      },
      {
        id: 'bot-service',
        label: 'Bot Service',
        icon: Bot,
        path: '/bots',
        badge: '8001'
      }
    ]
  };

  // Core Platform Menu
  const corePlatformMenu: MenuItem = {
    id: 'core-platform',
    label: 'Core Platform',
    icon: Server,
    children: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        path: '/'
      },
      {
        id: 'donor-discovery',
        label: 'Donor Discovery',
        icon: Target,
        path: '/donor-discovery'
      },
      {
        id: 'proposals',
        label: 'Proposals',
        icon: FileText,
        path: '/proposals'
      },
      {
        id: 'funding',
        label: 'Funding',
        icon: DollarSign,
        path: '/funding'
      }
    ]
  };

  // Academic Suite Menu
  const academicSuiteMenu: MenuItem = {
    id: 'academic-suite',
    label: 'Academic Suite',
    icon: Library,
    children: [
      {
        id: 'literature-review',
        label: 'Literature Review',
        icon: BookOpen,
        path: '/academic?tab=literature'
      },
      {
        id: 'research-assistant',
        label: 'Research Assistant',
        icon: Search,
        path: '/academic?tab=research'
      },
      {
        id: 'academic-writing',
        label: 'Academic Writing',
        icon: PenTool,
        path: '/academic?tab=writing'
      },
      {
        id: 'citations',
        label: 'Citation Manager',
        icon: FileCheck,
        path: '/academic?tab=citations'
      }
    ]
  };

  // System Menu
  const systemMenu: MenuItem = {
    id: 'system',
    label: 'System',
    icon: Settings,
    children: [
      {
        id: 'service-health',
        label: 'Service Health',
        icon: Network,
        path: '/health'
      },
      {
        id: 'database',
        label: 'Database',
        icon: Database,
        path: '/database'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        path: '/analytics'
      },
      {
        id: 'credits',
        label: 'Credits',
        icon: Gem,
        path: '/credits'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: '/settings'
      }
    ]
  };

  // Different navigation structure for students vs organizations
  const studentNavigationStructure = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/'
    },
    {
      id: 'scholarships',
      label: 'Scholarships',
      icon: Award,
      path: '/scholarships'
    },
    academicSuiteMenu,
    {
      id: 'career-development',
      label: 'Career Development',
      icon: Briefcase,
      path: '/career'
    },
    {
      id: 'human-help',
      label: 'Professional Help',
      icon: Users,
      path: '/human-help'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    }
  ];

  const organizationNavigationStructure = [
    aiEnginesMenu,
    corePlatformMenu,
    academicSuiteMenu,
    systemMenu,
    {
      id: 'human-help',
      label: 'Professional Help',
      icon: Users,
      path: '/human-help'
    }
  ];

  // Choose navigation structure based on user type
  const navigationStructure = isStudent ? studentNavigationStructure : organizationNavigationStructure;

  // Add admin for superusers
  const allMenuItems = user?.is_superuser 
    ? [...navigationStructure, { id: 'admin', label: 'Admin', icon: Shield, path: '/admin' }]
    : navigationStructure;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const isActive = item.path && location.pathname === item.path;
    
    return (
      <div key={item.id}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.id);
            } else if (item.path) {
              handleNavigation(item.path);
            }
          }}
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all ${
            depth > 0 ? 'ml-4' : ''
          } ${
            isActive 
              ? 'bg-blue-50 text-blue-600 border border-blue-100' 
              : hasChildren 
                ? 'text-gray-800 hover:text-gray-900 hover:bg-gray-50'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <item.icon className={`flex-shrink-0 ${depth > 0 ? 'w-4 h-4' : 'w-5 h-5'}`} />
          
          {!collapsed && (
            <>
              <span className={`font-medium truncate ${depth > 0 ? 'text-sm' : ''}`}>
                {item.label}
              </span>
              
              {item.badge && (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  item.badge === '90%' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
              
              {hasChildren && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="ml-auto"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              )}
            </>
          )}
        </motion.button>
        
        {/* Children */}
        {hasChildren && !collapsed && (
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0
            }}
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

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 64 : 280 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 overflow-y-auto hidden md:block"
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-between items-center p-4">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-gray-900">Granada OS</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                FastAPI 90%
              </span>
            </div>
          )}
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
          {allMenuItems.map((item) => renderMenuItem(item))}
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