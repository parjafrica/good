import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaApple, FaTwitter, FaUser, FaEye, FaEyeSlash, FaStar, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Reviews data for popup testimonials
const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "NGO Director",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
    rating: 5,
    text: "Granada OS transformed our funding strategy. We secured $150K in grants within 3 months!",
    organization: "Clean Water Initiative"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Research Lead",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    rating: 5,
    text: "The AI-powered matching saved me weeks of research. Found perfect funding for our climate project.",
    organization: "University of Science"
  },
  {
    id: 3,
    name: "Amara Okafor",
    role: "Startup Founder",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&h=60&fit=crop&crop=face",
    rating: 5,
    text: "From idea to funded startup in 6 months. Granada OS guided every step of our journey.",
    organization: "TechForGood Africa"
  }
];

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const { toast } = useToast();

  // Auto-rotate reviews
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Show review popup after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReviewPopup(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        // Google OAuth implementation - redirect to backend route
        window.location.href = '/api/auth/google';
      } else {
        toast({
          title: "Coming Soon",
          description: `${provider} login will be available soon!`,
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Social login failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Welcome Back!",
          description: "Redirecting to your dashboard...",
          variant: "default"
        });
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Please check your credentials",
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-lg rotate-45"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            className="absolute bottom-32 left-32 w-28 h-28 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur-lg"
          />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main illustration container */}
            <div className="relative w-96 h-96">
              {/* Background elements */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-3xl blur-2xl"
              />
              
              {/* Central dashboard mockup */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-64 bg-white rounded-2xl shadow-2xl p-6"
              >
                <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="h-6 bg-gradient-to-r from-blue-200 to-purple-200 rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-blue-100 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-purple-100 rounded w-1/2 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="h-12 bg-gradient-to-br from-green-200 to-emerald-200 rounded animate-pulse" />
                      <div className="h-12 bg-gradient-to-br from-orange-200 to-red-200 rounded animate-pulse" />
                      <div className="h-12 bg-gradient-to-br from-indigo-200 to-blue-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 2, delay: 0.6, repeat: Infinity, repeatDuration: 10 }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <FaStar className="text-white text-xl" />
              </motion.div>

              <motion.div
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl rotate-12 shadow-lg"
              />
            </div>

            {/* Testimonial preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-8 text-center"
            >
              <div className="flex items-center justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm" />
                ))}
              </div>
              <p className="text-gray-600 text-sm italic max-w-xs">
                "Secured $2.3M in funding using Granada OS's AI matching system"
              </p>
              <p className="text-gray-500 text-xs mt-1">- Top NGO Director</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md">
              <CardContent className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <div className="text-white text-2xl font-bold">G</div>
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    Log in to Granada OS
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 text-sm"
                  >
                    Log in with:
                  </motion.p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={() => handleSocialLogin('google')}
                      disabled={isLoading}
                      className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <FaGoogle className="mr-3 text-red-500" size={18} />
                      Google
                    </Button>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={() => handleSocialLogin('apple')}
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
                        onClick={() => handleSocialLogin('twitter')}
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

                {/* Email Form */}
                <motion.form
                  onSubmit={handleEmailLogin}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-4"
                >
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-blue-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-blue-500 transition-colors pr-12"
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
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                </motion.form>

                {/* Footer */}
                <div className="text-center mt-6 space-y-2">
                  <p className="text-sm text-gray-600">
                    Don't have a Granada OS ID?{' '}
                    <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                      Create account
                    </a>
                  </p>
                  <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 block">
                    Forgot your password?
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Review Popup */}
      <AnimatePresence>
        {showReviewPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={reviews[currentReview].avatar}
                    alt={reviews[currentReview].name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {reviews[currentReview].name}
                    </h4>
                    <p className="text-gray-500 text-xs">
                      {reviews[currentReview].role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewPopup(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(reviews[currentReview].rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm" />
                ))}
              </div>
              
              <p className="text-gray-700 text-sm mb-2">
                "{reviews[currentReview].text}"
              </p>
              
              <p className="text-gray-500 text-xs">
                {reviews[currentReview].organization}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}