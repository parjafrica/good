import { useState } from 'react';
import { Book, Users, Trophy, Target, Calendar, Star, BookOpen, PenTool, Download, GraduationCap, Award, Search, ChevronRight, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import StudentNavigation from './StudentNavigation';

interface StudentUser {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  userType: string;
  educationLevel: string;
  fieldOfStudy: string;
  currentInstitution: string;
  country: string;
  credits: number;
  researchInterests: string[];
  academicAchievements: string[];
  careerGoals: string[];
}

interface StudentDashboardData {
  user: StudentUser;
  scholarships: any[];
  researchGrants: any[];
  academicProgress: any;
  personalizedInsights: any;
  customActions: any[];
}

export default function StudentDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('study');

  // Fetch student-specific dashboard data
  const { data: dashboardData, isLoading } = useQuery<StudentDashboardData>({
    queryKey: ['/api/student-dashboard'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your academic dashboard...</p>
        </div>
      </div>
    );
  }

  const categories = [
    { id: 'study', label: 'For Study', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { id: 'research', label: 'Research', icon: Search, color: 'from-purple-500 to-purple-600' },
    { id: 'career', label: 'Career', icon: Target, color: 'from-green-500 to-green-600' },
    { id: 'funding', label: 'Funding', icon: Award, color: 'from-yellow-500 to-yellow-600' },
    { id: 'network', label: 'Network', icon: Users, color: 'from-pink-500 to-pink-600' }
  ];

  const quickStartItems = [
    {
      id: 'academic-writing',
      title: 'Academic Writing Suite',
      description: 'AI-powered writing tools with plagiarism checker',
      icon: PenTool,
      color: 'from-emerald-500 to-emerald-600',
      glowColor: 'shadow-emerald-500/50',
      category: 'study',
      href: '/academic-writing',
      isNew: true
    },
    {
      id: 'scholarships',
      title: 'Scholarship Finder',
      description: 'Find scholarships matching your profile',
      icon: Award,
      color: 'from-blue-500 to-blue-600',
      glowColor: 'shadow-blue-500/50',
      category: 'funding',
      href: '/scholarships'
    },
    {
      id: 'research-grants',
      title: 'Research Grants',
      description: 'Discover undergraduate research opportunities',
      icon: Search,
      color: 'from-purple-500 to-purple-600',
      glowColor: 'shadow-purple-500/50',
      category: 'research',
      href: '/research-grants'
    },
    {
      id: 'study-planner',
      title: 'Study Planner',
      description: 'Organize your academic schedule',
      icon: Calendar,
      color: 'from-indigo-500 to-indigo-600',
      glowColor: 'shadow-indigo-500/50',
      category: 'study',
      href: '/study-planner'
    },
    {
      id: 'career-center',
      title: 'Career Center',
      description: 'CV builder and interview preparation',
      icon: Target,
      color: 'from-green-500 to-green-600',
      glowColor: 'shadow-green-500/50',
      category: 'career',
      href: '/career-center'
    },
    {
      id: 'peer-network',
      title: 'Peer Network',
      description: 'Connect with fellow students',
      icon: Users,
      color: 'from-pink-500 to-pink-600',
      glowColor: 'shadow-pink-500/50',
      category: 'network',
      href: '/peer-network'
    }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? quickStartItems 
    : quickStartItems.filter(item => item.category === selectedCategory);

  const user = dashboardData?.user;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section - EdrawAI Style */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-700/20 backdrop-blur-lg"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                Hey, What do you want to do today?
              </h1>
              <p className="text-purple-200">
                Welcome back, {user?.firstName || 'Student'}! Let's continue your academic journey.
              </p>
            </div>
          </div>

          {/* Category Selector - EdrawAI Style */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 min-w-[120px] ${
                    isSelected 
                      ? `bg-gradient-to-br ${category.color} shadow-lg shadow-current/25` 
                      : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  <IconComponent className={`w-8 h-8 mb-3 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {category.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Quick Start Section - EdrawAI Style */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.a
                  key={item.id}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`relative group block p-6 bg-gray-800 border border-gray-700 rounded-xl transition-all duration-300 hover:border-gray-600 hover:${item.glowColor} hover:shadow-xl`}
                >
                  {item.isNew && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                    <span className="text-sm font-medium mr-2">Get started</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Additional Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <Plus className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-white font-medium">Create New</span>
            </div>
            <div className="space-y-2">
              <a href="/academic-writing" className="block text-sm text-gray-400 hover:text-blue-400 transition-colors">+ New Research Paper</a>
              <a href="/study-planner" className="block text-sm text-gray-400 hover:text-blue-400 transition-colors">+ Study Schedule</a>
              <a href="/career-center" className="block text-sm text-gray-400 hover:text-blue-400 transition-colors">+ CV Project</a>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <Trophy className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-white font-medium">Your Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">GPA</span>
                <span className="text-white">3.8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Credits</span>
                <span className="text-white">{user?.credits || 145}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Projects</span>
                <span className="text-white">8 completed</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white font-medium">Upcoming</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Research Proposal Due</div>
              <div className="text-xs text-green-400">Feb 15, 2025</div>
              <div className="text-sm text-gray-400">Scholarship Application</div>
              <div className="text-xs text-green-400">Mar 1, 2025</div>
            </div>
          </motion.div>
        </div>

        {/* Recent Documents Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Documents</h2>
            <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Research Proposal Draft', type: 'Document', modified: '2 hours ago', icon: PenTool },
              { name: 'Literature Review', type: 'Paper', modified: '1 day ago', icon: BookOpen },
              { name: 'CV Template', type: 'CV', modified: '3 days ago', icon: Target }
            ].map((doc, index) => {
              const IconComponent = doc.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{doc.name}</h3>
                      <p className="text-gray-400 text-sm">{doc.type}</p>
                      <p className="text-gray-500 text-xs">{doc.modified}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Student Navigation */}
      <StudentNavigation />
    </div>
  );
}