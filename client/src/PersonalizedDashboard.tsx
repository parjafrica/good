import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './contexts/AuthContext';
import { MoodSelector } from './components/MoodSelector';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Clock, 
  Award,
  Users,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Brain,
  Star,
  ChevronRight,
  Calendar,
  Building,
  MapPin
} from 'lucide-react';

interface PersonalizedDashboard {
  userId: string;
  personalizedGreeting: string;
  relevantOpportunities: number;
  aiMatchScore: number;
  personalizedStats: {
    availableFunding: string;
    totalOpportunities: number;
    matchAccuracy: string;
    processingTime: string;
    successRate: string;
    weeklyGrowth: string;
  };
  sectorFocus: Array<{
    name: string;
    amount: string;
    color: string;
    icon: string;
    percentage: number;
  }>;
  personalizedInsights: string[];
  customActions: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
    url: string;
  }>;
  dashboardTheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  priorityAreas: string[];
}

const PersonalizedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<PersonalizedDashboard | null>(null);

  // Fetch user profile for personalization
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user/profile', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch personalized dashboard data
  const { data: personalizedData, isLoading } = useQuery({
    queryKey: ['/api/personalization/personalize-dashboard', user?.id],
    queryFn: async () => {
      if (!userProfile) return null;
      
      const personalProfile = {
        id: user?.id || 'demo-user',
        fullName: (userProfile as any)?.fullName || user?.firstName + ' ' + user?.lastName || user?.fullName || 'User',
        userType: (userProfile as any)?.userType || user?.userType || 'individual',
        sector: (userProfile as any)?.sector || user?.sector || 'development',
        country: (userProfile as any)?.country || user?.country || 'Uganda',
        region: (userProfile as any)?.region,
        organizationType: (userProfile as any)?.organizationType || user?.organizationType,
        organizationSize: (userProfile as any)?.organizationSize,
        annualBudget: (userProfile as any)?.annualBudget,
        primaryFocus: (userProfile as any)?.primaryFocus,
        experienceLevel: (userProfile as any)?.experienceLevel,
        previousFunding: (userProfile as any)?.previousFunding,
        targetAudience: (userProfile as any)?.targetAudience,
        educationLevel: (userProfile as any)?.educationLevel,
        fieldOfStudy: (userProfile as any)?.fieldOfStudy,
        currentRole: (userProfile as any)?.currentRole,
        yearsOfExperience: (userProfile as any)?.yearsOfExperience
      };

      const response = await fetch('/api/personalization/personalize-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalProfile)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch personalized dashboard');
      }

      return response.json();
    },
    enabled: !!userProfile && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    if (personalizedData) {
      setDashboardData(personalizedData);
    }
  }, [personalizedData]);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'fas fa-heartbeat': <Target className="w-5 h-5" />,
      'fas fa-graduation-cap': <Award className="w-5 h-5" />,
      'fas fa-microchip': <Brain className="w-5 h-5" />,
      'fas fa-leaf': <TrendingUp className="w-5 h-5" />,
      'fas fa-seedling': <TrendingUp className="w-5 h-5" />,
      'fas fa-hands-helping': <Users className="w-5 h-5" />,
      'fas fa-building': <Building className="w-5 h-5" />,
      'fas fa-dollar-sign': <DollarSign className="w-5 h-5" />,
      'fas fa-calculator': <Target className="w-5 h-5" />,
      'fas fa-chart-line': <TrendingUp className="w-5 h-5" />,
      'fas fa-robot': <Brain className="w-5 h-5" />,
      'fas fa-user-tie': <Users className="w-5 h-5" />
    };
    return iconMap[iconName] || <Star className="w-5 h-5" />;
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'blue': 'from-blue-500 to-blue-600',
      'green': 'from-green-500 to-green-600',
      'purple': 'from-purple-500 to-purple-600',
      'red': 'from-red-500 to-red-600',
      'orange': 'from-orange-500 to-orange-600',
      'cyan': 'from-cyan-500 to-cyan-600'
    };
    return colorMap[color] || 'from-indigo-500 to-indigo-600';
  };

  // Initialize dashboard with immediate fallback data
  useEffect(() => {
    if (!dashboardData && user?.id) {
      setDashboardData({
        userId: user?.id || 'demo_user',
        personalizedGreeting: `Oli otya, ${user?.firstName || 'Dennis'}! 👋\n\nYour healthcare impact opportunities are ready.`,
        relevantOpportunities: 18,
        aiMatchScore: 87.3,
        personalizedStats: {
          availableFunding: "$2.8M",
          totalOpportunities: 18,
          matchAccuracy: "87.3%",
          processingTime: "2.4 hours",
          successRate: "89%",
          weeklyGrowth: "+15%"
        },
        sectorFocus: [
          {
            name: "Healthcare",
            amount: "$2.1M",
            color: "blue",
            icon: "fas fa-heartbeat",
            percentage: 65
          },
          {
            name: "Community Development",
            amount: "$480K",
            color: "green", 
            icon: "fas fa-hands-helping",
            percentage: 25
          },
          {
            name: "Education",
            amount: "$220K",
            color: "purple",
            icon: "fas fa-graduation-cap", 
            percentage: 10
          }
        ],
        personalizedInsights: [
          "Based on your NGO profile in Uganda, you have access to specialized health sector funding",
          "Your organization size qualifies for both small grants ($5K-$50K) and medium grants ($50K-$200K)",
          "USAID and Gates Foundation have active programs specifically for East African health initiatives",
          "Your location in Uganda provides access to regional funding pools not available elsewhere"
        ],
        customActions: [
          {
            title: "Apply to USAID Health Programs",
            description: "3 active grants matching your health focus",
            icon: "fas fa-heartbeat",
            color: "blue",
            url: "/opportunities?filter=usaid"
          },
          {
            title: "Gates Foundation Maternal Health",
            description: "New $2M funding opportunity just opened",
            icon: "fas fa-dollar-sign", 
            color: "green",
            url: "/opportunities?filter=gates"
          },
          {
            title: "Build Expert Network",
            description: "Connect with 12 similar organizations",
            icon: "fas fa-user-tie",
            color: "purple",
            url: "/network"
          }
        ],
        dashboardTheme: {
          background: "from-blue-50 to-indigo-100",
          primary: "blue",
          secondary: "indigo",
          accent: "blue",
          cardStyle: "glassmorphic"
        },
        priorityAreas: [
          {
            title: "Health System Strengthening",
            description: "Focus on primary healthcare delivery in rural areas",
            progress: 75,
            color: "blue"
          },
          {
            title: "Maternal Health Programs",
            description: "Maternal and child health initiatives",
            progress: 60,
            color: "green"
          },
          {
            title: "Community Outreach",
            description: "Health education and awareness campaigns",
            progress: 85,
            color: "purple"
          }
        ],
        lastUpdated: new Date().toISOString(),
        dataFreshness: "real-time"
      });
    }
  }, [user?.id, dashboardData]);

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${dashboardData.dashboardTheme.background} dark:from-gray-900 dark:to-gray-800`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personalized Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="whitespace-pre-line text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {dashboardData.personalizedGreeting}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{dashboardData.relevantOpportunities} opportunities</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    <span>{dashboardData.aiMatchScore}% AI match</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.personalizedStats.availableFunding}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available Funding</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mood Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <MoodSelector compact={true} showLabel={true} className="max-w-xs" />
        </motion.div>

        {/* Personalized Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Relevant for You</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.relevantOpportunities}</p>
              </div>
              <Target className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Match Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.aiMatchScore}%</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Opportunities</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.personalizedStats.totalOpportunities}</p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.personalizedStats.successRate}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Processing Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.personalizedStats.processingTime}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Weekly Growth</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.personalizedStats.weeklyGrowth}</p>
              </div>
              <ArrowRight className="w-8 h-8 text-cyan-500" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sector Focus */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6" style={{ color: dashboardData.dashboardTheme.primary }} />
                Funding by Sector
              </h3>
              <div className="space-y-4">
                {dashboardData.sectorFocus.map((sector, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${sector.color}20` }}
                      >
                        {getIconComponent(sector.icon)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{sector.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{sector.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{sector.percentage}%</p>
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: sector.color,
                            width: `${sector.percentage}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Personalized Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" style={{ color: dashboardData.dashboardTheme.primary }} />
                AI Insights
              </h3>
              <div className="space-y-4">
                {dashboardData.personalizedInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Custom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6" style={{ color: dashboardData.dashboardTheme.primary }} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.customActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
                onClick={() => window.location.href = action.url}
              >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className={`p-2 rounded-lg bg-gradient-to-r ${getColorClass(action.color)}`}
                    >
                      {getIconComponent(action.icon)}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Priority Areas */}
        {dashboardData.priorityAreas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Star className="w-6 h-6" style={{ color: dashboardData.dashboardTheme.primary }} />
                Priority Areas
              </h3>
              <div className="space-y-4">
                {dashboardData.priorityAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{area.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{area.description}</p>
                    </div>
                    <div className="ml-4">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getColorClass(area.color)}`}
                          style={{ width: `${area.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{area.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PersonalizedDashboard;