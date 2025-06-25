import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  Building,
  Tag,
  SortAsc,
  SortDesc,
  MoreVertical,
  Share2,
  Copy,
  Star,
  StarOff,
  RefreshCw,
  Send,
  Award,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_review' | 'in_review' | 'completed' | 'submitted';
  content: any;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  opportunityTitle?: string;
  fundingAmount?: string;
  adminNotes?: string;
}

const ProposalManager: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showProposalDetail, setShowProposalDetail] = useState(false);

  // Fetch proposals from database
  const { data: proposals = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/proposals/user'],
    refetchInterval: 30000, // Refresh every 30 seconds to sync with admin updates
  });

  // Delete proposal mutation
  const deleteMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete proposal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/proposals/user'] });
    },
  });

  // Filter and sort proposals
  const filteredProposals = proposals
    .filter((proposal: Proposal) => {
      const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proposal.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a: Proposal, b: Proposal) => {
      const aVal = a[sortBy as keyof Proposal] || '';
      const bVal = b[sortBy as keyof Proposal] || '';
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4 text-gray-500" />;
      case 'pending_review': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_review': return <Users className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'submitted': return <Send className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'pending_review': return 'Expert Review Pending';
      case 'in_review': return 'Under Expert Review';
      case 'completed': return 'Expert Reviewed';
      case 'submitted': return 'Submitted';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      case 'pending_review': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'in_review': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'submitted': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const downloadProposal = (proposal: Proposal) => {
    const content = `
PROPOSAL: ${proposal.title}

Description: ${proposal.description}

Status: ${getStatusText(proposal.status)}

Created: ${new Date(proposal.createdAt).toLocaleDateString()}

${proposal.adminNotes ? `\nExpert Notes:\n${proposal.adminNotes}` : ''}

Content:
${JSON.stringify(proposal.content, null, 2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proposal.title.replace(/[^a-zA-Z0-9]/g, '_')}_proposal.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Proposals</h1>
              <p className="text-gray-400">Track and manage your funding proposals</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/donor-discovery'}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Proposal
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Proposals</p>
                  <p className="text-2xl font-bold text-white">{proposals.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Under Review</p>
                  <p className="text-2xl font-bold text-white">
                    {proposals.filter((p: Proposal) => p.status === 'pending_review' || p.status === 'in_review').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {proposals.filter((p: Proposal) => p.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">94%</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Expert Review Pending</option>
                <option value="in_review">Under Expert Review</option>
                <option value="completed">Expert Reviewed</option>
                <option value="submitted">Submitted</option>
              </select>
              
              <button
                onClick={() => refetch()}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Proposals List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading proposals...</p>
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Proposals Found</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No proposals match your current filters.' 
                    : 'Start by creating your first proposal.'}
                </p>
                <button
                  onClick={() => window.location.href = '/donor-discovery'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Proposal
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredProposals.map((proposal: Proposal) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{proposal.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(proposal.status)}
                              {getStatusText(proposal.status)}
                            </div>
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{proposal.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Created: {new Date(proposal.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(proposal.updatedAt).toLocaleDateString()}</span>
                          {proposal.adminNotes && (
                            <span className="text-blue-400">• Expert notes available</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setShowProposalDetail(true);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadProposal(proposal)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(proposal.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proposal Detail Modal */}
      <AnimatePresence>
        {showProposalDetail && selectedProposal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedProposal.title}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProposal.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedProposal.status)}
                          {getStatusText(selectedProposal.status)}
                        </div>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProposalDetail(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300">{selectedProposal.description}</p>
                </div>
                
                {selectedProposal.adminNotes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Expert Notes</h3>
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                      <p className="text-blue-300">{selectedProposal.adminNotes}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Content</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedProposal.content, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => downloadProposal(selectedProposal)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Proposal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProposalManager;