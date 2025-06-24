import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  FileText, 
  Target, 
  TrendingUp,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DonorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userId = localStorage.getItem('userId') || user?.id || 'demo_user';
  const [userProfile, setUserProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const StatCard = ({ title, value, change, changeType, icon }: any) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className={`text-sm ${changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'}`}>
            {change}
          </p>
        </div>
        <div className="text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
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
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {greeting}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {userProfile?.sector 
            ? `Discover ${userProfile.sector} funding opportunities tailored for ${userProfile?.country || 'your region'}`
            : "Here's what's happening with your funding opportunities today."
          }
        </p>
        {userProfile?.organizationType && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Specialized content for {userProfile.organizationType.replace('_', ' ')} organizations
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Available Funding"
          value={`$${(stats.totalFundingSecured / 1000000).toFixed(1)}M`}
          change={`${opportunities.length} opportunities`}
          changeType="neutral"
          icon={<DollarSign className="w-6 h-6" />}
        />
        <StatCard
          title="Relevant for You"
          value={stats.activeProposals}
          change={userProfile?.country ? `${userProfile.country} focused` : 'Update profile'}
          changeType="neutral"
          icon={<Target className="w-6 h-6" />}
        />
        <StatCard
          title="AI Match Score"
          value={`${stats.successRate}%`}
          change="Based on your profile"
          changeType={stats.successRate > 70 ? "increase" : "decrease"}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          title="Total Opportunities"
          value={stats.matchedDonors}
          change={userProfile?.sector || 'Update profile'}
          changeType="neutral"
          icon={<FileText className="w-6 h-6" />}
        />
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-3xl mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for funding opportunities, donors, or sectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 pl-14 pr-20 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
          />
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-md transition-all"
          >
            Find
          </button>
        </div>
      </form>

      {/* Dynamic Opportunities Display */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {userProfile?.sector 
            ? `${userProfile.sector} Opportunities for You`
            : "AI-Matched Opportunities"
          }
        </h3>
        {isLoading ? (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">Loading personalized opportunities...</p>
          </div>
        ) : opportunities.slice(0, 4).map((opportunity: any) => (
          <div 
            key={opportunity.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{opportunity.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{opportunity.sourceName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {opportunity.country}
                  </span>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    {opportunity.sector}
                  </span>
                  {opportunity.aiMatchScore && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      {opportunity.aiMatchScore}% match
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  ${opportunity.amountMin?.toLocaleString()} - ${opportunity.amountMax?.toLocaleString()}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {opportunity.currency}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorDashboard;