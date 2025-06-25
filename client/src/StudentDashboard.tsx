import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Calendar, 
  Search,
  ArrowUp,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Edit,
  Plus,
  Gem,
  Bell,
  Settings,
  RefreshCw,
  FileText,
  Users,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for student dashboard
  const [stats, setStats] = useState({
    totalScholarships: 12,
    scholarshipsGrowth: 5,
    activeCourses: 3,
    coursesGrowth: 2,
    researchOpportunities: 8,
    researchGrowth: 3,
    completionRate: 92
  });

  const [recentActivity] = useState([
    {
      id: '1',
      type: 'scholarship_match',
      title: 'New Scholarship Match',
      description: 'STEM Excellence Scholarship - $10,000',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: 'award'
    },
    {
      id: '2',
      type: 'course_completed',
      title: 'Course Completed',
      description: 'Introduction to Data Science',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      icon: 'book'
    },
    {
      id: '3',
      type: 'research_opportunity',
      title: 'Research Opportunity',
      description: 'Summer Research Program at MIT',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: 'search'
    },
    {
      id: '4',
      type: 'application_submitted',
      title: 'Application Submitted',
      description: 'Global Leaders Fellowship',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: 'file'
    }
  ]);

  const [bookmarkedScholarships, setBookmarkedScholarships] = useState([
    { id: '1', title: 'Global Leaders Scholarship', provider: 'International Education Fund', deadline: '15 days', amount: '$10,000' },
    { id: '2', title: 'Women in STEM Grant', provider: 'Tech Future Foundation', deadline: '8 days', amount: '$5,000' },
    { id: '3', title: 'Graduate Research Fellowship', provider: 'National Science Foundation', deadline: '22 days', amount: '$25,000' }
  ]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scholarship_match': return <Award className="w-5 h-5 text-purple-500" />;
      case 'course_completed': return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'research_opportunity': return <Search className="w-5 h-5 text-blue-500" />;
      case 'application_submitted': return <FileText className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'scholarships':
        navigate('/scholarships');
        break;
      case 'courses':
        navigate('/courses');
        break;
      case 'research':
        navigate('/research');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        break;
    }
  };

  const handleActivityClick = (activity: any) => {
    switch (activity.type) {
      case 'scholarship_match':
        navigate('/scholarships');
        break;
      case 'course_completed':
        navigate('/courses');
        break;
      case 'research_opportunity':
        navigate('/research');
        break;
      case 'application_submitted':
        navigate('/scholarships');
        break;
      default:
        break;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'find-scholarships':
        navigate('/scholarships');
        break;
      case 'manage-courses':
        navigate('/courses');
        break;
      case 'research-opportunities':
        navigate('/research');
        break;
      case 'get-help':
        navigate('/human-help');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Student Dashboard</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Student Dashboard! 👋
            </h1>
            <p className="text-gray-700 text-lg">
              Here's what's happening with your academic journey today.
            </p>
          </div>
          
          {/* Credits Display - Clickable */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/credits')}
            className="flex items-center space-x-3 px-6 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <Gem className="w-8 h-8 text-emerald-500 group-hover:animate-pulse" />
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{user?.credits.toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Credits</div>
            </div>
          </motion.button>
        </div>

        {/* User Profile Card - Clickable */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/settings')}
          className="inline-flex items-center space-x-4 px-6 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {user?.fullName?.split(' ').map(n => n[0]).join('') || 'S'}
            </span>
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-900">{user?.fullName || 'Student'}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600">Computer Science Student</p>
              <div className="flex items-center space-x-1">
                <span className="text-gray-600">•</span>
                <span className="text-gray-600 text-sm">Stanford University</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Grid - All Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-stats">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => handleStatClick('scholarships')}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+{stats.scholarshipsGrowth}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalScholarships}</h3>
          <p className="text-gray-600">Scholarship Matches</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => handleStatClick('courses')}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+{stats.coursesGrowth}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.activeCourses}</h3>
          <p className="text-gray-600">Active Courses</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => handleStatClick('research')}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+{stats.researchGrowth}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.researchOpportunities}</h3>
          <p className="text-gray-600">Research Opportunities</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => handleStatClick('analytics')}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-orange-600 text-sm font-medium">{stats.completionRate}%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.completionRate}%</h3>
          <p className="text-gray-600">Completion Rate</p>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Progress Chart - Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/courses')}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Academic Progress</h3>
            <div className="flex items-center space-x-3">
              <select className="bg-gray-100 text-gray-700 rounded-lg px-3 py-2 border border-gray-200">
                <option>Current Semester</option>
                <option>Last Semester</option>
                <option>All Time</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          
          {/* Interactive Chart */}
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 40}
                  x2="400"
                  y2={i * 40}
                  stroke="rgb(229 231 235)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Course Completion Line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
                d="M 0 160 Q 100 140 200 100 T 400 80"
                fill="none"
                stroke="rgb(59 130 246)"
                strokeWidth="3"
                className="hover:stroke-blue-400 cursor-pointer"
              />
              
              {/* Grade Average Line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.7 }}
                d="M 0 180 Q 100 160 200 120 T 400 100"
                fill="none"
                stroke="rgb(147 51 234)"
                strokeWidth="3"
                className="hover:stroke-purple-400 cursor-pointer"
              />

              {/* Interactive Data Points */}
              {[80, 140, 200, 260, 320, 380].map((x, index) => (
                <motion.circle
                  key={index}
                  cx={x}
                  cy={120 - index * 8}
                  r="4"
                  fill="rgb(59 130 246)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.5 }}
                  className="cursor-pointer"
                />
              ))}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 text-sm">Course Completion</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700 text-sm">Grade Average</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity - All Items Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => handleActivityClick(activity)}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group"
              >
                <div className="p-2 bg-gray-200 rounded-lg group-hover:bg-gray-300 transition-colors">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{formatTimeAgo(activity.timestamp)}</p>
                </div>
                <ArrowUp className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transform rotate-45 transition-all" />
              </motion.div>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/notifications')}
            className="w-full mt-4 py-2 text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
          >
            View All Activity →
          </motion.button>
        </motion.div>
      </div>

      {/* Quick Actions & Bookmarked Scholarships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions - All Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          id="quick-actions"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('find-scholarships')}
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl text-left group hover:shadow-md transition-all"
            >
              <div className="p-3 bg-purple-100 rounded-xl w-fit mb-4 group-hover:bg-purple-200 transition-colors">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-gray-900 font-semibold mb-2">Find Scholarships</h4>
              <p className="text-gray-600 text-sm">Discover opportunities</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('manage-courses')}
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl text-left group hover:shadow-md transition-all"
            >
              <div className="p-3 bg-green-100 rounded-xl w-fit mb-4 group-hover:bg-green-200 transition-colors">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-gray-900 font-semibold mb-2">Manage Courses</h4>
              <p className="text-gray-600 text-sm">Track your progress</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('research-opportunities')}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl text-left group hover:shadow-md transition-all"
            >
              <div className="p-3 bg-blue-100 rounded-xl w-fit mb-4 group-hover:bg-blue-200 transition-colors">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-gray-900 font-semibold mb-2">Research</h4>
              <p className="text-gray-600 text-sm">Find opportunities</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('get-help')}
              className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl text-left group hover:shadow-md transition-all"
            >
              <div className="p-3 bg-orange-100 rounded-xl w-fit mb-4 group-hover:bg-orange-200 transition-colors">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-gray-900 font-semibold mb-2">Get Help</h4>
              <p className="text-gray-600 text-sm">Expert assistance</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Bookmarked Scholarships */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Bookmarked Scholarships</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate('/scholarships')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-4">
            {bookmarkedScholarships.map((scholarship, index) => (
              <motion.div
                key={scholarship.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/scholarships')}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <h4 className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">{scholarship.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{scholarship.provider}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Amount: {scholarship.amount}</span>
                      <span>Deadline: {scholarship.deadline}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/scholarships');
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/scholarships');
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/scholarships')}
            className="w-full mt-4 py-2 text-purple-600 hover:text-purple-500 text-sm font-medium transition-colors"
          >
            View All Scholarships →
          </motion.button>
        </motion.div>
      </div>

      {/* Upcoming Deadlines - Clickable */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate('/scholarships')}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Calendar className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/scholarships')}
            className="p-4 bg-red-50 border border-red-100 rounded-xl hover:border-red-200 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-900 font-medium group-hover:text-red-600 transition-colors">STEM Excellence Scholarship</h4>
                <p className="text-gray-600 text-sm">Application deadline</p>
              </div>
              <div className="text-right">
                <p className="text-red-600 font-bold">3 days</p>
                <p className="text-gray-500 text-xs">remaining</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/courses')}
            className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl hover:border-yellow-200 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-900 font-medium group-hover:text-yellow-600 transition-colors">Data Science Final Project</h4>
                <p className="text-gray-600 text-sm">Assignment due</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-600 font-bold">5 days</p>
                <p className="text-gray-500 text-xs">remaining</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Professional Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Professional Help</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate('/human-help')}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Users className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/human-help')}
            className="flex-1 p-4 bg-green-50 border border-green-100 rounded-xl hover:border-green-200 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-gray-900 font-medium">Academic Advising</h4>
            </div>
            <p className="text-gray-600 text-sm mb-3">Get personalized guidance from academic experts</p>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <span>Connect with an advisor</span>
              <ArrowUp className="w-4 h-4 ml-1 transform rotate-45" />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/human-help')}
            className="flex-1 p-4 bg-blue-50 border border-blue-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-gray-900 font-medium">Application Review</h4>
            </div>
            <p className="text-gray-600 text-sm mb-3">Get professional feedback on your applications</p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <span>Submit for review</span>
              <ArrowUp className="w-4 h-4 ml-1 transform rotate-45" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;