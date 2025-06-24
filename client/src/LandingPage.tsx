import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  GraduationCap, 
  Building, 
  User, 
  Briefcase, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Globe,
  Award,
  BookOpen,
  Search,
  Target,
  FileText,
  Users,
  DollarSign,
  Bot,
  Star,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const faqItems = [
    {
      question: 'What is Granada?',
      answer: 'Granada is a comprehensive platform designed to empower impact-driven organizations and individuals. For NGOs, it provides tools for finding funding, creating proposals, and managing projects. For students, it offers scholarship discovery, course management, and research opportunities.'
    },
    {
      question: 'How does the scholarship search work?',
      answer: 'Our AI-powered scholarship search engine continuously scans hundreds of sources to find relevant opportunities. We match scholarships to your profile based on your academic background, interests, and eligibility criteria, providing you with personalized recommendations.'
    },
    {
      question: 'Is Granada free to use?',
      answer: 'Granada offers a free tier with basic features and a 14-day trial of premium features. After the trial period, you can continue with the free tier or upgrade to a premium plan to access advanced features like AI-powered matching and proposal generation.'
    },
    {
      question: 'How do I apply for scholarships through Granada?',
      answer: 'Granada provides direct links to scholarship application pages. For some partner institutions, we offer streamlined applications directly through our platform. We also provide guidance and resources to help you create compelling applications.'
    },
    {
      question: 'Can businesses use Granada?',
      answer: 'Yes, businesses can use Granada to find funding opportunities, manage corporate social responsibility projects, and connect with NGOs for partnerships. We offer specialized tools for impact-focused businesses and social enterprises.'
    }
  ];

  // Testimonials for the carousel
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "PhD Student, Stanford University",
      quote: "Granada helped me find and secure a $25,000 research grant that perfectly matched my field of study.",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      id: 2,
      name: "Michael Okonkwo",
      role: "Executive Director, Clean Water Initiative",
      quote: "We've secured over $500,000 in grants using Granada's proposal tools and donor matching.",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      id: 3,
      name: "Lisa Chen",
      role: "CSR Manager, Tech Innovations Inc.",
      quote: "We've launched three successful CSR initiatives through connections made on the platform.",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Granada</span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Features</a>
              <a href="#solutions" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Solutions</a>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Pricing</a>
              <a href="#faq" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">FAQ</a>
            </nav>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Log In
                </motion.button>
              </Link>
              
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-200"
            >
              <div className="px-4 pt-2 pb-3 space-y-1">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Features
                </a>
                <a 
                  href="#solutions" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Solutions
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Pricing
                </a>
                <a 
                  href="#faq" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  FAQ
                </a>
                <div className="pt-4 pb-2 border-t border-gray-200">
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all mb-2"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-blue-50 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Empowering Students with <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Opportunities</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover scholarships, courses, and research opportunities tailored to your profile. Your academic journey, simplified.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Watch Demo
                </motion.button>
              </div>
              
              <div className="mt-8 flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">10,000+</span> students already using Granada
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Scholarship Matches</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Global Leaders Scholarship</h4>
                          <div className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                            Open
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">$10,000</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-yellow-700 font-medium">95% Match</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                    <span>View All Matches</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-20 z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-20 z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden">
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex overflow-hidden"
              >
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.2 }
                    }}
                    className="flex-shrink-0 w-full sm:w-96 mx-4"
                  >
                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-4 mb-4">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name} 
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                          <p className="text-sm text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                      <div className="mt-4 flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Granada provides all the tools and resources students need to find opportunities, manage applications, and track progress.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="p-3 bg-blue-100 rounded-xl w-fit mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scholarship Discovery</h3>
              <p className="text-gray-600 mb-4">
                Find scholarships that match your profile with our AI-powered search engine. Get personalized recommendations and deadline reminders.
              </p>
              <ul className="space-y-2">
                {['Personalized matching', 'Global database', 'Application tracking'].map((feature, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="p-3 bg-purple-100 rounded-xl w-fit mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Course Management</h3>
              <p className="text-gray-600 mb-4">
                Track your online courses, assignments, and deadlines in one place. Integrate with popular learning platforms.
              </p>
              <ul className="space-y-2">
                {['Progress tracking', 'Deadline management', 'Certificate storage'].map((feature, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="p-3 bg-green-100 rounded-xl w-fit mb-4">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Research Opportunities</h3>
              <p className="text-gray-600 mb-4">
                Discover internships, fellowships, and research assistant positions aligned with your academic interests.
              </p>
              <ul className="space-y-2">
                {['Global opportunities', 'Application assistance', 'Direct connections'].map((feature, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Solutions for Everyone</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Granada offers specialized solutions for different user types, from students to organizations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-start space-x-4"
              >
                <div className="p-3 bg-blue-100 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">For Students</h3>
                  <p className="text-gray-600">
                    Find scholarships, manage courses, discover research opportunities, and track academic progress all in one place.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-start space-x-4"
              >
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">For NGOs & CBOs</h3>
                  <p className="text-gray-600">
                    Discover funding opportunities, create professional proposals, and manage projects efficiently.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-start space-x-4"
              >
                <div className="p-3 bg-green-100 rounded-xl">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">For Businesses</h3>
                  <p className="text-gray-600">
                    Find impact investment opportunities, manage CSR initiatives, and connect with NGOs for partnerships.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-start space-x-4"
              >
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">For Everyone</h3>
                  <p className="text-gray-600">
                    Access a global network of opportunities, resources, and connections to make a positive impact.
                  </p>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Student Dashboard</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <h4 className="font-medium text-gray-900">Scholarships</h4>
                        </div>
                        <p className="text-blue-700 text-xl font-bold">12</p>
                        <p className="text-gray-600 text-xs">Matches found</p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <BookOpen className="w-4 h-4 text-green-600" />
                          <h4 className="font-medium text-gray-900">Courses</h4>
                        </div>
                        <p className="text-green-700 text-xl font-bold">3</p>
                        <p className="text-gray-600 text-xs">In progress</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Next Deadline</h4>
                        <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                          3 days left
                        </div>
                      </div>
                      <p className="text-gray-700">STEM Excellence Scholarship</p>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                    <span>View Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-400 rounded-full opacity-20 z-0"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-400 rounded-full opacity-20 z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for you, with no hidden fees or long-term commitments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 mb-6">Basic features for students</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Basic scholarship search',
                    'Course tracking',
                    'Limited research opportunities',
                    'Profile builder'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium">
                Popular
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600 mb-6">Advanced features for serious students</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">$9.99</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Free',
                    'AI-powered scholarship matching',
                    'Application tracking & reminders',
                    'Unlimited research opportunities',
                    'Priority support'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Start 14-Day Free Trial
                  </motion.button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-6">For educational institutions</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">Custom</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Pro',
                    'Bulk student accounts',
                    'Institution-specific opportunities',
                    'Custom integrations',
                    'Dedicated account manager',
                    'Analytics dashboard'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Contact Sales
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
                  {activeAccordion === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </motion.button>
                
                {activeAccordion === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-600">{item.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Academic Journey?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of students who are discovering opportunities and achieving their academic goals with Granada.
          </p>
          
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-xl transition-all font-medium"
            >
              Get Started Free
            </motion.button>
          </Link>
          
          <p className="mt-4 text-blue-200">
            No credit card required. Start with a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Granada</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering impact-driven organizations and individuals with the tools they need to succeed.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">{social}</span>
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                      <span className="text-xs">{social[0].toUpperCase()}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2">
                {['For Students', 'For NGOs', 'For Businesses', 'For Researchers'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Careers', 'Blog', 'Press', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Data Processing'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Granada. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40 md:hidden">
        <div className="flex justify-around items-center h-16">
          <Link to="/register" className="flex flex-col items-center justify-center p-2 text-blue-600">
            <GraduationCap className="w-5 h-5 mb-1" />
            <span className="text-xs">Students</span>
          </Link>
          <Link to="/register" className="flex flex-col items-center justify-center p-2 text-gray-500">
            <Building className="w-5 h-5 mb-1" />
            <span className="text-xs">NGOs</span>
          </Link>
          <Link to="/register" className="flex flex-col items-center justify-center p-2 text-gray-500">
            <Briefcase className="w-5 h-5 mb-1" />
            <span className="text-xs">Business</span>
          </Link>
          <Link to="/login" className="flex flex-col items-center justify-center p-2 text-gray-500">
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs">Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;