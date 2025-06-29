import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, DollarSign, Users, TrendingUp, FileText, Calendar,
  PieChart, BarChart3, Activity, Target, Briefcase, Settings,
  Plus, Download, Upload, Search, Filter, Bell, Menu,
  ChevronRight, ArrowUpRight, ArrowDownRight, Eye, Edit,
  Trash2, Star, Clock, CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';

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

const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch business metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/business/metrics', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/business/metrics?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    }
  });

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/business/projects'],
    queryFn: async () => {
      const response = await fetch('/api/business/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    }
  });

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/business/employees'],
    queryFn: async () => {
      const response = await fetch('/api/business/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      return response.json();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'on-hold': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'projects', name: 'Projects', icon: Briefcase },
    { id: 'employees', name: 'Employees', icon: Users },
    { id: 'finances', name: 'Finances', icon: DollarSign },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  if (metricsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-32 w-32 border-b-2 border-blue-600"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Business Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive business management and analytics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-medium">+12.5%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  $847,320
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Total Revenue</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex items-center text-blue-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-medium">+8</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  142
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Active Employees</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex items-center text-purple-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-medium">+3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  28
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Active Projects</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-medium">+18.3%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  94.2%
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
              </motion.div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Revenue Overview
                  </h3>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[65, 78, 82, 95, 88, 92, 105, 98, 115, 122, 135, 148].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${(height / 148) * 100}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg flex-1 min-h-4"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Jan</span>
                  <span>Dec</span>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Recent Projects
                  </h3>
                  <Plus className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600" />
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Website Redesign', progress: 85, status: 'active', budget: '$45K' },
                    { name: 'Mobile App Development', progress: 62, status: 'active', budget: '$120K' },
                    { name: 'Marketing Campaign', progress: 100, status: 'completed', budget: '$25K' },
                    { name: 'Database Migration', progress: 35, status: 'pending', budget: '$80K' }
                  ].map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ delay: index * 0.1 + 0.5 }}
                              className="bg-blue-600 h-2 rounded-full"
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {project.budget}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Project Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[
                {
                  id: '1',
                  name: 'E-commerce Platform',
                  status: 'active',
                  progress: 75,
                  budget: 150000,
                  spent: 112500,
                  deadline: '2024-02-15',
                  team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
                  priority: 'high'
                },
                {
                  id: '2',
                  name: 'Mobile App Development',
                  status: 'active',
                  progress: 45,
                  budget: 120000,
                  spent: 54000,
                  deadline: '2024-03-20',
                  team: ['Sarah Wilson', 'Tom Brown'],
                  priority: 'medium'
                },
                {
                  id: '3',
                  name: 'Database Migration',
                  status: 'pending',
                  progress: 0,
                  budget: 80000,
                  spent: 0,
                  deadline: '2024-04-10',
                  team: ['Alex Chen'],
                  priority: 'low'
                }
              ].map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {project.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority} priority
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                          className="bg-blue-600 h-2 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Deadline</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(project.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Team</p>
                      <div className="flex -space-x-2">
                        {project.team.map((member, memberIndex) => (
                          <div
                            key={memberIndex}
                            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
                          >
                            {member.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Employee Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                  <option>HR</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            </div>

            {/* Employee Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: '1',
                  name: 'John Doe',
                  position: 'Senior Developer',
                  department: 'Engineering',
                  salary: 95000,
                  startDate: '2022-01-15',
                  status: 'active',
                  performance: 92
                },
                {
                  id: '2',
                  name: 'Jane Smith',
                  position: 'Marketing Manager',
                  department: 'Marketing',
                  salary: 78000,
                  startDate: '2021-06-10',
                  status: 'active',
                  performance: 88
                },
                {
                  id: '3',
                  name: 'Mike Johnson',
                  position: 'Sales Representative',
                  department: 'Sales',
                  salary: 65000,
                  startDate: '2023-03-20',
                  status: 'active',
                  performance: 85
                }
              ].map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {employee.position}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {employee.department}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Salary</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${employee.salary.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(employee.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.performance}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${employee.performance}%` }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                          className="bg-green-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Finances Tab */}
        {activeTab === 'finances' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Revenue</h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-2">$2,847,320</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">+15.2% from last month</p>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Expenses</h3>
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600 mb-2">$1,654,280</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">+8.1% from last month</p>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Net Profit</h3>
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">$1,193,040</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">+25.3% from last month</p>
              </div>
            </div>

            {/* Financial Charts and Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Flow Chart */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Cash Flow</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[45, 52, 48, 61, 55, 67, 73, 69, 78, 82, 89, 95].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-t from-green-500 to-blue-500 rounded-t-lg flex-1 min-h-4"
                    />
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Transactions</h3>
                <div className="space-y-4">
                  {[
                    { type: 'income', description: 'Client Payment - Project X', amount: 45000, date: '2024-01-15' },
                    { type: 'expense', description: 'Office Rent', amount: -12000, date: '2024-01-14' },
                    { type: 'income', description: 'Consulting Fee', amount: 8500, date: '2024-01-13' },
                    { type: 'expense', description: 'Software Licenses', amount: -3200, date: '2024-01-12' }
                  ].map((transaction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed business intelligence and reporting tools coming soon
              </p>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Business Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configure business preferences and system settings
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;