import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  Phone,
  UserPlus,
  Package,
  MessageCircle,
  ArrowRight,
  Shield,
  Key,
  TrendingDown
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

// HR Management Component
const HRManagement: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Human Resources</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddEmployee(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Employee</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Total Employees</p>
              <p className="text-2xl font-bold text-white">{employees.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-white">
                {employees.filter(emp => emp.status === 'active').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-slate-400 text-sm">Avg Salary</p>
              <p className="text-2xl font-bold text-white">
                ${Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Employee Directory</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 text-slate-300">Name</th>
                <th className="text-left py-3 text-slate-300">Position</th>
                <th className="text-left py-3 text-slate-300">Department</th>
                <th className="text-left py-3 text-slate-300">Status</th>
                <th className="text-left py-3 text-slate-300">Performance</th>
                <th className="text-left py-3 text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-white/5">
                  <td className="py-4">
                    <div>
                      <p className="text-white font-medium">{employee.name}</p>
                      <p className="text-slate-400 text-sm">Started {employee.startDate}</p>
                    </div>
                  </td>
                  <td className="py-4 text-slate-300">{employee.position}</td>
                  <td className="py-4 text-slate-300">{employee.department}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employee.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      employee.status === 'on-leave' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2 w-16">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${employee.performance}%` }}
                        />
                      </div>
                      <span className="text-slate-300 text-sm">{employee.performance}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedEmployee(employee)}
                      className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

// Finance Management Component
const FinanceManagement: React.FC<{ metrics: BusinessMetrics }> = ({ metrics }) => {
  const [transactions, setTransactions] = useState([
    { id: '1', date: '2024-01-15', description: 'Client Payment - Website Development', amount: 15000, type: 'income', category: 'Services' },
    { id: '2', date: '2024-01-14', description: 'Office Rent', amount: -3500, type: 'expense', category: 'Overhead' },
    { id: '3', date: '2024-01-12', description: 'Software Licenses', amount: -1200, type: 'expense', category: 'Software' },
    { id: '4', date: '2024-01-10', description: 'Marketing Campaign', amount: -2500, type: 'expense', category: 'Marketing' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Financial Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${metrics.revenue.total.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Net Profit</p>
              <p className="text-2xl font-bold text-white">${metrics.finances.profit.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <TrendingDown className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-slate-400 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-white">${metrics.finances.expenses.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-slate-400 text-sm">Cash Flow</p>
              <p className="text-2xl font-bold text-white">${metrics.finances.cashFlow.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {transaction.type === 'income' ? 
                    <TrendingUp className="h-4 w-4 text-green-400" /> :
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  }
                </div>
                <div>
                  <p className="text-white font-medium">{transaction.description}</p>
                  <p className="text-slate-400 text-sm">{transaction.date} • {transaction.category}</p>
                </div>
              </div>
              <div className={`text-lg font-bold ${
                transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Analytics Component
const AnalyticsSection: React.FC<{ metrics: BusinessMetrics; projects: Project[] }> = ({ metrics, projects }) => {
  const chartData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 52000, expenses: 35000 },
    { month: 'Mar', revenue: 48000, expenses: 33000 },
    { month: 'Apr', revenue: 61000, expenses: 38000 },
    { month: 'May', revenue: 55000, expenses: 36000 },
    { month: 'Jun', revenue: 67000, expenses: 42000 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Business Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue vs Expenses</h3>
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
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Project Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={[
                  { name: 'Active', value: projects.filter(p => p.status === 'active').length, fill: '#10B981' },
                  { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, fill: '#3B82F6' },
                  { name: 'Pending', value: projects.filter(p => p.status === 'pending').length, fill: '#F59E0B' },
                  { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, fill: '#EF4444' },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {[
                  { name: 'Active', value: projects.filter(p => p.status === 'active').length, fill: '#10B981' },
                  { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, fill: '#3B82F6' },
                  { name: 'Pending', value: projects.filter(p => p.status === 'pending').length, fill: '#F59E0B' },
                  { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, fill: '#EF4444' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{metrics.revenue.growth}%</p>
            <p className="text-slate-400 text-sm">Revenue Growth</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">
              {Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100)}%
            </p>
            <p className="text-slate-400 text-sm">Project Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">
              {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
            </p>
            <p className="text-slate-400 text-sm">Avg Project Progress</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Settings Component
const SettingsSection: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Business Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Enable Notifications</p>
                <p className="text-slate-400 text-sm">Receive updates about business activities</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full ${notifications ? 'bg-green-500' : 'bg-slate-600'} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-slate-400 text-sm">Use dark theme for better visibility</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full ${darkMode ? 'bg-green-500' : 'bg-slate-600'} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto-save</p>
                <p className="text-slate-400 text-sm">Automatically save changes</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setAutoSave(!autoSave)}
                className={`w-12 h-6 rounded-full ${autoSave ? 'bg-green-500' : 'bg-slate-600'} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  autoSave ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Company Name</label>
              <input 
                type="text" 
                defaultValue="TechCorp Solutions"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Business Email</label>
              <input 
                type="email" 
                defaultValue="info@techcorp.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Industry</label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Change Password</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <Key className="h-4 w-4" />
            <span>Enable 2FA</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// Menu Component (All Business Modules)
const MenuSection: React.FC<{ onNavigate: (section: string) => void }> = ({ onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: Home, color: 'from-blue-500 to-purple-600', description: 'View business metrics and quick stats' },
    { id: 'hr', name: 'Human Resources', icon: Users, color: 'from-green-500 to-blue-500', description: 'Manage employees and HR operations' },
    { id: 'finance', name: 'Financial Management', icon: DollarSign, color: 'from-yellow-500 to-red-500', description: 'Track revenue, expenses, and transactions' },
    { id: 'analytics', name: 'Business Analytics', icon: BarChart, color: 'from-purple-500 to-pink-500', description: 'Data insights and performance metrics' },
    { id: 'projects', name: 'Project Management', icon: Briefcase, color: 'from-indigo-500 to-purple-500', description: 'Manage projects and timelines' },
    { id: 'inventory', name: 'Inventory Control', icon: Package, color: 'from-teal-500 to-cyan-500', description: 'Track stock and inventory levels' },
    { id: 'customers', name: 'Customer Relations', icon: Users, color: 'from-pink-500 to-rose-500', description: 'Manage customer relationships' },
    { id: 'reports', name: 'Reports & Documents', icon: FileText, color: 'from-slate-500 to-gray-500', description: 'Generate business reports' },
    { id: 'marketing', name: 'Marketing Hub', icon: TrendingUp, color: 'from-orange-500 to-yellow-500', description: 'Marketing campaigns and analytics' },
    { id: 'support', name: 'Customer Support', icon: MessageCircle, color: 'from-blue-500 to-teal-500', description: 'Handle customer inquiries' },
    { id: 'settings', name: 'Business Settings', icon: Settings, color: 'from-gray-500 to-slate-500', description: 'Configure business preferences' },
    { id: 'integrations', name: 'Third-party Apps', icon: Zap, color: 'from-violet-500 to-purple-500', description: 'Connect external services' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Business Management Suite</h2>
        <p className="text-slate-400">Access all your business tools from one central hub</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(item.id)}
            className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 cursor-pointer group hover:bg-white/10 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
              {item.name}
            </h3>
            <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
              {item.description}
            </p>
            <div className="mt-4 flex items-center text-purple-400 group-hover:text-pink-400 transition-colors">
              <span className="text-sm font-medium">Open Module</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Business Footer Navigation Component
const BusinessFooter: React.FC<{
  onNavigate: (section: string) => void;
  activeTab: string;
}> = ({ onNavigate, activeTab }) => {
  const footerItems = [
    { icon: Home, label: 'Home', section: 'dashboard' },
    { icon: Users, label: 'Donors', section: 'donors' },
    { icon: Zap, label: 'Genesis', section: 'genesis' },
    { icon: FileText, label: 'Proposals', section: 'proposals' },
    { icon: Menu, label: 'Menu', section: 'menu' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {footerItems.map((item) => (
          <motion.button
            key={item.section}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(item.section)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
              activeTab === item.section
                ? 'text-purple-600'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            <item.icon className={`h-6 w-6 mb-1 ${
              activeTab === item.section ? 'text-purple-600' : 'text-slate-600'
            }`} />
            <span className={`text-xs font-medium ${
              activeTab === item.section ? 'text-purple-600' : 'text-slate-600'
            }`}>
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Navigation Header Component
const BusinessHeader: React.FC<{ 
  onMobileMenuToggle: () => void; 
  isMobileMenuOpen: boolean;
  onNavigate: (section: string) => void;
}> = ({ 
  onMobileMenuToggle, 
  isMobileMenuOpen,
  onNavigate 
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
              onClick={() => onNavigate('settings')}
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
const MobileNavigation: React.FC<{ isOpen: boolean; onClose: () => void; onNavigate: (section: string) => void }> = ({ isOpen, onClose, onNavigate }) => {
  const navItems = [
    { icon: Home, label: 'Dashboard', href: 'overview', active: true },
    { icon: BarChart3, label: 'Analytics', href: 'analytics' },
    { icon: Briefcase, label: 'Project Management', href: 'projects' },
    { icon: Users, label: 'Human Resources', href: 'hr' },
    { icon: DollarSign, label: 'Finance & Accounting', href: 'finance' },
    { icon: FileText, label: 'Documents', href: 'documents' },
    { icon: Target, label: 'CRM & Sales', href: 'crm' },
    { icon: Calendar, label: 'Calendar & Tasks', href: 'calendar' },
    { icon: Activity, label: 'Performance', href: 'performance' },
    { icon: MessageSquare, label: 'Communication', href: 'communication' },
    { icon: PieChart, label: 'Business Intelligence', href: 'intelligence' },
    { icon: Settings, label: 'Settings', href: 'settings' },
  ];

  const handleNavClick = (href: string) => {
    onNavigate(href);
    onClose();
  };

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
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
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



// Main Standalone Business Dashboard Component
const StandaloneBusinessDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation handler
  const handleNavigation = (section: string) => {
    setActiveTab(section);
    console.log(`Navigating to: ${section}`);
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

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
      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleNavigation}
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
                Ready to Grow Your Business?
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto"
            >
              Discover funding opportunities, create winning business plans, and connect with investors to scale your business
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
              { icon: DollarSign, label: 'Find Funding', color: 'from-purple-500 to-purple-600', section: 'funding' },
              { icon: FileText, label: 'Business Plan', color: 'from-blue-500 to-blue-600', section: 'business-plan' },
              { icon: Users, label: 'Network', color: 'from-green-500 to-green-600', section: 'network' },
              { icon: BarChart3, label: 'Growth Tools', color: 'from-yellow-500 to-yellow-600', section: 'growth' },
              { icon: Briefcase, label: 'Portfolio', color: 'from-pink-500 to-pink-600', section: 'portfolio' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(item.section)}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Render content based on active tab */}
        {activeTab === 'overview' && (
          <div>
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
        )}

        {/* Business Funding Section */}
        {activeTab === 'funding' && (
          <BusinessFundingSection />
        )}

        {/* Business Plan Section */}
        {activeTab === 'business-plan' && (
          <BusinessPlanSection />
        )}

        {/* Network Section */}
        {activeTab === 'network' && (
          <BusinessNetworkSection />
        )}

        {/* Growth Tools Section */}
        {activeTab === 'growth' && metrics && projects && (
          <BusinessGrowthSection metrics={metrics} projects={projects} />
        )}

        {/* Portfolio Section */}
        {activeTab === 'portfolio' && (
          <BusinessPortfolioSection />
        )}

        {/* Settings Section */}
        {activeTab === 'settings' && (
          <SettingsSection />
        )}

        {/* Menu Section */}
        {activeTab === 'menu' && (
          <MenuSection onNavigate={handleNavigation} />
        )}

        {/* Default to overview if no matching tab */}
        {!['overview', 'funding', 'business-plan', 'network', 'growth', 'portfolio', 'settings', 'menu'].includes(activeTab) && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Section Not Found</h2>
            <p className="text-slate-400 mb-6">The requested section is not available.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation('overview')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg"
            >
              Return to Dashboard
            </motion.button>
          </div>
        )}
      </div>

      {/* Business Footer Navigation */}
      <BusinessFooter onNavigate={handleNavigation} activeTab={activeTab} />
    </div>
  );
};

// Business Section Components  
const BusinessFundingSection = () => {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleFindFunding = () => {
    handleNavigation('/donor-discovery');
  };

  const handleFindMoreFunding = () => {
    handleNavigation('/donor-discovery?focus=business');
  };

  const handleViewOpportunities = () => {
    handleNavigation('/opportunities');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Find Business Funding</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Access our comprehensive funding discovery system with thousands of verified opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Access Cards */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 cursor-pointer"
          onClick={handleFindFunding}
        >
          <Search className="h-12 w-12 text-purple-400 mb-4" />
          <h3 className="text-white font-bold text-xl mb-3">Explore All Funding</h3>
          <p className="text-slate-300 mb-6">
            Access the complete funding discovery system with advanced search and filtering
          </p>
          <div className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium">
            Launch Discovery Tool
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-8 cursor-pointer"
          onClick={handleViewOpportunities}
        >
          <Target className="h-12 w-12 text-blue-400 mb-4" />
          <h3 className="text-white font-bold text-xl mb-3">Browse Opportunities</h3>
          <p className="text-slate-300 mb-6">
            View categorized funding opportunities with detailed application information
          </p>
          <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium">
            View Opportunities
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-600/20 to-teal-600/20 border border-green-500/30 rounded-2xl p-8 cursor-pointer"
          onClick={handleFindMoreFunding}
        >
          <DollarSign className="h-12 w-12 text-green-400 mb-4" />
          <h3 className="text-white font-bold text-xl mb-3">Business Focus</h3>
          <p className="text-slate-300 mb-6">
            Find funding specifically filtered for business and startup opportunities
          </p>
          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-medium">
            Business Funding
          </div>
        </motion.div>
      </div>

      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFindFunding}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-lg font-bold text-lg inline-flex items-center space-x-3"
        >
          <Search className="h-5 w-5" />
          <span>Launch Funding Discovery System</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const BusinessPlanSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Create Your Business Plan</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Build a comprehensive business plan that attracts investors and guides your growth
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {[
            { title: "Executive Summary", progress: 85, color: "purple" },
            { title: "Market Analysis", progress: 70, color: "blue" },
            { title: "Financial Projections", progress: 60, color: "green" },
            { title: "Marketing Strategy", progress: 45, color: "yellow" },
            { title: "Operations Plan", progress: 30, color: "pink" }
          ].map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-semibold">{section.title}</h3>
                <span className="text-slate-400 text-sm">{section.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r from-${section.color}-500 to-${section.color}-600 h-2 rounded-full transition-all`}
                  style={{ width: `${section.progress}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-6">AI Business Plan Assistant</h3>
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-2">Next Steps Recommended:</p>
              <ul className="text-white text-sm space-y-1">
                <li>• Complete market size analysis</li>
                <li>• Define pricing strategy</li>
                <li>• Identify key partnerships</li>
              </ul>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/proposals'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium"
            >
              Continue Writing Plan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/proposals/new'}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg font-medium mt-2"
            >
              Create New Business Plan
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BusinessNetworkSection = () => {
  // Fetch network connections from database
  const { data: networkData, isLoading } = useQuery({
    queryKey: ['/api/network'],
    queryFn: async () => {
      const response = await fetch('/api/network');
      return response.json();
    }
  });

  const handleConnectToNetwork = () => {
    window.location.href = '/donor-discovery?tab=network';
  };

  const handleViewProfile = (profileId: string) => {
    window.location.href = `/profile/${profileId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Business Network</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Connect with investors, mentors, and other businesses to accelerate your growth
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnectToNetwork}
          className="mt-6 bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>Expand Your Network</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Angel Investors",
            count: "24 Active",
            description: "Individual investors looking for promising startups",
            icon: "👨‍💼",
            color: "from-purple-500 to-purple-600"
          },
          {
            title: "Venture Capital",
            count: "12 Firms", 
            description: "VC firms focused on growth-stage businesses",
            icon: "🏢",
            color: "from-blue-500 to-blue-600"
          },
          {
            title: "Business Mentors",
            count: "38 Experts",
            description: "Experienced entrepreneurs offering guidance",
            icon: "🎯",
            color: "from-green-500 to-green-600"
          }
        ].map((network, index) => (
          <motion.div
            key={network.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${network.color} rounded-2xl p-6 border border-white/10`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{network.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{network.title}</h3>
              <p className="text-white/90 text-xl font-semibold mb-3">{network.count}</p>
              <p className="text-white/80 text-sm mb-6">{network.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium"
              >
                Connect Now
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const BusinessGrowthSection = ({ metrics, projects }: { metrics: any, projects: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Growth Tools & Analytics</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Track your business performance and access tools to accelerate growth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">Revenue Growth</h3>
          <p className="text-2xl font-bold text-green-400 mb-1">+{metrics.revenue.growth}%</p>
          <p className="text-slate-400 text-sm">vs last quarter</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">Active Projects</h3>
          <p className="text-2xl font-bold text-blue-400 mb-1">{metrics.projects.active}</p>
          <p className="text-slate-400 text-sm">in progress</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">Team Size</h3>
          <p className="text-2xl font-bold text-purple-400 mb-1">{metrics.employees.total}</p>
          <p className="text-slate-400 text-sm">team members</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">Net Profit</h3>
          <p className="text-2xl font-bold text-yellow-400 mb-1">${metrics.finances.profit.toLocaleString()}</p>
          <p className="text-slate-400 text-sm">this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-6">Growth Recommendations</h3>
          <div className="space-y-4">
            {[
              "Expand marketing in Uganda and Kenya markets",
              "Consider hiring 2 additional developers", 
              "Launch mobile app version Q2 2025",
              "Partner with local business associations"
            ].map((rec, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-slate-300 text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-6">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { title: "Apply for Growth Loan", color: "purple" },
              { title: "Schedule Investor Meeting", color: "blue" },
              { title: "Export Market Analysis", color: "green" },
              { title: "Tax Optimization Review", color: "yellow" }
            ].map((action, index) => (
              <motion.button
                key={action.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-gradient-to-r from-${action.color}-600 to-${action.color}-700 text-white py-3 rounded-lg text-sm font-medium`}
              >
                {action.title}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BusinessPortfolioSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Business Portfolio</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Showcase your business achievements and create investor-ready presentations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">Success Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Revenue Generated", value: "$2.8M", color: "green" },
                { label: "Customers Served", value: "15,400", color: "blue" },
                { label: "Market Share", value: "12%", color: "purple" },
                { label: "Team Growth", value: "300%", color: "yellow" }
              ].map((metric, index) => (
                <div key={metric.label} className="text-center">
                  <p className={`text-2xl font-bold text-${metric.color}-400 mb-1`}>{metric.value}</p>
                  <p className="text-slate-400 text-sm">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">Key Achievements</h3>
            <div className="space-y-3">
              {[
                "Secured $500K Series A funding",
                "Expanded to 3 African markets", 
                "Won 'Best Tech Startup' award 2024",
                "Reached break-even within 18 months",
                "Built team of 25 professionals"
              ].map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gold-400 rounded-full" />
                  <span className="text-slate-300 text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">Pitch Deck</h3>
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
              <div className="w-full h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Business Presentation</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium"
            >
              Edit Pitch Deck
            </motion.button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">Documents</h3>
            <div className="space-y-2">
              {[
                "Business Plan 2025.pdf",
                "Financial Projections.xlsx", 
                "Market Research.pdf",
                "Legal Documents.zip"
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300 text-sm">{doc}</span>
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StandaloneBusinessDashboard;