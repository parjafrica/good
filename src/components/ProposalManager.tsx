import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  RefreshCw,
  Sparkles,
  Send,
  ArrowRight,
  Users,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Proposal {
  id: string;
  title: string;
  donor: string;
  status: 'draft' | 'review' | 'submitted' | 'awarded' | 'declined';
  amount: number;
  deadline: string;
  progress: number;
  lastModified: string;
  description?: string;
  createdAt: Date;
  aiScore?: number;
  matchScore?: number;
  content?: {
    executiveSummary?: string;
    problemStatement?: string;
    objectives?: string;
    methodology?: string;
    budget?: string;
    timeline?: string;
    evaluation?: string;
  };
  team?: string[];
}

const ProposalManager: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      // For now, we'll use mock data
      const mockProposals: Proposal[] = [
        {
          id: '1',
          title: 'Youth Digital Literacy Program',
          donor: 'USAID',
          status: 'draft',
          amount: 250000,
          deadline: '2024-03-15',
          progress: 78,
          lastModified: '2 hours ago',
          description: 'A comprehensive program to improve digital literacy among youth in underserved communities.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
          aiScore: 87,
          matchScore: 92,
          content: {
            executiveSummary: 'This proposal outlines a comprehensive initiative to address the digital divide affecting youth in underserved communities...',
            problemStatement: 'Despite the growing importance of digital skills in today\'s economy, many young people lack access to quality digital education...',
            objectives: '1. Provide digital literacy training to 5,000 youth\n2. Establish 10 community technology centers\n3. Develop a sustainable digital skills curriculum',
            methodology: 'Our approach combines hands-on training with mentorship and access to technology resources...',
            budget: 'Personnel: $120,000\nEquipment: $80,000\nTraining Materials: $30,000\nFacilities: $20,000',
            timeline: 'Phase 1 (Months 1-3): Planning and setup\nPhase 2 (Months 4-9): Implementation\nPhase 3 (Months 10-12): Evaluation',
            evaluation: 'We will measure success through pre and post assessments, tracking of employment outcomes, and community impact surveys.'
          },
          team: ['Sarah Johnson (Project Director)', 'Michael Chen (Technical Lead)', 'Lisa Rodriguez (Community Outreach)']
        },
        {
          id: '2',
          title: 'Community Health Initiative',
          donor: 'Gates Foundation',
          status: 'review',
          amount: 500000,
          deadline: '2024-02-28',
          progress: 95,
          lastModified: '1 day ago',
          description: 'Improving healthcare access in rural communities through mobile clinics and telemedicine.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
          aiScore: 92,
          matchScore: 88,
          content: {
            executiveSummary: 'This initiative aims to address healthcare disparities in rural communities through innovative mobile health solutions...',
            problemStatement: 'Rural communities face significant barriers to healthcare access, including distance, lack of providers, and limited resources...',
            objectives: '1. Establish 5 mobile health clinics\n2. Implement telemedicine services in 20 communities\n3. Train 50 community health workers',
            methodology: 'Our comprehensive approach combines mobile clinics, telemedicine technology, and community health worker training...',
            budget: 'Medical Equipment: $200,000\nPersonnel: $150,000\nVehicles: $100,000\nTechnology: $50,000',
            timeline: 'Phase 1 (Months 1-2): Procurement and staffing\nPhase 2 (Months 3-10): Implementation\nPhase 3 (Months 11-12): Evaluation',
            evaluation: 'Success metrics include number of patients served, health outcomes improvement, and community satisfaction surveys.'
          },
          team: ['Dr. James Wilson (Medical Director)', 'Emily Parker (Operations Manager)', 'Robert Kim (Technology Specialist)']
        },
        {
          id: '3',
          title: 'Climate Resilience Project',
          donor: 'UNDP',
          status: 'submitted',
          amount: 750000,
          deadline: '2024-01-30',
          progress: 100,
          lastModified: '3 days ago',
          description: 'Building community resilience to climate change through sustainable development projects.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
          aiScore: 95,
          matchScore: 94,
          content: {
            executiveSummary: 'This project aims to build climate resilience in vulnerable coastal communities through sustainable infrastructure and capacity building...',
            problemStatement: 'Coastal communities are increasingly threatened by rising sea levels, extreme weather events, and environmental degradation...',
            objectives: '1. Implement nature-based coastal protection in 5 communities\n2. Train 200 community members in climate-adaptive practices\n3. Develop community-based early warning systems',
            methodology: 'We will use a participatory approach that combines traditional knowledge with scientific expertise...',
            budget: 'Infrastructure: $350,000\nTraining: $150,000\nEquipment: $200,000\nMonitoring: $50,000',
            timeline: 'Phase 1 (Months 1-3): Community engagement and planning\nPhase 2 (Months 4-18): Implementation\nPhase 3 (Months 19-24): Monitoring and evaluation',
            evaluation: 'We will track reduced damage from climate events, improved ecosystem health, and community preparedness metrics.'
          },
          team: ['Maria Gonzalez (Project Director)', 'Dr. Thomas Lee (Environmental Scientist)', 'Aisha Okafor (Community Engagement Specialist)']
        },
        {
          id: '4',
          title: 'Women Entrepreneurship Support',
          donor: 'Ford Foundation',
          status: 'awarded',
          amount: 300000,
          deadline: '2023-12-15',
          progress: 100,
          lastModified: '1 week ago',
          description: 'Empowering women entrepreneurs through business training, mentorship, and access to capital.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240),
          aiScore: 91,
          matchScore: 96,
          content: {
            executiveSummary: 'This program aims to empower women entrepreneurs in underserved communities through comprehensive business support...',
            problemStatement: 'Women entrepreneurs face disproportionate barriers to business success, including limited access to capital, networks, and training...',
            objectives: '1. Provide business training to 300 women entrepreneurs\n2. Facilitate access to microloans for 150 participants\n3. Create a mentorship network with 50 established business leaders',
            methodology: 'Our approach combines skills development, access to capital, and ongoing mentorship support...',
            budget: 'Training Programs: $100,000\nMicroloan Fund: $150,000\nMentorship Program: $30,000\nOperations: $20,000',
            timeline: 'Phase 1 (Months 1-2): Participant selection\nPhase 2 (Months 3-9): Training and mentorship\nPhase 3 (Months 10-12): Evaluation and reporting',
            evaluation: 'Success will be measured by business growth metrics, income increases, and sustainability of ventures.'
          },
          team: ['Jennifer Smith (Program Director)', 'David Okonkwo (Financial Advisor)', 'Sophia Chen (Training Coordinator)']
        },
        {
          id: '5',
          title: 'Education for All Initiative',
          donor: 'UNESCO',
          status: 'declined',
          amount: 450000,
          deadline: '2023-11-30',
          progress: 100,
          lastModified: '2 weeks ago',
          description: 'Improving access to quality education for children in conflict-affected regions.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 360),
          aiScore: 83,
          matchScore: 85,
          content: {
            executiveSummary: 'This initiative seeks to provide quality education opportunities for children in conflict-affected regions...',
            problemStatement: 'Children in conflict zones face severe disruptions to their education, with long-term consequences for their development and future prospects...',
            objectives: '1. Establish 15 safe learning spaces\n2. Train 100 teachers in trauma-informed education\n3. Provide educational materials to 5,000 children',
            methodology: 'Our approach prioritizes safety, psychosocial support, and quality learning in challenging environments...',
            budget: 'Learning Spaces: $200,000\nTeacher Training: $100,000\nEducational Materials: $100,000\nProgram Support: $50,000',
            timeline: 'Phase 1 (Months 1-3): Site selection and preparation\nPhase 2 (Months 4-10): Implementation\nPhase 3 (Months 11-12): Evaluation',
            evaluation: 'We will track enrollment, attendance, learning outcomes, and psychosocial wellbeing indicators.'
          },
          team: ['Dr. Ahmed Hassan (Education Specialist)', 'Grace Mwangi (Child Protection Officer)', 'John Doe (Operations Manager)']
        }
      ];
      
      setProposals(mockProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'awarded': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'review': return <Clock className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'awarded': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleCreateProposal = () => {
    navigate('/proposal-generator');
  };

  const handleEditProposal = (proposalId: string) => {
    // Find the proposal to edit
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      // In a real app, this would navigate to an edit page with the proposal data
      navigate(`/proposal-generator?edit=${proposalId}`);
    }
  };

  const handleViewProposal = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      setSelectedProposal(proposal);
      setShowViewModal(true);
    }
  };

  const handleDeleteProposal = (proposalId: string) => {
    setDeletingId(proposalId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProposal = () => {
    if (deletingId) {
      // In a real app, this would call an API to delete the proposal
      setProposals(prev => prev.filter(p => p.id !== deletingId));
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesFilter = filter === 'all' || proposal.status === filter;
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.donor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: proposals.length,
    inProgress: proposals.filter(p => p.status === 'draft' || p.status === 'review').length,
    submitted: proposals.filter(p => p.status === 'submitted' || p.status === 'awarded').length,
    totalValue: proposals.reduce((sum, p) => sum + p.amount, 0)
  };

  const renderViewModal = () => {
    if (!selectedProposal) return null;

    return (
      <AnimatePresence>
        {showViewModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowViewModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-8 lg:inset-16 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 z-50 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-bold text-white">{selectedProposal.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(selectedProposal.status)}`}>
                        {getStatusIcon(selectedProposal.status)}
                        {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-slate-400">Donor: {selectedProposal.donor}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        setShowViewModal(false);
                        handleEditProposal(selectedProposal.id);
                      }}
                      className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setShowViewModal(false)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Description */}
                      <div className="bg-slate-700/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                        <p className="text-slate-300">{selectedProposal.description}</p>
                      </div>

                      {/* Proposal Content */}
                      {selectedProposal.content && (
                        <div className="space-y-6">
                          {selectedProposal.content.executiveSummary && (
                            <div className="bg-slate-700/30 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-white mb-3">Executive Summary</h3>
                              <p className="text-slate-300 whitespace-pre-line">{selectedProposal.content.executiveSummary}</p>
                            </div>
                          )}

                          {selectedProposal.content.problemStatement && (
                            <div className="bg-slate-700/30 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-white mb-3">Problem Statement</h3>
                              <p className="text-slate-300 whitespace-pre-line">{selectedProposal.content.problemStatement}</p>
                            </div>
                          )}

                          {selectedProposal.content.objectives && (
                            <div className="bg-slate-700/30 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-white mb-3">Objectives</h3>
                              <p className="text-slate-300 whitespace-pre-line">{selectedProposal.content.objectives}</p>
                            </div>
                          )}

                          {selectedProposal.content.methodology && (
                            <div className="bg-slate-700/30 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-white mb-3">Methodology</h3>
                              <p className="text-slate-300 whitespace-pre-line">{selectedProposal.content.methodology}</p>
                            </div>
                          )}

                          {selectedProposal.content.budget && (
                            <div className="bg-slate-700/30 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-white mb-3">Budget</h3>
                              <p className="text-slate-300 whitespace-pre-line">{selectedProposal.content.budget}</p>
                            </div>
                          )}

                          {selectedProposal.content.timeline && (
                            <div className="bg-slate-700/30 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-white mb-3">Timeline</h3>
                              <p className="text-slate-300 whitespace-pre-line">{selectedProposal.content.timeline}</p>
                            </div>
                          )}

                          {selectedProposal.content.evaluation && (
                            <div className="bg-slate-700/30 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-white mb-3">Monitoring & Evaluation</h3>
                              <p className="text-slate-300 whitespace-pre-line">{selectedProposal.content.evaluation}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Team */}
                      {selectedProposal.team && selectedProposal.team.length > 0 && (
                        <div className="bg-slate-700/30 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-white mb-3">Project Team</h3>
                          <ul className="space-y-2">
                            {selectedProposal.team.map((member, index) => (
                              <li key={index} className="flex items-center space-x-2 text-slate-300">
                                <Users className="w-4 h-4 text-blue-400" />
                                <span>{member}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      {/* Key Details */}
                      <div className="bg-slate-700/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Key Details</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Amount:</span>
                            <span className="text-white font-medium">${selectedProposal.amount.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Deadline:</span>
                            <span className="text-orange-400 font-medium">{new Date(selectedProposal.deadline).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Created:</span>
                            <span className="text-white font-medium">{selectedProposal.createdAt.toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Last Modified:</span>
                            <span className="text-white font-medium">{selectedProposal.lastModified}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Scores */}
                      {(selectedProposal.aiScore || selectedProposal.matchScore) && (
                        <div className="bg-slate-700/30 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">AI Analysis</h3>
                          
                          <div className="space-y-4">
                            {selectedProposal.aiScore && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-400">Quality Score:</span>
                                  <span className="text-white font-medium">{selectedProposal.aiScore}/100</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-2">
                                  <motion.div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selectedProposal.aiScore}%` }}
                                    transition={{ duration: 1 }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {selectedProposal.matchScore && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-400">Donor Match:</span>
                                  <span className="text-white font-medium">{selectedProposal.matchScore}%</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-2">
                                  <motion.div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selectedProposal.matchScore}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowViewModal(false);
                            handleEditProposal(selectedProposal.id);
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                          <Edit className="w-5 h-5" />
                          <span>Edit Proposal</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          className="w-full px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
                        >
                          <Download className="w-5 h-5" />
                          <span>Download PDF</span>
                        </motion.button>

                        {selectedProposal.status === 'draft' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            className="w-full px-6 py-3 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-600/30 transition-all flex items-center justify-center space-x-2"
                          >
                            <Send className="w-5 h-5" />
                            <span>Submit Proposal</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  const renderDeleteModal = () => {
    const proposalToDelete = proposals.find(p => p.id === deletingId);
    
    return (
      <AnimatePresence>
        {showDeleteModal && proposalToDelete && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 z-50 p-6 w-full max-w-md"
            >
              <div className="text-center mb-6">
                <div className="p-3 bg-red-600/20 rounded-full w-fit mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Proposal</h3>
                <p className="text-slate-300">
                  Are you sure you want to delete <span className="font-semibold">"{proposalToDelete.title}"</span>? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDeleteProposal}
                  className="flex-1 px-4 py-3 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-600/30 transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600/20 rounded-xl">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Proposal Management</h1>
            <p className="text-slate-300">Create, manage, and track your grant proposals</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateProposal}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Proposal</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Proposals</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-yellow-600/20 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Submitted</p>
              <p className="text-2xl font-bold text-green-400">{stats.submitted}</p>
            </div>
            <div className="p-3 bg-green-600/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-purple-400">${(stats.totalValue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposals..."
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="submitted">Submitted</option>
                <option value="awarded">Awarded</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Proposals List */}
      <div className="space-y-6">
        <AnimatePresence>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
              >
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
                      <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
                      <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full"></div>
                </div>
              </motion.div>
            ))
          ) : (
            filteredProposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{proposal.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(proposal.status)}`}>
                        {getStatusIcon(proposal.status)}
                        <span>{proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}</span>
                      </span>
                    </div>
                    
                    <p className="text-slate-400 mb-3">{proposal.donor}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Amount:</span>
                        <span className="text-white font-medium ml-2">${proposal.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Deadline:</span>
                        <span className="text-white font-medium ml-2">{new Date(proposal.deadline).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Last Modified:</span>
                        <span className="text-white font-medium ml-2">{proposal.lastModified}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleViewProposal(proposal.id)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditProposal(proposal.id)}
                      className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-600/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteProposal(proposal.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Progress: {proposal.progress}%</span>
                    {proposal.aiScore && (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">AI Score: {proposal.aiScore}/100</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${proposal.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!loading && filteredProposals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-700/50 text-center"
        >
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No proposals found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your search terms or filters</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleCreateProposal}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Create Your First Proposal
          </motion.button>
        </motion.div>
      )}

      {/* View Modal */}
      {renderViewModal()}

      {/* Delete Confirmation Modal */}
      {renderDeleteModal()}
    </div>
  );
};

export default ProposalManager;