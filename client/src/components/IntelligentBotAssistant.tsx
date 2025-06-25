import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Brain, Zap, Target, TrendingUp, 
  CheckCircle, AlertCircle, Loader, 
  BarChart3, Users, Clock, Lightbulb
} from 'lucide-react';

interface BotAssistantProps {
  opportunity: any;
  onSuggestion: (suggestion: string, sectionId: string) => void;
  activeSection: string;
}

interface BotAnalysis {
  funderType: string;
  competitiveLevel: string;
  keyStrategies: string[];
  languageStyle: string;
  successProbability: number;
  recommendations: string[];
}

const IntelligentBotAssistant: React.FC<BotAssistantProps> = ({ 
  opportunity, 
  onSuggestion, 
  activeSection 
}) => {
  const [botAnalysis, setBotAnalysis] = useState<BotAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeBot, setActiveBot] = useState<string>('strategy');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Bot types with their specializations
  const botTypes = [
    {
      id: 'strategy',
      name: 'Strategy Bot',
      icon: <Target className="w-5 h-5" />,
      color: 'blue',
      description: 'Analyzes funder patterns and competitive landscape'
    },
    {
      id: 'language',
      name: 'Language Bot', 
      icon: <Brain className="w-5 h-5" />,
      color: 'purple',
      description: 'Optimizes terminology and writing style'
    },
    {
      id: 'metrics',
      name: 'Metrics Bot',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'green',
      description: 'Suggests key performance indicators and outcomes'
    },
    {
      id: 'innovation',
      name: 'Innovation Bot',
      icon: <Zap className="w-5 h-5" />,
      color: 'yellow',
      description: 'Identifies differentiation opportunities'
    }
  ];

  useEffect(() => {
    if (opportunity) {
      deployIntelligentAnalysis();
    }
  }, [opportunity]);

  useEffect(() => {
    if (botAnalysis && activeSection) {
      generateSectionSuggestions();
    }
  }, [activeSection, botAnalysis, activeBot]);

  const deployIntelligentAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate intelligent bot analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis: BotAnalysis = {
      funderType: classifyFunder(opportunity),
      competitiveLevel: assessCompetition(opportunity),
      keyStrategies: generateStrategies(opportunity),
      languageStyle: determineLanguageStyle(opportunity),
      successProbability: calculateSuccessProbability(opportunity),
      recommendations: generateRecommendations(opportunity)
    };
    
    setBotAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const classifyFunder = (opp: any): string => {
    const source = opp.sourceName?.toLowerCase() || '';
    if (source.includes('foundation')) return 'Private Foundation';
    if (source.includes('government')) return 'Government Agency';
    if (source.includes('research')) return 'Research Institution';
    return 'Mixed/Corporate';
  };

  const assessCompetition = (opp: any): string => {
    const amount = opp.amountMax || opp.amountMin || 0;
    if (amount > 500000) return 'High Competition';
    if (amount > 100000) return 'Moderate Competition';
    return 'Accessible Opportunity';
  };

  const generateStrategies = (opp: any): string[] => {
    const strategies = [];
    const sector = opp.sector?.toLowerCase() || '';
    
    if (sector.includes('health')) {
      strategies.push('Evidence-based interventions', 'Health outcome metrics');
    } else if (sector.includes('education')) {
      strategies.push('Learning outcome focus', 'Educational methodology');
    } else {
      strategies.push('Community engagement', 'Measurable impact');
    }
    
    strategies.push('Strong partnerships', 'Sustainability planning');
    return strategies;
  };

  const determineLanguageStyle = (opp: any): string => {
    const description = opp.description?.toLowerCase() || '';
    if (description.includes('research')) return 'Academic/Technical';
    if (description.includes('community')) return 'Community-Focused';
    return 'Professional/Formal';
  };

  const calculateSuccessProbability = (opp: any): number => {
    let score = 70; // Base score
    
    // Adjust based on opportunity characteristics
    if (opp.country === 'Global') score += 10;
    if (opp.amountMin && opp.amountMin < 100000) score += 15;
    if (opp.sector === 'Development') score += 10;
    
    return Math.min(95, score);
  };

  const generateRecommendations = (opp: any): string[] => {
    return [
      'Emphasize local partnerships and community engagement',
      'Include specific, measurable outcomes and KPIs',
      'Demonstrate organizational capacity and track record',
      'Align project goals with funder mission statements',
      'Provide detailed budget justification and cost-effectiveness'
    ];
  };

  const generateSectionSuggestions = () => {
    if (!botAnalysis) return;

    const sectionSuggestions: { [key: string]: string[] } = {
      strategy: [
        `Focus on ${botAnalysis.funderType.toLowerCase()} priorities`,
        `Address ${botAnalysis.competitiveLevel.toLowerCase()} environment`,
        'Highlight unique value proposition'
      ],
      language: [
        `Adopt ${botAnalysis.languageStyle.toLowerCase()} tone`,
        'Use funder-specific terminology',
        'Mirror application guidelines language'
      ],
      metrics: [
        'Include quantifiable success metrics',
        'Define clear evaluation framework',
        'Specify timeline and milestones'
      ],
      innovation: [
        'Emphasize novel approaches',
        'Highlight technological integration',
        'Demonstrate scalability potential'
      ]
    };

    setSuggestions(sectionSuggestions[activeBot] || []);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestion(suggestion, activeSection);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-300', 
      green: 'bg-green-500/20 border-green-500/30 text-green-300',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (!opportunity) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Bot className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Intelligent Bot Assistant</h3>
          <p className="text-slate-400 text-sm">AI-powered proposal optimization</p>
        </div>
      </div>

      {/* Bot Analysis Status */}
      <AnimatePresence>
        {isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <Loader className="w-5 h-5 text-blue-400 animate-spin" />
              <div>
                <p className="text-blue-300 font-medium">Deploying Intelligent Analysis</p>
                <p className="text-blue-200 text-sm">Bots are analyzing opportunity patterns...</p>
              </div>
            </div>
          </motion.div>
        ) : botAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-6"
          >
            {/* Analysis Summary */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Funder Type</p>
                  <p className="text-white font-medium">{botAnalysis.funderType}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Competition Level</p>
                  <p className="text-white font-medium">{botAnalysis.competitiveLevel}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Language Style</p>
                  <p className="text-white font-medium">{botAnalysis.languageStyle}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Success Probability</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full"
                        style={{ width: `${botAnalysis.successProbability}%` }}
                      />
                    </div>
                    <span className="text-green-400 font-medium text-sm">
                      {botAnalysis.successProbability}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bot Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {botTypes.map((bot) => (
          <motion.button
            key={bot.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveBot(bot.id)}
            className={`p-3 rounded-lg border transition-all ${
              activeBot === bot.id 
                ? getColorClasses(bot.color)
                : 'bg-slate-700/30 border-slate-600/30 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {bot.icon}
              <span className="font-medium text-sm">{bot.name}</span>
            </div>
            <p className="text-xs opacity-80">{bot.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Bot Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium text-sm">
                {botTypes.find(b => b.id === activeBot)?.name} Suggestions
              </span>
            </div>
            
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg transition-all group"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
                    {suggestion}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Recommendations */}
      {botAnalysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t border-slate-600/30"
        >
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Key Recommendations
          </h4>
          <div className="space-y-2">
            {botAnalysis.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2" />
                <span className="text-slate-300 text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default IntelligentBotAssistant;