import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Folder,
  Star,
  Share,
  Clock,
  User,
  Tag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: string;
  name: string;
  type: 'proposal' | 'report' | 'contract' | 'template' | 'other';
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  createdBy: string;
  tags: string[];
  isStarred: boolean;
  isShared: boolean;
  folder?: string;
}

interface Folder {
  id: string;
  name: string;
  documentCount: number;
  color: string;
}

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  const [folders] = useState<Folder[]>([
    { id: '1', name: 'Proposals', documentCount: 12, color: 'blue' },
    { id: '2', name: 'Reports', documentCount: 8, color: 'green' },
    { id: '3', name: 'Contracts', documentCount: 5, color: 'purple' },
    { id: '4', name: 'Templates', documentCount: 15, color: 'orange' }
  ]);

  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'Youth Digital Skills Proposal.pdf',
      type: 'proposal',
      size: 2048000,
      createdAt: new Date('2024-01-15'),
      modifiedAt: new Date('2024-01-20'),
      createdBy: 'John Doe',
      tags: ['education', 'technology', 'youth'],
      isStarred: true,
      isShared: false,
      folder: 'Proposals'
    },
    {
      id: '2',
      name: 'Q4 Impact Report.docx',
      type: 'report',
      size: 1536000,
      createdAt: new Date('2024-01-10'),
      modifiedAt: new Date('2024-01-18'),
      createdBy: 'Sarah Johnson',
      tags: ['impact', 'quarterly', 'metrics'],
      isStarred: false,
      isShared: true,
      folder: 'Reports'
    },
    {
      id: '3',
      name: 'Grant Agreement Template.docx',
      type: 'template',
      size: 512000,
      createdAt: new Date('2024-01-05'),
      modifiedAt: new Date('2024-01-05'),
      createdBy: 'Admin',
      tags: ['template', 'legal', 'agreement'],
      isStarred: true,
      isShared: true,
      folder: 'Templates'
    },
    {
      id: '4',
      name: 'Budget Breakdown.xlsx',
      type: 'other',
      size: 256000,
      createdAt: new Date('2024-01-12'),
      modifiedAt: new Date('2024-01-16'),
      createdBy: 'Michael Chen',
      tags: ['budget', 'finance', 'planning'],
      isStarred: false,
      isShared: false,
      folder: 'Proposals'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'proposal': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'report': return <FileText className="w-5 h-5 text-green-400" />;
      case 'contract': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'template': return <FileText className="w-5 h-5 text-orange-400" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'proposal': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'report': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'contract': return 'text-purple-400 bg-purple-400/20 border-purple-400/30';
      case 'template': return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      default: return 'text-slate-400 bg-slate-400/20 border-slate-400/30';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesFolder = !selectedFolder || doc.folder === selectedFolder;
    
    return matchesSearch && matchesType && matchesFolder;
  });

  const toggleStar = (docId: string) => {
    console.log('Toggle star for document:', docId);
  };

  const handleShare = (docId: string) => {
    console.log('Share document:', docId);
  };

  const handleDelete = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      console.log('Delete document:', docId);
    }
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
            <h1 className="text-3xl font-bold text-white">Document Management</h1>
            <p className="text-slate-300">Organize and manage your project documents</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUpload(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Document</span>
        </motion.button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documents, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="proposal">Proposals</option>
              <option value="report">Reports</option>
              <option value="contract">Contracts</option>
              <option value="template">Templates</option>
              <option value="other">Other</option>
            </select>

            <div className="flex bg-slate-700/50 border border-slate-600/50 rounded-xl">
              <button
                onClick={() => setActiveView('grid')}
                className={`px-4 py-3 rounded-l-xl transition-all ${
                  activeView === 'grid' 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`px-4 py-3 rounded-r-xl transition-all ${
                  activeView === 'list' 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Folders</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedFolder(null)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                selectedFolder === null
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>All Documents</span>
              <span className="ml-auto text-sm">{documents.length}</span>
            </motion.button>

            {folders.map((folder) => (
              <motion.button
                key={folder.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedFolder(folder.name)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  selectedFolder === folder.name
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <Folder className={`w-5 h-5 text-${folder.color}-400`} />
                <span>{folder.name}</span>
                <span className="ml-auto text-sm">{folder.documentCount}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          {activeView === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-700/50 rounded-xl">
                      {getTypeIcon(doc.type)}
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => toggleStar(doc.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          doc.isStarred ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${doc.isStarred ? 'fill-current' : ''}`} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleShare(doc.id)}
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Share className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  <h3 className="text-white font-medium mb-2 line-clamp-2">{doc.name}</h3>
                  
                  <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getTypeColor(doc.type)} mb-3`}>
                    {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                  </div>

                  <div className="space-y-2 text-sm text-slate-400 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3" />
                      <span>{doc.createdBy}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(doc.modifiedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3 h-3" />
                      <span>{formatFileSize(doc.size)}</span>
                    </div>
                  </div>

                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {doc.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg">
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="p-2 bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 bg-slate-700/50 text-slate-400 rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-lg font-bold text-white">Documents ({filteredDocuments.length})</h3>
              </div>
              <div className="divide-y divide-slate-700/50">
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-slate-700/20 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-slate-700/50 rounded-lg">
                        {getTypeIcon(doc.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-white font-medium truncate">{doc.name}</h4>
                          {doc.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />}
                          {doc.isShared && <Share className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span>{doc.createdBy}</span>
                          <span>•</span>
                          <span>{formatDate(doc.modifiedAt)}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <div className={`px-2 py-1 rounded text-xs ${getTypeColor(doc.type)}`}>
                            {doc.type}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {filteredDocuments.length === 0 && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-700/50 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No documents found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Upload Your First Document
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Documents;