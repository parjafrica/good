import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { 
  FileText, 
  Edit3, 
  Bot, 
  Shield, 
  Search,
  BookOpen,
  PenTool,
  Download,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  Brain,
  Sparkles,
  Zap,
  Target,
  Award,
  RefreshCw,
  Plus,
  Save,
  Eye,
  Trash2
} from 'lucide-react';

interface PaperProject {
  id: string;
  title: string;
  paper_type: string;
  status: string;
  word_count: number;
  created_at: string;
}

interface OutlineData {
  outline_id: string;
  topic: string;
  paper_type: string;
  total_words: number;
  structure: Array<{
    section: string;
    subsections: string[];
    topic_focus: string;
  }>;
  word_distribution: Record<string, number>;
  estimated_completion: {
    total_estimated_days: string;
    phases: Record<string, string>;
  };
}

interface EditingResults {
  editing_id: string;
  improvement_score: number;
  editing_results: {
    grammar?: {
      grammar_score: number;
      total_issues: number;
      readability_score: number;
    };
    academic_style?: {
      academic_score: number;
      improvement_suggestions: string[];
    };
    plagiarism?: {
      originality_score: number;
      risk_level: string;
    };
  };
}

export default function AcademicWritingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [topic, setTopic] = useState('');
  const [paperType, setPaperType] = useState('research');
  const [academicLevel, setAcademicLevel] = useState('undergraduate');
  const [wordCount, setWordCount] = useState(5000);
  const [citationStyle, setCitationStyle] = useState('apa');
  const [requirements, setRequirements] = useState('');
  const [content, setContent] = useState('');
  const [editingType, setEditingType] = useState('grammar');
  const [removalLevel, setRemovalLevel] = useState('moderate');
  const [researchQuery, setResearchQuery] = useState('');
  const [paperSection, setPaperSection] = useState('introduction');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<OutlineData | null>(null);
  const [editingResults, setEditingResults] = useState<EditingResults | null>(null);
  const [removalResults, setRemovalResults] = useState(null);
  const [researchResults, setResearchResults] = useState(null);

  const queryClient = useQueryClient();

  // Fetch user papers
  const { data: userPapers, isLoading: papersLoading } = useQuery({
    queryKey: ['userPapers'],
    queryFn: () => apiRequest('/api/academic-writing/papers/demo_user'),
    retry: 1
  });

  // Generate paper outline
  const generateOutline = async (e: any) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const response = await apiRequest('/api/academic-writing/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo_user',
          topic,
          paper_type: paperType,
          academic_level: academicLevel,
          word_count: wordCount,
          citation_style: citationStyle,
          requirements
        })
      });
      
      setGeneratedOutline(response);
    } catch (error) {
      console.error('Error generating outline:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Edit content
  const editContent = async (e: any) => {
    e.preventDefault();
    setIsEditing(true);
    
    try {
      const response = await apiRequest('/api/academic-writing/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo_user',
          content,
          editing_type: editingType,
          paper_type: paperType,
          citation_style: citationStyle
        })
      });
      
      setEditingResults(response);
    } catch (error) {
      console.error('Error editing content:', error);
    } finally {
      setIsEditing(false);
    }
  };

  // AI detection removal
  const removeAIDetection = async (e: any) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await apiRequest('/api/academic-writing/ai-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo_user',
          content,
          removal_level: removalLevel
        })
      });
      
      setRemovalResults(response);
    } catch (error) {
      console.error('Error processing AI removal:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Research assistance
  const getResearchAssistance = async (e: any) => {
    e.preventDefault();
    setIsResearching(true);
    
    try {
      const response = await apiRequest('/api/academic-writing/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo_user',
          research_query: researchQuery,
          paper_section: paperSection,
          context
        })
      });
      
      setResearchResults(response);
    } catch (error) {
      console.error('Error getting research assistance:', error);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Academic Writing Suite
              </h1>
              <p className="text-gray-300 mt-1">
                AI-powered research paper writing, editing, and academic tools
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-black/20 rounded-xl p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'papers', label: 'My Papers', icon: FileText },
              { id: 'outline', label: 'Paper Outline', icon: Edit3 },
              { id: 'editing', label: 'Expert Editing', icon: Bot },
              { id: 'ai-removal', label: 'AI Humanizer', icon: Shield },
              { id: 'research', label: 'Research Assistant', icon: Search }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: FileText,
                  title: 'Research Paper Writing',
                  description: 'Generate comprehensive research papers with AI assistance',
                  color: 'from-blue-500 to-cyan-500',
                  features: ['Topic Research', 'Structure Planning', 'Citation Management']
                },
                {
                  icon: Bot,
                  title: 'Expert Editing Tools',
                  description: 'Advanced grammar, style, and academic writing enhancement',
                  color: 'from-purple-500 to-pink-500',
                  features: ['Grammar Check', 'Style Analysis', 'Plagiarism Detection']
                },
                {
                  icon: Shield,
                  title: 'AI Detection Removal',
                  description: 'Humanize AI-generated content to bypass detection tools',
                  color: 'from-emerald-500 to-teal-500',
                  features: ['Pattern Analysis', 'Content Rewriting', 'Human-like Tone']
                },
                {
                  icon: Search,
                  title: 'Research Assistant',
                  description: 'Find relevant sources and academic references',
                  color: 'from-orange-500 to-red-500',
                  features: ['Source Discovery', 'Citation Generation', 'Literature Review']
                },
                {
                  icon: Download,
                  title: 'Export & Publishing',
                  description: 'Professional formatting and document export',
                  color: 'from-indigo-500 to-purple-500',
                  features: ['Multiple Formats', 'Academic Standards', 'Publishing Ready']
                },
                {
                  icon: TrendingUp,
                  title: 'Progress Tracking',
                  description: 'Monitor your writing progress and improvements',
                  color: 'from-pink-500 to-rose-500',
                  features: ['Writing Analytics', 'Goal Setting', 'Achievement Tracking']
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Papers Written', value: '2,847', icon: FileText, color: 'text-blue-400' },
                { label: 'Students Helped', value: '15,432', icon: Users, color: 'text-green-400' },
                { label: 'AI Detection Removed', value: '98.7%', icon: Shield, color: 'text-purple-400' },
                { label: 'Success Rate', value: '99.2%', icon: Award, color: 'text-yellow-400' }
              ].map((stat, index) => (
                <div key={index} className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <div>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-gray-300 text-sm">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Papers Tab */}
        {activeTab === 'papers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Academic Papers</h2>
              <button
                onClick={() => setActiveTab('outline')}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Paper</span>
              </button>
            </div>

            {papersLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                <span className="ml-3 text-gray-300">Loading papers...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPapers && Array.isArray(userPapers) ? (
                  userPapers.map((project: PaperProject) => (
                    <div
                      key={project.id}
                      className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <span className="bg-purple-600/20 px-2 py-1 rounded">{project.paper_type}</span>
                            <span className="bg-blue-600/20 px-2 py-1 rounded">{project.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Word Count:</span>
                          <span className="text-white font-medium">{project.word_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Created:</span>
                          <span className="text-white font-medium">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
                          <Download className="w-4 h-4" />
                          <span>Export</span>
                        </button>
                        <button className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Papers Yet</h3>
                    <p className="text-gray-300 mb-6">Start your first academic paper to see it here</p>
                    <button
                      onClick={() => setActiveTab('outline')}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
                    >
                      Create Your First Paper
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Paper Outline Tab */}
        {activeTab === 'outline' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Generate Paper Outline</h2>
              
              <form onSubmit={generateOutline} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Research Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter your research topic..."
                    className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Paper Type</label>
                    <select
                      value={paperType}
                      onChange={(e) => setPaperType(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="research">Research Paper</option>
                      <option value="review">Literature Review</option>
                      <option value="thesis">Thesis</option>
                      <option value="dissertation">Dissertation</option>
                      <option value="article">Journal Article</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Academic Level</label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="undergraduate">Undergraduate</option>
                      <option value="graduate">Graduate</option>
                      <option value="phd">PhD</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Word Count</label>
                    <input
                      type="number"
                      value={wordCount}
                      onChange={(e) => setWordCount(parseInt(e.target.value))}
                      min="1000"
                      max="50000"
                      step="500"
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Citation Style</label>
                    <select
                      value={citationStyle}
                      onChange={(e) => setCitationStyle(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="apa">APA</option>
                      <option value="mla">MLA</option>
                      <option value="chicago">Chicago</option>
                      <option value="harvard">Harvard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Special Requirements</label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Any specific requirements or guidelines..."
                    rows={3}
                    className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Outline...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Expert Outline</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results */}
            {generatedOutline && (
              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Generated Outline</h3>
                
                <div className="space-y-6">
                  <div className="bg-purple-600/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-300 mb-2">Paper Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Topic:</span>
                        <span className="text-white">{generatedOutline.topic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Type:</span>
                        <span className="text-white">{generatedOutline.paper_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Words:</span>
                        <span className="text-white">{generatedOutline.total_words.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Paper Structure</h4>
                    <div className="space-y-3">
                      {generatedOutline.structure.map((section, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                          <h5 className="font-medium text-blue-300 mb-2">{section.section}</h5>
                          <p className="text-sm text-gray-300 mb-2">{section.topic_focus}</p>
                          <div className="space-y-1">
                            {section.subsections.map((subsection, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                <span className="text-sm text-gray-300">{subsection}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-600/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-300 mb-2">Estimated Timeline</h4>
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">Total Days:</span>
                        <span className="text-white">{generatedOutline.estimated_completion.total_estimated_days}</span>
                      </div>
                      {Object.entries(generatedOutline.estimated_completion.phases).map(([phase, time]) => (
                        <div key={phase} className="flex justify-between">
                          <span className="text-gray-300">{phase}:</span>
                          <span className="text-white">{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs would be implemented similarly... */}
        {activeTab === 'editing' && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Expert Editing Tools</h3>
            <p className="text-gray-300">Professional academic editing and enhancement coming soon...</p>
          </div>
        )}

        {activeTab === 'ai-removal' && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Detection Removal</h3>
            <p className="text-gray-300">Humanize your content to bypass AI detection tools...</p>
          </div>
        )}

        {activeTab === 'research' && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Research Assistant</h3>
            <p className="text-gray-300">Find relevant academic sources and references...</p>
          </div>
        )}
      </div>
    </div>
  );
}