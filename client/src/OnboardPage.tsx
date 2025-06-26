import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowRight, Sparkles, User, Building, DollarSign, CheckCircle, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  userType: 'student' | 'organization' | 'business';
  // Student fields
  educationLevel?: string;
  fieldOfStudy?: string;
  studyCountry?: string;
  // Organization fields
  organizationType?: string;
  organizationName?: string;
  position?: string;
  organizationCountry?: string;
  // Business fields
  businessType?: string;
  businessName?: string;
  businessStage?: string;
  industry?: string;
  businessCountry?: string;
  // Common
  fundingExperience?: string;
}

const STEPS = {
  WELCOME: 'welcome',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName', 
  EMAIL: 'email',
  USER_TYPE: 'userType',
  STUDENT_DETAILS: 'studentDetails',
  ORGANIZATION_DETAILS: 'organizationDetails',
  BUSINESS_DETAILS: 'businessDetails',
  COMPLETION: 'completion'
};

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export default function OnboardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    userType: 'student'
  });
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    setError('');
    
    if (currentStep === STEPS.FIRST_NAME) {
      if (!validateName(currentInput)) {
        setError('Please enter at least 2 characters for your first name');
        return;
      }
      updateProfile('firstName', currentInput);
      setCurrentStep(STEPS.LAST_NAME);
      setCurrentInput('');
    } else if (currentStep === STEPS.LAST_NAME) {
      if (!validateName(currentInput)) {
        setError('Please enter at least 2 characters for your last name');
        return;
      }
      updateProfile('lastName', currentInput);
      setCurrentStep(STEPS.EMAIL);
      setCurrentInput('');
    } else if (currentStep === STEPS.EMAIL) {
      if (!validateEmail(currentInput)) {
        setError('Please enter a valid email address');
        return;
      }
      updateProfile('email', currentInput);
      setCurrentStep(STEPS.USER_TYPE);
      setCurrentInput('');
    }
  };

  const handleUserTypeSelect = (type: 'student' | 'organization' | 'business') => {
    updateProfile('userType', type);
    if (type === 'student') {
      setCurrentStep(STEPS.STUDENT_DETAILS);
    } else if (type === 'organization') {
      setCurrentStep(STEPS.ORGANIZATION_DETAILS);
    } else {
      setCurrentStep(STEPS.BUSINESS_DETAILS);
    }
  };

  const handleSelectChange = (field: keyof UserProfile, value: string) => {
    updateProfile(field, value);
  };

  const saveToDatabase = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to save user profile');
      }

      // Navigate to appropriate dashboard based on user type
      setTimeout(() => {
        if (userProfile.userType === 'student') {
          navigate('/student-dashboard');
        } else if (userProfile.userType === 'business') {
          navigate('/business-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const finishOnboarding = () => {
    setCurrentStep(STEPS.COMPLETION);
    saveToDatabase();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -50,
      transition: { duration: 0.4 }
    }
  };

  const renderWelcome = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-center max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Welcome to Granada OS
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Your gateway to funding opportunities worldwide
        </p>
      </div>
      
      <div className="bg-gray-800/50 rounded-xl p-8 mb-8">
        <p className="text-gray-300 text-lg mb-6">
          Let's get you set up in just a few steps. We'll personalize your experience based on your needs.
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            Quick setup
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            Personalized experience
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            Secure & private
          </div>
        </div>
      </div>

      <Button 
        onClick={() => setCurrentStep(STEPS.FIRST_NAME)}
        size="lg"
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8 py-4 text-lg"
      >
        Let's Get Started
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  const renderTextInput = (title: string, placeholder: string, value: string) => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-center max-w-md mx-auto"
    >
      <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 mb-8">This helps us personalize your experience</p>
      
      <div className="bg-gray-800/50 rounded-xl p-8">
        <Input
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentInput(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleNext()}
          placeholder={placeholder}
          className="mb-4 bg-gray-700 border-gray-600 text-white text-lg p-4 focus:border-purple-500"
          autoFocus
        />
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mb-4"
          >
            {error}
          </motion.p>
        )}
        
        <Button 
          onClick={handleNext}
          disabled={!currentInput.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-3"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  const renderUserTypeSelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-center max-w-4xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-white mb-2">
        Hi {userProfile.firstName}! What brings you here?
      </h2>
      <p className="text-gray-400 mb-8">Choose the option that best describes you</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleUserTypeSelect('student')}
          className="p-8 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 hover:border-purple-400 transition-all text-left group"
        >
          <User className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-3">Individual Student</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Seeking scholarships, educational grants, and academic funding opportunities
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleUserTypeSelect('organization')}
          className="p-8 rounded-xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 hover:border-green-400 transition-all text-left group"
        >
          <Building className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-3">Organization</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            NGO, Non-profit, Community organization seeking institutional funding
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleUserTypeSelect('business')}
          className="p-8 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 hover:border-blue-400 transition-all text-left group"
        >
          <DollarSign className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-white mb-3">Business Entity</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Startup, SME, Enterprise seeking business funding, grants, and investment
          </p>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderDetailForm = () => {
    const isStudent = userProfile.userType === 'student';
    const isOrganization = userProfile.userType === 'organization';
    const isBusiness = userProfile.userType === 'business';

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-center max-w-md mx-auto"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Tell us more about {isStudent ? 'your studies' : isOrganization ? 'your organization' : 'your business'}
        </h2>
        <p className="text-gray-400 mb-8">This helps us find the perfect opportunities for you</p>
        
        <div className="bg-gray-800/50 rounded-xl p-8 space-y-6">
          {isStudent && (
            <>
              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Education Level</label>
                <select
                  value={userProfile.educationLevel || ''}
                  onChange={(e) => handleSelectChange('educationLevel', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-purple-500"
                >
                  <option value="">Select your education level</option>
                  <option value="high-school">High School Graduate</option>
                  <option value="undergraduate">Undergraduate Student</option>
                  <option value="graduate">Graduate Student (Masters)</option>
                  <option value="phd">PhD/Doctoral Student</option>
                  <option value="postdoc">Postdoctoral Researcher</option>
                  <option value="vocational">Vocational/Technical Training</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Field of Study</label>
                <select
                  value={userProfile.fieldOfStudy || ''}
                  onChange={(e) => handleSelectChange('fieldOfStudy', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-purple-500"
                >
                  <option value="">Select your field of study</option>
                  <option value="stem">STEM (Science, Technology, Engineering, Mathematics)</option>
                  <option value="medicine">Medicine & Health Sciences</option>
                  <option value="business">Business & Economics</option>
                  <option value="social-sciences">Social Sciences & Public Policy</option>
                  <option value="arts">Arts & Humanities</option>
                  <option value="education">Education & Teaching</option>
                  <option value="agriculture">Agriculture & Environmental Sciences</option>
                  <option value="engineering">Engineering & Technology</option>
                  <option value="law">Law & Legal Studies</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Study Country</label>
                <Input
                  value={userProfile.studyCountry || ''}
                  onChange={(e) => updateProfile('studyCountry', e.target.value)}
                  placeholder="Where are you studying or plan to study?"
                  className="bg-gray-700 border-gray-600 text-white py-3 focus:border-purple-500"
                />
              </div>
            </>
          )}

          {isOrganization && (
            <>
              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Organization Type</label>
                <select
                  value={userProfile.organizationType || ''}
                  onChange={(e) => handleSelectChange('organizationType', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-green-500"
                >
                  <option value="">Select organization type</option>
                  <option value="ngo">NGO</option>
                  <option value="nonprofit">Non-Profit Organization</option>
                  <option value="cbo">Community Based Organization</option>
                  <option value="faith-based">Faith-Based Organization</option>
                  <option value="social-enterprise">Social Enterprise</option>
                  <option value="educational">Educational Institution</option>
                  <option value="healthcare">Healthcare Organization</option>
                  <option value="research">Research Institution</option>
                  <option value="government">Government Agency</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                <Input
                  value={userProfile.organizationName || ''}
                  onChange={(e) => updateProfile('organizationName', e.target.value)}
                  placeholder="Enter your organization name"
                  className="bg-gray-700 border-gray-600 text-white py-3 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Your Position</label>
                <Input
                  value={userProfile.position || ''}
                  onChange={(e) => updateProfile('position', e.target.value)}
                  placeholder="e.g., Executive Director, Program Manager"
                  className="bg-gray-700 border-gray-600 text-white py-3 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Country</label>
                <Input
                  value={userProfile.organizationCountry || ''}
                  onChange={(e) => updateProfile('organizationCountry', e.target.value)}
                  placeholder="Organization's country"
                  className="bg-gray-700 border-gray-600 text-white py-3 focus:border-green-500"
                />
              </div>
            </>
          )}

          {isBusiness && (
            <>
              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Business Type</label>
                <select
                  value={userProfile.businessType || ''}
                  onChange={(e) => handleSelectChange('businessType', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-blue-500"
                >
                  <option value="">Select business type</option>
                  <option value="startup">Startup</option>
                  <option value="sme">Small & Medium Enterprise (SME)</option>
                  <option value="corporation">Corporation</option>
                  <option value="social-enterprise">Social Enterprise</option>
                  <option value="cooperative">Cooperative</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole-proprietorship">Sole Proprietorship</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Business Name</label>
                <Input
                  value={userProfile.businessName || ''}
                  onChange={(e) => updateProfile('businessName', e.target.value)}
                  placeholder="Enter your business name"
                  className="bg-gray-700 border-gray-600 text-white py-3 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Business Stage</label>
                <select
                  value={userProfile.businessStage || ''}
                  onChange={(e) => handleSelectChange('businessStage', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-blue-500"
                >
                  <option value="">Select business stage</option>
                  <option value="idea">Idea Stage</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed Stage</option>
                  <option value="early-stage">Early Stage</option>
                  <option value="growth">Growth Stage</option>
                  <option value="established">Established</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-300 mb-2">Industry</label>
                <select
                  value={userProfile.industry || ''}
                  onChange={(e) => handleSelectChange('industry', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-3 focus:border-blue-500"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="fintech">FinTech</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail & E-commerce</option>
                  <option value="education">Education</option>
                  <option value="renewable-energy">Renewable Energy</option>
                  <option value="tourism">Tourism & Hospitality</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          <Button 
            onClick={finishOnboarding}
            className={`w-full py-3 ${
              isStudent ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' :
              isOrganization ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' :
              'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            Complete Setup
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderCompletion = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center max-w-md mx-auto"
    >
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome aboard, {userProfile.firstName}!</h2>
        <p className="text-gray-400 mb-8">
          Your profile has been created successfully. We're setting up your personalized dashboard...
        </p>
      </div>
      
      <div className="bg-gray-800/50 rounded-xl p-8">
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-3">
            <Coffee className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-gray-300">Setting up your experience...</span>
          </div>
        ) : (
          <div className="text-green-400">
            <CheckCircle className="w-6 h-6 inline mr-2" />
            Setup complete! Redirecting...
          </div>
        )}
        
        {error && (
          <p className="text-red-400 text-sm mt-4">{error}</p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {currentStep === STEPS.WELCOME && renderWelcome()}
          {currentStep === STEPS.FIRST_NAME && renderTextInput(
            "What's your first name?", 
            "Enter your first name", 
            currentInput
          )}
          {currentStep === STEPS.LAST_NAME && renderTextInput(
            "And your last name?", 
            "Enter your last name", 
            currentInput
          )}
          {currentStep === STEPS.EMAIL && renderTextInput(
            "What's your email address?", 
            "Enter your email address", 
            currentInput
          )}
          {currentStep === STEPS.USER_TYPE && renderUserTypeSelection()}
          {(currentStep === STEPS.STUDENT_DETAILS || 
            currentStep === STEPS.ORGANIZATION_DETAILS || 
            currentStep === STEPS.BUSINESS_DETAILS) && renderDetailForm()}
          {currentStep === STEPS.COMPLETION && renderCompletion()}
        </AnimatePresence>
      </div>
    </div>
  );
}