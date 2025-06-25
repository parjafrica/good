import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, FileText, Sparkles, Download, Copy, RefreshCw, CheckCircle, Gem, Upload, File, X, Play, Pause, Square, FileImage, FileSpreadsheet, File as FilePdf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  file: File;
}

interface VoiceRecording {
  id: string;
  duration: number;
  blob: Blob;
  url: string;
}

const ProposalGenerator: React.FC = () => {
  const { user, deductCredits } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [projectDescription, setProjectDescription] = useState('');
  const [organizationName, setOrganizationName] = useState(user?.organization?.name || 'Impact First Foundation');
  const [fundingAmount, setFundingAmount] = useState('50000');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [voiceRecordings, setVoiceRecordings] = useState<VoiceRecording[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Add IDs to elements for tour guide
    const addIdsToElements = () => {
      const inputSection = document.querySelector('.space-y-6');
      if (inputSection) {
        inputSection.setAttribute('id', 'proposal-input');
      }
      
      const inputMethods = document.querySelector('.space-y-3');
      if (inputMethods) {
        inputMethods.setAttribute('id', 'input-methods');
      }
    };
    
    // Run after component is mounted
    setTimeout(addIdsToElements, 500);
  }, []);

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-blue-400" />;
    if (type.includes('pdf')) return <FilePdf className="w-5 h-5 text-red-400" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    setProcessingFiles(true);
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = Date.now().toString() + i;
      
      // Read file content for text files
      let content = '';
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        try {
          content = await file.text();
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }

      newFiles.push({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        content,
        file
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setProcessingFiles(false);

    // Auto-extract content from text files
    const textContent = newFiles
      .filter(f => f.content)
      .map(f => f.content)
      .join('\n\n');
    
    if (textContent) {
      setProjectDescription(prev => prev + (prev ? '\n\n' : '') + textContent);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const recording: VoiceRecording = {
          id: Date.now().toString(),
          duration: recordingDuration,
          blob,
          url
        };
        setVoiceRecordings(prev => [...prev, recording]);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        recordingIntervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const removeRecording = (recordingId: string) => {
    setVoiceRecordings(prev => {
      const recording = prev.find(r => r.id === recordingId);
      if (recording) {
        URL.revokeObjectURL(recording.url);
      }
      return prev.filter(r => r.id !== recordingId);
    });
  };

  const handleGenerateProposal = async () => {
    if (!projectDescription.trim() && uploadedFiles.length === 0 && voiceRecordings.length === 0) {
      alert('Please provide project information through text, files, or voice recording');
      return;
    }

    if (!deductCredits(5)) {
      alert('Insufficient credits. Please purchase more credits to generate a proposal.');
      return;
    }

    setIsGenerating(true);
    setShowWelcome(false);

    try {
      // Combine all input sources
      let combinedContent = projectDescription;
      
      // Add file contents
      const fileContents = uploadedFiles
        .filter(f => f.content)
        .map(f => `[From ${f.name}]:\n${f.content}`)
        .join('\n\n');
      
      if (fileContents) {
        combinedContent += (combinedContent ? '\n\n' : '') + fileContents;
      }

      // Note about voice recordings (in real implementation, these would be transcribed)
      if (voiceRecordings.length > 0) {
        combinedContent += (combinedContent ? '\n\n' : '') + 
          `[Voice recordings provided: ${voiceRecordings.length} recording(s) - would be transcribed in production]`;
      }

      const proposal = await aiService.generateProposal({
        prompt: combinedContent,
        context: {
          title: 'AI-Generated Proposal',
          organizationName,
          fundingAmount: parseInt(fundingAmount),
          hasFiles: uploadedFiles.length > 0,
          hasVoiceRecordings: voiceRecordings.length > 0
        }
      });
      
      setGeneratedProposal(proposal);
    } catch (error) {
      console.error('Error generating proposal:', error);
      alert('Error generating proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(generatedProposal);
    // Show success message
  };

  const handleDownloadProposal = () => {
    const blob = new Blob([generatedProposal], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-generated-proposal.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showWelcome && !generatedProposal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl w-full"
        >
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center space-x-3 mb-6"
            >
              <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">
              🎉 Welcome to Granada, {user?.fullName?.split(' ')[0]}!
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Let's generate your first AI-powered proposal in under 5 minutes
            </p>

            {/* Credits Display */}
            <div className="inline-flex items-center space-x-8 px-8 py-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">100</div>
                <div className="text-slate-400 text-sm">Free Credits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">14</div>
                <div className="text-slate-400 text-sm">Days Trial</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">∞</div>
                <div className="text-slate-400 text-sm">Proposals</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50"
              id="proposal-input"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Mic className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Tell Us About Your Project</h2>
              </div>

              {/* Input Methods Tabs */}
              <div className="space-y-6" id="input-methods">
                {/* Voice Recording */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">🎤 Voice Recording</h3>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={isRecording ? (isPaused ? pauseRecording : pauseRecording) : startRecording}
                      className={`w-full flex items-center justify-center space-x-3 py-4 rounded-xl border-2 border-dashed transition-all ${
                        isRecording 
                          ? 'border-red-500 bg-red-600/10 text-red-400' 
                          : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                          <span className="font-medium">
                            {isPaused ? 'Resume Recording' : 'Pause Recording'} ({formatDuration(recordingDuration)})
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span>Click to record your project idea</span>
                        </>
                      )}
                    </motion.button>

                    {isRecording && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopRecording}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                      >
                        <Square className="w-4 h-4" />
                        <span>Stop Recording</span>
                      </motion.button>
                    )}

                    {/* Voice Recordings List */}
                    {voiceRecordings.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-300">Recorded Audio:</h4>
                        {voiceRecordings.map((recording) => (
                          <div key={recording.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                            <audio controls src={recording.url} className="flex-1 h-8" />
                            <span className="text-xs text-slate-400">{formatDuration(recording.duration)}</span>
                            <button
                              onClick={() => removeRecording(recording.id)}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">📁 Upload Documents</h3>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-600/10' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".txt,.md,.pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-300 font-medium mb-1">
                        Drop files here or click to upload
                      </p>
                      <p className="text-slate-500 text-sm">
                        Supports: TXT, PDF, DOC, XLS files
                      </p>
                    </div>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-300">Uploaded Files:</h4>
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-300 font-medium truncate">{file.name}</p>
                            <p className="text-slate-500 text-xs">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {processingFiles && (
                    <div className="flex items-center space-x-2 text-slate-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Processing files...</span>
                    </div>
                  )}
                </div>

                {/* Text Input */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">✍️ Type Description</h3>
                  <textarea
                    ref={textareaRef}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Example: We want to provide clean water access to 5,000 people in rural Kenya through solar-powered water pumps. Our organization has 10 years of experience in water projects..."
                    className="w-full h-32 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Organization Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Organization Name</label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Funding Amount</label>
                    <input
                      type="text"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      placeholder="$50,000"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateProposal}
                  disabled={(!projectDescription.trim() && uploadedFiles.length === 0 && voiceRecordings.length === 0) || isGenerating}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">
                    {isGenerating ? 'Generating...' : 'Generate AI Proposal (5 Credits)'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Gem className="w-4 h-4" />
                    <span className="text-sm">5</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>

            {/* Preview Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Generated Proposal</h2>
              </div>

              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <FileText className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-slate-400 mb-2">Your AI-generated proposal will appear here</p>
                  <p className="text-slate-500 text-sm">Professional, compelling, and ready to submit</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-600/20 rounded-xl">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Proposal Generator</h1>
            <p className="text-slate-300">Generate professional proposals from voice, files, or text</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 space-y-6"
          id="proposal-input"
        >
          <h2 className="text-xl font-bold text-white">Project Information</h2>
          
          {/* Voice Recording Section */}
          <div className="space-y-3" id="input-methods">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Mic className="w-5 h-5 text-green-400" />
              <span>Voice Recording</span>
            </h3>
            
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                  isRecording 
                    ? 'bg-red-600/20 border border-red-500/30 text-red-400' 
                    : 'bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30'
                }`}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? `Stop (${formatDuration(recordingDuration)})` : 'Start Recording'}</span>
              </motion.button>

              {isRecording && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={pauseRecording}
                  className="flex items-center space-x-2 px-4 py-3 bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 rounded-xl hover:bg-yellow-600/30 transition-all"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </motion.button>
              )}
            </div>

            {voiceRecordings.length > 0 && (
              <div className="space-y-2">
                {voiceRecordings.map((recording) => (
                  <div key={recording.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                    <audio controls src={recording.url} className="flex-1 h-8" />
                    <span className="text-xs text-slate-400">{formatDuration(recording.duration)}</span>
                    <button
                      onClick={() => removeRecording(recording.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-400" />
              <span>Upload Documents</span>
            </h3>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-600/10' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <div className="text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-300 text-sm">Drop files or click to upload</p>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center space-x-3 p-2 bg-slate-700/30 rounded-lg">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm truncate">{file.name}</p>
                      <p className="text-slate-500 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text Input */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>Text Description</span>
            </h3>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe your project, goals, and impact..."
              className="w-full h-32 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Organization Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-2">Organization</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-2">Funding Amount</label>
              <input
                type="text"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateProposal}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generating Proposal...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Proposal (5 Credits)</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Generated Proposal */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Generated Proposal</h2>
            {generatedProposal && (
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyProposal}
                  className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadProposal}
                  className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>

          <div className="h-96 overflow-y-auto">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-slate-300">Generating your proposal...</p>
                  <p className="text-slate-500 text-sm">Analyzing your input and creating professional content</p>
                </div>
              </div>
            ) : generatedProposal ? (
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">
                  {generatedProposal}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Your generated proposal will appear here</p>
                  <p className="text-slate-500 text-sm">Provide project information to get started</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProposalGenerator;