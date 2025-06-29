import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target, Users, Calendar, Award, Activity, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const AnalyticsPage = () => {
  const [searchParams] = useSearchParams();
  const analyticsType = searchParams.get('type') || 'overview';

  // Fetch analytics data from database
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/analytics', analyticsType],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?type=${analyticsType}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  // Notify admin of analytics access
  useEffect(() => {
    fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'analytics_access',
        analytics_type: analyticsType,
        timestamp: new Date().toISOString(),
        user_id: 'demo_user'
      })
    }).catch(console.error);
  }, [analyticsType]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
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

  const sampleData = analyticsData || {
    overview: {
      totalFunding: '$12.5M',
      activeOpportunities: 47,
      successRate: '89.2%',
      avgProcessingTime: '14 days'
    },
    monthlyData: [
      { month: 'Jan', applications: 12, success: 8, funding: 2.1 },
      { month: 'Feb', applications: 15, success: 11, funding: 3.2 },
      { month: 'Mar', applications: 18, success: 14, funding: 4.1 },
      { month: 'Apr', applications: 22, success: 19, funding: 5.8 },
      { month: 'May', applications: 16, success: 13, funding: 3.9 },
      { month: 'Jun', applications: 25, success: 21, funding: 6.2 }
    ],
    sectorData: [
      { name: 'Healthcare', value: 35, funding: 4.2 },
      { name: 'Education', value: 28, funding: 3.1 },
      { name: 'Environment', value: 20, funding: 2.8 },
      { name: 'Technology', value: 17, funding: 1.9 }
    ],
    performanceMetrics: {
      responseTime: '2.3s',
      userSatisfaction: '94.7%',
      systemUptime: '99.8%',
      dataAccuracy: '97.2%'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Comprehensive insights into your funding opportunities and performance
          </p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(sampleData.overview).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  {key === 'totalFunding' && <DollarSign className="w-6 h-6 text-blue-600" />}
                  {key === 'activeOpportunities' && <Target className="w-6 h-6 text-green-600" />}
                  {key === 'successRate' && <TrendingUp className="w-6 h-6 text-purple-600" />}
                  {key === 'avgProcessingTime' && <Calendar className="w-6 h-6 text-orange-600" />}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{value}</h3>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Monthly Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sampleData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={3} />
                <Line type="monotone" dataKey="success" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Sector Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-green-600" />
              Sector Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sampleData.sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sampleData.sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Funding by Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Funding Secured by Month (Millions $)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sampleData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Legend />
              <Bar dataKey="funding" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            System Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(sampleData.performanceMetrics).map(([key, value], index) => (
              <div key={key} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;