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
                    {selectedOpportunity.requirements?.map((req: string, index: number) => (
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