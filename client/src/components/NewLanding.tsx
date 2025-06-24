import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Building, 
  Heart, 
  GraduationCap,
  Briefcase,
  Globe,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  DollarSign,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  country?: string;
  sector?: string;
  organizationType?: string;
  interests?: string[];
  fundingNeeds?: string;
}

const NewLanding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({});
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    setShowParticles(true);
  }, []);

  const steps = [
    {
      title: "Welcome to Granada OS",
      subtitle: "Your AI-Powered Funding Discovery Platform",
      type: "welcome"
    },
    {
      title: "What's your name?",
      subtitle: "Let's get to know you better",
      type: "name"
    },
    {
      title: "What's your email?",
      subtitle: "We'll create your personalized account",
      type: "email"
    },
    {
      title: "Where are you based?",
      subtitle: "We'll find opportunities in your region",
      type: "country",
      options: [
        { value: "KE", label: "Kenya", flag: "🇰🇪" },
        { value: "UG", label: "Uganda", flag: "🇺🇬" },
        { value: "SS", label: "South Sudan", flag: "🇸🇸" },
        { value: "TZ", label: "Tanzania", flag: "🇹🇿" },
        { value: "RW", label: "Rwanda", flag: "🇷🇼" },
        { value: "ET", label: "Ethiopia", flag: "🇪🇹" },
        { value: "OTHER", label: "Other", flag: "🌍" }
      ]
    },
    {
      title: "What sector do you work in?",
      subtitle: "We'll match you with relevant opportunities",
      type: "sector",
      options: [
        { value: "Education", label: "Education", icon: <GraduationCap className="w-6 h-6" /> },
        { value: "Health", label: "Health & Medicine", icon: <Heart className="w-6 h-6" /> },
        { value: "Environment", label: "Environment & Climate", icon: <Globe className="w-6 h-6" /> },
        { value: "Agriculture", label: "Agriculture & Food", icon: <Briefcase className="w-6 h-6" /> },
        { value: "Technology", label: "Technology & Innovation", icon: <Zap className="w-6 h-6" /> },
        { value: "Community", label: "Community Development", icon: <Users className="w-6 h-6" /> },
        { value: "Women", label: "Women Empowerment", icon: <Target className="w-6 h-6" /> },
        { value: "Youth", label: "Youth Development", icon: <Award className="w-6 h-6" /> }
      ]
    },
    {
      title: "What type of organization are you?",
      subtitle: "This helps us personalize your experience",
      type: "organization",
      options: [
        { value: "small_ngo", label: "Small NGO", subtitle: "Under 20 staff members" },
        { value: "large_ngo", label: "Large NGO", subtitle: "20+ staff members" },
        { value: "university", label: "University/Research", subtitle: "Academic institution" },
        { value: "social_enterprise", label: "Social Enterprise", subtitle: "For-profit with social mission" },
        { value: "community", label: "Community Group", subtitle: "Grassroots organization" },
        { value: "individual", label: "Individual Researcher", subtitle: "Independent researcher" }
      ]
    },
    {
      title: "What are your areas of interest?",
      subtitle: "Select all that apply - we'll find matching opportunities",
      type: "interests",
      options: [
        "Gender Equality", "Poverty Reduction", "Education Access", "Healthcare",
        "Climate Change", "Clean Energy", "Food Security", "Water & Sanitation",
        "Human Rights", "Technology Innovation", "Youth Empowerment", "Disability Rights",
        "Refugee Support", "Economic Development", "Governance", "Peacebuilding"
      ]
    },
    {
      title: "How much funding do you typically seek?",
      subtitle: "This helps us prioritize relevant opportunities",
      type: "funding",
      options: [
        { value: "under_10k", label: "Under $10,000", subtitle: "Small grants & pilots" },
        { value: "10k_50k", label: "$10,000 - $50,000", subtitle: "Medium projects" },
        { value: "50k_100k", label: "$50,000 - $100,000", subtitle: "Large projects" },
        { value: "100k_500k", label: "$100,000 - $500,000", subtitle: "Major initiatives" },
        { value: "500k_plus", label: "$500,000+", subtitle: "Large-scale programs" }
      ]
    }
  ];

  const createUserMutation = useMutation({
    mutationFn: async (data: UserData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          hashedPassword: 'temp_password',
          userType: 'donor',
          interests: data.interests?.join(', ')
        })
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userOnboarded', 'true');
      window.location.href = '/donor-dashboard';
    }
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      createUserMutation.mutate(userData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setUserData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }));
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step.type) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white">{step.title}</h1>
              <p className="text-xl text-gray-300">{step.subtitle}</p>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Matching</h3>
                  <p className="text-gray-300 text-sm">Get opportunities perfectly matched to your profile</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Real-Time Updates</h3>
                  <p className="text-gray-300 text-sm">Fresh opportunities updated daily from global sources</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Millions Available</h3>
                  <p className="text-gray-300 text-sm">Access funding worth millions across all sectors</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        );

      case 'name':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={userData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={userData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <input
              type="email"
              placeholder="your.email@example.com"
              value={userData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'country':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {step.options?.map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    userData.country === option.value
                      ? 'bg-blue-600/30 border-blue-400'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  } backdrop-blur-sm`}
                  onClick={() => handleInputChange('country', option.value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{option.flag}</div>
                    <p className="text-white font-medium">{option.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        );

      case 'sector':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {step.options?.map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    userData.sector === option.value
                      ? 'bg-purple-600/30 border-purple-400'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  } backdrop-blur-sm`}
                  onClick={() => handleInputChange('sector', option.value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-blue-400 mb-3 flex justify-center">{option.icon}</div>
                    <p className="text-white font-medium text-sm">{option.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        );

      case 'organization':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {step.options?.map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    userData.organizationType === option.value
                      ? 'bg-green-600/30 border-green-400'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  } backdrop-blur-sm`}
                  onClick={() => handleInputChange('organizationType', option.value)}
                >
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold mb-1">{option.label}</h3>
                    <p className="text-gray-300 text-sm">{option.subtitle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        );

      case 'interests':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {step.options?.map((interest) => (
              <motion.div
                key={interest}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    userData.interests?.includes(interest)
                      ? 'bg-yellow-600/30 border-yellow-400'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  } backdrop-blur-sm`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  <CardContent className="p-3 text-center">
                    <p className="text-white text-sm font-medium">{interest}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        );

      case 'funding':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {step.options?.map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    userData.fundingNeeds === option.value
                      ? 'bg-orange-600/30 border-orange-400'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  } backdrop-blur-sm`}
                  onClick={() => handleInputChange('fundingNeeds', option.value)}
                >
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold mb-1">{option.label}</h3>
                    <p className="text-gray-300 text-sm">{option.subtitle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    switch (step.type) {
      case 'welcome': return true;
      case 'name': return userData.firstName && userData.lastName;
      case 'email': return userData.email;
      case 'country': return userData.country;
      case 'sector': return userData.sector;
      case 'organization': return userData.organizationType;
      case 'interests': return userData.interests && userData.interests.length > 0;
      case 'funding': return userData.fundingNeeds;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background particles */}
      {showParticles && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">{steps[currentStep].title}</h2>
              <p className="text-lg text-gray-300">{steps[currentStep].subtitle}</p>
            </div>

            <div className="max-w-3xl mx-auto">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center max-w-md mx-auto">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Back
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || createUserMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 ml-auto"
              >
                {createUserMutation.isPending ? (
                  "Creating Profile..."
                ) : currentStep === steps.length - 1 ? (
                  "Enter Dashboard"
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NewLanding;