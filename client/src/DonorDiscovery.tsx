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
  CheckCircle, ExternalLink, Layers, Activity, TrendingDown, X
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { apiRequest } from './lib/queryClient';
import RealTimeAnalytics from './services/realTimeAnalytics';
import AIEngine, { AIInsight, AIAction } from './services/aiEngine';
import AIGuidancePopup from './shared/AIGuidancePopup';

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
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  
  // AI Intelligence System
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);
  const [analyticsEngine, setAnalyticsEngine] = useState<RealTimeAnalytics | null>(null);
  const [aiEngine, setAiEngine] = useState<AIEngine | null>(null);
  
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

  // Initialize AI Intelligence System
  useEffect(() => {
    const initializeAISystem = async () => {
      // Initialize real-time analytics
      const analytics = new RealTimeAnalytics();
      setAnalyticsEngine(analytics);

      // Initialize AI engine with provided API key
      const aiEngineInstance = new AIEngine('sk-66bff222cc87452fa4f7222c9fa4ddfd');
      setAiEngine(aiEngineInstance);

      // Set up insight callback
      aiEngineInstance.onInsight((insight: AIInsight) => {
        console.log('Setting insight for popup:', insight);
        setCurrentInsight(insight);
      });

      // Connect analytics to AI engine
      analytics.onInsight((behaviorData: any) => {
        aiEngineInstance.analyzeBehavior(behaviorData);
      });

      console.log('AI Intelligence System initialized with real-time tracking');
    };

    initializeAISystem();

    // Cleanup on unmount
    return () => {
      if (analyticsEngine) {
        analyticsEngine.destroy();
      }
    };
  }, []);

  // Handle AI action responses
  const handleAIAction = (action: AIAction) => {
    switch (action.type) {
      case 'tutorial':
        // Highlight or focus the target element
        if (action.target) {
          const element = document.querySelector(action.target);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect
            element.classList.add('ai-highlight');
            setTimeout(() => element.classList.remove('ai-highlight'), 3000);
          }
        }
        break;
      
      case 'navigate':
        if (action.target) {
          navigate(action.target);
        }
        break;
      
      case 'external':
        if (action.target) {
          window.open(action.target, '_blank');
        }
        break;
      
      case 'highlight':
        if (action.target) {
          const element = document.querySelector(action.target);
          if (element) {
            element.classList.add('ai-highlight-permanent');
            setTimeout(() => element.classList.remove('ai-highlight-permanent'), 5000);
          }
        }
        break;
    }

    // Track the action taken
    trackInteraction.mutate({ 
      type: 'ai_action_taken', 
      credits: 1, 
      data: { 
        actionId: action.id, 
        actionType: action.type 
      } 
    });

    // Dismiss the insight after action
    setCurrentInsight(null);
  };

  // Dismiss AI insight
  const dismissAIInsight = () => {
    setCurrentInsight(null);
    trackInteraction.mutate({ 
      type: 'ai_insight_dismissed', 
      credits: 0 
    });
  };

  // Test function to trigger AI insight manually
  const triggerTestInsight = () => {
    console.log('Test button clicked - creating insight...');
    const testInsight: AIInsight = {
      type: 'guidance',
      priority: 'medium',
      title: 'Expert System Active',
      message: 'The AI guidance system is working! This test confirms that expert insights can appear when analyzing your behavior patterns.',
      actions: [
        {
          id: 'continue_exploring',
          label: 'Continue Exploring',
          type: 'dismiss'
        },
        {
          id: 'get_help',
          label: 'Get Expert Help',
          type: 'tutorial',
          target: '#opportunity-grid'
        }
      ],
      metadata: {
        confidence: 1.0,
        reasoning: 'Manual test trigger',
        triggerConditions: ['test'],
        estimatedImpact: 1.0
      }
    };
    console.log('Setting current insight:', testInsight);
    setCurrentInsight(testInsight);
    console.log('Current insight state after setting:', testInsight);
  };

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
      setSearchMetrics((prev: any) => ({
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
      setSearchMetrics((prev: any) => ({
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
    }
  });

  const OpportunityCard = ({ opportunity }: { opportunity: any }) => {
    const isFavorite = favoriteIds.has(opportunity.id);
    const isBookmarked = bookmarkedIds.has(opportunity.id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {opportunity.title}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newFavorites = new Set(favoriteIds);
                if (isFavorite) {
                  newFavorites.delete(opportunity.id);
                } else {
                  newFavorites.add(opportunity.id);
                }
                setFavoriteIds(newFavorites);
                trackInteraction.mutate({ type: 'toggle_favorite', credits: 1 });
              }}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {opportunity.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{opportunity.fundingAmount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{opportunity.deadline}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
            {opportunity.sourceName}
          </span>
          <button
            onClick={() => {
              setSelectedOpportunity(opportunity);
              trackInteraction.mutate({ type: 'view_details', credits: 2 });
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            View Details
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Funding Opportunities
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find the perfect funding match for your projects with our AI-powered discovery engine
          </p>
        </motion.div>

        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for funding opportunities..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex gap-3">
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

        {/* Results */}
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
        ) : opportunities.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No opportunities found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? "Try adjusting your search terms or removing some filters" 
                : "Try searching for funding opportunities in your sector"
              }
            </p>
            
            <div className="space-y-3 max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['health', 'education', 'environment', 'technology', 'development'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setActiveFilters({});
                      trackInteraction.mutate({ type: 'search_suggestion', credits: 1, data: { suggestion } });
                    }}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setActiveFilters({});
                  setSearchQuery('');
                  trackInteraction.mutate({ type: 'clear_all_filters', credits: 1 });
                }}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Browse All Opportunities
              </button>
            </div>
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
            {opportunities.map((opportunity: any) => (
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

      {/* Enhanced Opportunity Detail Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOpportunity(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Gradient Background */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10"></div>
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Target className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                          {selectedOpportunity.sourceName}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold leading-tight mb-2">
                        {selectedOpportunity.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm opacity-90 mb-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {selectedOpportunity.fundingAmount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {selectedOpportunity.deadline}
                        </div>
                      </div>
                      
                      {/* Prominent Apply Now Button */}
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowApplyModal(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg"
                      >
                        <Zap className="w-5 h-5" />
                        Apply Now
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedOpportunity(null)}
                      className="p-3 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {/* Description */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Description
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {selectedOpportunity.description}
                    </p>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Eligibility</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{selectedOpportunity.eligibility}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Location</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{selectedOpportunity.country}</p>
                    </div>
                  </div>

                  {/* Requirements */}
                  {selectedOpportunity.requirements && selectedOpportunity.requirements.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-orange-600" />
                        Requirements
                      </h4>
                      <ul className="space-y-2">
                        {selectedOpportunity.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        window.open(selectedOpportunity.sourceUrl, '_blank');
                        trackInteraction.mutate({ type: 'view_caller_link', credits: 2 });
                      }}
                      className="group flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                    >
                      <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>See Caller Link</span>
                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full">2 credits</div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        window.open(selectedOpportunity.sourceUrl, '_blank');
                        trackInteraction.mutate({ type: 'apply_yourself', credits: 5 });
                      }}
                      className="group flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Apply Yourself</span>
                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full">5 credits</div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate('/human-help', { 
                          state: { 
                            opportunityId: selectedOpportunity.id,
                            opportunityTitle: selectedOpportunity.title 
                          } 
                        });
                        trackInteraction.mutate({ type: 'request_expert_help', credits: 3 });
                      }}
                      className="group flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                    >
                      <Users className="w-5 h-5 group-hover:bounce transition-transform" />
                      <span>Expert Help</span>
                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full">3 credits</div>
                    </motion.button>
                  </div>
                  
                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedOpportunity(null)}
                    className="w-full py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Now Choice Modal */}
      <AnimatePresence>
        {showApplyModal && selectedOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            onClick={() => setShowApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  How would you like to apply?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose your preferred application method for this opportunity
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.open(selectedOpportunity.sourceUrl, '_blank');
                    trackInteraction.mutate({ type: 'self_apply', credits: 5 });
                    setShowApplyModal(false);
                  }}
                  className="w-full flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Apply Yourself
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Go directly to the funding source website
                    </p>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Uses 5 credits
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate('/human-help', { 
                      state: { 
                        opportunityId: selectedOpportunity.id,
                        opportunityTitle: selectedOpportunity.title 
                      } 
                    });
                    trackInteraction.mutate({ type: 'request_expert_help_apply', credits: 8 });
                    setShowApplyModal(false);
                    setSelectedOpportunity(null);
                  }}
                  className="w-full flex items-center gap-4 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl hover:border-orange-300 dark:hover:border-orange-700 transition-all group"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Get Expert Help
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connect with professionals for guidance
                    </p>
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Uses 8 credits
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                </motion.button>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    window.open(selectedOpportunity.sourceUrl, '_blank');
                    trackInteraction.mutate({ type: 'view_source_only', credits: 1 });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Just view the source (1 credit)
                </button>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowApplyModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test AI Guidance Button */}
      <button
        onClick={triggerTestInsight}
        className="fixed bottom-4 right-20 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-40"
        title="Test AI Guidance System"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      {/* AI Guidance Popup */}
      <AIGuidancePopup
        insight={currentInsight}
        onAction={handleAIAction}
        onDismiss={dismissAIInsight}
      />
    </div>
  );
};

export default DonorDiscovery;