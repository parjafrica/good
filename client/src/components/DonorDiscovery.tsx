import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, MapPin, Calendar, DollarSign, ExternalLink,
  Bookmark, BookmarkCheck, Send, Building, X, ArrowRight,
  Sparkles, RefreshCw, Database, AlertCircle, Bot, UserCheck, Coins
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ApplyButton from './DonorDiscovery/ApplyButton';
import ViewDetailsButton from './DonorDiscovery/ViewDetailsButton';

// Interfaces for the component's state
interface Donor {
  id: string;
  name: string;
  type: "foundation" | "government" | "corporate" | "multilateral" | "individual";
  country: string;
  website: string;
  description: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  fundingAmount: {
    min: number | null;
    max: number | null;
    currency: string;
  };
  source_url: string;
  source_name: string;
  country: string;
  is_verified: boolean;
  scraped_at: string;
  donor: Donor;
  status: 'open' | 'closed' | 'upcoming';
  eligibility: {
      countries: string[];
      sectors: string[];
      organizationTypes: string[];
  };
  focusAreas: string[];
  applicationProcess: string;
}

interface SearchFilters {
  query?: string;
  country?: string;
  sector?: string;
  min_amount?: number;
  verified_only?: boolean;
}

// API response structure
interface ApiOpportunity {
    id: string;
    title: string;
    description: string;
    deadline: string | null;
    amount_min: number | null;
    amount_max: number | null;
    currency: string;
    source_url: string;
    source_name: string;
    country: string;
    sector: string | null;
    is_verified: boolean;
    scraped_at: string;
}

const SimpleBotStatusPanel: React.FC<{
  isSearching: boolean;
  progress: number;
  stats: { totalResults: number } | null;
  onClose: () => void;
}> = ({ isSearching, progress, stats, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="fixed top-20 right-4 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 z-50 w-80"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-white font-medium">Search Status</h3>
      <button onClick={onClose} className="text-slate-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
    
    {isSearching && (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm">Searching...</span>
          <span className="text-slate-300 text-sm">{Math.round(progress)}%</span>
        </div>
        <div className="bg-slate-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )}
    
    {stats && (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Results Found:</span>
          <span className="text-white">{stats.totalResults}</span>
        </div>
      </div>
    )}
  </motion.div>
);

const DonorDiscovery: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [searchStats, setSearchStats] = useState<{ totalResults: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [showBotPanel, setShowBotPanel] = useState(false);
  const [applyingOpportunity, setApplyingOpportunity] = useState<Opportunity | null>(null);

  const navigate = useNavigate();

  const sectors = ['Education', 'Health', 'Environment', 'Human Rights', 'Economic Development', 'Technology', 'Agriculture', 'Water & Sanitation', 'Gender Equality', 'Climate Change'];
  const countries = ['Global', 'United States', 'United Kingdom', 'Germany', 'France', 'Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Uganda', 'Tanzania', 'Rwanda', 'Senegal', 'Mali', 'Ivory Coast', 'Cameroon', 'South Sudan'];

  const transformApiData = (apiData: ApiOpportunity): Opportunity => {
    // This function converts the flat API response to the nested structure the component expects.
    return {
      id: apiData.id,
      title: apiData.title,
      description: apiData.description,
      deadline: apiData.deadline,
      fundingAmount: {
        min: apiData.amount_min,
        max: apiData.amount_max,
        currency: apiData.currency || 'USD',
      },
      source_url: apiData.source_url,
      source_name: apiData.source_name,
      country: apiData.country,
      is_verified: apiData.is_verified,
      scraped_at: apiData.scraped_at,
      donor: {
        id: apiData.source_name, // Using source_name as a proxy for donor ID
        name: apiData.source_name,
        type: 'foundation', // Defaulting type, could be enhanced
        country: apiData.country,
        website: new URL(apiData.source_url).origin,
        description: `Funding opportunities from ${apiData.source_name}.`,
      },
      status: apiData.deadline && new Date(apiData.deadline) < new Date() ? 'closed' : 'open',
      eligibility: {
        countries: [apiData.country, 'Global'], // Placeholder
        sectors: apiData.sector ? [apiData.sector] : [], // Placeholder
        organizationTypes: ['NGO', 'Non-profit'], // Placeholder
      },
      focusAreas: apiData.sector ? [apiData.sector] : [], // Placeholder
      applicationProcess: `The application process is detailed on the official website. Please visit the source URL for more information.`, // Placeholder
    };
  };

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setIsSearching(true);
    setSearchProgress(0);

    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('query', searchQuery);
    if (filters.country) queryParams.append('country', filters.country);
    if (filters.sector) queryParams.append('sector', filters.sector);
    if (filters.min_amount) queryParams.append('min_amount', String(filters.min_amount));
    if (filters.verified_only) queryParams.append('verified_only', String(filters.verified_only));
    queryParams.append('limit', '100');

    // Simulate search progress
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => Math.min(prev + Math.random() * 10, 95));
    }, 300);

    try {
      const response = await fetch(`http://localhost:8000/api/search/opportunities?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      const transformedOpportunities = data.opportunities.map(transformApiData);
      setOpportunities(transformedOpportunities);
      setSearchStats({ totalResults: data.total });

    } catch (error) {
      console.error('Search error:', error);
      setOpportunities([]);
      setSearchStats({ totalResults: 0 });
    } finally {
      clearInterval(progressInterval);
      setSearchProgress(100);
      setTimeout(() => {
        setLoading(false);
        setIsSearching(false);
      }, 500);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleBookmark = (opportunityId: string) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(opportunityId)) newSet.delete(opportunityId);
      else newSet.add(opportunityId);
      return newSet;
    });
  };

  const handleViewDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetailModal(true);
  };

  const handleOpenApplyModal = (opportunity: Opportunity) => {
    setApplyingOpportunity(opportunity);
  };

  const handleGenerateProposal = () => {
    if (!applyingOpportunity) return;
    navigate('/proposal-generator', { 
      state: { 
        opportunityTitle: applyingOpportunity.title,
        donorName: applyingOpportunity.donor.name,
        description: applyingOpportunity.description,
        fundingAmount: applyingOpportunity.fundingAmount.max || applyingOpportunity.fundingAmount.min
      } 
    });
    setApplyingOpportunity(null);
  };

  const handleExpertAssistance = () => {
    if (!applyingOpportunity) return;
    navigate('/human-help', { 
      state: { 
        opportunityTitle: applyingOpportunity.title,
        donorName: applyingOpportunity.donor.name,
        description: applyingOpportunity.description,
        fundingAmount: applyingOpportunity.fundingAmount.max || applyingOpportunity.fundingAmount.min
      } 
    });
    setApplyingOpportunity(null);
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'upcoming': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'closed': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (deadline: string | null): string => {
    if (!deadline) return 'TBD';
    return new Date(deadline).toLocaleDateString();
  };

  // Apply Modal Component
  const ApplyModal: React.FC = () => (
    <AnimatePresence>
      {applyingOpportunity && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setApplyingOpportunity(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-md mx-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div>
                  <h3 className="text-xl font-bold text-white">Apply for Funding</h3>
                  <p className="text-slate-400 text-sm mt-1">{applyingOpportunity.donor.name}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setApplyingOpportunity(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-2">{applyingOpportunity.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Choose how you'd like to proceed with your application.
                  </p>
                </div>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => window.open(applyingOpportunity.source_url, '_blank')}
                    className="w-full flex items-center justify-between p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-xl transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600/30 rounded-lg"><Send className="w-5 h-5 text-blue-400" /></div>
                      <div className="text-left">
                        <div className="text-white font-medium">Direct Application</div>
                        <div className="text-blue-300 text-sm">Apply on their website</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleGenerateProposal}
                    className="w-full flex items-center justify-between p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-xl transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-600/30 rounded-lg"><Sparkles className="w-5 h-5 text-purple-400" /></div>
                      <div className="text-left">
                        <div className="text-white font-medium">Generate Proposal</div>
                        <div className="text-purple-300 text-sm">AI-powered proposal creation</div>
                        <div className="text-purple-200 text-xs mt-1">Cost: 25 credits</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleExpertAssistance}
                    className="w-full flex items-center justify-between p-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 rounded-xl transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-600/30 rounded-lg"><UserCheck className="w-5 h-5 text-emerald-400" /></div>
                      <div className="text-left">
                        <div className="text-white font-medium">Expert Assistance</div>
                        <div className="text-emerald-300 text-sm">Human expert help</div>
                        <div className="text-emerald-200 text-xs mt-1">Cost: 50 credits</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  const renderDetailModal = () => (
    <AnimatePresence>
      {showDetailModal && selectedOpportunity && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 z-[60] overflow-auto max-h-[90vh]"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedOpportunity.title}</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-blue-400 font-medium">{selectedOpportunity.donor.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOpportunity.status)}`}>
                      {selectedOpportunity.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleBookmark(selectedOpportunity.id)}
                    className={`p-2 rounded-lg transition-colors ${bookmarkedIds.has(selectedOpportunity.id) ? 'text-yellow-400 bg-yellow-400/20' : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/20'}`}
                  >
                    {bookmarkedIds.has(selectedOpportunity.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-700/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                      <p className="text-slate-300 leading-relaxed">{selectedOpportunity.description}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Application Process</h3>
                      <p className="text-slate-300 leading-relaxed">{selectedOpportunity.applicationProcess}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Eligibility</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-white font-medium mb-2">Countries</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedOpportunity.eligibility.countries.map((country, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm">{country}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-2">Sectors</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedOpportunity.eligibility.sectors.map((sector, index) => (
                              <span key={index} className="px-2 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm">{sector}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-slate-700/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Key Details</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Funding Range:</span>
                          <span className="text-white font-medium">
                            {formatCurrency(selectedOpportunity.fundingAmount.min, selectedOpportunity.fundingAmount.currency)} - {formatCurrency(selectedOpportunity.fundingAmount.max, selectedOpportunity.fundingAmount.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Deadline:</span>
                          <span className="text-white font-medium">{formatDate(selectedOpportunity.deadline)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleOpenApplyModal(selectedOpportunity)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Apply for Funding</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => window.open(selectedOpportunity.source_url, '_blank')}
                        className="w-full bg-slate-700/50 hover:bg-slate-700/70 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Visit Website</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Donor Discovery</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-slate-700/50 rounded-lg">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300 text-sm">{user?.credits || 0} credits</span>
              </div>
              {searchStats && (
                <div className="hidden md:flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">{searchStats.totalResults} results</span>
                  </div>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowBotPanel(!showBotPanel)}
                className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
              >
                <Bot className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBotPanel && (
          <SimpleBotStatusPanel
            isSearching={isSearching}
            progress={searchProgress}
            stats={searchStats}
            onClose={() => setShowBotPanel(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for funding opportunities..."
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${showFilters ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70'}`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center space-x-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </motion.button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-slate-700/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Sectors</label>
                    <select
                      value={filters.sector || ''}
                      onChange={(e) => handleFilterChange('sector', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">All Sectors</option>
                      {sectors.map(sector => <option key={sector} value={sector}>{sector}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Countries</label>
                    <select
                      value={filters.country || ''}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">All Countries</option>
                      {countries.map(country => <option key={country} value={country}>{country}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Min. Funding (USD)</label>
                    <input
                      type="number"
                      value={filters.min_amount || ''}
                      onChange={(e) => handleFilterChange('min_amount', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="e.g., 10000"
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-300">Searching for opportunities...</p>
            </div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No opportunities found</h3>
            <p className="text-slate-400">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{opportunity.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="text-blue-400 font-medium">{opportunity.donor.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status.toUpperCase()}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleBookmark(opportunity.id)}
                      className={`p-1.5 rounded-lg transition-colors ${bookmarkedIds.has(opportunity.id) ? 'text-yellow-400 bg-yellow-400/20' : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/20'}`}
                    >
                      {bookmarkedIds.has(opportunity.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">{opportunity.description}</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-slate-400 text-sm">Funding:</span>
                    </div>
                    <span className="text-white font-medium text-sm">
                      {formatCurrency(opportunity.fundingAmount.min, opportunity.fundingAmount.currency)} - {formatCurrency(opportunity.fundingAmount.max, opportunity.fundingAmount.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-400 text-sm">Deadline:</span>
                    </div>
                    <span className="text-white font-medium text-sm">{formatDate(opportunity.deadline)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-400 text-sm">Location:</span>
                    </div>
                    <span className="text-white font-medium text-sm">{opportunity.country}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <ViewDetailsButton onClick={() => handleViewDetails(opportunity)} className="flex-1" />
                  <ApplyButton onClick={() => handleOpenApplyModal(opportunity)} className="flex-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {renderDetailModal()}
      <ApplyModal />
    </div>
  );
};

export default DonorDiscovery;
