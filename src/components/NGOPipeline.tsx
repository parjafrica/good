import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  FileText, 
  Palette, 
  Globe, 
  Download, 
  Eye,
  CheckCircle,
  Loader,
  Sparkles,
  Image,
  Layout,
  Shield,
  Users,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ngoTemplateGenerator, NGODetails, BrandAssets, DocumentTemplate } from '../services/ngoTemplateGenerator';

const NGOPipeline: React.FC = () => {
  const { user, deductCredits } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ngoDetails, setNgoDetails] = useState<Partial<NGODetails>>({
    name: '',
    mission: '',
    vision: '',
    sector: 'Education',
    country: '',
    address: '',
    email: '',
    phone: '',
    foundedYear: new Date().getFullYear(),
    legalStructure: 'ngo',
    boardMembers: [{ name: '', position: 'Chairperson', background: '' }],
    keyStaff: [{ name: '', position: 'Executive Director', qualifications: '' }],
    targetBeneficiaries: '',
    geographicScope: '',
    fundingSources: []
  });
  const [generatedPackage, setGeneratedPackage] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const steps = [
    { id: 1, title: 'Organization Details', icon: Building },
    { id: 2, title: 'Brand & Identity', icon: Palette },
    { id: 3, title: 'Document Selection', icon: FileText },
    { id: 4, title: 'Generate Package', icon: Sparkles }
  ];

  const sectors = [
    'Education', 'Health', 'Environment', 'Human Rights', 'Economic Development',
    'Technology', 'Agriculture', 'Water & Sanitation', 'Gender Equality', 'Climate Change'
  ];

  const legalStructures = [
    { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
    { value: 'nonprofit', label: 'Non-Profit Organization' },
    { value: 'charity', label: 'Charitable Organization' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'social_enterprise', label: 'Social Enterprise' }
  ];

  const documentCategories = [
    {
      category: 'Governance',
      documents: [
        { id: 'governance-board-charter', title: 'Governance and Board Charter', required: true },
        { id: 'code-of-conduct', title: 'Code of Conduct and Ethics', required: true },
        { id: 'conflict-of-interest', title: 'Conflict of Interest Policy', required: true },
        { id: 'whistleblower-protection', title: 'Whistleblower Protection Policy', required: false }
      ]
    },
    {
      category: 'Compliance',
      documents: [
        { id: 'anti-money-laundering', title: 'Anti-Money Laundering Policy', required: true },
        { id: 'data-protection', title: 'Data Protection and Confidentiality Policy', required: true },
        { id: 'donor-compliance', title: 'Donor Compliance and Grant Management Policy', required: true },
        { id: 'fraud-bribery-corruption', title: 'Fraud, Bribery and Corruption Policy', required: true }
      ]
    },
    {
      category: 'Operations',
      documents: [
        { id: 'financial-management', title: 'Financial Management Policy', required: true },
        { id: 'human-resource-recruitment', title: 'Human Resource and Recruitment Policy', required: true },
        { id: 'procurement-asset-management', title: 'Procurement and Asset Management Policy', required: true },
        { id: 'banking-cash-handling', title: 'Banking and Cash Handling Procedures', required: false }
      ]
    },
    {
      category: 'Risk & Safety',
      documents: [
        { id: 'risk-management', title: 'Risk Management Framework', required: true },
        { id: 'anti-sexual-harassment', title: 'Anti-Sexual Harassment Policy', required: true },
        { id: 'internal-control', title: 'Internal Control Framework', required: false },
        { id: 'document-retention', title: 'Document Retention and Archiving Policy', required: false }
      ]
    }
  ];

  const updateNGODetails = (field: string, value: any) => {
    setNgoDetails(prev => ({ ...prev, [field]: value }));
  };

  const addBoardMember = () => {
    setNgoDetails(prev => ({
      ...prev,
      boardMembers: [...(prev.boardMembers || []), { name: '', position: '', background: '' }]
    }));
  };

  const updateBoardMember = (index: number, field: string, value: string) => {
    setNgoDetails(prev => ({
      ...prev,
      boardMembers: prev.boardMembers?.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const removeBoardMember = (index: number) => {
    setNgoDetails(prev => ({
      ...prev,
      boardMembers: prev.boardMembers?.filter((_, i) => i !== index)
    }));
  };

  const addStaffMember = () => {
    setNgoDetails(prev => ({
      ...prev,
      keyStaff: [...(prev.keyStaff || []), { name: '', position: '', qualifications: '' }]
    }));
  };

  const updateStaffMember = (index: number, field: string, value: string) => {
    setNgoDetails(prev => ({
      ...prev,
      keyStaff: prev.keyStaff?.map((staff, i) => 
        i === index ? { ...staff, [field]: value } : staff
      )
    }));
  };

  const removeStaffMember = (index: number) => {
    setNgoDetails(prev => ({
      ...prev,
      keyStaff: prev.keyStaff?.filter((_, i) => i !== index)
    }));
  };

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const selectAllRequired = () => {
    const requiredDocs = documentCategories.flatMap(cat => 
      cat.documents.filter(doc => doc.required).map(doc => doc.id)
    );
    setSelectedDocuments(requiredDocs);
  };

  const selectAllDocuments = () => {
    const allDocs = documentCategories.flatMap(cat => cat.documents.map(doc => doc.id));
    setSelectedDocuments(allDocs);
  };

  const generateNGOPackage = async () => {
    if (!ngoDetails.name || !ngoDetails.mission || !ngoDetails.email) {
      alert('Please fill in all required fields');
      return;
    }

    const creditsNeeded = 25; // NGO package generation costs 25 credits
    if (!deductCredits(creditsNeeded)) {
      alert('Insufficient credits. Please purchase more credits to generate NGO package.');
      return;
    }

    setIsGenerating(true);
    try {
      const packageResult = await ngoTemplateGenerator.generateNGOPackage(ngoDetails as NGODetails);
      setGeneratedPackage(packageResult);
      setActiveStep(4);
    } catch (error) {
      console.error('Error generating NGO package:', error);
      alert('Error generating package. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDocument = async (documentId: string, format: 'docx' | 'pdf' = 'docx') => {
    try {
      const blob = await ngoTemplateGenerator.downloadDocument(documentId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Organization Details</h3>
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Organization Name *</label>
                <input
                  type="text"
                  value={ngoDetails.name || ''}
                  onChange={(e) => updateNGODetails('name', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Hope for Tomorrow Foundation"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 font-medium mb-2">Sector *</label>
                <select
                  value={ngoDetails.sector || ''}
                  onChange={(e) => updateNGODetails('sector', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Country *</label>
                <input
                  type="text"
                  value={ngoDetails.country || ''}
                  onChange={(e) => updateNGODetails('country', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Kenya"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Legal Structure</label>
                <select
                  value={ngoDetails.legalStructure || ''}
                  onChange={(e) => updateNGODetails('legalStructure', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {legalStructures.map(structure => (
                    <option key={structure.value} value={structure.value}>{structure.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Founded Year</label>
                <input
                  type="number"
                  value={ngoDetails.foundedYear || ''}
                  onChange={(e) => updateNGODetails('foundedYear', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Registration Number</label>
                <input
                  type="text"
                  value={ngoDetails.registrationNumber || ''}
                  onChange={(e) => updateNGODetails('registrationNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., NGO/12345/2020"
                />
              </div>
            </div>

            {/* Mission and Vision */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Mission Statement *</label>
                <textarea
                  value={ngoDetails.mission || ''}
                  onChange={(e) => updateNGODetails('mission', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Describe your organization's mission and purpose..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Vision Statement *</label>
                <textarea
                  value={ngoDetails.vision || ''}
                  onChange={(e) => updateNGODetails('vision', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Describe your organization's vision for the future..."
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-medium mb-2">Address *</label>
                <textarea
                  value={ngoDetails.address || ''}
                  onChange={(e) => updateNGODetails('address', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="Full organizational address..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={ngoDetails.email || ''}
                  onChange={(e) => updateNGODetails('email', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="info@organization.org"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  value={ngoDetails.phone || ''}
                  onChange={(e) => updateNGODetails('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Website</label>
                <input
                  type="url"
                  value={ngoDetails.website || ''}
                  onChange={(e) => updateNGODetails('website', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.organization.org"
                />
              </div>
            </div>

            {/* Program Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Target Beneficiaries</label>
                <input
                  type="text"
                  value={ngoDetails.targetBeneficiaries || ''}
                  onChange={(e) => updateNGODetails('targetBeneficiaries', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Children aged 5-18, Women entrepreneurs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Geographic Scope</label>
                <input
                  type="text"
                  value={ngoDetails.geographicScope || ''}
                  onChange={(e) => updateNGODetails('geographicScope', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., National, Regional, Local communities"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Leadership & Governance</h3>
            
            {/* Board Members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Board Members</h4>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={addBoardMember}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </motion.button>
              </div>

              <div className="space-y-4">
                {ngoDetails.boardMembers?.map((member, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white font-medium">Board Member {index + 1}</h5>
                      {ngoDetails.boardMembers!.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => removeBoardMember(index)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={member.name}
                        onChange={(e) => updateBoardMember(index, 'name', e.target.value)}
                        className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={member.position}
                        onChange={(e) => updateBoardMember(index, 'position', e.target.value)}
                        className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Background/Expertise"
                        value={member.background}
                        onChange={(e) => updateBoardMember(index, 'background', e.target.value)}
                        className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Staff */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Key Staff</h4>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={addStaffMember}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff</span>
                </motion.button>
              </div>

              <div className="space-y-4">
                {ngoDetails.keyStaff?.map((staff, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white font-medium">Staff Member {index + 1}</h5>
                      {ngoDetails.keyStaff!.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => removeStaffMember(index)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={staff.name}
                        onChange={(e) => updateStaffMember(index, 'name', e.target.value)}
                        className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={staff.position}
                        onChange={(e) => updateStaffMember(index, 'position', e.target.value)}
                        className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Qualifications"
                        value={staff.qualifications}
                        onChange={(e) => updateStaffMember(index, 'qualifications', e.target.value)}
                        className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Document Selection</h3>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={selectAllRequired}
                  className="px-4 py-2 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-600/30 transition-all"
                >
                  Select Required Only
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={selectAllDocuments}
                  className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
                >
                  Select All
                </motion.button>
              </div>
            </div>

            <div className="space-y-6">
              {documentCategories.map((category) => (
                <div key={category.category} className="bg-slate-700/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span>{category.category}</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.documents.map((doc) => (
                      <motion.div
                        key={doc.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleDocumentSelection(doc.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedDocuments.includes(doc.id)
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                            : 'bg-slate-600/30 border-slate-500/50 text-slate-300 hover:bg-slate-600/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedDocuments.includes(doc.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-slate-400'
                          }`}>
                            {selectedDocuments.includes(doc.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{doc.title}</h5>
                            {doc.required && (
                              <span className="text-xs text-orange-400">Required</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">
                <strong>Selected:</strong> {selectedDocuments.length} documents
                {selectedDocuments.length > 0 && (
                  <span className="ml-2">
                    (Includes {documentCategories.flatMap(cat => cat.documents.filter(doc => doc.required && selectedDocuments.includes(doc.id))).length} required documents)
                  </span>
                )}
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Generate NGO Package</h3>
            
            {!generatedPackage ? (
              <div className="text-center py-12">
                <div className="bg-slate-700/30 rounded-xl p-8">
                  <Building className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-4">Ready to Generate Your NGO Package</h4>
                  <p className="text-slate-300 mb-6">
                    This will create a comprehensive package including:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="text-center">
                      <div className="p-3 bg-blue-600/20 rounded-xl w-fit mx-auto mb-2">
                        <Palette className="w-6 h-6 text-blue-400" />
                      </div>
                      <h5 className="text-white font-medium">Brand Assets</h5>
                      <p className="text-slate-400 text-sm">Logo, colors, guidelines</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="p-3 bg-green-600/20 rounded-xl w-fit mx-auto mb-2">
                        <FileText className="w-6 h-6 text-green-400" />
                      </div>
                      <h5 className="text-white font-medium">Policy Documents</h5>
                      <p className="text-slate-400 text-sm">{selectedDocuments.length} customized policies</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="p-3 bg-purple-600/20 rounded-xl w-fit mx-auto mb-2">
                        <Globe className="w-6 h-6 text-purple-400" />
                      </div>
                      <h5 className="text-white font-medium">Website Mockup</h5>
                      <p className="text-slate-400 text-sm">Professional website template</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="p-3 bg-orange-600/20 rounded-xl w-fit mx-auto mb-2">
                        <Image className="w-6 h-6 text-orange-400" />
                      </div>
                      <h5 className="text-white font-medium">Marketing Materials</h5>
                      <p className="text-slate-400 text-sm">Business cards, letterheads</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateNGOPackage}
                    disabled={isGenerating}
                    className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 mx-auto"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        <span>Generating Package...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>Generate NGO Package (25 Credits)</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="text-green-400 font-semibold">Package Generated Successfully!</h4>
                      <p className="text-green-300 text-sm">Your complete NGO package is ready for download.</p>
                    </div>
                  </div>
                </div>

                {/* Brand Assets */}
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-blue-400" />
                    <span>Brand Assets</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-medium mb-3">Logo Variations</h5>
                      <div className="grid grid-cols-3 gap-3">
                        {generatedPackage.logoVariations.map((logo: string, index: number) => (
                          <div key={index} className="bg-white p-4 rounded-lg">
                            <img src={logo} alt={`Logo ${index + 1}`} className="w-full h-auto" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-white font-medium mb-3">Color Palette</h5>
                      <div className="flex space-x-3">
                        <div className="text-center">
                          <div 
                            className="w-16 h-16 rounded-lg mb-2"
                            style={{ backgroundColor: generatedPackage.brandAssets.primaryColor }}
                          ></div>
                          <p className="text-slate-300 text-xs">Primary</p>
                        </div>
                        <div className="text-center">
                          <div 
                            className="w-16 h-16 rounded-lg mb-2"
                            style={{ backgroundColor: generatedPackage.brandAssets.secondaryColor }}
                          ></div>
                          <p className="text-slate-300 text-xs">Secondary</p>
                        </div>
                        <div className="text-center">
                          <div 
                            className="w-16 h-16 rounded-lg mb-2"
                            style={{ backgroundColor: generatedPackage.brandAssets.accentColor }}
                          ></div>
                          <p className="text-slate-300 text-xs">Accent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    <span>Policy Documents ({generatedPackage.documents.length})</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedPackage.documents.map((doc: DocumentTemplate) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-600/30 rounded-lg">
                        <div>
                          <h5 className="text-white font-medium">{doc.title}</h5>
                          <p className="text-slate-400 text-sm capitalize">{doc.type}</p>
                        </div>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => downloadDocument(doc.id, 'docx')}
                            className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Website Preview */}
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <span>Website Mockup</span>
                  </h4>
                  
                  <div className="bg-white rounded-lg p-4">
                    <iframe
                      srcDoc={generatedPackage.website}
                      className="w-full h-96 border-0 rounded"
                      title="Website Preview"
                    />
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all"
                    >
                      Download HTML
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
                    >
                      View Full Size
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
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
          <div className="p-3 bg-orange-600/20 rounded-xl">
            <Building className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">NGO Pipeline Generator</h1>
            <p className="text-slate-300">Complete organizational setup with documents, branding, and templates</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeStep === step.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : activeStep > step.id
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeStep === step.id
                    ? 'bg-blue-600/30'
                    : activeStep > step.id
                    ? 'bg-green-600/30'
                    : 'bg-slate-700/50'
                }`}>
                  {activeStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="font-medium">{step.title}</span>
              </motion.button>
              
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  activeStep > step.id ? 'bg-green-500' : 'bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
          disabled={activeStep === 4}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {activeStep === 3 ? 'Generate Package' : 'Next'}
        </motion.button>
      </div>
    </div>
  );
};

export default NGOPipeline;