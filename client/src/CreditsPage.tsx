import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gem, 
  Search, 
  Download, 
  ArrowLeft,
  FileText,
  CreditCard,
  Wallet,
  Shield,
  Check,
  Star,
  Crown,
  Zap,
  Award,
  TrendingUp,
  Clock,
  Users,
  Globe,
  Sparkles,
  Gift,
  Target
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
  features: string[];
  savings?: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

const CreditsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');
  const [activeTab, setActiveTab] = useState<'packages' | 'history'>('packages');
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  const packages: CreditPackage[] = [
    {
      id: 'starter',
      name: 'Starter',
      credits: 100,
      price: 10,
      color: 'from-blue-500 to-cyan-500',
      icon: <Target className="w-6 h-6" />,
      description: 'Perfect for getting started',
      features: [
        '20 Expert proposal generations',
        '6 intelligent donor searches',
        'Basic support',
        '30-day validity',
        'PDF export'
      ]
    },
    {
      id: 'standard',
      name: 'Professional',
      credits: 500,
      price: 40,
      bonus: 50,
      popular: true,
      savings: 'Save 20%',
      color: 'from-emerald-500 to-green-500',
      icon: <Crown className="w-6 h-6" />,
      description: 'Most popular choice for professionals',
      features: [
        '100+ Expert proposal generations',
        '33+ intelligent donor searches',
        'Priority support',
        '90-day validity',
        'Advanced templates',
        'Export capabilities',
        'Analytics dashboard'
      ]
    },
    {
      id: 'professional',
      name: 'Premium',
      credits: 1000,
      price: 70,
      bonus: 200,
      savings: 'Save 30%',
      color: 'from-purple-500 to-pink-500',
      icon: <Zap className="w-6 h-6" />,
      description: 'Power user solution',
      features: [
        '200+ Expert proposal generations',
        '66+ intelligent donor searches',
        'Premium support',
        '180-day validity',
        'Custom templates',
        'Advanced analytics',
        'Priority Expert processing',
        'Team collaboration'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      credits: 2500,
      price: 150,
      bonus: 750,
      savings: 'Save 40%',
      color: 'from-orange-500 to-red-500',
      icon: <Award className="w-6 h-6" />,
      description: 'Complete enterprise solution',
      features: [
        'Unlimited Expert generations',
        'Unlimited donor searches',
        '24/7 dedicated support',
        '1-year validity',
        'White-label options',
        'API access',
        'Team collaboration',
        'Custom integrations',
        'Success manager'
      ]
    }
  ];

  useEffect(() => {
    generateMockTransactionHistory();
  }, []);

  const generateMockTransactionHistory = () => {
    const history = [
      {
        id: 'tx-001',
        type: 'purchase',
        description: 'Professional Credits Package',
        amount: 550,
        timestamp: new Date('2024-06-25'),
        status: 'completed'
      },
      {
        id: 'tx-002',
        type: 'usage',
        description: 'Expert Proposal Generation',
        amount: -5,
        timestamp: new Date('2024-06-24'),
        status: 'completed'
      },
      {
        id: 'tx-003',
        type: 'usage',
        description: 'Intelligent Donor Search',
        amount: -15,
        timestamp: new Date('2024-06-23'),
        status: 'completed'
      },
      {
        id: 'tx-004',
        type: 'bonus',
        description: 'Welcome Bonus Credits',
        amount: 25,
        timestamp: new Date('2024-06-20'),
        status: 'completed'
      },
      {
        id: 'tx-005',
        type: 'usage',
        description: 'Application Submission',
        amount: -15,
        timestamp: new Date('2024-06-19'),
        status: 'completed'
      }
    ];
    
    setTransactionHistory(history);
  };

  const handlePurchase = (packageId: string) => {
    navigate(`/purchase/${packageId}`);
  };

  const getCreditsPerDollar = (pkg: CreditPackage) => {
    const totalCredits = pkg.credits + (pkg.bonus || 0);
    return Math.round(totalCredits / pkg.price);
  };

  const creditUsageExamples = [
    {
      action: 'Expert Proposal Generation',
      credits: 5,
      icon: <FileText className="w-5 h-5" />,
      description: 'Generate comprehensive, professional proposals with Expert intelligence',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      action: 'Intelligent Donor Search',
      credits: 15,
      icon: <Search className="w-5 h-5" />,
      description: 'Find and match with relevant funding opportunities using Expert algorithms',
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      action: 'Application Submission',
      credits: 15,
      icon: <Download className="w-5 h-5" />,
      description: 'Submit applications to donor portals with Expert optimization',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      action: 'Expert Review & Analysis',
      credits: 10,
      icon: <Shield className="w-5 h-5" />,
      description: 'Get professional review and analysis of your proposals',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'usage':
        return <Zap className="w-5 h-5 text-orange-600" />;
      case 'bonus':
        return <Gift className="w-5 h-5 text-purple-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-50 border-green-200';
      case 'usage':
        return 'bg-orange-50 border-orange-200';
      case 'bonus':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-xl"
        />
      </div>

      <div className="relative p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-6">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl shadow-lg"
            >
              <Gem className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Credits & Billing
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Power your funding journey with Expert intelligence</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </motion.button>
        </motion.div>

        {/* Current Credits - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-20" />
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {user?.credits?.toLocaleString() || '0'}
                </div>
                <div className="text-xl text-gray-600 dark:text-gray-400 font-medium">Credits Available</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-2 mb-8 max-w-md mx-auto border border-white/20 dark:border-gray-700/20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab('packages')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'packages'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              Buy Credits
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              History
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'packages' && (
              <motion.div
                key="packages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Credit Usage Guide */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                      How Credits Work
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Every action in Granada OS is powered by Expert intelligence</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {creditUsageExamples.map((example, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
                      >
                        <div className={`p-3 ${example.color} rounded-xl mb-4 w-fit group-hover:scale-110 transition-transform`}>
                          {example.icon}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-gray-900 dark:text-white font-semibold">{example.action}</h4>
                          <div className="flex items-center space-x-1">
                            <Gem className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-600 font-bold text-lg">{example.credits}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{example.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Pricing Packages */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                  {packages.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className={`group relative cursor-pointer transition-all duration-300 ${
                        pkg.popular ? 'scale-105' : ''
                      }`}
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      {pkg.popular && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                        >
                          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-full shadow-lg">
                            <Crown className="w-4 h-4" />
                            <span>Most Popular</span>
                          </div>
                        </motion.div>
                      )}

                      {pkg.savings && (
                        <div className="absolute -top-3 -right-3 z-10">
                          <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                            {pkg.savings}
                          </div>
                        </div>
                      )}

                      <div className="relative h-full">
                        <div className={`absolute inset-0 bg-gradient-to-r ${pkg.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <div className="relative h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all">
                          
                          {/* Header */}
                          <div className="text-center mb-8">
                            <div className={`p-4 bg-gradient-to-r ${pkg.color} rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                              <div className="text-white">
                                {pkg.icon}
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{pkg.description}</p>
                            
                            <div className="mb-4">
                              <div className="flex items-baseline justify-center space-x-2 mb-2">
                                <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                  ${pkg.price}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">USD</span>
                              </div>
                              
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <Gem className="w-5 h-5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold text-lg">
                                  {pkg.credits.toLocaleString()} credits
                                </span>
                                {pkg.bonus && (
                                  <motion.span 
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-green-600 font-semibold text-sm bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full"
                                  >
                                    +{pkg.bonus} bonus
                                  </motion.span>
                                )}
                              </div>
                              
                              <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {getCreditsPerDollar(pkg)} credits per $1
                              </p>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="space-y-3 mb-8">
                            {pkg.features.map((feature, i) => (
                              <motion.div 
                                key={i} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-center space-x-3"
                              >
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                              </motion.div>
                            ))}
                          </div>

                          {/* Purchase Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchase(pkg.id);
                            }}
                            className={`w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-lg hover:shadow-xl ${
                              pkg.popular
                                ? `bg-gradient-to-r ${pkg.color} hover:shadow-emerald-500/25`
                                : `bg-gradient-to-r ${pkg.color} hover:shadow-lg`
                            }`}
                          >
                            Purchase Credits
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Payment Methods Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-10" />
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                        Multiple Payment Options
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">Choose from various secure payment methods worldwide</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { name: 'Credit Cards', icon: <CreditCard className="w-8 h-8" />, color: 'from-blue-500 to-blue-600' },
                        { name: 'Mobile Money', icon: <Wallet className="w-8 h-8" />, color: 'from-green-500 to-green-600' },
                        { name: 'Bank Transfer', icon: <Shield className="w-8 h-8" />, color: 'from-purple-500 to-purple-600' },
                        { name: 'PayPal', icon: <Globe className="w-8 h-8" />, color: 'from-orange-500 to-orange-600' }
                      ].map((method, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          whileHover={{ y: -5 }}
                          className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                        >
                          <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}>
                            {method.icon}
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 font-semibold">{method.name}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                    Transaction History
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Track your credit purchases and usage</p>
                </div>

                <div className="space-y-4">
                  {transactionHistory.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-2xl border-2 ${getTransactionColor(transaction.type)} hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{transaction.description}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {transaction.timestamp.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                          </div>
                          <span className="text-green-600 text-sm font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;