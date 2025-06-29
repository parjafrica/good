import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, Award, Users, TrendingUp, Activity, Star, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const MatchingPage = () => {
  const [searchParams] = useSearchParams();
  const matchType = searchParams.get('type') || 'ai_match';

  // Fetch matching data from database
  const { data: matchingData, isLoading } = useQuery({
    queryKey: ['/api/matching', matchType],
    queryFn: async () => {
      const response = await fetch(`/api/matching?type=${matchType}`);
      if (!response.ok) throw new Error('Failed to fetch matching data');
      return response.json();
    }
  });

  // Notify admin of matching page access
  useEffect(() => {
    fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'matching_access',
        match_type: matchType,
        timestamp: new Date().toISOString(),
        user_id: 'demo_user'
      })
    }).catch(console.error);
  }, [matchType]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-32 w-32 border-b-2 border-purple-600"
        />
      </div>
    );
  }

  const sampleMatchingData = matchingData || {
    aiMatchScore: 87.3,
    matchingFactors: [
      { factor: 'Sector Alignment', score: 95, description: 'Perfect match with healthcare focus' },
      { factor: 'Geographic Focus', score: 92, description: 'East Africa specialization' },
      { factor: 'Organization Size', score: 88, description: 'Mid-size NGO requirements' },
      { factor: 'Experience Level', score: 85, description: '5+ years in health promotion' },
      { factor: 'Budget Range', score: 83, description: 'Suitable for $100K-$2M grants' },
      { factor: 'Impact Metrics', score: 78, description: 'Strong data collection capability' }
    ],
    recommendations: [
      {
        title: 'USAID Health Systems Strengthening',
        matchScore: 94,
        reason: 'Perfect alignment with your healthcare focus and East Africa operations',
        amount: '$2.5M',
        deadline: '2025-08-15'
      },
      {
        title: 'Gates Foundation Community Health',
        matchScore: 91,
        reason: 'Matches your NGO size and community health expertise',
        amount: '$1.8M',
        deadline: '2025-09-30'
      },
      {
        title: 'WHO Health Innovation Grant',
        matchScore: 89,
        reason: 'Aligns with your technology integration and health promotion work',
        amount: '$750K',
        deadline: '2025-10-20'
      }
    ],
    improvementSuggestions: [
      'Strengthen data collection and impact measurement capabilities',
      'Expand partnership network in East Africa',
      'Develop expertise in digital health technologies',
      'Enhance grant writing and proposal development skills'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Matching Intelligence
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Advanced algorithm analysis of your funding compatibility
          </p>
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl px-8 py-4 shadow-lg border border-white/20">
            <Brain className="w-8 h-8 text-purple-600" />
            <div className="text-left">
              <div className="text-3xl font-bold text-purple-600">{sampleMatchingData.aiMatchScore}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Match Score</div>
            </div>
          </div>
        </motion.div>

        {/* Matching Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Matching Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleMatchingData.matchingFactors.map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{factor.factor}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-bold ${
                      factor.score >= 90 ? 'text-green-600' :
                      factor.score >= 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {factor.score}%
                    </div>
                    {factor.score >= 85 && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        factor.score >= 90 ? 'bg-green-500' :
                        factor.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{factor.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-green-600" />
            Top Recommended Opportunities
          </h2>
          <div className="space-y-6">
            {sampleMatchingData.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 transition-colors">
                      {rec.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{rec.reason}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Deadline: {new Date(rec.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">{rec.amount}</div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-600">{rec.matchScore}% match</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform group-hover:scale-105">
                    Apply Now - Perfect Match!
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Improvement Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            Ways to Improve Your Match Score
          </h2>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20">
            <div className="space-y-4">
              {sampleMatchingData.improvementSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">{suggestion}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Analysis Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-8 border border-purple-200 dark:border-purple-800"
        >
          <div className="text-center">
            <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              AI Analysis Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Based on comprehensive analysis of your organization profile, sector focus, geographic location, 
              and funding history, our AI algorithm has identified high-compatibility opportunities. Your healthcare 
              specialization in East Africa positions you excellently for health systems strengthening grants 
              from major international donors.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MatchingPage;