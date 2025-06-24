import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  FileText, 
  Target, 
  BarChart3,
  TrendingUp,
  ArrowUp,
  CheckCircle,
  Clock,
  Search,
  Sparkles,
  Calendar,
  AlertTriangle,
  Users,
  Star,
  Eye,
  Edit,
  Plus,
  Gem,
  Bell,
  Settings,
  RefreshCw,
  MapPin,
  Flag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardStats, ActivityItem } from '../types';
import { realDonorSearchEngine } from '../services/realDonorSearchEngine';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalFundingSecured: 2300000,
    fundingGrowth: 12.5,
    activeProposals: 24,
    proposalGrowth: 8,
    matchedDonors: 156,
    donorGrowth: 15,
    successRate: 89
  });

  const [recentActivity] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'grant_approved',
      title: 'Grant Approved',
      description: 'Gates Foundation - $500K',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: 'check'
    },
    {
      id: '2',
      type: 'proposal_submitted',
      title: 'Proposal Submitted',
      description: 'Climate Action Initiative',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      icon: 'file'
    },
    {
      id: '3',
      type: 'donor_match',
      title: 'New Donor Match',
      description: '15 potential funders found',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: 'target'
    },
    {
      id: '4',
      type: 'ai_proposal',
      title: 'AI Generated Proposal',
      description: 'Education for All project',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: 'sparkles'
    }
  ]);

  const [bookmarkedOpportunities, setBookmarkedOpportunities] = useState([
    { id: '1', title: 'USAID Digital Literacy Grant', donor: 'USAID', deadline: '15 days', amount: '$250K' },
    { id: '2', title: 'Ford Foundation Education', donor: 'Ford Foundation', deadline: '8 days', amount: '$150K' },
    { id: '3', title: 'Gates Health Initiative', donor: 'Gates Foundation', deadline: '22 days', amount: '$500K' }
  ]);
  
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [countryFlag, setCountryFlag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Get user's country from search engine
    const country = realDonorSearchEngine.getUserCountry();
    if (country) {
      setUserCountry(country);
      setCountryFlag(getFlagEmoji(country));
      
      // Update bookmarked opportunities to include country-specific ones
      if (country !== 'Global') {
        const countryOpportunity = {
          id: '4',
          title: `${country} Development Fund`,
          donor: `${country} Ministry of Finance`,
          deadline: '30 days',
          amount: '$300K'
        };
        setBookmarkedOpportunities(prev => [...prev, countryOpportunity]);
      }
    }

    return () => clearTimeout(timer);
  }, []);

  const getFlagEmoji = (country: string): string => {
    // Convert country name to ISO code (simplified)
    const countryCodes: Record<string, string> = {
      'Kenya': 'KE',
      'Nigeria': 'NG',
      'South Africa': 'ZA',
      'Ghana': 'GH',
      'Uganda': 'UG',
      'Tanzania': 'TZ',
      'Rwanda': 'RW',
      'Senegal': 'SN',
      'Mali': 'ML',
      'Ivory Coast': 'CI',
      'Cameroon': 'CM',
      'South Sudan': 'SS',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'France': 'FR'
    };
    
    const code = countryCodes[country] || '';
    if (!code) return '🌍';
    
    // Convert country code to flag emoji
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grant_approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'proposal_submitted': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'donor_match': return <Target className="w-5 h-5 text-purple-500" />;
      case 'ai_proposal': return <Sparkles className="w-5 h-5 text-orange-500" />;
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
      case 'funding':
        navigate('/funding');
        break;
      case 'proposals':
        navigate('/proposals');
        break;
      case 'donors':
        navigate('/donor-discovery');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        break;
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'grant_approved':
      case 'proposal_submitted':
        navigate('/funding');
        break;
      case 'donor_match':
        navigate('/donor-discovery');
        break;
      case 'ai_proposal':
        navigate('/proposal-generator');
        break;
      default:
        break;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'ai-proposal':
        navigate('/proposal-generator');
        break;
      case 'find-donors':
        navigate('/donor-discovery');
        break;
      case 'view-analytics':
        navigate('/analytics');
        break;
      case 'manage-projects':
        navigate('/projects');
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Donor Dashboard</h3>
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
              Welcome to Donor Dashboard! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening with your impact organization today.
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
              {user?.fullName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-900">{user?.fullName}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600">Executive Director</p>
              {userCountry && (
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600">•</span>
                  <span className="text-lg" role="img" aria-label={`Flag of ${userCountry}`}>
                    {countryFlag || '🌍'}
                  </span>
                  <span className="text-gray-600 text-sm">{userCountry}</span>
                </div>
              )}
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
          onClick={() => handleStatClick('funding')}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+{stats.fundingGrowth}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            ${(stats.totalFundingSecured / 1000000).toFixed(1)}M
          </h3>
          <p className="text-gray-600">Total Funding Secured</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => handleStatClick('proposals')}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+{stats.proposalGrowth}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.activeProposals}</h3>
          <p className="text-gray-600">Active Proposals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => handleStatClick('donors')}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+{stats.donorGrowth}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.matchedDonors}</h3>
          <p className="text-gray-600">Matched Donors</p>
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
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-orange-600 text-sm font-medium">{stats.successRate}%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.successRate}%</h3>
          <p className="text-gray-600">Success Rate</p>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funding Pipeline Chart - Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/analytics')}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Funding Pipeline</h3>
            <div className="flex items-center space-x-3">
              <select className="bg-gray-100 text-gray-700 rounded-lg px-3 py-2 border border-gray-200">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
                <option>This year</option>
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
              
              {/* Funding Secured Line */}
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
              
              {/* Applications Submitted Line */}
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
                <span className="text-gray-700 text-sm">Funding Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700 text-sm">Applications Submitted</span>
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

      {/* Quick Actions & Bookmarked Opportunities */}
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
              onClick={() => handleQuickAction('ai-proposal')}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl text-left group hover:shadow-md transition-all"
            >
              <div className="p-3 bg-blue-100 rounded-xl w-fit mb-4 group-hover:bg-blue-200 transition-colors">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-gray-900 font-semibold mb-2">AI Proposal</h4>
              <p className="text-gray-600 text-sm">Generate with AI</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('find-donors')}
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl text-left group hover:shadow-md transition-all"
            >
              <div className="p-3 bg-purple-100 rounded-xl w-fit mb-4 group-hover:bg-purple-200 transition-colors">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-gray-900 font-semibold mb-2">Find Donors</h4>
              <p className="text-gray-600 text-sm">Discover opportunities</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('view-analytics')}
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl text-left group hover:shadow-md transition-all"
            >
              <div className="p-3 bg-green-100 rounded-xl w-fit mb-4 group-hover:bg-green-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-gray-900 font-semibold mb-2">Analytics</h4>
              <p className="text-gray-600 text-sm">View insights</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('manage-projects')}
              className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl text-left group hover:shadow-md transition-all"
            >
              <div className="p-3 bg-orange-100 rounded-xl w-fit mb-4 group-hover:bg-orange-200 transition-colors">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-gray-900 font-semibold mb-2">Projects</h4>
              <p className="text-gray-600 text-sm">Manage projects</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Bookmarked Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Bookmarked Opportunities</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate('/donor-discovery')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-4">
            {bookmarkedOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/donor-discovery')}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <h4 className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">{opportunity.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{opportunity.donor}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Amount: {opportunity.amount}</span>
                      <span>Deadline: {opportunity.deadline}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/donor-discovery');
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/proposal-generator');
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
            onClick={() => navigate('/donor-discovery')}
            className="w-full mt-4 py-2 text-purple-600 hover:text-purple-500 text-sm font-medium transition-colors"
          >
            View All Bookmarks →
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
            onClick={() => navigate('/proposals')}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Calendar className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/proposals')}
            className="p-4 bg-red-50 border border-red-100 rounded-xl hover:border-red-200 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-900 font-medium group-hover:text-red-600 transition-colors">UN Climate Fund</h4>
                <p className="text-gray-600 text-sm">Final submission due</p>
              </div>
              <div className="text-right">
                <p className="text-red-600 font-bold">2 days</p>
                <p className="text-gray-500 text-xs">remaining</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/proposals')}
            className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl hover:border-yellow-200 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-900 font-medium group-hover:text-yellow-600 transition-colors">Ford Foundation</h4>
                <p className="text-gray-600 text-sm">Application deadline</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-600 font-bold">7 days</p>
                <p className="text-gray-500 text-xs">remaining</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;