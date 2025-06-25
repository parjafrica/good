import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, AlertCircle, CheckCircle, 
  X, Loader, Sparkles, File, FileImage,
  Send
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

interface DocumentUploadProps {
  onUploadComplete?: (opportunityId: string, analysis: any) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'docx':
      case 'doc': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'txt': return <FileText className="w-8 h-8 text-gray-500" />;
      default: return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('user_id', user?.id || 'anonymous');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
        if (onUploadComplete) {
          onUploadComplete(result.opportunity_id, result.analysis);
        }
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!textContent.trim()) {
      setError('Please enter some text content');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const response = await fetch('/api/documents/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_content: textContent,
          user_id: user?.id || 'anonymous'
        })
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
        setTextContent('');
        setShowTextInput(false);
        if (onUploadComplete) {
          onUploadComplete(result.opportunity_id, result.analysis);
        }
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error during analysis');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Upload Funding Call Document
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drop your funding call document here or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Supports PDF, DOCX, DOC, and TXT files
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Choose File
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Text Input Alternative */}
      <div className="text-center">
        <span className="text-gray-500 dark:text-gray-400">or</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {!showTextInput ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowTextInput(true)}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-700 dark:text-gray-300">
              Paste funding call text directly
            </span>
          </motion.button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste Funding Call Text
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste the full text of your funding call or opportunity here..."
                rows={8}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTextAnalysis}
                disabled={isUploading || !textContent.trim()}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Analyze Text
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowTextInput(false);
                  setTextContent('');
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-200">
                  Processing Document...
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  AI is analyzing your funding call document
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-200 mb-1">
                  Upload Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success State */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                  Document Processed Successfully!
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Title:</strong> {uploadResult.analysis.title}
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Organization:</strong> {uploadResult.analysis.organization}
                  </p>
                  {uploadResult.analysis.amount_max && (
                    <p className="text-green-700 dark:text-green-300">
                      <strong>Funding:</strong> ${uploadResult.analysis.amount_min?.toLocaleString()} - ${uploadResult.analysis.amount_max?.toLocaleString()} {uploadResult.analysis.currency}
                    </p>
                  )}
                </div>
                <p className="text-green-600 dark:text-green-400 text-sm mt-3">
                  Your custom funding opportunity has been added to the database and is now available for proposal generation.
                </p>
              </div>
              <button
                onClick={() => setUploadResult(null)}
                className="text-green-400 hover:text-green-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentUpload;