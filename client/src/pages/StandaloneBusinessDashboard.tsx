import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  BarChart3,
  Building2,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  LogOut,
  Home,
  FileText,
  PieChart,
  Activity,
  Briefcase,
  MessageSquare,
  HelpCircle,
  Zap,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// Enhanced Business Metrics Interface
interface BusinessMetrics {
  revenue: {
    total: number;
    growth: number;
    monthly: number[];
  };
  employees: {
    total: number;
    active: number;
    departments: { name: string; count: number }[];
  };
  projects: {
    active: number;
    completed: number;
    pending: number;
  };
  finances: {
    profit: number;
    expenses: number;
    cashFlow: number;
  };
}

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'pending' | 'on-hold';
  progress: number;
  budget: number;
  spent: number;
  deadline: string;
  team: string[];
  priority: 'high' | 'medium' | 'low';
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'on-leave' | 'terminated';
  performance: number;
}

// Navigation Header Component
const BusinessHeader: React.FC<{ onMobileMenuToggle: () => void; isMobileMenuOpen: boolean }> = ({ 
  onMobileMenuToggle, 
  isMobileMenuOpen 
}) => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/20 shadow-2xl sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <Building2 className="h-8 w-8 text-purple-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  BusinessOS
                </h1>
                <p className="text-xs text-slate-400">Management Suite</p>
              </div>
            </motion.div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects, employees, metrics..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </motion.button>

            {/* User Profile */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Sarah Johnson</p>
                <p className="text-xs text-slate-400">CEO</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">SJ</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// Mobile Navigation Menu
const MobileNavigation: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navItems = [
    { icon: Home, label: 'Dashboard', href: '#', active: true },
    { icon: BarChart3, label: 'Analytics', href: '#' },
    { icon: Briefcase, label: 'Projects', href: '#' },
    { icon: Users, label: 'Team', href: '#' },
    { icon: DollarSign, label: 'Finance', href: '#' },
    { icon: FileText, label: 'Reports', href: '#' },
    { icon: MessageSquare, label: 'Messages', href: '#' },
    { icon: Settings, label: 'Settings', href: '#' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
          
          {/* Mobile Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-slate-900 to-slate-800 border-l border-purple-500/20 z-50 md:hidden"
          >
            <div className="p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-6 w-6 text-purple-400" />
                  <span className="text-lg font-semibold text-white">BusinessOS</span>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3 mb-8 p-3 bg-slate-800/50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SJ</span>
                </div>
                <div>
                  <p className="text-white font-medium">Sarah Johnson</p>
                  <p className="text-slate-400 text-sm">CEO</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.a>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="mt-8 pt-8 border-t border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Project</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Footer Component
const BusinessFooter: React.FC = () => {
  return (
    <motion.footer 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-t border-purple-500/20 mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-purple-400" />
              <span className="text-lg font-semibold text-white">BusinessOS</span>
            </div>
            <p className="text-slate-400 text-sm">
              Comprehensive business management suite for modern enterprises. 
              Streamline operations, boost productivity, and drive growth.
            </p>
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <Globe className="h-4 w-4 text-purple-400" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-purple-400" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <Phone className="h-4 w-4 text-purple-400" />
              </motion.div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Project Management</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Team Collaboration</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Financial Tracking</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-purple-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2025 BusinessOS. All rights reserved. Built with 💜 for modern businesses.
          </p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="text-slate-400 text-sm">Powered by</span>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Granada OS</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

// Main Standalone Business Dashboard Component
const StandaloneBusinessDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, projectsRes, employeesRes] = await Promise.all([
          fetch('/api/business/metrics'),
          fetch('/api/business/projects'),
          fetch('/api/business/employees')
        ]);

        const [metricsData, projectsData, employeesData] = await Promise.all([
          metricsRes.json(),
          projectsRes.json(),
          employeesRes.json()
        ]);

        setMetrics(metricsData);
        setProjects(projectsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Failed to fetch business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart data
  const chartData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 52000, expenses: 35000 },
    { month: 'Mar', revenue: 48000, expenses: 33000 },
    { month: 'Apr', revenue: 61000, expenses: 38000 },
    { month: 'May', revenue: 55000, expenses: 36000 },
    { month: 'Jun', revenue: 67000, expenses: 42000 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 45, color: '#8B5CF6' },
    { name: 'Sales', value: 25, color: '#EC4899' },
    { name: 'Marketing', value: 15, color: '#06B6D4' },
    { name: 'Operations', value: 15, color: '#10B981' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <BusinessHeader 
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Hey, What do you want to do today?
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto"
            >
              Manage your business operations, track performance, and drive growth with our comprehensive suite
            </motion.p>
          </div>

          {/* Quick Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12"
          >
            {[
              { icon: BarChart3, label: 'Analytics', color: 'from-purple-500 to-purple-600' },
              { icon: Briefcase, label: 'Projects', color: 'from-blue-500 to-blue-600' },
              { icon: Users, label: 'Team', color: 'from-green-500 to-green-600' },
              { icon: DollarSign, label: 'Finance', color: 'from-yellow-500 to-yellow-600' },
              { icon: FileText, label: 'Reports', color: 'from-pink-500 to-pink-600' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-6 bg-gradient-to-br ${item.color} rounded-2xl border border-white/10 cursor-pointer group overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-center">
                  <item.icon className="h-8 w-8 text-white mx-auto mb-3" />
                  <span className="text-white font-medium">{item.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Quick Stats */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${metrics.revenue.total.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <ArrowUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm">{metrics.revenue.growth}% growth</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold text-white">{metrics.projects.active}</p>
                  <p className="text-slate-400 text-sm">{metrics.projects.completed} completed</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Team Members</p>
                  <p className="text-2xl font-bold text-white">{metrics.employees.total}</p>
                  <p className="text-slate-400 text-sm">{metrics.employees.active} active</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Net Profit</p>
                  <p className="text-2xl font-bold text-white">${metrics.finances.profit.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">This month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-pink-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} />
                <Line type="monotone" dataKey="expenses" stroke="#EC4899" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Department Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Team Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {departmentData.map((dept) => (
                <div key={dept.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="text-slate-300 text-sm">{dept.name} ({dept.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </motion.button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 text-slate-400 font-medium">Project</th>
                  <th className="text-left py-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 text-slate-400 font-medium">Progress</th>
                  <th className="text-left py-3 text-slate-400 font-medium">Budget</th>
                  <th className="text-left py-3 text-slate-400 font-medium">Deadline</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((project) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4">
                      <div>
                        <p className="text-white font-medium">{project.name}</p>
                        <p className="text-slate-400 text-sm">{project.team.length} team members</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        project.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-slate-300 text-sm">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="text-white">${project.budget.toLocaleString()}</p>
                        <p className="text-slate-400 text-sm">${project.spent.toLocaleString()} spent</p>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{project.deadline}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <BusinessFooter />
    </div>
  );
};

export default StandaloneBusinessDashboard;