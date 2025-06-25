import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, FileText, Sparkles, Download, Copy, RefreshCw, 
  CheckCircle, Upload, File, X, Play, Pause, Square, 
  Lightbulb, Target, Clock, DollarSign, Users, BarChart3,
  Zap, ArrowRight, Brain, Send, Volume2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import DocumentUpload from './DocumentUpload';
import IntelligentBotAssistant from './IntelligentBotAssistant';
import ProposalReviewWorkflow from './ProposalReviewWorkflow';

interface OpportunityDetails {
  id: string;
  title: string;
  description: string;
  amountMin: number;
  amountMax: number;
  currency: string;
  sector: string;
  country: string;
  eligibilityCriteria: string;
  applicationProcess: string;
  sourceName: string;
}

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  isExpanded: boolean;
  isGenerating: boolean;
}

interface VoiceRecording {
  id: string;
  duration: number;
  blob: Blob;
  url: string;
  transcription?: string;
}

const EnhancedProposalGenerator: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<OpportunityDetails | null>(null);

  // Initialize opportunity from navigation state
  useEffect(() => {
    console.log('Location state:', location.state);
    if (location.state?.opportunity) {
      setOpportunity(location.state.opportunity);
    }
  }, [location.state]);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceRecordings, setVoiceRecordings] = useState<VoiceRecording[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [realTimeTranscript, setRealTimeTranscript] = useState('');
  
  // Proposal sections - will be dynamically generated based on opportunity analysis
  const [sections, setSections] = useState<ProposalSection[]>([]);
  
  // Expert assistance state
  const [opportunityAnalysis, setOpportunityAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('executive_summary');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [proposalStatus, setProposalStatus] = useState('generating');
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setRealTimeTranscript(finalTranscript + interimTranscript);
        
        if (finalTranscript) {
          // Auto-add to active section
          setSections(prev => prev.map(section => 
            section.id === activeSection 
              ? { ...section, content: section.content + ' ' + finalTranscript }
              : section
          ));
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, [activeSection]);
  
  // Analyze opportunity when received and generate adaptive sections
  useEffect(() => {
    if (opportunity && !opportunityAnalysis) {
      analyzeOpportunity();
    }
  }, [opportunity]);

  // Generate sections based on analysis
  useEffect(() => {
    if (opportunityAnalysis && opportunityAnalysis.required_sections) {
      const adaptiveSections = opportunityAnalysis.required_sections.map((section: any, index: number) => ({
        id: section.section_name.toLowerCase().replace(/\s+/g, '_'),
        title: section.section_name,
        content: '',
        isExpanded: index === 0, // First section expanded by default
        isGenerating: false,
        requirements: section
      }));
      setSections(adaptiveSections);
      setActiveSection(adaptiveSections[0]?.id || '');
    }
  }, [opportunityAnalysis]);
  
  const analyzeOpportunity = async () => {
    if (!opportunity) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/proposal/analyze-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunity.id })
      });
      
      if (response.ok) {
        const data = await response.json();
        setOpportunityAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error analyzing opportunity:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
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
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start real-time transcription
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop real-time transcription
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      setRecordingDuration(0);
      setRealTimeTranscript('');
    }
  };
  
  const handleBotSuggestion = (suggestion: string, sectionId: string) => {
    // Find the section and append the suggestion
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            content: section.content 
              ? section.content + '\n\n' + suggestion 
              : suggestion 
          }
        : section
    ));
  };

  const saveDraftToDatabase = async () => {
    try {
      const proposalData = {
        user_id: user?.id || 'anonymous',
        opportunity_id: opportunity?.id,
        content: {
          title: opportunity?.title,
          sections: sections.reduce((acc, section) => {
            acc[section.id] = {
              title: section.title,
              content: section.content,
              requirements: section.requirements
            };
            return acc;
          }, {} as any)
        }
      };

      const response = await fetch('/api/proposal/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposalData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Draft saved to database:', data.proposal_id);
        setSavedProposalId(data.proposal_id);
        setProposalStatus(data.status || 'pending_review');
        return data.proposal_id;
      } else {
        throw new Error('Failed to save proposal');
      }
    } catch (error) {
      console.error('Error saving draft to database:', error);
      return null;
    }
  };

  const generateSection = async (sectionId: string, userInput: string = '') => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, isGenerating: true } : s
    ));
    
    try {
      const response = await fetch('/api/proposal/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_name: section.title,
          opportunity,
          user_input: userInput,
          transcribed_text: realTimeTranscript,
          section_requirements: section.requirements
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSections(prev => prev.map(s => 
          s.id === sectionId 
            ? { ...s, content: data.content, isGenerating: false }
            : s
        ));
      } else {
        throw new Error('Failed to generate section');
      }
    } catch (error) {
      console.error('Error generating section:', error);
      setSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { ...s, isGenerating: false }
          : s
      ));
    }
  };
  
  const enhanceContent = async (sectionId: string, enhancementType: string = 'improve') => {
    const section = sections.find(s => s.id === sectionId);
    if (!section?.content) return;
    
    setSections(prev => prev.map(s => 
      s.id === sectionId 
        ? { ...s, isGenerating: true }
        : s
    ));
    
    try {
      const response = await fetch('/api/proposal/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: section.content,
          opportunity_id: opportunity?.id,
          enhancement_type: enhancementType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSections(prev => prev.map(s => 
          s.id === sectionId 
            ? { ...s, content: data.enhanced_content, isGenerating: false }
            : s
        ));
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
    } finally {
      setSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { ...s, isGenerating: false }
          : s
      ));
    }
  };
  
  const getSuggestions = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section?.content) return;
    
    try {
      const response = await fetch('/api/proposal/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_text: section.content,
          opportunity_id: opportunity?.id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };
  
  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
    setActiveSection(sectionId);
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg text-center"
            >
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Opportunity Selected
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select a funding opportunity from discovery or upload your own funding call document.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/donor-discovery')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Browse Opportunities
                </button>
                <button
                  onClick={() => setShowDocumentUpload(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Custom Call
                </button>
              </div>
            </motion.div>

            {/* Document Upload Component */}
            <AnimatePresence>
              {showDocumentUpload && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Upload Custom Funding Call
                    </h3>
                    <button
                      onClick={() => setShowDocumentUpload(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <DocumentUpload
                    onUploadComplete={(opportunityId, analysis) => {
                      setOpportunity({
                        id: opportunityId,
                        title: analysis.title,
                        description: analysis.description,
                        amountMin: analysis.amount_min,
                        amountMax: analysis.amount_max,
                        currency: analysis.currency,
                        sector: analysis.focus_areas[0] || 'General',
                        country: analysis.countries[0] || 'Global',
                        eligibilityCriteria: analysis.eligibility_criteria,
                        applicationProcess: analysis.application_process,
                        sourceName: analysis.organization
                      });
                      setShowDocumentUpload(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                AI Proposal Generator
              </h1>
              <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  {opportunity.title}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  {opportunity.sourceName} • {opportunity.sector} • {opportunity.country}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Funding: ${opportunity.amountMin?.toLocaleString()} - ${opportunity.amountMax?.toLocaleString()} {opportunity.currency}
                </p>
              </div>
            </div>
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            ) : opportunityAnalysis && (
              <div className="text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Voice Recording Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Real-time Voice Input
          </h3>
          
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isRecording ? `Recording... ${formatDuration(recordingDuration)}` : 'Start Recording'}
            </motion.button>
            
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live</span>
              </div>
            )}
          </div>
          
          {realTimeTranscript && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Real-time transcript:</strong> {realTimeTranscript}
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Intelligent Bot Assistant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <IntelligentBotAssistant
            opportunity={opportunity}
            onSuggestion={handleBotSuggestion}
            activeSection={activeSection}
          />
        </motion.div>
        
        {/* Opportunity Analysis */}
        {opportunityAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Analysis & Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunityAnalysis.critical_requirements?.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Critical Requirements
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    {opportunityAnalysis.critical_requirements.slice(0, 3).map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {opportunityAnalysis.success_strategies?.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Success Strategies
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    {opportunityAnalysis.success_strategies.slice(0, 3).map((strategy: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {opportunityAnalysis.competitive_edge?.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Competitive Edge
                  </h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    {opportunityAnalysis.competitive_edge.slice(0, 3).map((edge: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        {edge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Proposal Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden"
            >
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {section.content && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Complete
                      </span>
                    )}
                    <motion.div
                      animate={{ rotate: section.isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                </div>
              </div>
              
              <AnimatePresence>
                {section.isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6 space-y-4">
                      {section.isGenerating ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-gray-400">
                              Expert system is generating content...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <textarea
                            value={section.content}
                            onChange={(e) => setSections(prev => prev.map(s => 
                              s.id === section.id 
                                ? { ...s, content: e.target.value }
                                : s
                            ))}
                            placeholder={`Enter your ${section.title.toLowerCase()} here...`}
                            className="w-full h-40 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => generateSection(section.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Sparkles className="w-4 h-4" />
                              Generate with Expert
                            </motion.button>
                            
                            {section.content && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => enhanceContent(section.id, 'improve')}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                  <Zap className="w-4 h-4" />
                                  Enhance
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => getSuggestions(section.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                >
                                  <Lightbulb className="w-4 h-4" />
                                  Get Suggestions
                                </motion.button>
                              </>
                            )}
                          </div>
                          
                          {suggestions.length > 0 && activeSection === section.id && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/50 rounded-lg p-4">
                              <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                                AI Suggestions:
                              </h4>
                              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                {suggestions.map((suggestion, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        {/* Proposal Review Workflow */}
        {savedProposalId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ProposalReviewWorkflow
              proposalId={savedProposalId}
              status={proposalStatus}
              onStatusChange={setProposalStatus}
            />
          </motion.div>
        ) : (
          /* Export Actions */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Generate Complete Proposal Package
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Create your full proposal and send to our expert review team
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Generate downloadable content
                    const proposalContent = sections.map(section => 
                      `${section.title}\n${'='.repeat(section.title.length)}\n\n${section.content || 'Content not yet generated'}\n\n`
                    ).join('');
                    
                    const fullProposal = `GRANT PROPOSAL\n\nTitle: ${opportunity?.title}\nFunder: ${opportunity?.sourceName}\nAmount: ${opportunity?.currency} ${opportunity?.amountMin?.toLocaleString()} - ${opportunity?.amountMax?.toLocaleString()}\n\n${proposalContent}`;
                    
                    const blob = new Blob([fullProposal], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${opportunity?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_proposal_draft.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    // Show success flow
                    setShowDownloadFlow(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Draft
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExpertFlow(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Send for Expert Review
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProposalGenerator;