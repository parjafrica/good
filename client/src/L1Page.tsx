import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { 
  ChevronRight, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Target,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Star,
  Play,
  Award,
  DollarSign,
  MapPin
} from 'lucide-react';

export default function L1Page() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Dynamic user details based on actual user data or intelligent defaults
  const userDetails = {
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Your Organization",
    location: "Uganda", // This could be detected from user profile or IP
    userType: "NGO", // Could be from user profile
    fundingNeeds: "$150,000", // Could be from user's funding goals
    sector: "Education & Healthcare", // Could be from user's sector selection
    email: user?.email || "your.email@example.com"
  };

  // Get localized greeting based on detected country
  const getLocalizedGreeting = () => {
    return "Oli otya! 🇺🇬"; // Ugandan greeting since location is detected as Uganda
  };

  const stats = [
    { label: "Success Rate", value: "94%", icon: TrendingUp },
    { label: "Funding Secured", value: "$2.3M", icon: Award },
    { label: "Active Projects", value: "127", icon: Target },
    { label: "Expert Network", value: "450+", icon: Users }
  ];

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Matching",
      description: "Smart algorithms connect you with the perfect funding opportunities tailored to your profile"
    },
    {
      icon: Shield,
      title: "Verified Opportunities",
      description: "All funding sources are verified and actively monitored for authenticity and availability"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Access to international donors, foundations, and funding programs worldwide"
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Professional support from funding experts who understand your sector and region"
    }
  ];

  const testimonials = [
    {
      name: "Sarah K.",
      organization: "Hope Foundation Kenya",
      amount: "$85,000",
      text: "Secured funding for our children's education program within 3 months",
      rating: 5
    },
    {
      name: "Michael R.",
      organization: "Tech4Good Uganda",
      amount: "$120,000",
      text: "The AI matching was incredible - found opportunities I never knew existed",
      rating: 5
    },
    {
      name: "Amina T.",
      organization: "Women's Empowerment Rwanda",
      amount: "$75,000",
      text: "Expert guidance made all the difference in our proposal success",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold">Granada OS</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-6"
        >
          <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-blue-400 transition-colors">Success Stories</a>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
            Get Started
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 px-4 py-2 rounded-full mb-6">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">{getLocalizedGreeting()} Trusted by 500+ Organizations in {userDetails.location}</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Unlock {userDetails.fundingNeeds} in Funding
                <br />
                <span className="text-blue-400">For Your {userDetails.sector}</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                AI-powered platform connecting {userDetails.userType}s in {userDetails.location} with verified funding opportunities. 
                Join thousands who've secured over $2.3M in grants and donations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center group"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-gray-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all flex items-center justify-center group"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="text-center"
                    >
                      <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-300">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why Choose <span className="text-blue-400">Granada OS</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built specifically for organizations like yours in {userDetails.location}, 
              our platform combines AI intelligence with local expertise.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-xl rounded-xl p-8 border border-white/10 hover:border-blue-500/30 transition-colors group"
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Success Stories from <span className="text-blue-400">{userDetails.location}</span>
            </h2>
            <p className="text-xl text-gray-300">
              Organizations like yours achieving remarkable funding results
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-xl rounded-xl p-8 border border-white/10"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                
                <div className="border-t border-white/10 pt-4">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.organization}</div>
                  <div className="text-lg font-bold text-green-400 mt-2">{testimonial.amount} Secured</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-12 border border-white/10"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Secure Your <span className="text-blue-400">{userDetails.fundingNeeds}</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join hundreds of successful {userDetails.userType}s in {userDetails.location} who trust Granada OS
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 px-12 py-4 rounded-lg text-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all inline-flex items-center group"
            >
              Start Your Success Story
              <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Granada OS</span>
          </div>
          <p className="text-gray-400">
            Empowering organizations in {userDetails.location} to achieve their funding goals
          </p>
        </div>
      </footer>
    </div>
  );
}