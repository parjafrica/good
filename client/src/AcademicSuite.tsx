import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Database,
  Target,
  TrendingUp,
  Users,
  Award,
  Download,
  Share,
  Edit,
  Save,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Globe,
  Brain,
  Lightbulb,
  BarChart3,
  Microscope,
  GraduationCap,
  Library,
  PenTool,
  Bookmark
} from 'lucide-react';

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  abstract: string;
  relevanceScore: number;
  citations: number;
  accessType: 'open' | 'subscription' | 'preprint';
}

interface LiteratureNote {
  id: string;
  paperId: string;
  content: string;
  tags: string[];
  category: 'summary' | 'methodology' | 'findings' | 'critique';
  createdAt: Date;
}

export default function AcademicSuite() {
  const [activeTab, setActiveTab] = useState('literature');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ResearchPaper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [literatureNotes, setLiteratureNotes] = useState<LiteratureNote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [researchTopic, setResearchTopic] = useState('');
  const { user } = useAuth();

  const academicTools = [
    {
      id: 'literature',
      title: 'Literature Review',
      subtitle: 'AI-powered research discovery',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      description: 'Systematic literature discovery and analysis'
    },
    {
      id: 'research',
      title: 'Research Assistant',
      subtitle: 'Methodology and analysis',
      icon: Microscope,
      color: 'from-purple-500 to-pink-600',
      description: 'Research design and data analysis support'
    },
    {
      id: 'writing',
      title: 'Academic Writing',
      subtitle: 'Paper and thesis support',
      icon: PenTool,
      color: 'from-green-500 to-teal-600',
      description: 'Academic writing assistance and editing'
    },
    {
      id: 'citations',
      title: 'Citation Manager',
      subtitle: 'Reference organization',
      icon: Bookmark,
      color: 'from-orange-500 to-red-600',
      description: 'Bibliography and citation management'
    }
  ];

  const researchDatabases = [
    { name: 'PubMed', description: 'Biomedical literature', papers: '34M+' },
    { name: 'Google Scholar', description: 'Multi-disciplinary', papers: '389M+' },
    { name: 'IEEE Xplore', description: 'Engineering & technology', papers: '5M+' },
    { name: 'JSTOR', description: 'Academic journals', papers: '12M+' },
    { name: 'arXiv', description: 'Preprints', papers: '2M+' },
    { name: 'SSRN', description: 'Social sciences', papers: '1M+' }
  ];

  const generateMockPapers = (query: string): ResearchPaper[] => {
    const topics = [
      'sustainable development',
      'climate change adaptation',
      'microfinance impact',
      'education technology',
      'health systems strengthening',
      'social entrepreneurship'
    ];
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: `paper-${i}`,
      title: `${topics[i % topics.length]} in Sub-Saharan Africa: ${query} perspectives`,
      authors: [`Author ${i + 1}`, `Co-Author ${i + 1}`],
      journal: ['Nature', 'Science', 'Cell', 'The Lancet', 'PNAS'][i % 5],
      year: 2020 + (i % 4),
      abstract: `This study examines ${query} in the context of ${topics[i % topics.length]}, focusing on implementation strategies and outcomes in East African countries. Our findings suggest significant potential for scaling innovative approaches...`,
      relevanceScore: 95 - i * 5,
      citations: Math.floor(Math.random() * 1000) + 50,
      accessType: ['open', 'subscription', 'preprint'][i % 3] as 'open' | 'subscription' | 'preprint'
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = generateMockPapers(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const togglePaperSelection = (paperId: string) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    );
  };

  const generateLiteratureReview = async () => {
    if (selectedPapers.length === 0) return;
    
    setIsSearching(true);
    
    // Simulate AI literature review generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Add mock literature review generation logic here
    setIsSearching(false);
  };

  const renderLiteratureReview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Literature Review Assistant</h2>
          <p className="text-gray-400">Discover and analyze academic literature with AI</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Review
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            AI Analysis
          </button>
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Research Topic & Search</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Research Topic</label>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Climate change adaptation in East Africa"
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Search Query</label>
            <div className="flex space-x-3">
              <input
                type="text"
                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Enter keywords, authors, or specific terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Database Sources */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Searching across databases:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {researchDatabases.map((db) => (
              <div key={db.name} className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                <div className="font-medium text-sm">{db.name}</div>
                <div className="text-xs text-gray-400">{db.papers} papers</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
            <div className="flex space-x-3">
              <span className="text-sm text-gray-400">{selectedPapers.length} selected</span>
              <button
                onClick={generateLiteratureReview}
                disabled={selectedPapers.length === 0}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Review
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {searchResults.map((paper) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPapers.includes(paper.id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-900 hover:border-gray-500'
                }`}
                onClick={() => togglePaperSelection(paper.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{paper.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      {paper.authors.join(', ')} • {paper.journal} ({paper.year})
                    </p>
                    <p className="text-sm text-gray-300 mb-3">{paper.abstract.substring(0, 200)}...</p>
                    
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center text-green-400">
                        <Star className="w-3 h-3 mr-1" />
                        {paper.relevanceScore}% relevance
                      </div>
                      <div className="flex items-center text-blue-400">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        {paper.citations} citations
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        paper.accessType === 'open' ? 'bg-green-500/20 text-green-400' :
                        paper.accessType === 'subscription' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {paper.accessType}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={selectedPapers.includes(paper.id)}
                      onChange={() => togglePaperSelection(paper.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderResearchAssistant = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Research Assistant</h2>
        <p className="text-gray-400">AI-powered research methodology and analysis support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Research Design', icon: Target, desc: 'Study design and methodology planning' },
          { title: 'Data Analysis', icon: BarChart3, desc: 'Statistical analysis and interpretation' },
          { title: 'Survey Builder', icon: Users, desc: 'Create and analyze questionnaires' },
          { title: 'Hypothesis Testing', icon: Lightbulb, desc: 'Statistical hypothesis validation' }
        ].map((tool, index) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-colors cursor-pointer"
          >
            <tool.icon className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">{tool.title}</h3>
            <p className="text-gray-300 text-sm">{tool.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'literature':
        return renderLiteratureReview();
      case 'research':
        return renderResearchAssistant();
      case 'writing':
        return <div className="text-center py-20">Academic Writing Assistant - Coming Soon</div>;
      case 'citations':
        return <div className="text-center py-20">Citation Manager - Coming Soon</div>;
      default:
        return renderLiteratureReview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Academic Suite</h1>
            <p className="text-xl text-gray-300">
              AI-powered research and academic writing tools
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-xl p-2 flex space-x-2 overflow-x-auto">
              {academicTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tool.id
                      ? 'bg-gradient-to-r ' + tool.color + ' text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tool.icon className="w-5 h-5" />
                  <span className="font-medium">{tool.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Content */}
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderActiveTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}