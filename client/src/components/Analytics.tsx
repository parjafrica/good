import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('6months');
  const [isLoading, setIsLoading] = useState(false);

  const metrics: MetricCard[] = [
    {
      id: 'success-rate',
      title: 'Grant Success Rate',
      value: '89%',
      change: 12,
      changeType: 'increase',
      icon: <Target className="w-6 h-6" />,
      color: 'green'
    },
    {
      id: 'avg-grant-size',
      title: 'Average Grant Size',
      value: '$125K',
      change: 8,
      changeType: 'increase',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'blue'
    },
    {
      id: 'proposal-completion',
      title: 'Proposal Completion Time',
      value: '14 days',
      change: -3,
      changeType: 'decrease',
      icon: <Calendar className="w-6 h-6" />,
      color: 'purple'
    },
    {
      id: 'donor-engagement',
      title: 'Donor Engagement Score',
      value: '94%',
      change: 5,
      changeType: 'increase',
      icon: <Users className="w-6 h-6" />,
      color: 'orange'
    }
  ];

  const fundingTrends: ChartData[] = [
    { label: 'Jan', value: 150000, color: '#3b82f6' },
    { label: 'Feb', value: 200000, color: '#3b82f6' },
    { label: 'Mar', value: 180000, color: '#3b82f6' },
    { label: 'Apr', value: 250000, color: '#3b82f6' },
    { label: 'May', value: 300000, color: '#3b82f6' },
    { label: 'Jun', value: 280000, color: '#3b82f6' }
  ];

  const proposalsByStatus: ChartData[] = [
    { label: 'Approved', value: 45, color: '#22c55e' },
    { label: 'Pending', value: 25, color: '#f59e0b' },
    { label: 'In Review', value: 20, color: '#3b82f6' },
    { label: 'Rejected', value: 10, color: '#ef4444' }
  ];

  const donorTypes: ChartData[] = [
    { label: 'Foundations', value: 40, color: '#8b5cf6' },
    { label: 'Government', value: 30, color: '#06b6d4' },
    { label: 'Corporate', value: 20, color: '#f97316' },
    { label: 'Individual', value: 10, color: '#ec4899' }
  ];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'decrease':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-400';
      case 'decrease':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'bg-green-600/20 text-green-400',
      blue: 'bg-blue-600/20 text-blue-400',
      purple: 'bg-purple-600/20 text-purple-400',
      orange: 'bg-orange-600/20 text-orange-400'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const exportReport = () => {
    console.log('Exporting analytics report...');
    alert('Analytics report exported successfully!');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'funding', label: 'Funding Analysis' },
    { id: 'proposals', label: 'Proposal Performance' },
    { id: 'donors', label: 'Donor Insights' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-700/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses(metric.color)}`}>
                {metric.icon}
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
                {getChangeIcon(metric.changeType)}
                <span className="text-sm font-medium">{Math.abs(metric.change)}%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
            <p className="text-slate-400 text-sm">{metric.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funding Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-700/30 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Funding Trends</h3>
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 50}
                  x2="400"
                  y2={i * 50}
                  stroke="rgb(71 85 105 / 0.3)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Bars */}
              {fundingTrends.map((item, index) => {
                const barHeight = (item.value / 300000) * 150;
                const x = index * 60 + 30;
                return (
                  <motion.rect
                    key={item.label}
                    x={x}
                    y={200 - barHeight}
                    width="40"
                    height={barHeight}
                    fill={item.color}
                    initial={{ height: 0, y: 200 }}
                    animate={{ height: barHeight, y: 200 - barHeight }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                );
              })}
              
              {/* Labels */}
              {fundingTrends.map((item, index) => (
                <text
                  key={`label-${item.label}`}
                  x={index * 60 + 50}
                  y="190"
                  fill="rgb(148 163 184)"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              ))}
            </svg>
          </div>
        </motion.div>

        {/* Proposal Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-700/30 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Proposal Status</h3>
          <div className="space-y-4">
            {proposalsByStatus.map((item, index) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderFunding = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Funding Analysis</h3>
        <p className="text-slate-400">Detailed breakdown of your funding performance</p>
      </div>
      
      <div className="bg-slate-700/30 rounded-xl p-8 text-center">
        <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-white mb-2">Advanced Funding Analytics</h4>
        <p className="text-slate-400">Detailed funding analysis dashboard coming soon</p>
      </div>
    </div>
  );

  const renderProposals = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Proposal Performance</h3>
        <p className="text-slate-400">Track your proposal success metrics and trends</p>
      </div>
      
      <div className="bg-slate-700/30 rounded-xl p-8 text-center">
        <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-white mb-2">Proposal Analytics</h4>
        <p className="text-slate-400">Comprehensive proposal performance metrics coming soon</p>
      </div>
    </div>
  );

  const renderDonors = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Donor Insights</h3>
        <p className="text-slate-400">Understand your donor relationships and patterns</p>
      </div>
      
      <div className="bg-slate-700/30 rounded-xl p-8 text-center">
        <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-white mb-2">Donor Analytics</h4>
        <p className="text-slate-400">Advanced donor relationship analytics coming soon</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-600/20 rounded-xl">
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-slate-300">Track performance and gain insights</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'funding' && renderFunding()}
        {activeTab === 'proposals' && renderProposals()}
        {activeTab === 'donors' && renderDonors()}
      </motion.div>
    </div>
  );
};

export default Analytics;