import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  BarChart3,
  Users,
  Clock,
  Zap,
  Star,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { proposalIntelligence } from '../services/proposalIntelligence';
import { useAuth } from '../contexts/AuthContext';

interface ProposalIntelligencePanelProps {
  proposal: any;
  opportunity?: any;
  onUpdate?: () => void;
}

const ProposalIntelligencePanel: React.FC<ProposalIntelligencePanelProps> = ({
  proposal,
  opportunity,
  onUpdate
}) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<any>(null);
  const [optimization, setOptimization] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [competitive, setCompetitive] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (proposal && opportunity) {
      loadIntelligenceData();
    }
  }, [proposal, opportunity]);

  const loadIntelligenceData = async () => {
    setLoading(true);
    try {
      const [analysisResult, optimizationResult, insightsResult, competitiveResult] = await Promise.allSettled([
        proposalIntelligence.analyzeProposal(proposal.content, opportunity),
        proposalIntelligence.getOptimizationSuggestions(proposal.content, opportunity),
        proposalIntelligence.getSmartInsights(proposal.content, opportunity, user),
        proposalIntelligence.getCompetitiveAnalysis(opportunity, user)
      ]);

      if (analysisResult.status === 'fulfilled') setAnalysis(analysisResult.value);
      if (optimizationResult.status === 'fulfilled') setOptimization(optimizationResult.value);
      if (insightsResult.status === 'fulfilled') setInsights(insightsResult.value);
      if (competitiveResult.status === 'fulfilled') setCompetitive(competitiveResult.value);
    } catch (error) {
      console.error('Intelligence data loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return 'bg-green-500';
    if (probability >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="text-gray-300">Analyzing proposal with Expert Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Expert Intelligence Analysis</h2>
            <p className="text-blue-200">AI-powered proposal optimization and insights</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <div className="flex">
          {[
            { id: 'analysis', label: 'Analysis', icon: BarChart3 },
            { id: 'optimization', label: 'Optimization', icon: Zap },
            { id: 'insights', label: 'Smart Insights', icon: Lightbulb },
            { id: 'competitive', label: 'Competition', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 bg-gray-750 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'analysis' && analysis && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Score */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Overall Score</h3>
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                    {Math.round(analysis.score)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      analysis.score >= 85 ? 'bg-green-500' :
                      analysis.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Funding Probability: {Math.round(analysis.fundingProbability * 100)}%
                </p>
              </div>

              {/* Strengths */}
              <div className="bg-gray-700 rounded-lg p-4">
                <button
                  onClick={() => toggleSection('strengths')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-white">Strengths</h3>
                  </div>
                  {expandedSections.strengths ? 
                    <ChevronUp className="w-5 h-5 text-gray-400" /> :
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  }
                </button>
                {expandedSections.strengths && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    {analysis.strengths.map((strength: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300">{strength}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Areas for Improvement */}
              <div className="bg-gray-700 rounded-lg p-4">
                <button
                  onClick={() => toggleSection('weaknesses')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-white">Areas for Improvement</h3>
                  </div>
                  {expandedSections.weaknesses ? 
                    <ChevronUp className="w-5 h-5 text-gray-400" /> :
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  }
                </button>
                {expandedSections.weaknesses && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    {analysis.weaknesses.map((weakness: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <ArrowRight className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300">{weakness}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Recommendations */}
              <div className="bg-gray-700 rounded-lg p-4">
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-white">Expert Recommendations</h3>
                  </div>
                  {expandedSections.recommendations ? 
                    <ChevronUp className="w-5 h-5 text-gray-400" /> :
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  }
                </button>
                {expandedSections.recommendations && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    {analysis.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300">{recommendation}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'optimization' && optimization && (
            <motion.div
              key="optimization"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Suggested Changes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span>Suggested Improvements</span>
                </h3>
                {optimization.suggestedChanges.map((change: any, index: number) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{change.section}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        change.impact === 'high' ? 'bg-red-900 text-red-300' :
                        change.impact === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-blue-900 text-blue-300'
                      }`}>
                        {change.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{change.reasoning}</p>
                    <div className="bg-gray-800 rounded p-3">
                      <p className="text-green-400 text-sm">{change.suggested}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Keyword Optimization */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Keyword Optimization</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-red-400 mb-2">Missing Keywords</h5>
                    <div className="space-y-1">
                      {optimization.keywordOptimization.missing.map((keyword: string, index: number) => (
                        <span key={index} className="inline-block bg-red-900 text-red-300 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-yellow-400 mb-2">Overused</h5>
                    <div className="space-y-1">
                      {optimization.keywordOptimization.overused.map((keyword: string, index: number) => (
                        <span key={index} className="inline-block bg-yellow-900 text-yellow-300 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-green-400 mb-2">Trending</h5>
                    <div className="space-y-1">
                      {optimization.keywordOptimization.trending.map((keyword: string, index: number) => (
                        <span key={index} className="inline-block bg-green-900 text-green-300 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && insights && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round(insights.matchScore * 100)}%
                  </div>
                  <div className="text-gray-400 text-sm">Match Score</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round(insights.successProbability * 100)}%
                  </div>
                  <div className="text-gray-400 text-sm">Success Probability</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{insights.timeToComplete}</div>
                  <div className="text-gray-400 text-sm">Est. Completion</div>
                </div>
              </div>

              {/* Urgency Indicator */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-medium text-white">Deadline Status</h4>
                </div>
                <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  insights.deadlineUrgency === 'critical' ? 'bg-red-900 text-red-300' :
                  insights.deadlineUrgency === 'high' ? 'bg-orange-900 text-orange-300' :
                  insights.deadlineUrgency === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-green-900 text-green-300'
                }`}>
                  {insights.deadlineUrgency.toUpperCase()} URGENCY
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>Recommended Actions</span>
                </h4>
                <div className="space-y-2">
                  {insights.suggestedActions.map((action: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'competitive' && competitive && (
            <motion.div
              key="competitive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Competition Overview */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-white">Competition Analysis</h4>
                  <span className="text-2xl font-bold text-orange-400">
                    ~{competitive.competitorCount}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Estimated competing applications</p>
                <div className="mt-3">
                  <div className="text-sm text-gray-400 mb-1">Win Probability</div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProbabilityColor(competitive.winProbability)}`}
                      style={{ width: `${competitive.winProbability * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-400 mt-1">
                    {Math.round(competitive.winProbability * 100)}%
                  </div>
                </div>
              </div>

              {/* Competitive Advantages */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Your Competitive Advantages</span>
                </h4>
                <div className="space-y-2">
                  {competitive.competitiveAdvantages.map((advantage: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">{advantage}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Differentiators */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span>Recommended Differentiators</span>
                </h4>
                <div className="space-y-2">
                  {competitive.recommendedDifferentiators.map((differentiator: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">{differentiator}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadIntelligenceData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analysis</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUpdate}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Apply Suggestions</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProposalIntelligencePanel;