import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaApple, FaTwitter, FaEye, FaEyeSlash, FaStar, FaTimes, FaCheck, FaRocket, FaTrophy, FaUsers } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Success stories for rotating display
const successStories = [
  {
    id: 1,
    amount: "$2.3M",
    user: "Dr. Sarah M.",
    organization: "Climate Research Institute",
    achievement: "Secured major climate research funding",
    gradient: "from-green-400 to-emerald-500"
  },
  {
    id: 2,
    amount: "$850K",
    user: "James K.",
    organization: "African Education NGO",
    achievement: "Funded 500+ student scholarships",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    id: 3,
    amount: "$1.8M",
    user: "Maria L.",
    organization: "Healthcare Access Foundation",
    gradient: "from-purple-400 to-pink-500",
    achievement: "Expanded healthcare to rural communities"
  },
  {
    id: 4,
    amount: "$650K",
    user: "Ahmed R.",
    organization: "Tech Innovation Hub",
    gradient: "from-orange-400 to-red-500",
    achievement: "Launched startup accelerator program"
  }
];

// Features showcase
const features = [
  {
    icon: FaRocket,
    title: "AI-Powered Matching",
    description: "Find perfect funding opportunities instantly"
  },
  {
    icon: FaTrophy,
    title: "95% Success Rate",
    description: "Proven track record of successful applications"
  },
  {
    icon: FaUsers,
    title: "Expert Network",
    description: "Connect with funding experts and mentors"
  }
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organization: '',
    country: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStory, setCurrentStory] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const { toast } = useToast();

  // Auto-rotate success stories
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Show feature popup after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFeaturePopup(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Show success story popup
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuccessPopup(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialRegister = async (provider: string) => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        // Google OAuth implementation
        window.location.href = '/api/auth/google';
      } else {
        toast({
          title: "Coming Soon",
          description: `${provider} registration will be available soon!`,
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "Social registration failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = Object.entries(formData);
    for (const [key, value] of requiredFields) {
      if (!value.trim()) {
        toast({
          title: "Missing Information",
          description: `Please fill in your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
          variant: "destructive"
        });
        return;
      }
    }

    if (formData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Welcome to Granada OS!",
          description: "Your account has been created successfully.",
          variant: "default"
        });
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        toast({
          title: "Registration Failed",
          description: error.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="absolute inset-0">
          {/* Floating shapes */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-rose-400 rounded-3xl blur-xl rotate-45"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 2 }}
            className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur-lg"
          />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Success Stories & Features */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-lg"
          >
            {/* Main success story display */}
            <div className="relative">
              <motion.div
                key={currentStory}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className={`inline-block p-8 rounded-3xl bg-gradient-to-r ${successStories[currentStory].gradient} text-white shadow-2xl mb-6`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl font-bold mb-2"
                  >
                    {successStories[currentStory].amount}
                  </motion.div>
                  <div className="text-lg opacity-90">Secured in Funding</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-800 font-medium mb-2">
                    "{successStories[currentStory].achievement}"
                  </p>
                  <p className="text-gray-600 text-sm">
                    {successStories[currentStory].user} - {successStories[currentStory].organization}
                  </p>
                </div>
              </motion.div>

              {/* Story indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {successStories.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: index === currentStory ? 1.2 : 0.8 }}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      index === currentStory ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Features preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-12 space-y-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="flex items-center space-x-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <feature.icon className="text-white text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardContent className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <div className="text-white text-2xl font-bold">G</div>
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    Join Granada OS
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 text-sm"
                  >
                    Create your account and start finding funding
                  </motion.p>
                </div>

                {/* Social Registration Buttons */}
                <div className="space-y-3 mb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={() => handleSocialRegister('google')}
                      disabled={isLoading}
                      className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <FaGoogle className="mr-3 text-red-500" size={18} />
                      Sign up with Google
                    </Button>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={() => handleSocialRegister('apple')}
                        disabled={isLoading}
                        className="w-full h-12 bg-black hover:bg-gray-800 text-white transition-all duration-200"
                      >
                        <FaApple className="mr-2" size={18} />
                        Apple
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={() => handleSocialRegister('twitter')}
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
                      >
                        <FaTwitter className="mr-2" size={18} />
                        Twitter
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Registration Form */}
                <motion.form
                  onSubmit={handleEmailRegister}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-purple-500 transition-colors"
                      disabled={isLoading}
                    />
                    <Input
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-purple-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>

                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-12 border-gray-200 focus:border-purple-500 transition-colors"
                    disabled={isLoading}
                  />

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password (min 8 characters)"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-purple-500 transition-colors pr-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <Input
                    type="text"
                    placeholder="Organization name"
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    required
                    className="h-12 border-gray-200 focus:border-purple-500 transition-colors"
                    disabled={isLoading}
                  />

                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                    className="w-full h-12 px-3 py-2 border border-gray-200 rounded-md focus:border-purple-500 focus:outline-none transition-colors"
                    disabled={isLoading}
                  >
                    <option value="">Select your country</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="South Africa">South Africa</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Other">Other</option>
                  </select>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </motion.form>

                {/* Footer */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                      Sign in
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Success Story Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <FaCheck className="text-white text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Latest Success
                    </h4>
                    <p className="text-gray-500 text-xs">
                      Just funded today!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="text-2xl font-bold text-green-600 mb-2">$425K</div>
              <p className="text-gray-700 text-sm mb-2">
                "Got funding for our clean water project in just 2 weeks!"
              </p>
              <p className="text-gray-500 text-xs">
                Maria C. - Water Access Foundation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Popup */}
      <AnimatePresence>
        {showFeaturePopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-2xl p-6 max-w-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FaRocket className="text-white text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      AI-Powered Matching
                    </h4>
                    <p className="text-white/80 text-xs">
                      Find perfect opportunities
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFeaturePopup(false)}
                  className="text-white/60 hover:text-white text-sm"
                >
                  <FaTimes />
                </button>
              </div>
              
              <p className="text-white/90 text-sm">
                Our AI analyzes thousands of funding opportunities to find the perfect match for your organization.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}