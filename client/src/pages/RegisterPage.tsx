import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaApple, FaMicrosoft, FaEye, FaEyeSlash, FaTimes, FaStar, FaCheck } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// Success statistics for the sidebar
const successStats = [
  { value: "10k+", label: "Users", color: "text-blue-600" },
  { value: "$5M+", label: "Funding", color: "text-purple-600" },
  { value: "95%", label: "Success Rate", color: "text-green-600" }
];

// Success stories for rotating testimonials
const successStories = [
  {
    id: 1,
    name: "David Kimani",
    role: "Graduate Student, University of Nairobi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    rating: 5,
    text: "I discovered a fully-funded scholarship opportunity through Granada that I wouldn't have found elsewhere. Their deadline reminders ensured I submitted on time!"
  },
  {
    id: 2,
    name: "Sarah Achieng",
    role: "NGO Director, Kenya",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
    rating: 5,
    text: "Granada's expert matching helped us secure $150K in grants within 3 months. The platform understands our mission perfectly."
  },
  {
    id: 3,
    name: "Dr. Michael Omondi",
    role: "Research Lead, Uganda",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    rating: 5,
    text: "From idea to funded research project in 4 months. Granada's expert guidance made the impossible possible."
  }
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    institution: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [currentStory, setCurrentStory] = useState(0);

  // Auto-rotate success stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register attempt:', formData);
  };

  const handleSocialRegister = (provider: string) => {
    if (provider === 'google') {
      window.location.href = '/auth/google';
    } else {
      console.log(`${provider} registration will be implemented soon`);
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
        <div className="flex w-full max-w-5xl gap-8">
          {/* Left side - Success Stories */}
          <div className="hidden lg:flex flex-col w-1/2 text-white">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-3">
                  <span className="text-white text-xl font-bold">G</span>
                </div>
                <span className="text-2xl font-bold">Granada</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Student Success Stories</h1>
              <p className="text-xl text-white/80">Join thousands of students who found their perfect funding opportunities</p>
            </motion.div>

            {/* Success Statistics */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {successStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/80">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Rotating Success Story */}
            <motion.div
              key={currentStory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
            >
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={successStories[currentStory].avatar}
                  alt={successStories[currentStory].name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-lg">{successStories[currentStory].name}</h4>
                  <p className="text-white/80">{successStories[currentStory].role}</p>
                </div>
              </div>
              
              <p className="text-white/90 mb-4">{successStories[currentStory].text}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <div className="flex space-x-2">
                  {successStories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStory(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStory ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right side - Registration Form */}
          <div className="w-full lg:w-1/2">
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Register as Student</h1>
                  </div>

                  {/* Registration Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Your full name"
                      />
                    </div>

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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Educational Institution
                      </label>
                      <Input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => setFormData({...formData, institution: e.target.value})}
                        className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Your school/university"
                      />
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                          Privacy Policy
                        </a>
                      </span>
                    </div>

                    <Button
                      type="submit"
                      disabled={!agreeToTerms}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Account
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-sm text-gray-500">Or register with</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  {/* Social Registration */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialRegister('google')}
                      className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl flex items-center justify-center space-x-3"
                    >
                      <FaGoogle className="text-red-500" size={20} />
                      <span className="font-medium text-gray-700">Google</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialRegister('microsoft')}
                      className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl flex items-center justify-center space-x-3"
                    >
                      <FaMicrosoft className="text-blue-500" size={20} />
                      <span className="font-medium text-gray-700">Microsoft</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialRegister('apple')}
                      className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl flex items-center justify-center space-x-3"
                    >
                      <FaApple className="text-gray-800" size={20} />
                      <span className="font-medium text-gray-700">Apple</span>
                    </Button>
                  </div>

                  {/* Back to Login */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      <a href="/login" className="text-purple-600 font-semibold hover:text-purple-700">
                        ← Back to account types
                      </a>
                    </p>
                  </div>

                  {/* Already have account */}
                  <div className="mt-4 text-center">
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <a href="/login" className="text-purple-600 font-semibold hover:text-purple-700">
                        Log in
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}