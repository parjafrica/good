import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, DollarSign, Calendar, MapPin, Building, Users, Target, ChevronRight, Star, Clock, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  amount: string;
  deadline: string;
  location: string;
  sector: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  matchScore: number;
  description: string;
  eligibility: string[];
  tags: string[];
  url?: string;
  verified: boolean;
}

const OpportunitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Get filter from URL parameters
  const filterParam = searchParams.get('filter');
  const sectorParam = searchParams.get('sector');

  // Fetch real opportunities from database
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['/api/opportunities', filterParam, sectorParam, searchQuery, selectedSector, selectedDifficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterParam) params.append('filter', filterParam);
      if (sectorParam) params.append('sector', sectorParam);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedSector) params.append('sector', selectedSector);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      
      const response = await fetch(`/api/opportunities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      return response.json();
    }
  });

  useEffect(() => {
    if (sectorParam) {
      setSelectedSector(sectorParam);
    }
  }, [sectorParam]);

  // Notify admin of page access
  useEffect(() => {
    fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'page_access',
        page: 'opportunities',
        filter: filterParam,
        sector: sectorParam,
        timestamp: new Date().toISOString(),
        user_id: 'demo_user'
      })
    }).catch(console.error);
  }, [filterParam, sectorParam]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleOpportunityClick = (opportunity: Opportunity) => {
    // Notify admin of opportunity view
    fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'opportunity_view',
        opportunity_id: opportunity.id,
        opportunity_title: opportunity.title,
        user_id: 'demo_user',
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);

    navigate(`/opportunity/${opportunity.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-32 w-32 border-b-2 border-blue-600"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Funding Opportunities
          </h1>
          {filterParam && (
            <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-200">
                Showing opportunities filtered by: <span className="font-semibold capitalize">{filterParam}</span>
              </p>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover {opportunities.length} verified funding opportunities from our database
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Sector Filter */}
            <div>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Sectors</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Community Development">Community Development</option>
                <option value="Environment">Environment</option>
                <option value="Child Protection">Child Protection</option>
                <option value="Social Justice">Social Justice</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Technology">Technology</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {opportunities.map((opportunity: Opportunity, index: number) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-102 cursor-pointer group"
              onClick={() => handleOpportunityClick(opportunity)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {opportunity.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Building className="w-4 h-4" />
                    <span>{opportunity.organization}</span>
                    {opportunity.verified && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {opportunity.amount}
                  </div>
                  <div className={`text-sm font-medium ${getMatchScoreColor(opportunity.matchScore)}`}>
                    {opportunity.matchScore}% match
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(opportunity.difficulty)}`}>
                  {opportunity.difficulty}
                </span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                  {opportunity.sector}
                </span>
                {opportunity.tags?.slice(0, 2).map((tag, tagIndex) => (
                  <span key={tagIndex} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {opportunity.description}
              </p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{opportunity.location}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>High Priority</span>
                </div>
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group-hover:gap-3 transition-all">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {opportunities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No opportunities found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('');
                setSelectedDifficulty('');
                setSearchParams({});
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OpportunitiesPage;