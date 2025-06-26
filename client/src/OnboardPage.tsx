import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowRight, ArrowLeft, Sparkles, User, Building, DollarSign } from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  userType: 'student' | 'organization' | 'business';
  // Student fields
  educationLevel?: string;
  fieldOfStudy?: string;
  studyCountry?: string;
  academicGoals?: string[];
  // Organization fields
  organizationType?: string;
  organizationName?: string;
  position?: string;
  organizationCountry?: string;
  focusAreas?: string[];
  // Business fields
  businessType?: string;
  businessName?: string;
  businessStage?: string;
  industry?: string;
  businessCountry?: string;
  fundingPurpose?: string[];
  // Common
  fundingExperience?: string;
}

const STEPS = {
  PERSONAL_INFO: 'personal',
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
  const [currentStep, setCurrentStep] = useState(STEPS.PERSONAL_INFO);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    userType: 'student'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePersonalInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!validateName(userProfile.firstName)) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!validateName(userProfile.lastName)) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!validateEmail(userProfile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === STEPS.PERSONAL_INFO) {
      if (!validatePersonalInfo()) return;
      setCurrentStep(STEPS.USER_TYPE);
    } else if (currentStep === STEPS.USER_TYPE) {
      // Route based on user type
      if (userProfile.userType === 'student') {
        setCurrentStep(STEPS.STUDENT_DETAILS);
      } else if (userProfile.userType === 'organization') {
        setCurrentStep(STEPS.ORGANIZATION_DETAILS);
      } else if (userProfile.userType === 'business') {
        setCurrentStep(STEPS.BUSINESS_DETAILS);
      }
    } else {
      setCurrentStep(STEPS.COMPLETION);
    }
  };

  const handleBack = () => {
    if (currentStep === STEPS.USER_TYPE) {
      setCurrentStep(STEPS.PERSONAL_INFO);
    } else if (currentStep === STEPS.STUDENT_DETAILS || 
               currentStep === STEPS.ORGANIZATION_DETAILS || 
               currentStep === STEPS.BUSINESS_DETAILS) {
      setCurrentStep(STEPS.USER_TYPE);
    }
  };

  const saveToDatabase = async () => {
    setIsSubmitting(true);
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
      if (userProfile.userType === 'student') {
        navigate('/student-dashboard');
      } else if (userProfile.userType === 'business') {
        navigate('/business-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonalInfo = () => (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-700">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-400 mr-2" />
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Welcome to Granada OS
          </CardTitle>
        </div>
        <p className="text-gray-400">Let's start by getting to know you</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
          <Input
            value={userProfile.firstName}
            onChange={(e) => updateProfile('firstName', e.target.value)}
            placeholder="Enter your first name"
            className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
              errors.firstName ? 'border-red-500' : 'focus:border-purple-500'
            }`}
          />
          {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
          <Input
            value={userProfile.lastName}
            onChange={(e) => updateProfile('lastName', e.target.value)}
            placeholder="Enter your last name"
            className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
              errors.lastName ? 'border-red-500' : 'focus:border-purple-500'
            }`}
          />
          {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
          <Input
            type="email"
            value={userProfile.email}
            onChange={(e) => updateProfile('email', e.target.value)}
            placeholder="Enter your email address"
            className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 ${
              errors.email ? 'border-red-500' : 'focus:border-purple-500'
            }`}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        <Button 
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderUserTypeSelection = () => (
    <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">
          Hi {userProfile.firstName}! What brings you here?
        </CardTitle>
        <p className="text-gray-400">Choose the option that best describes you</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              updateProfile('userType', 'student');
              setTimeout(handleNext, 300);
            }}
            className="p-6 rounded-lg border-2 border-gray-600 hover:border-purple-500 transition-all bg-gray-800 hover:bg-gray-700 text-left"
          >
            <User className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Individual Student</h3>
            <p className="text-gray-400 text-sm">
              Seeking scholarships, educational grants, and academic funding opportunities
            </p>
          </button>

          <button
            onClick={() => {
              updateProfile('userType', 'organization');
              setTimeout(handleNext, 300);
            }}
            className="p-6 rounded-lg border-2 border-gray-600 hover:border-green-500 transition-all bg-gray-800 hover:bg-gray-700 text-left"
          >
            <Building className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Organization</h3>
            <p className="text-gray-400 text-sm">
              NGO, Non-profit, Community organization seeking institutional funding
            </p>
          </button>

          <button
            onClick={() => {
              updateProfile('userType', 'business');
              setTimeout(handleNext, 300);
            }}
            className="p-6 rounded-lg border-2 border-gray-600 hover:border-blue-500 transition-all bg-gray-800 hover:bg-gray-700 text-left"
          >
            <DollarSign className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Business Entity</h3>
            <p className="text-gray-400 text-sm">
              Startup, SME, Enterprise seeking business funding, grants, and investment
            </p>
          </button>
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleBack}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStudentDetails = () => (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Student Information</CardTitle>
        <p className="text-gray-400">Tell us about your academic journey</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Education Level</label>
          <select
            value={userProfile.educationLevel || ''}
            onChange={(e) => updateProfile('educationLevel', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-purple-500"
          >
            <option value="">Select education level</option>
            <option value="high-school">High School Graduate</option>
            <option value="undergraduate">Undergraduate Student</option>
            <option value="graduate">Graduate Student (Masters)</option>
            <option value="phd">PhD/Doctoral Student</option>
            <option value="postdoc">Postdoctoral Researcher</option>
            <option value="vocational">Vocational/Technical Training</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Field of Study</label>
          <select
            value={userProfile.fieldOfStudy || ''}
            onChange={(e) => updateProfile('fieldOfStudy', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-purple-500"
          >
            <option value="">Select field of study</option>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Study Country</label>
          <Input
            value={userProfile.studyCountry || ''}
            onChange={(e) => updateProfile('studyCountry', e.target.value)}
            placeholder="Where are you studying or plan to study?"
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
          />
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleBack}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            Complete Setup
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderOrganizationDetails = () => (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Organization Information</CardTitle>
        <p className="text-gray-400">Tell us about your organization</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Organization Type</label>
          <select
            value={userProfile.organizationType || ''}
            onChange={(e) => updateProfile('organizationType', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-green-500"
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
          <Input
            value={userProfile.organizationName || ''}
            onChange={(e) => updateProfile('organizationName', e.target.value)}
            placeholder="Enter organization name"
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Position</label>
          <Input
            value={userProfile.position || ''}
            onChange={(e) => updateProfile('position', e.target.value)}
            placeholder="e.g., Executive Director, Program Manager"
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
          <Input
            value={userProfile.organizationCountry || ''}
            onChange={(e) => updateProfile('organizationCountry', e.target.value)}
            placeholder="Organization's country"
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
          />
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleBack}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            Complete Setup
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBusinessDetails = () => (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Business Information</CardTitle>
        <p className="text-gray-400">Tell us about your business</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
          <select
            value={userProfile.businessType || ''}
            onChange={(e) => updateProfile('businessType', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
          <Input
            value={userProfile.businessName || ''}
            onChange={(e) => updateProfile('businessName', e.target.value)}
            placeholder="Enter business name"
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Business Stage</label>
          <select
            value={userProfile.businessStage || ''}
            onChange={(e) => updateProfile('businessStage', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
          <select
            value={userProfile.industry || ''}
            onChange={(e) => updateProfile('industry', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-blue-500"
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

        <div className="flex space-x-2">
          <Button 
            onClick={handleBack}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Complete Setup
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompletion = () => (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-700">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-green-400 mr-2" />
          <CardTitle className="text-2xl text-white">Setup Complete!</CardTitle>
        </div>
        <p className="text-gray-400">
          Welcome {userProfile.firstName}! Your profile has been created successfully.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Profile Summary:</strong>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Name: {userProfile.firstName} {userProfile.lastName}
          </p>
          <p className="text-sm text-gray-400">
            Email: {userProfile.email}
          </p>
          <p className="text-sm text-gray-400">
            Type: {userProfile.userType === 'student' ? 'Student' : 
                   userProfile.userType === 'organization' ? 'Organization' : 'Business'}
          </p>
        </div>

        {errors.submit && (
          <p className="text-red-400 text-sm text-center">{errors.submit}</p>
        )}

        <Button 
          onClick={saveToDatabase}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          {isSubmitting ? 'Saving...' : 'Enter Dashboard'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full">
        {currentStep === STEPS.PERSONAL_INFO && renderPersonalInfo()}
        {currentStep === STEPS.USER_TYPE && renderUserTypeSelection()}
        {currentStep === STEPS.STUDENT_DETAILS && renderStudentDetails()}
        {currentStep === STEPS.ORGANIZATION_DETAILS && renderOrganizationDetails()}
        {currentStep === STEPS.BUSINESS_DETAILS && renderBusinessDetails()}
        {currentStep === STEPS.COMPLETION && renderCompletion()}
      </div>
    </div>
  );
}