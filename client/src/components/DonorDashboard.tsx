import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  FileText, 
  Target, 
  TrendingUp,
  Search,
  RefreshCw,
  Sparkles,
  Globe,
  Award,
  Calendar,
  ArrowRight,
  Zap,
  Star,
  ChevronRight,
  BarChart3,
  Users,
  Eye,
  BookOpen,
  Gift
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DonorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userId = localStorage.getItem('userId') || user?.id || 'demo_user';
  const [userProfile, setUserProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Save user preferences to cookies
  useEffect(() => {
    const saveUserPreferences = () => {
      if (userProfile) {
        const preferences = {
          userId,
          lastVisit: new Date().toISOString(),
          country: userProfile.country,
          sector: userProfile.sector,
          organizationType: userProfile.organizationType
        };
        document.cookie = `granada_user_prefs=${JSON.stringify(preferences)}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
      }
    };
    saveUserPreferences();
  }, [userProfile, userId]);

  // Fetch user profile for personalization
  const { data: profileData } = useQuery({
    queryKey: ['/api/user/profile', userId],
    enabled: !!userId
  });

  // Fetch personalized opportunities based on user profile
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['/api/opportunities/personalized', userId],
    enabled: !!userId
  });

  useEffect(() => {
    if (profileData) {
      setUserProfile(profileData);
    }
  }, [profileData]);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      const userName = userProfile?.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'there';
      
      if (hour < 12) {
        setGreeting(`Good morning, ${userName}`);
      } else if (hour < 18) {
        setGreeting(`Good afternoon, ${userName}`);
      } else {
        setGreeting(`Good evening, ${userName}`);
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, [user, userProfile]);

  // Calculate dynamic stats based on user's actual data
  const calculateUserStats = () => {
    if (!opportunities.length) return {
      totalFundingSecured: 0,
      activeProposals: 0,
      matchedDonors: 0,
      successRate: 0
    };

    const totalFunding = opportunities.reduce((sum: number, opp: any) => sum + (opp.amountMax || 0), 0);
    const userCountryOpps = opportunities.filter((opp: any) => 
      opp.country === userProfile?.country || opp.country === 'Global'
    ).length;
    const userSectorOpps = opportunities.filter((opp: any) => 
      opp.sector === userProfile?.sector
    ).length;
    
    const successRate = userProfile ? 
      Math.round((userCountryOpps / opportunities.length) * 40 + 
                 (userSectorOpps / opportunities.length) * 60) : 0;

    return {
      totalFundingSecured: totalFunding,
      activeProposals: userCountryOpps,
      matchedDonors: opportunities.length,
      successRate
    };
  };

  const stats = calculateUserStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/donor-discovery', { state: { query: searchQuery } });
    }
  };

  const StatCard = ({ title, value, change, changeType, icon, gradient, index }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-2xl border border-white/20 shadow-lg backdrop-blur-sm group cursor-pointer`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div className="text-white/60">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          <p className="text-sm text-white/70 flex items-center gap-1">
            {changeType === 'increase' && <TrendingUp className="w-4 h-4" />}
            {changeType === 'decrease' && <TrendingUp className="w-4 h-4 rotate-180" />}
            {change}
          </p>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Enhanced Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12"
        >
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
                >
                  {greeting}! 👋
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-gray-700 dark:text-gray-300 mb-2"
                >
                  {userProfile?.sector 
                    ? `Discover ${userProfile.sector} funding opportunities tailored for ${userProfile?.country || 'your region'}`
                    : "Here's what's happening with your funding opportunities today."
                  }
                </motion.p>
                {userProfile?.organizationType && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full"
                  >
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {userProfile.organizationType.replace('_', ' ')} organization
                    </span>
                  </motion.div>
                )}
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="hidden md:block"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl opacity-20 blur-lg"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Available Funding"
            value={`$${(stats.totalFundingSecured / 1000000).toFixed(1)}M`}
            change={`${opportunities.length} opportunities`}
            changeType="increase"
            icon={<DollarSign className="w-7 h-7" />}
            gradient="from-emerald-500 to-green-600"
            index={0}
          />
          <StatCard
            title="Relevant for You"
            value={stats.activeProposals}
            change={userProfile?.country ? `${userProfile.country} focused` : 'Update profile'}
            changeType="increase"
            icon={<Target className="w-7 h-7" />}
            gradient="from-blue-500 to-cyan-600"
            index={1}
          />
          <StatCard
            title="AI Match Score"
            value={`${stats.successRate}%`}
            change="Based on your profile"
            changeType={stats.successRate > 70 ? "increase" : "decrease"}
            icon={<Zap className="w-7 h-7" />}
            gradient="from-purple-500 to-pink-600"
            index={2}
          />
          <StatCard
            title="Total Opportunities"
            value={stats.matchedDonors}
            change={userProfile?.sector || 'Update profile'}
            changeType="increase"
            icon={<Award className="w-7 h-7" />}
            gradient="from-orange-500 to-red-600"
            index={3}
          />
        </div>

        {/* Enhanced Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20">
                <input
                  type="text"
                  placeholder="Search for funding opportunities, donors, or sectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-8 py-6 pl-16 pr-32 bg-transparent text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none text-lg"
                />
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
                >
                  <span>Find</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Enhanced Opportunities Display */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-between"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                {userProfile?.sector 
                  ? `${userProfile.sector} Opportunities for You`
                  : "AI-Matched Opportunities"
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Personalized recommendations based on your profile and AI analysis
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/donor-discovery')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                      </div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {opportunities.slice(0, 6).map((opportunity: any, index: number) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="group cursor-pointer"
                    onClick={() => navigate('/donor-discovery')}
                  >
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                      
                      {/* Match Score Badge */}
                      {opportunity.aiMatchScore && (
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium">
                            <Zap className="w-3 h-3" />
                            {opportunity.aiMatchScore}% match
                          </div>
                        </div>
                      )}

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                              {opportunity.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              {opportunity.sourceName}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                              <Globe className="w-3 h-3" />
                              {opportunity.country}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              <BarChart3 className="w-3 h-3" />
                              {opportunity.sector}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                              <Calendar className="w-3 h-3" />
                              Active
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                ${opportunity.amountMin?.toLocaleString()} - ${opportunity.amountMax?.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {opportunity.currency} • Funding Available
                              </p>
                            </div>
                            <motion.div
                              whileHover={{ x: 5 }}
                              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm"
                            >
                              <span>View Details</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FileText className="w-6 h-6" />, label: "Create Proposal", action: () => navigate('/proposal-generator'), gradient: "from-blue-500 to-cyan-600" },
              { icon: <Search className="w-6 h-6" />, label: "Find Donors", action: () => navigate('/donor-discovery'), gradient: "from-purple-500 to-pink-600" },
              { icon: <BarChart3 className="w-6 h-6" />, label: "Analytics", action: () => navigate('/analytics'), gradient: "from-green-500 to-emerald-600" },
              { icon: <BookOpen className="w-6 h-6" />, label: "Resources", action: () => navigate('/documents'), gradient: "from-orange-500 to-red-600" }
            ].map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={item.action}
                className={`p-6 bg-gradient-to-br ${item.gradient} rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 group`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonorDashboard;