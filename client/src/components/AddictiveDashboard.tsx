import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Zap, 
  Target,
  Star,
  Gift,
  Trophy,
  Sparkles,
  RefreshCcw,
  ExternalLink,
  Heart,
  Award,
  Rocket,
  Crown,
  Flame,
  MousePointer,
  Eye,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAddiction } from '../contexts/AddictionContext';

interface OpportunityStats {
  total: number;
  totalValue: number;
  avgAmount: number;
  sectors: Record<string, number>;
  countries: Record<string, number>;
  recentCount: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  reward?: string;
}

const AddictiveDashboard: React.FC = () => {
  const { 
    behavior, 
    trackClick, 
    trackPageVisit, 
    trackAction, 
    addCredits, 
    addXP, 
    isAddicted 
  } = useAddiction();
  
  const [excitement, setExcitement] = useState(0);
  const [pulseEffect, setPulseEffect] = useState(false);
  const queryClient = useQueryClient();

  // Track page visit
  useEffect(() => {
    trackPageVisit('dashboard');
  }, []);

  const { data: opportunities = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/opportunities'],
    refetchInterval: 15000, // Super frequent updates for addictive feel
  });

  const stats: OpportunityStats = React.useMemo(() => {
    const total = opportunities.length;
    const totalValue = opportunities.reduce((sum: number, opp: any) => sum + (opp.amountMax || 0), 0);
    const avgAmount = total > 0 ? totalValue / total : 0;
    
    const sectors: Record<string, number> = {};
    const countries: Record<string, number> = {};
    
    opportunities.forEach((opp: any) => {
      if (opp.sector) sectors[opp.sector] = (sectors[opp.sector] || 0) + 1;
      if (opp.country) countries[opp.country] = (countries[opp.country] || 0) + 1;
    });

    const recentCount = opportunities.filter((opp: any) => {
      const created = new Date(opp.createdAt);
      const now = new Date();
      const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    }).length;

    return { total, totalValue, avgAmount, sectors, countries, recentCount };
  }, [opportunities]);

  const achievements: Achievement[] = [
    {
      id: 'first_visit',
      title: 'Welcome Explorer!',
      description: 'Discovered the funding universe',
      icon: <Rocket className="w-6 h-6" />,
      unlocked: true,
      reward: '+10 XP'
    },
    {
      id: 'streak_week',
      title: 'Week Warrior',
      description: '7 days checking opportunities',
      icon: <Trophy className="w-6 h-6" />,
      unlocked: behavior.streak >= 7,
      progress: Math.min(behavior.streak / 7 * 100, 100),
      reward: '+50 XP'
    },
    {
      id: 'opportunity_hunter',
      title: 'Opportunity Hunter',
      description: 'Found 10+ opportunities',
      icon: <Target className="w-6 h-6" />,
      unlocked: stats.total >= 10,
      progress: Math.min(stats.total / 10 * 100, 100),
      reward: '+25 XP'
    },
    {
      id: 'value_seeker',
      title: 'Million Dollar Club',
      description: 'Discovered $1M+ in funding',
      icon: <DollarSign className="w-6 h-6" />,
      unlocked: stats.totalValue >= 1000000,
      progress: Math.min(stats.totalValue / 1000000 * 100, 100),
      reward: '+100 XP'
    }
  ];

  const handleRefresh = () => {
    trackClick('refresh', 'dashboard-refresh-button');
    setExcitement(excitement + 1);
    setPulseEffect(true);
    setTimeout(() => setPulseEffect(false), 1000);
    refetch();
    addXP(5, 'refreshing opportunities');
    
    // Random bonus for frequent refreshing
    if (Math.random() > 0.7) {
      addCredits(25, 'lucky refresh bonus!');
    }
  };

  const handleOpportunityClick = (opportunity: any) => {
    trackClick('view_opportunity', `opportunity-${opportunity.title.substring(0, 20)}`);
    trackAction('opportunity_viewed');
    addXP(3, 'viewing opportunity details');
    
    // Simulate showing opportunity details
    setTimeout(() => {
      if (Math.random() > 0.8) {
        addCredits(10, 'detailed opportunity review');
      }
    }, 2000);
  };

  const handleQuickApply = (opportunity: any) => {
    trackClick('quick_apply', `apply-${opportunity.title.substring(0, 20)}`);
    trackAction('quick_apply_initiated');
    addXP(15, 'starting application process');
    addCredits(50, 'application initiative');
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `$${(amount/1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount/1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with user behavior tracking */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Granada OS
          </h1>
          <div className="flex justify-center items-center flex-wrap gap-4 text-white">
            <motion.div 
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full"
              animate={{ 
                scale: behavior.streak >= 7 ? [1, 1.1, 1] : 1,
                boxShadow: isAddicted ? ["0 0 0 0 rgba(251, 146, 60, 0.7)", "0 0 0 10px rgba(251, 146, 60, 0)", "0 0 0 0 rgba(251, 146, 60, 0)"] : "none"
              }}
              transition={{ repeat: behavior.streak >= 7 ? Infinity : 0, duration: 2 }}
            >
              <Flame className="w-5 h-5" />
              <span className="font-bold">{behavior.streak} Day Streak!</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-full"
              animate={{ scale: behavior.clicks > 50 ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: behavior.clicks > 50 ? Infinity : 0, duration: 3 }}
            >
              <MousePointer className="w-5 h-5" />
              <span>{behavior.clicks} clicks</span>
            </motion.div>
            
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-500 px-4 py-2 rounded-full">
              <Crown className="w-5 h-5" />
              <span>Level {behavior.level}</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full">
              <Star className="w-5 h-5" />
              <span>{behavior.xp} XP</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 rounded-full">
              <Gift className="w-5 h-5" />
              <span>{behavior.credits} Credits</span>
            </div>
            
            <motion.button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-4 py-2 rounded-full transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={pulseEffect ? { scale: [1, 1.2, 1] } : {}}
            >
              <RefreshCcw className="w-5 h-5" />
              <span>Refresh Magic</span>
            </motion.button>
          </div>
          
          {/* Addiction status */}
          {isAddicted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400 rounded-full px-6 py-2 inline-block"
            >
              <span className="text-red-300 font-semibold flex items-center">
                <Heart className="w-4 h-4 mr-2 animate-pulse" />
                You're becoming addicted to success! 🔥
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards with Click Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-2xl cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              trackClick('view_stat', 'live-opportunities-card');
              addXP(2, 'checking live opportunities');
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Live Opportunities</p>
                <motion.p 
                  className="text-4xl font-bold"
                  key={stats.total}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {stats.total}
                </motion.p>
                <motion.p 
                  className="text-green-200 text-xs mt-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Click for details!
                </motion.p>
              </div>
              <div className="relative">
                <Target className="w-12 h-12 text-green-200" />
                {stats.recentCount > 0 && (
                  <motion.div 
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    {stats.recentCount}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Value</p>
                <motion.p 
                  className="text-4xl font-bold"
                  key={stats.totalValue}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {formatMoney(stats.totalValue)}
                </motion.p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-200" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Avg Grant Size</p>
                <p className="text-4xl font-bold">{formatMoney(stats.avgAmount)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-r from-pink-400 to-pink-600 rounded-2xl p-6 text-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Countries</p>
                <p className="text-4xl font-bold">{Object.keys(stats.countries).length}</p>
              </div>
              <Users className="w-12 h-12 text-pink-200" />
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Award className="w-6 h-6 mr-2" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20' 
                    : 'bg-gray-700/50 border-gray-600'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}>
                    {achievement.icon}
                  </div>
                  <div>
                    <p className={`font-semibold ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {achievement.title}
                    </p>
                    {achievement.unlocked && achievement.reward && (
                      <p className="text-green-400 text-sm">{achievement.reward}</p>
                    )}
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2">{achievement.description}</p>
                {achievement.progress !== undefined && (
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Live Opportunities Feed */}
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Sparkles className="w-6 h-6 mr-2" />
              Live Opportunities Feed
            </h2>
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Updates</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-12">
              <motion.div 
                className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-white mt-4 text-lg">Loading fresh opportunities...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {opportunities.slice(0, 8).map((opportunity: any, index: number) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
                    onClick={() => handleOpportunityClick(opportunity)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <motion.div 
                            className="w-2 h-2 bg-green-400 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                          <span className="text-green-400 text-sm font-medium">LIVE</span>
                          <span className="text-gray-400 text-sm">
                            {formatDistanceToNow(new Date(opportunity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-1">{opportunity.title}</h3>
                        <p className="text-gray-300 text-sm mb-2 line-clamp-2">{opportunity.description}</p>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            {opportunity.sector}
                          </span>
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            {opportunity.country}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                          {formatMoney(opportunity.amountMax)}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickApply(opportunity);
                          }}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm mt-2 hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-1 transform hover:scale-105"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Quick Apply</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AddictiveDashboard;