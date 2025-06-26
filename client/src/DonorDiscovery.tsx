import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, MapPin, DollarSign, Calendar, Globe, Target, 
  Zap, TrendingUp, Star, Heart, Bookmark, Share2, RefreshCw,
  ChevronDown, ChevronRight, BarChart3, Users, Award, Sparkles,
  Eye, Clock, ArrowRight, Plus, Coins, Flame, Lightbulb,
  MousePointer, ThumbsUp, MessageCircle, Settings, SortAsc,
  Grid, List, Map, FileText, Download, Bell, AlertCircle,
  CheckCircle, ExternalLink, Layers, Activity, TrendingDown
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
  
  // Core state
  const [searchQuery, setSearchQuery] = useState(location.state?.query || '');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedOpportunity, setSelectedOpportunity] = useState<SmartOpportunity | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  
  // Advanced features
  const [searchMetrics, setSearchMetrics] = useState<SearchMetrics>({
    totalSearches: 0,
    creditsConsumed: 0,
    opportunitiesViewed: 0,
    timeSpent: 0,
    clicksToday: 0,
    streak: 0
  });
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Track user interactions
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
      setSearchMetrics(prev => ({
        ...prev,
        creditsConsumed: prev.creditsConsumed + 1,
        clicksToday: prev.clicksToday + 1
      }));
    }
  });

  // Enhanced search with AI processing
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

  // Get opportunities with smart recommendations
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

  // Filter categories for advanced search
  const filterCategories = [
    {
      id: 'funding_range',
      label: 'Funding Range',
      type: 'range',
      options: [
        { value: '0-50000', label: 'Up to $50K' },
        { value: '50000-250000', label: '$50K - $250K' },
        { value: '250000-1000000', label: '$250K - $1M' },
        { value: '1000000+', label: '$1M+' }
      ]
    },
    {
      id: 'deadline',
      label: 'Application Deadline',
      type: 'select',
      options: [
        { value: '7', label: 'Next 7 days' },
        { value: '30', label: 'Next 30 days' },
        { value: '90', label: 'Next 3 months' },
        { value: 'rolling', label: 'Rolling deadline' }
      ]
    },
    {
      id: 'sector',
      label: 'Sector',
      type: 'multi-select',
      options: [
        { value: 'education', label: 'Education' },
        { value: 'health', label: 'Health' },
        { value: 'environment', label: 'Environment' },
        { value: 'technology', label: 'Technology' },
        { value: 'agriculture', label: 'Agriculture' },
        { value: 'governance', label: 'Governance' }
      ]
    },
    {
      id: 'difficulty',
      label: 'Application Difficulty',
      type: 'select',
      options: [
        { value: 'easy', label: 'Easy (Basic info)' },
        { value: 'medium', label: 'Medium (Detailed proposal)' },
        { value: 'hard', label: 'Hard (Complex requirements)' },
        { value: 'expert', label: 'Expert (Extensive documentation)' }
      ]
    },
    {
      id: 'tags',
      label: 'Special Features',
      type: 'tags',
      options: [
        { value: 'quick_apply', label: 'Quick Apply' },
        { value: 'verified', label: 'Verified Only' },
        { value: 'trending', label: 'Trending' },
        { value: 'high_success', label: 'High Success Rate' },
        { value: 'new', label: 'Recently Added' }
      ]
    }
  ];

  // Enhanced filter panel
  const FilterPanel = () => (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
            <button
              onClick={() => setActiveFilters({})}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {category.label}
                </label>
                
                {category.type === 'select' && (
                  <select
                    className="w-full bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, [category.id]: e.target.value }))}
                    value={activeFilters[category.id] || ''}
                  >
                    <option value="">All</option>
                    {category.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {category.type === 'range' && (
                  <div className="space-y-2">
                    {category.options.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={category.id}
                          value={option.value}
                          checked={activeFilters[category.id] === option.value}
                          onChange={(e) => setActiveFilters(prev => ({ ...prev, [category.id]: e.target.value }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {category.type === 'tags' && (
                  <div className="flex flex-wrap gap-2">
                    {category.options.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const currentTags = activeFilters[category.id] || [];
                          const isSelected = currentTags.includes(option.value);
                          const newTags = isSelected 
                            ? currentTags.filter((tag: string) => tag !== option.value)
                            : [...currentTags, option.value];
                          setActiveFilters(prev => ({ ...prev, [category.id]: newTags }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          (activeFilters[category.id] || []).includes(option.value)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Enhanced opportunity card
  const OpportunityCard = ({ opportunity }: { opportunity: SmartOpportunity }) => {
    const urgencyColors = {
      low: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      critical: 'bg-red-500/20 text-red-400'
    };

    const difficultyIcons = {
      easy: <CheckCircle className="w-4 h-4" />,
      medium: <Clock className="w-4 h-4" />,
      hard: <AlertCircle className="w-4 h-4" />,
      expert: <Star className="w-4 h-4" />
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-blue-500/50 transition-all cursor-pointer shadow-lg hover:shadow-xl"
        onClick={() => {
          setSelectedOpportunity(opportunity);
          trackInteraction.mutate({ type: 'opportunity_view', credits: 2, data: { opportunityId: opportunity.id } });
        }}
      >
        {/* Header with badges */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              {opportunity.trending && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                  <Flame className="w-3 h-3" />
                  Trending
                </div>
              )}
              {opportunity.verified && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </div>
              )}
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                <Target className="w-3 h-3" />
                {opportunity.matchScore}% Match
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${urgencyColors[opportunity.urgency]}`}>
                <Clock className="w-3 h-3" />
                {opportunity.urgency.charAt(0).toUpperCase() + opportunity.urgency.slice(1)}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {opportunity.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {opportunity.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setFavoriteIds(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(opportunity.id)) {
                    newSet.delete(opportunity.id);
                  } else {
                    newSet.add(opportunity.id);
                  }
                  return newSet;
                });
                trackInteraction.mutate({ type: 'favorite', credits: 1, data: { opportunityId: opportunity.id } });
              }}
              className={`p-2 rounded-lg transition-colors ${
                favoriteIds.has(opportunity.id) 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-red-500/20 hover:text-red-400'
              }`}
            >
              <Heart className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={(e) => {
                e.stopPropagation();
                setBookmarkedIds(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(opportunity.id)) {
                    newSet.delete(opportunity.id);
                  } else {
                    newSet.add(opportunity.id);
                  }
                  return newSet;
                });
                trackInteraction.mutate({ type: 'bookmark', credits: 1, data: { opportunityId: opportunity.id } });
              }}
              className={`p-2 rounded-lg transition-colors ${
                bookmarkedIds.has(opportunity.id)
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-blue-500/20 hover:text-blue-400'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Key information grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{opportunity.fundingAmount}</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{opportunity.deadline}</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{opportunity.country}</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-lg">
            {difficultyIcons[opportunity.difficulty]}
            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{opportunity.difficulty}</span>
          </div>
        </div>

        {/* Success metrics */}
        <div className="flex justify-between items-center mb-4 p-3 bg-gray-100/50 dark:bg-gray-700/30 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{opportunity.successRate}%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{opportunity.applicantCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Applicants</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{opportunity.estimatedTime}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Est. Time</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md text-xs"
            >
              {tag}
            </span>
          ))}
          {opportunity.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md text-xs">
              +{opportunity.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation();
              trackInteraction.mutate({ type: 'apply_intent', credits: 5, data: { opportunityId: opportunity.id } });
              window.open(opportunity.sourceUrl, '_blank');
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Apply Now
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation();
              trackInteraction.mutate({ type: 'share', credits: 2, data: { opportunityId: opportunity.id } });
              navigator.share?.({
                title: opportunity.title,
                text: opportunity.description,
                url: opportunity.sourceUrl
              });
            }}
            className="px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Expert Funding Discovery
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              AI-powered discovery of funding opportunities tailored to your organization's needs and expertise
            </p>
          </motion.div>

          {/* Enhanced search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-6"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center">
                <Search className="absolute left-6 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for funding opportunities, sectors, or organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-16 py-4 bg-transparent text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none text-lg"
                />
                {isSearching && (
                  <div className="absolute right-20">
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-3 px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-all flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {searchMetrics.opportunitiesViewed} viewed today
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              {searchMetrics.creditsConsumed} credits used
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {opportunities.length} opportunities found
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Advanced filters */}
        <FilterPanel />

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-gray-700 dark:text-gray-300 font-medium focus:outline-none"
              >
                <option value="relevance">Most Relevant</option>
                <option value="deadline">Deadline</option>
                <option value="amount">Funding Amount</option>
                <option value="success_rate">Success Rate</option>
                <option value="trending">Trending</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {opportunities.length} opportunities
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-200/50 dark:bg-gray-700/50 rounded-lg p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Opportunities grid/list */}
        {isLoading || isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
                <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}
          >
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </motion.div>
        )}

        {/* Load more */}
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

      {/* Opportunity detail modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedOpportunity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedOpportunity.title}
                </h2>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedOpportunity.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Funding Amount</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOpportunity.fundingAmount}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Deadline</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOpportunity.deadline}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {selectedOpportunity.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      window.open(selectedOpportunity.sourceUrl, '_blank');
                      trackInteraction.mutate({ type: 'apply_from_modal', credits: 5 });
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-3 px-6 font-medium hover:shadow-lg transition-all"
                  >
                    Apply Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedOpportunity(null)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonorDiscovery;