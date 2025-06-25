import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Award,
  TrendingUp,
  Globe,
  Search,
  MapPin,
  Flag
} from 'lucide-react';
import { realDonorSearchEngine } from '.././services/realDonorSearchEngine';

interface BotStatus {
  id: string;
  name: string;
  country: string;
  status: string;
  last_run: string;
  opportunities_found: number;
  reward_points: number;
  success_rate: number;
  error_count: number;
}

interface BotReward {
  bot_id: string;
  country: string;
  opportunities_found: number;
  reward_points: number;
  awarded_at: string;
}

interface BotStatistics {
  bots: BotStatus[];
  recent_rewards: BotReward[];
  statistics: {
    recent_activity: any[];
    opportunity_counts: Record<string, { total: number; verified: number }>;
    total_opportunities: number;
    total_verified: number;
  };
  system_status: {
    is_active: boolean;
    last_update: string;
  };
}

const BotStatusPanel: React.FC = () => {
  const [statistics, setStatistics] = useState<BotStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [countryFlags, setCountryFlags] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBotStatistics();
    
    // Get user's country from search engine
    const country = realDonorSearchEngine.getUserCountry();
    if (country) {
      setUserCountry(country);
      setSelectedCountry(country);
    }
  }, []);

  useEffect(() => {
    // Generate flags for all countries in statistics
    if (statistics) {
      const flags: Record<string, string> = {};
      statistics.bots.forEach(bot => {
        flags[bot.country] = getFlagEmoji(bot.country);
      });
      setCountryFlags(flags);
    }
  }, [statistics]);

  const getFlagEmoji = (country: string): string => {
    // Convert country name to ISO code (simplified)
    const countryCodes: Record<string, string> = {
      'South Sudan': 'SS',
      'Kenya': 'KE',
      'Nigeria': 'NG',
      'South Africa': 'ZA',
      'Ghana': 'GH',
      'Uganda': 'UG',
      'Tanzania': 'TZ',
      'Rwanda': 'RW',
      'Senegal': 'SN',
      'Mali': 'ML',
      'Ivory Coast': 'CI',
      'Cameroon': 'CM',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'France': 'FR'
    };
    
    const code = countryCodes[country] || '';
    if (!code) return '🌍';
    
    // Convert country code to flag emoji
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  };

  const fetchBotStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = await realDonorSearchEngine.fetchBotStatistics();
      
      if (stats) {
        setStatistics(stats);
      } else {
        setError('Failed to fetch bot statistics');
      }
    } catch (err) {
      setError('Error fetching bot statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBotStatistics();
    setRefreshing(false);
  };

  const handleTriggerSearch = async () => {
    if (!selectedCountry) return;
    
    try {
      setIsSearching(true);
      setSearchResult(null);
      
      const result = await realDonorSearchEngine.triggerSearch(
        selectedCountry,
        searchQuery || undefined
      );
      
      setSearchResult(result);
      
      // Refresh statistics after a delay
      setTimeout(() => {
        fetchBotStatistics();
      }, 3000);
    } catch (err) {
      console.error('Error triggering search:', err);
      setSearchResult({ error: 'Failed to trigger search' });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'paused': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'error': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'maintenance': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      default: return 'text-slate-400 bg-slate-400/20 border-slate-400/30';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 text-center">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Loading bot statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 font-medium mb-2">Error loading bot statistics</p>
        <p className="text-slate-300">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Search Bot System</h3>
            <p className="text-slate-400 text-sm">Real-time funding opportunity discovery</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Total Opportunities</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {statistics.statistics.total_opportunities.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {statistics.statistics.total_verified.toLocaleString()} verified ({Math.round((statistics.statistics.total_verified / statistics.statistics.total_opportunities) * 100)}%)
          </div>
        </div>
        
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Active Bots</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {statistics.bots.filter(b => b.status === 'active').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {statistics.bots.length} total bots configured
          </div>
        </div>
        
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Last Update</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-lg font-bold text-white">
            {formatDate(statistics.system_status.last_update).split(',')[1]}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            System is {statistics.system_status.is_active ? 'active' : 'inactive'}
          </div>
        </div>
      </div>

      {/* Bot List */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">Active Search Bots</h4>
        <div className="space-y-3">
          {statistics.bots.map((bot) => (
            <motion.div
              key={bot.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedCountry(bot.country)}
              className={`p-4 bg-slate-700/30 rounded-lg cursor-pointer transition-all ${
                selectedCountry === bot.country ? 'border border-blue-500/50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(bot.status)}`}>
                    {bot.status.toUpperCase()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg" role="img" aria-label={`Flag of ${bot.country}`}>
                      {countryFlags[bot.country] || '🌍'}
                    </span>
                    <h5 className="text-white font-medium">{bot.name}</h5>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-xs">
                    <Database className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-400">{bot.opportunities_found}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <Award className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400">{bot.reward_points}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>Country: {bot.country}</span>
                </div>
                <div>Last run: {formatDate(bot.last_run).split(',')[0]}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trigger Search */}
      {selectedCountry && (
        <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
            <span>Trigger Search for {selectedCountry}</span>
            <span className="text-lg" role="img" aria-label={`Flag of ${selectedCountry}`}>
              {countryFlags[selectedCountry] || '🌍'}
            </span>
          </h4>
          <div className="flex space-x-3 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Optional search query..."
              className="flex-1 px-4 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleTriggerSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 inline mr-2" />
                  Trigger Search
                </>
              )}
            </motion.button>
          </div>
          
          {searchResult && (
            <div className={`p-3 rounded-lg text-sm ${
              searchResult.error 
                ? 'bg-red-600/20 border border-red-500/30 text-red-400' 
                : 'bg-green-600/20 border border-green-500/30 text-green-400'
            }`}>
              {searchResult.error ? (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{searchResult.error}</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{searchResult.message}</span>
                  </div>
                  <div className="text-xs">
                    Queued {searchResult.targets_queued} targets. Results will be available soon.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Rewards */}
      {statistics.recent_rewards.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Recent Bot Rewards</h4>
          <div className="space-y-2">
            {statistics.recent_rewards.slice(0, 5).map((reward, index) => (
              <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm">{reward.bot_id}</span>
                  </div>
                  <span className="text-yellow-400 font-medium">+{reward.reward_points} points</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg" role="img" aria-label={`Flag of ${reward.country}`}>
                      {countryFlags[reward.country] || '🌍'}
                    </span>
                    <span>Found {reward.opportunities_found} opportunities</span>
                  </div>
                  <div>{formatDate(reward.awarded_at).split(',')[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country Statistics */}
      <div>
        <h4 className="text-white font-medium mb-3">Country Coverage</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(statistics.statistics.opportunity_counts)
            .sort(([, a], [, b]) => b.total - a.total)
            .slice(0, 6)
            .map(([country, counts]) => (
              <div key={country} className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg" role="img" aria-label={`Flag of ${country}`}>
                      {countryFlags[country] || '🌍'}
                    </span>
                    <span className="text-white text-sm">{country}</span>
                  </div>
                  <span className="text-blue-400 font-medium">{counts.total} opportunities</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ width: `${(counts.verified / counts.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {counts.verified} verified ({Math.round((counts.verified / counts.total) * 100)}%)
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BotStatusPanel;