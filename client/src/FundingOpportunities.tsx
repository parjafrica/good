import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Globe, 
  DollarSign, 
  Calendar, 
  Building, 
  MapPin, 
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  TrendingUp,
  Target,
  Users,
  Award,
  Zap,
  Eye,
  Heart
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface FundingOpportunity {
  id: string;
  title: string;
  description: string;
  amountMin: number;
  amountMax: number;
  currency: string;
  deadline: string | null;
  sourceUrl: string;
  sourceName: string;
  country: string;
  sector: string;
  eligibilityCriteria: string;
  applicationProcess: string;
  keywords: string[];
  focusAreas: string[];
  isVerified: boolean;
  verificationScore: number;
  createdAt: string;
}

const FundingOpportunities: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [amountRange, setAmountRange] = useState('all');
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);

  // Fetch funding opportunities from database
  const { data: opportunities = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/opportunities'],
    refetchInterval: 30000, // Refresh every 30 seconds for live updates
  });

  // Save/unsave opportunity mutation
  const saveMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const response = await fetch('/api/opportunities/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, userId: user?.id }),
      });
      if (!response.ok) throw new Error('Failed to save opportunity');
      return response.json();
    },
    onSuccess: (data, opportunityId) => {
      if (savedOpportunities.includes(opportunityId)) {
        setSavedOpportunities(prev => prev.filter(id => id !== opportunityId));
      } else {
        setSavedOpportunities(prev => [...prev, opportunityId]);
      }
    },
  });

  // Filter opportunities based on search criteria
  const filteredOpportunities = opportunities.filter((opp: FundingOpportunity) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSector = selectedSector === 'all' || opp.sector.toLowerCase() === selectedSector.toLowerCase();
    const matchesCountry = selectedCountry === 'all' || opp.country.toLowerCase() === selectedCountry.toLowerCase();
    
    let matchesAmount = true;
    if (amountRange !== 'all') {
      const [min, max] = amountRange.split('-').map(Number);
      matchesAmount = opp.amountMin >= min && (max === 0 || opp.amountMax <= max);
    }
    
    return matchesSearch && matchesSector && matchesCountry && matchesAmount;
  });

  const formatAmount = (min: number, max: number, currency: string) => {
    if (min === max) {
      return `${currency} ${min.toLocaleString()}`;
    }
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'Rolling deadline';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Deadline passed';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getDeadlineColor = (deadline: string | null) => {
    if (!deadline) return 'text-blue-400';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-400';
    if (diffDays <= 7) return 'text-orange-400';
    if (diffDays <= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  const handleApply = (opportunity: FundingOpportunity) => {
    navigate('/proposal-generator', { state: { opportunity } });
  };

  const uniqueSectors = [...new Set(opportunities.map((opp: FundingOpportunity) => opp.sector))];
  const uniqueCountries = [...new Set(opportunities.map((opp: FundingOpportunity) => opp.country))];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Funding Opportunities</h1>
              <p className="text-gray-400">Discover funding opportunities tailored to your needs</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Opportunities</p>
                  <p className="text-2xl font-bold text-white">{opportunities.length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Available Funding</p>
                  <p className="text-2xl font-bold text-white">
                    ${opportunities.reduce((sum: number, opp: FundingOpportunity) => sum + opp.amountMax, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Sectors</p>
                  <p className="text-2xl font-bold text-white">{uniqueSectors.length}</p>
                </div>
                <Building className="w-8 h-8 text-purple-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Global Coverage</p>
                  <p className="text-2xl font-bold text-white">{uniqueCountries.length}</p>
                </div>
                <Globe className="w-8 h-8 text-orange-500" />
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sectors</option>
                {uniqueSectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
              
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              
              <select
                value={amountRange}
                onChange={(e) => setAmountRange(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Amounts</option>
                <option value="0-10000">Under $10K</option>
                <option value="10000-50000">$10K - $50K</option>
                <option value="50000-100000">$50K - $100K</option>
                <option value="100000-500000">$100K - $500K</option>
                <option value="500000-0">$500K+</option>
              </select>
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full p-8 text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading opportunities...</p>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="col-span-full p-8 text-center">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Opportunities Found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search filters or check back later for new opportunities.</p>
              </div>
            ) : (
              filteredOpportunities.map((opportunity: FundingOpportunity) => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                          {opportunity.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {opportunity.sourceName}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {opportunity.country}
                          </div>
                          {opportunity.isVerified && (
                            <div className="flex items-center gap-1 text-green-400">
                              <Award className="w-4 h-4" />
                              Verified
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => saveMutation.mutate(opportunity.id)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        {savedOpportunities.includes(opportunity.id) ? (
                          <BookmarkCheck className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {opportunity.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                        {opportunity.sector}
                      </span>
                      {opportunity.focusAreas.slice(0, 2).map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                          {area}
                        </span>
                      ))}
                    </div>

                    {/* Amount and Deadline */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-green-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">
                          {formatAmount(opportunity.amountMin, opportunity.amountMax, opportunity.currency)}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 ${getDeadlineColor(opportunity.deadline)}`}>
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDeadline(opportunity.deadline)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApply(opportunity)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Generate Proposal
                      </motion.button>
                      <a
                        href={opportunity.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingOpportunities;