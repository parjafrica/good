import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, MapPin, DollarSign, Calendar, Globe, Target, 
  Zap, TrendingUp, Star, Heart, Bookmark, Share2, RefreshCw,
  ChevronDown, ChevronRight, BarChart3, Users, Award, Sparkles,
  Eye, Clock, ArrowRight, Plus, Coins, Flame, Lightbulb,
  MousePointer, ThumbsUp, MessageCircle, Settings, SortAsc
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { apiRequest } from './lib/queryClient';

interface SmartOpportunity {
  id: string;
  title: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  country: string;
  sector: string;
  fundingAmount: string;
  deadline: string;
  eligibility: string;
  requirements: string[];
  tags: string[];
  matchScore: number;
  trending: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  successRate: number;
  applicantCount: number;
  averageAmount: number;
  quickApply: boolean;
  verified: boolean;
  aiSuggestions: string[];
  relatedOpportunities: string[];
  estimatedTime: string;
  competitionLevel: number;
  fundingType: string;
}

interface SearchMetrics {
  totalSearches: number;
  creditsConsumed: number;
  opportunitiesViewed: number;
  timeSpent: number;
  clicksToday: number;
  streak: number;
}

const DonorDiscovery: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState(location.state?.query || '');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedOpportunity, setSelectedOpportunity] = useState<SmartOpportunity | null>(null);
  const [searchMetrics, setSearchMetrics] = useState<SearchMetrics>({
    totalSearches: 0,
    creditsConsumed: 0,
    opportunitiesViewed: 0,
    timeSpent: 0,
    clicksToday: 0,
    streak: 0
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [recentViews, setRecentViews] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Track user engagement and consumption
  const trackInteraction = useMutation({
    mutationFn: async (action: { type: string; credits: number; data?: any }) => {
      return apiRequest('/api/interactions/track', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          action: action.type,
          creditsUsed: action.credits,
          metadata: action.data,
          timestamp: new Date().toISOString()
        })
      });
    },
    onSuccess: () => {
      // Update metrics silently
      setSearchMetrics(prev => ({
        ...prev,
        creditsConsumed: prev.creditsConsumed + 1,
        clicksToday: prev.clicksToday + 1
      }));
    }
  });

  // Enhanced search with backend processing
  const searchMutation = useMutation({
    mutationFn: async (params: any) => {
      setIsSearching(true);
      trackInteraction.mutate({ type: 'search', credits: 3, data: params });
      
      const response = await apiRequest('/api/opportunities/smart-search', {
        method: 'POST',
        body: JSON.stringify({
          query: params.query,
          filters: params.filters,
          userId: user?.id,
          location: params.location,
          preferences: user?.preferences,
          aiEnhanced: true
        })
      });
      
      return response;
    },
    onSuccess: (data) => {
      setIsSearching(false);
      setSearchMetrics(prev => ({
        ...prev,
        totalSearches: prev.totalSearches + 1,
        opportunitiesViewed: prev.opportunitiesViewed + data.length
      }));
    },
    onError: () => setIsSearching(false)
  });

  // Get smart recommendations
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['/api/opportunities/smart-discovery', searchQuery, activeFilters, sortBy],
    queryFn: () => {
      if (searchQuery || Object.keys(activeFilters).length > 0) {
        return searchMutation.mutateAsync({
          query: searchQuery,
          filters: activeFilters,
          sortBy: sortBy,
          location: user?.country
        });
      }
      return apiRequest('/api/opportunities/trending');
    },
    enabled: true
  });

  // Auto-refresh for real-time updates
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries(['/api/opportunities/smart-discovery']);
        trackInteraction.mutate({ type: 'auto_refresh', credits: 1 });
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, queryClient]);

  // Smart search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery) {
      searchTimeoutRef.current = setTimeout(() => {
        searchMutation.mutate({
          query: searchQuery,
          filters: activeFilters,
          sortBy: sortBy
        });
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Enhanced click tracking for every interaction
  const handleOpportunityClick = (opportunity: SmartOpportunity, action: string) => {
    trackInteraction.mutate({ 
      type: `opportunity_${action}`, 
      credits: action === 'view' ? 2 : action === 'apply' ? 5 : 1,
      data: { opportunityId: opportunity.id, title: opportunity.title }
    });
    
    if (action === 'view') {
      setSelectedOpportunity(opportunity);
      setRecentViews(prev => [opportunity.id, ...prev.slice(0, 9)]);
    }
  };

  // Smart filtering with credit consumption
  const handleFilterChange = (filterType: string, value: any) => {
    trackInteraction.mutate({ 
      type: 'filter_change', 
      credits: 1, 
      data: { filterType, value } 
    });
    
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Interactive engagement features
  const handleFavorite = (opportunityId: string) => {
    trackInteraction.mutate({ 
      type: 'favorite', 
      credits: 1, 
      data: { opportunityId } 
    });
    
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(opportunityId)) {
        newSet.delete(opportunityId);
      } else {
        newSet.add(opportunityId);
      }
      return newSet;
    });
  };

  const handleShare = (opportunity: SmartOpportunity) => {
    trackInteraction.mutate({ 
      type: 'share', 
      credits: 2, 
      data: { opportunityId: opportunity.id }
    });
    
    navigator.share?.({
      title: opportunity.title,
      text: opportunity.description,
      url: window.location.href
    });
  };

  // Advanced search options that consume credits
  const AdvancedSearchPanel = () => (
    <AnimatePresence>
      {showAdvancedSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Funding Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min ($)"
                  className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max ($)"
                  className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
              <select
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                onChange={(e) => handleFilterChange('deadline', e.target.value)}
              >
                <option value="">Any time</option>
                <option value="7">Next 7 days</option>
                <option value="30">Next 30 days</option>
                <option value="90">Next 3 months</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">Any difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {['Quick Apply', 'Verified Only', 'High Success Rate', 'Trending', 'Recently Added'].map((tag) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleFilterChange('tags', tag)}
                className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm hover:bg-blue-600/30 transition-colors"
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Enhanced opportunity card with multiple interaction points
  const OpportunityCard = ({ opportunity }: { opportunity: SmartOpportunity }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer backdrop-blur-sm"
      onClick={() => handleOpportunityClick(opportunity, 'view')}
    >
      {/* Header with multiple interactive elements */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {opportunity.trending && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                <Flame className="w-3 h-3" />
                Trending
              </div>
            )}
            {opportunity.verified && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                <Star className="w-3 h-3" />
                Verified
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
              <Target className="w-3 h-3" />
              {opportunity.matchScore}% Match
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{opportunity.title}</h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{opportunity.description}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite(opportunity.id);
            }}
            className={`p-2 rounded-lg transition-colors ${
              favoriteIds.has(opportunity.id) 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-gray-700/50 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
            }`}
          >
            <Heart className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleShare(opportunity);
            }}
            className="p-2 bg-gray-700/50 text-gray-400 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Interactive info grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpportunityClick(opportunity, 'funding_info');
          }}
          className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors cursor-pointer"
        >
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-sm text-white">{opportunity.fundingAmount}</span>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpportunityClick(opportunity, 'deadline_info');
          }}
          className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-white">{opportunity.deadline}</span>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpportunityClick(opportunity, 'location_info');
          }}
          className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white">{opportunity.country}</span>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpportunityClick(opportunity, 'sector_info');
          }}
          className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer"
        >
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white">{opportunity.sector}</span>
        </motion.div>
      </div>

      {/* Success metrics */}
      <div className="flex justify-between items-center mb-4">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpportunityClick(opportunity, 'success_rate');
          }}
          className="flex items-center gap-1 cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300">{opportunity.successRate}% success</span>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpportunityClick(opportunity, 'competition');
          }}
          className="flex items-center gap-1 cursor-pointer"
        >
          <Users className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-300">{opportunity.applicantCount} applicants</span>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpportunityClick(opportunity, 'quick_apply');
          }}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Quick Apply
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpportunityClick(opportunity, 'view_details');
          }}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Details
        </motion.button>
      </div>

      {/* Suggestions (high credit consumption) */}
      {opportunity.aiSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Smart Suggestions</span>
          </div>
          <div className="space-y-1">
            {opportunity.aiSuggestions.slice(0, 2).map((suggestion, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpportunityClick(opportunity, 'suggestion_click');
                }}
                className="text-xs text-gray-300 cursor-pointer hover:text-white transition-colors"
              >
                • {suggestion}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced header with metrics */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Opportunity Discovery</h1>
              <div className="hidden md:flex items-center space-x-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => trackInteraction.mutate({ type: 'metrics_view', credits: 1 })}
                  className="flex items-center space-x-2 px-3 py-1 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors"
                >
                  <MousePointer className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 text-sm">{searchMetrics.clicksToday} clicks today</span>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 px-3 py-1 bg-slate-700/50 rounded-lg cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-300 text-sm">{searchMetrics.streak} day streak</span>
                </motion.div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-slate-700/50 rounded-lg">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300 text-sm">{user?.credits || 0} credits</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setAutoRefresh(!autoRefresh);
                  trackInteraction.mutate({ type: 'toggle_refresh', credits: 1 });
                }}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-green-600/20 text-green-400' : 'bg-gray-700/50 text-gray-400'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced search interface */}
        <div className="mb-8">
          <div className="relative group mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
            <div className="relative bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700">
              <input
                type="text"
                placeholder="Discover funding opportunities, grants, scholarships..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  trackInteraction.mutate({ type: 'search_input', credits: 1 });
                }}
                className="w-full px-8 py-6 pl-16 pr-32 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-lg"
              />
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setShowAdvancedSearch(!showAdvancedSearch);
                    trackInteraction.mutate({ type: 'advanced_search_toggle', credits: 1 });
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    if (searchQuery) {
                      searchMutation.mutate({
                        query: searchQuery,
                        filters: activeFilters
                      });
                    }
                  }}
                  disabled={isSearching}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </motion.button>
              </div>
            </div>
          </div>

          <AdvancedSearchPanel />

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              'Trending Now', 'Quick Apply', 'High Success', 'Ending Soon', 
              'New This Week', 'AI Recommended', 'Large Grants', 'Easy Apply'
            ].map((action) => (
              <motion.button
                key={action}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  handleFilterChange('quickAction', action);
                  trackInteraction.mutate({ type: 'quick_action', credits: 2, data: { action } });
                }}
                className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 transition-colors text-sm"
              >
                {action}
              </motion.button>
            ))}
          </div>

          {/* View controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">View:</span>
                {['grid', 'list', 'map'].map((mode) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setViewMode(mode as any);
                      trackInteraction.mutate({ type: 'view_change', credits: 1, data: { mode } });
                    }}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      viewMode === mode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </motion.button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    trackInteraction.mutate({ type: 'sort_change', credits: 1, data: { sortBy: e.target.value } });
                  }}
                  className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="amount">Funding Amount</option>
                  <option value="deadline">Deadline</option>
                  <option value="success_rate">Success Rate</option>
                  <option value="trending">Trending</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              {opportunities.length} opportunities found
            </div>
          </div>
        </div>

        {/* Results display */}
        <AnimatePresence mode="wait">
          {isLoading || isSearching ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-8 bg-gray-700 rounded"></div>
                      <div className="h-8 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load more with credit consumption */}
        {opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                trackInteraction.mutate({ type: 'load_more', credits: 3 });
                // Load more logic here
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Discover More Opportunities
              <span className="text-xs opacity-75">(3 credits)</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DonorDiscovery;