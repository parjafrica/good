import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  GraduationCap, 
  Building, 
  User, 
  Briefcase, 
  ArrowRight, 
  X, 
  ChevronLeft,
  Star,
  Check,
  Quote
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type UserType = 'ngo' | 'student' | 'business' | 'general' | null;

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
  userType: UserType;
  rating: number;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [registerType, setRegisterType] = useState<UserType>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [institution, setInstitution] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "PhD Student, Stanford University",
      content: "Granada helped me find and secure a $25,000 research grant that perfectly matched my field of study. The AI-powered matching is incredibly accurate!",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      userType: "student",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Okonkwo",
      role: "Executive Director, Clean Water Initiative",
      content: "As an NGO leader, Granada has transformed how we find funding. We've secured over $500,000 in grants using their proposal tools and donor matching.",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      userType: "ngo",
      rating: 5
    },
    {
      id: 3,
      name: "Lisa Chen",
      role: "CSR Manager, Tech Innovations Inc.",
      content: "Granada makes it easy to find and partner with impactful NGOs. We've launched three successful CSR initiatives through connections made on the platform.",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      userType: "business",
      rating: 4
    },
    {
      id: 4,
      name: "David Kimani",
      role: "Graduate Student, University of Nairobi",
      content: "I discovered a fully-funded scholarship opportunity through Granada that I wouldn't have found elsewhere. Their deadline reminders ensured I submitted on time!",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      userType: "student",
      rating: 5
    },
    {
      id: 5,
      name: "Maria Rodriguez",
      role: "Program Director, Education for All",
      content: "The AI proposal generator saved us countless hours. We created a professional grant application in minutes that secured $75,000 in funding.",
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
      userType: "ngo",
      rating: 5
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Filter testimonials based on selected user type
  const filteredTestimonials = registerType 
    ? testimonials.filter(t => t.userType === registerType)
    : testimonials;

  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For demo purposes, just log in the user
      // In a real app, you would register the user first
      const loginEmail = registerType === 'student' 
        ? `student_${email}` 
        : registerType === 'ngo'
        ? `ngo_${email}`
        : registerType === 'business'
        ? `business_${email}`
        : email;
        
      await login(loginEmail, password);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Registration Form */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Granada</span>
              </div>
              <Link to="/landing">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {registerType ? `Register as ${registerType === 'ngo' ? 'NGO/CBO' : registerType === 'student' ? 'Student' : registerType === 'business' ? 'Business' : 'User'}` : 'Create an Account'}
            </h2>
            
            {!registerType ? (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Please select the type of account you want to create:</p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setRegisterType('ngo')}
                  className="w-full flex items-center space-x-4 p-4 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">NGO / CBO</h4>
                    <p className="text-sm text-gray-500">For non-profit organizations and community-based organizations</p>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setRegisterType('student')}
                  className="w-full flex items-center space-x-4 p-4 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Student</h4>
                    <p className="text-sm text-gray-500">For scholarships, research opportunities, and academic resources</p>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setRegisterType('business')}
                  className="w-full flex items-center space-x-4 p-4 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Business</h4>
                    <p className="text-sm text-gray-500">For companies, social enterprises, and startups</p>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setRegisterType('general')}
                  className="w-full flex items-center space-x-4 p-4 border border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">General User</h4>
                    <p className="text-sm text-gray-500">For individuals interested in impact and development</p>
                  </div>
                </motion.button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRegister} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {registerType === 'ngo' && (
                  <div>
                    <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                    <input
                      type="text"
                      id="org-name"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your organization name"
                      required
                    />
                  </div>
                )}
                
                {registerType === 'student' && (
                  <div>
                    <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">Educational Institution</label>
                    <input
                      type="text"
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your school or university"
                      required
                    />
                  </div>
                )}
                
                {registerType === 'business' && (
                  <div>
                    <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your company name"
                      required
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  </label>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-70"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </motion.button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setRegisterType(null)}
                    className="flex items-center justify-center space-x-1 text-sm text-blue-600 hover:text-blue-500 mx-auto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to account types</span>
                  </button>
                </div>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Log in
                </Link>
              </p>
            </div>
          </div>
          
          {/* Testimonials and Graphics */}
          <div className="hidden md:block bg-gradient-to-br from-blue-50 to-purple-50 p-8 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full opacity-20 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full opacity-20 -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-8">
                {registerType === 'student' ? (
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                ) : registerType === 'ngo' ? (
                  <Building className="w-6 h-6 text-blue-600" />
                ) : registerType === 'business' ? (
                  <Briefcase className="w-6 h-6 text-green-600" />
                ) : (
                  <Sparkles className="w-6 h-6 text-blue-600" />
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {registerType === 'student' ? 'Student Success Stories' : 
                   registerType === 'ngo' ? 'NGO Impact Stories' :
                   registerType === 'business' ? 'Business Partnership Stories' :
                   'Success Stories'}
                </h3>
              </div>
              
              <div className="h-80 relative">
                <AnimatePresence mode="wait">
                  {filteredTestimonials.map((testimonial, index) => (
                    currentTestimonial % filteredTestimonials.length === index && (
                      <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.name} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <Quote className="w-8 h-8 text-blue-100 mb-2" />
                          <p className="text-gray-700 italic">{testimonial.content}</p>
                        </div>
                        
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
                
                {/* Testimonial navigation dots */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 mt-4">
                  {filteredTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full ${
                        currentTestimonial % filteredTestimonials.length === index ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-blue-600">10k+</p>
                  <p className="text-sm text-gray-600">Users</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-purple-600">$5M+</p>
                  <p className="text-sm text-gray-600">Funding Secured</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-green-600">95%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;