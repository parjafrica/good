import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  ExternalLink,
  FileText,
  Send,
  Award,
  Building,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Grant {
  id: string;
  title: string;
  donor: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  applicationDate: Date;
  decisionDate?: Date;
  disbursementDate?: Date;
  progress: number;
  nextMilestone?: string;
  donorWebsite?: string;
  contactEmail?: string;
  contactPhone?: string;
  applicationUrl?: string;
  description?: string;
}

interface FundingStats {
  totalSecured: number;
  totalPending: number;
  successRate: number;
  averageGrant: number;
}

const Funding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [stats] = useState<FundingStats>({
    totalSecured: 2300000,
    totalPending: 850000,
    successRate: 89,
    averageGrant: 125000
  });

  const [grants] = useState<Grant[]>([
    {
      id: '1',
      title: 'Youth Digital Skills Program',
      donor: 'Gates Foundation',
      amount: 500000,
      status: 'approved',
      applicationDate: new Date('2024-01-15'),
      decisionDate: new Date('2024-03-01'),
      disbursementDate: new Date('2024-03-15'),
      progress: 75,
      nextMilestone: 'Quarterly Report Due',
      donorWebsite: 'https://www.gatesfoundation.org',
      contactEmail: 'grants@gatesfoundation.org',
      contactPhone: '+1-206-709-3100',
      applicationUrl: 'https://www.gatesfoundation.org/how-we-work/general-information/grant-opportunities',
      description: 'Comprehensive digital literacy program for underserved youth communities'
    },
    {
      id: '2',
      title: 'Community Health Initiative',
      donor: 'USAID',
      amount: 350000,
      status: 'disbursed',
      applicationDate: new Date('2023-11-20'),
      decisionDate: new Date('2024-01-10'),
      disbursementDate: new Date('2024-02-01'),
      progress: 100,
      donorWebsite: 'https://www.usaid.gov',
      contactEmail: 'partnerships@usaid.gov',
      applicationUrl: 'https://www.usaid.gov/work-usaid/partnership-opportunities',
      description: 'Mobile health clinics and telemedicine services for rural communities'
    },
    {
      id: '3',
      title: 'Climate Resilience Project',
      donor: 'UN Climate Fund',
      amount: 750000,
      status: 'pending',
      applicationDate: new Date('2024-02-01'),
      progress: 0,
      nextMilestone: 'Decision Expected: March 30',
      donorWebsite: 'https://www.greenclimate.fund',
      contactEmail: 'info@gcfund.org',
      applicationUrl: 'https://www.greenclimate.fund/how-we-work/funding-projects',
      description: 'Building climate resilience in vulnerable coastal communities'
    },
    {
      id: '4',
      title: 'Women Empowerment Program',
      donor: 'Ford Foundation',
      amount: 200000,
      status: 'rejected',
      applicationDate: new Date('2024-01-05'),
      decisionDate: new Date('2024-02-15'),
      progress: 0,
      donorWebsite: 'https://www.fordfoundation.org',
      contactEmail: 'grants@fordfoundation.org',
      applicationUrl: 'https://www.fordfoundation.org/work/our-grants/apply-for-a-grant/',
      description: 'Economic empowerment and leadership development for women entrepreneurs'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'disbursed': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'rejected': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'disbursed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredGrants = grants.filter(grant => 
    selectedStatus === 'all' || grant.status === selectedStatus
  );

  const handleGrantClick = (grant: Grant) => {
    // Navigate to grant details or proposal manager
    navigate(`/proposals?grant=${grant.id}`);
  };

  const handleDonorWebsiteClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleContactClick = (type: 'email' | 'phone', contact: string) => {
    if (type === 'email') {
      window.open(`mailto:${contact}`, '_blank');
    } else {
      window.open(`tel:${contact}`, '_blank');
    }
  };

  const handleApplicationClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleCreateProposal = () => {
    navigate('/proposal-generator');
  };

  const handleFindDonors = () => {
    navigate('/donor-discovery');
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'grants', label: 'Grant Portfolio' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'reports', label: 'Reports' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleViewAnalytics}
          className="bg-slate-700/30 rounded-xl p-6 cursor-pointer hover:bg-slate-700/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-600/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-green-400 text-sm font-medium">+12.5%</div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {formatCurrency(stats.totalSecured)}
          </h3>
          <p className="text-slate-400">Total Secured</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/proposals')}
          className="bg-slate-700/30 rounded-xl p-6 cursor-pointer hover:bg-slate-700/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-600/20 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-yellow-400 text-sm font-medium">3 Active</div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {formatCurrency(stats.totalPending)}
          </h3>
          <p className="text-slate-400">Pending Decisions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleViewAnalytics}
          className="bg-slate-700/30 rounded-xl p-6 cursor-pointer hover:bg-slate-700/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-blue-400 text-sm font-medium">+5%</div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{stats.successRate}%</h3>
          <p className="text-slate-400">Success Rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleViewAnalytics}
          className="bg-slate-700/30 rounded-xl p-6 cursor-pointer hover:bg-slate-700/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-purple-400 text-sm font-medium">Avg</div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {formatCurrency(stats.averageGrant)}
          </h3>
          <p className="text-slate-400">Average Grant</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleCreateProposal}
          className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl text-left hover:border-blue-400/50 transition-all"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Create Proposal</h3>
              <p className="text-slate-400 text-sm">Generate AI-powered proposals</p>
            </div>
          </div>
          <div className="flex items-center text-blue-400 text-sm font-medium">
            <span>Start Writing</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleFindDonors}
          className="p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl text-left hover:border-green-400/50 transition-all"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-600/20 rounded-xl">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Find Donors</h3>
              <p className="text-slate-400 text-sm">Discover funding opportunities</p>
            </div>
          </div>
          <div className="flex items-center text-green-400 text-sm font-medium">
            <span>Search Now</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleViewAnalytics}
          className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl text-left hover:border-purple-400/50 transition-all"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">View Analytics</h3>
              <p className="text-slate-400 text-sm">Track performance metrics</p>
            </div>
          </div>
          <div className="flex items-center text-purple-400 text-sm font-medium">
            <span>View Dashboard</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </div>
        </motion.button>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-700/30 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Recent Funding Activity</h3>
        <div className="space-y-4">
          {grants.slice(0, 3).map((grant, index) => (
            <motion.div
              key={grant.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleGrantClick(grant)}
              className="flex items-center space-x-4 p-4 bg-slate-600/30 rounded-xl cursor-pointer hover:bg-slate-600/50 transition-all"
            >
              <div className="p-2 bg-slate-500/50 rounded-lg">
                {getStatusIcon(grant.status)}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">{grant.title}</h4>
                <p className="text-slate-400 text-sm">{grant.donor} • {formatCurrency(grant.amount)}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(grant.status)}`}>
                {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderGrants = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/analytics')}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleCreateProposal}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Application</span>
          </motion.button>
        </div>
      </div>

      {/* Grants List */}
      <div className="space-y-4">
        {filteredGrants.map((grant, index) => (
          <motion.div
            key={grant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-700/30 rounded-xl p-6 hover:bg-slate-700/40 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <motion.h3
                    whileHover={{ color: '#60a5fa' }}
                    onClick={() => handleGrantClick(grant)}
                    className="text-xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors"
                  >
                    {grant.title}
                  </motion.h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(grant.status)}`}>
                    {getStatusIcon(grant.status)}
                    <span>{grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleDonorWebsiteClick(grant.donorWebsite!)}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Building className="w-4 h-4" />
                    <span className="font-medium">{grant.donor}</span>
                    <ExternalLink className="w-3 h-3" />
                  </motion.button>
                </div>

                {grant.description && (
                  <p className="text-slate-400 mb-3">{grant.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-white font-medium ml-2">{formatCurrency(grant.amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Applied:</span>
                    <span className="text-white font-medium ml-2">{grant.applicationDate.toLocaleDateString()}</span>
                  </div>
                  {grant.decisionDate && (
                    <div>
                      <span className="text-slate-400">Decision:</span>
                      <span className="text-white font-medium ml-2">{grant.decisionDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {grant.contactEmail && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleContactClick('email', grant.contactEmail!)}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
                    >
                      <Mail className="w-3 h-3" />
                      <span className="text-xs">Contact</span>
                    </motion.button>
                  )}
                  {grant.contactPhone && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleContactClick('phone', grant.contactPhone!)}
                      className="flex items-center space-x-2 px-3 py-1 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-600/30 transition-all"
                    >
                      <Phone className="w-3 h-3" />
                      <span className="text-xs">Call</span>
                    </motion.button>
                  )}
                  {grant.applicationUrl && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleApplicationClick(grant.applicationUrl!)}
                      className="flex items-center space-x-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all"
                    >
                      <Send className="w-3 h-3" />
                      <span className="text-xs">Apply</span>
                    </motion.button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleGrantClick(grant)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/proposal-generator')}
                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-600/20 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {grant.status === 'approved' && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Implementation Progress</span>
                  <span className="text-white font-medium text-sm">{grant.progress}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${grant.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
                {grant.nextMilestone && (
                  <p className="text-slate-400 text-sm mt-2">Next: {grant.nextMilestone}</p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPipeline = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Funding Pipeline</h3>
        <p className="text-slate-400">Track your funding opportunities from application to disbursement</p>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={handleFindDonors}
        className="w-full bg-slate-700/30 rounded-xl p-8 text-center hover:bg-slate-700/50 transition-all"
      >
        <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-white mb-2">Pipeline Visualization</h4>
        <p className="text-slate-400 mb-4">Interactive pipeline chart coming soon</p>
        <div className="flex items-center justify-center text-blue-400 font-medium">
          <span>Explore Opportunities</span>
          <ExternalLink className="w-4 h-4 ml-2" />
        </div>
      </motion.button>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Funding Reports</h3>
        <p className="text-slate-400">Generate detailed reports on your funding performance</p>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={handleViewAnalytics}
        className="w-full bg-slate-700/30 rounded-xl p-8 text-center hover:bg-slate-700/50 transition-all"
      >
        <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-white mb-2">Report Generator</h4>
        <p className="text-slate-400 mb-4">Custom reporting tools coming soon</p>
        <div className="flex items-center justify-center text-purple-400 font-medium">
          <span>View Analytics</span>
          <ExternalLink className="w-4 h-4 ml-2" />
        </div>
      </motion.button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <div className="p-3 bg-green-600/20 rounded-xl">
          <DollarSign className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Funding Management</h1>
          <p className="text-slate-300">Track and manage your grant portfolio</p>
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
        {activeTab === 'grants' && renderGrants()}
        {activeTab === 'pipeline' && renderPipeline()}
        {activeTab === 'reports' && renderReports()}
      </motion.div>
    </div>
  );
};

export default Funding;