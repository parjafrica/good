import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, User, Clock, Edit3, Send, Mail, 
  CheckCircle, AlertCircle, Eye, Download,
  MessageSquare, Star, Calendar, DollarSign,
  Building, MapPin, Tag, ArrowRight, Save
} from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  user_name: string;
  user_email: string;
  opportunity_title: string;
  funder_name: string;
  amount: string;
  submitted_at: string;
  status: 'pending' | 'reviewing' | 'completed';
  content: any;
  admin_notes?: string;
}

const AdminProposalReviewPanel: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [editedContent, setEditedContent] = useState<any>({});
  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/admin/proposals/pending');
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setEditedContent(proposal.content || {});
    setAdminNotes(proposal.admin_notes || '');
  };

  const handleSectionEdit = (sectionId: string, newContent: string) => {
    setEditedContent(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections?.[sectionId],
          content: newContent
        }
      }
    }));
  };

  const handleSaveEdits = async () => {
    if (!selectedProposal) return;

    try {
      await fetch(`/api/admin/proposals/${selectedProposal.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedContent,
          admin_notes: adminNotes,
          status: 'reviewing'
        })
      });

      // Update local state
      setProposals(prev => prev.map(p => 
        p.id === selectedProposal.id 
          ? { ...p, content: editedContent, admin_notes: adminNotes, status: 'reviewing' }
          : p
      ));

      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save changes');
    }
  };

  const handleCompleteReview = async () => {
    if (!selectedProposal) return;

    try {
      await fetch(`/api/admin/proposals/${selectedProposal.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedContent,
          admin_notes: adminNotes,
          send_email: true
        })
      });

      // Update local state
      setProposals(prev => prev.map(p => 
        p.id === selectedProposal.id 
          ? { ...p, status: 'completed' }
          : p
      ));

      setSelectedProposal(null);
      alert('Proposal completed and sent to user!');
    } catch (error) {
      console.error('Complete review failed:', error);
      alert('Failed to complete review');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'reviewing': return 'text-blue-400 bg-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewing': return <Edit3 className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Proposal Review Panel
          </h1>
          <p className="text-slate-400">
            Review and enhance user proposals before final submission
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Proposals List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Pending Reviews ({proposals.length})
              </h2>

              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <motion.div
                    key={proposal.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSelectProposal(proposal)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedProposal?.id === proposal.id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-slate-600/30 bg-slate-700/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white text-sm line-clamp-2">
                        {proposal.opportunity_title}
                      </h3>
                      <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(proposal.status)}`}>
                        {getStatusIcon(proposal.status)}
                        {proposal.status}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {proposal.user_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {proposal.funder_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {proposal.amount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(proposal.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {proposals.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">No proposals pending review</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Proposal Editor */}
          <div className="lg:col-span-2">
            {selectedProposal ? (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                {/* Proposal Header */}
                <div className="mb-6 pb-6 border-b border-slate-700/30">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-2">
                        {selectedProposal.opportunity_title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {selectedProposal.user_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedProposal.user_email}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getStatusColor(selectedProposal.status)}`}>
                      {getStatusIcon(selectedProposal.status)}
                      {selectedProposal.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-400 mb-1">Funder</p>
                      <p className="text-white font-medium">{selectedProposal.funder_name}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-400 mb-1">Amount</p>
                      <p className="text-white font-medium">{selectedProposal.amount}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-400 mb-1">Submitted</p>
                      <p className="text-white font-medium">
                        {new Date(selectedProposal.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-400 mb-1">Sections</p>
                      <p className="text-white font-medium">
                        {Object.keys(editedContent.sections || {}).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sections Editor */}
                <div className="space-y-6 mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Edit Proposal Sections
                  </h3>

                  {Object.entries(editedContent.sections || {}).map(([sectionId, section]: [string, any]) => (
                    <div key={sectionId} className="bg-slate-700/30 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {section.title}
                      </h4>
                      <textarea
                        value={section.content || ''}
                        onChange={(e) => handleSectionEdit(sectionId, e.target.value)}
                        className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none resize-none"
                        placeholder="Edit section content..."
                      />
                    </div>
                  ))}
                </div>

                {/* Admin Notes */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Admin Notes
                  </h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full h-24 px-3 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                    placeholder="Add notes about changes made, feedback for user, etc..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveEdits}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCompleteReview}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Complete & Send to User
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Select a Proposal to Review
                  </h3>
                  <p className="text-slate-400">
                    Choose a proposal from the list to start editing and reviewing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProposalReviewPanel;