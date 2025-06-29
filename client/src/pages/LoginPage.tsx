import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaApple, FaMicrosoft, FaEye, FaEyeSlash, FaTimes, FaStar } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// Success stories for rotating testimonials
const successStories = [
  {
    id: 1,
    name: "David Kimani",
    role: "Graduate Student, University of Nairobi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    rating: 5,
    text: "I discovered a fully-funded scholarship opportunity through Granada that I wouldn't have found elsewhere. Their deadline reminders ensured I submitted on time!",
    stats: { users: "10k+", funding: "$5M+", success: "95%" }
  },
  {
    id: 2,
    name: "Sarah Achieng",
    role: "NGO Director, Kenya",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
    rating: 5,
    text: "Granada's AI matching helped us secure $150K in grants within 3 months. The platform understands our mission perfectly.",
    stats: { users: "15k+", funding: "$12M+", success: "97%" }
  },
  {
    id: 3,
    name: "Dr. Michael Omondi",
    role: "Research Lead, Uganda",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    rating: 5,
    text: "From idea to funded research project in 4 months. Granada's expert guidance made the impossible possible.",
    stats: { users: "8k+", funding: "$3M+", success: "93%" }
  }
];

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentStory, setCurrentStory] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Auto-rotate success stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Show success popup periodically
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuccessPopup(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'google') {
      window.location.href = '/auth/google';
    } else {
      console.log(`${provider} login will be implemented soon`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white bg-opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 bg-opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-300 bg-opacity-10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Main Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mr-3">
                      <span className="text-white text-xl font-bold">G</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">Granada</span>
                    <button className="ml-auto text-gray-400 hover:text-gray-600">
                      <FaTimes size={20} />
                    </button>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Log In to Your Account</h1>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Log In
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-sm text-gray-500">Or continue with</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* Social Login */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl flex items-center justify-center space-x-3"
                  >
                    <FaGoogle className="text-red-500" size={20} />
                    <span className="font-medium text-gray-700">Google</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('microsoft')}
                    className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl flex items-center justify-center space-x-3"
                  >
                    <FaMicrosoft className="text-blue-500" size={20} />
                    <span className="font-medium text-gray-700">Microsoft</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('apple')}
                    className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl flex items-center justify-center space-x-3"
                  >
                    <FaApple className="text-gray-800" size={20} />
                    <span className="font-medium text-gray-700">Apple</span>
                  </Button>
                </div>

                {/* Register Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <a href="/register" className="text-purple-600 font-semibold hover:text-purple-700">
                      Sign up
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Success Stories Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="w-80 bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white">
                    <FaStar className="mr-2" />
                    <span className="font-semibold">Student Success Stories</span>
                  </div>
                  <button
                    onClick={() => setShowSuccessPopup(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <motion.div
                  key={currentStory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <img
                      src={successStories[currentStory].avatar}
                      alt={successStories[currentStory].name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{successStories[currentStory].name}</h4>
                      <p className="text-sm text-gray-600">{successStories[currentStory].role}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{successStories[currentStory].text}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-xs" />
                      ))}
                    </div>
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span><strong>{successStories[currentStory].stats.users}</strong> Users</span>
                      <span><strong>{successStories[currentStory].stats.funding}</strong> Funding</span>
                      <span><strong>{successStories[currentStory].stats.success}</strong> Success Rate</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Story indicators */}
                <div className="flex justify-center mt-4 space-x-2">
                  {successStories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStory(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStory ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}