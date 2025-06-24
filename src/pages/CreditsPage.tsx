import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gem, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  CreditCard,
  Smartphone,
  Mail,
  ExternalLink,
  Database,
  AlertCircle,
  Bot,
  Flag,
  ArrowLeft,
  Plus,
  RefreshCw,
  DollarSign,
  CreditCard as CardIcon,
  Wallet,
  Shield,
  Check,
  FileText,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { paymentService, PaymentMethod, MobileMoneyProvider } from '../services/paymentService';
import { realDonorSearchEngine } from '../services/realDonorSearchEngine';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
  features: string[];
  savings?: string;
}

const CreditsPage: React.FC = () => {
  const { user, deductCredits } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');
  const [userCountry, setUserCountry] = useState<string>('');
  const [countryFlag, setCountryFlag] = useState<string>('');
  const [isGeolocating, setIsGeolocating] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'packages' | 'history'>('packages');

  const packages: CreditPackage[] = [
    {
      id: 'starter',
      credits: 100,
      price: 10,
      features: [
        '20 AI proposal generations',
        '6 donor searches',
        'Basic support',
        '30-day validity'
      ]
    },
    {
      id: 'standard',
      credits: 500,
      price: 40,
      bonus: 50,
      popular: true,
      savings: 'Save 20%',
      features: [
        '100+ AI proposal generations',
        '33+ donor searches',
        'Priority support',
        '90-day validity',
        'Advanced templates',
        'Export capabilities'
      ]
    },
    {
      id: 'professional',
      credits: 1000,
      price: 70,
      bonus: 200,
      savings: 'Save 30%',
      features: [
        '200+ AI proposal generations',
        '66+ donor searches',
        'Premium support',
        '180-day validity',
        'Custom templates',
        'Analytics dashboard',
        'Priority AI processing'
      ]
    },
    {
      id: 'enterprise',
      credits: 2500,
      price: 150,
      bonus: 750,
      savings: 'Save 40%',
      features: [
        'Unlimited AI generations',
        'Unlimited donor searches',
        '24/7 dedicated support',
        '1-year validity',
        'White-label options',
        'API access',
        'Team collaboration',
        'Custom integrations'
      ]
    }
  ];

  useEffect(() => {
    // Generate mock transaction history
    generateMockTransactionHistory();
    
    // Get user's country using geolocation
    detectUserCountry();
  }, []);

  const generateMockTransactionHistory = () => {
    const history = [];
    const types = ['purchase', 'usage', 'refund'];
    const descriptions = [
      'AI Proposal Generation',
      'Donor Search',
      'Expert Assistance',
      'Credit Purchase',
      'Application Submission',
      'Document Generation'
    ];
    
    // Generate 10 random transactions
    for (let i = 0; i < 10; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const amount = type === 'purchase' ? 
        Math.floor(Math.random() * 500) + 100 : 
        type === 'usage' ? 
        -(Math.floor(Math.random() * 50) + 5) : 
        Math.floor(Math.random() * 100) + 10;
      
      history.push({
        id: `tx-${Date.now()}-${i}`,
        type,
        description,
        amount,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        status: 'completed'
      });
    }
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setTransactionHistory(history);
  };

  const detectUserCountry = async () => {
    setIsGeolocating(true);
    try {
      // First try to get country from search engine (which has better fallbacks)
      const country = realDonorSearchEngine.getUserCountry();
      if (country) {
        setUserCountry(country);
        const countryCode = realDonorSearchEngine.getCountryCode(country);
        setCountryFlag(realDonorSearchEngine.getFlagEmoji(countryCode));
        setIsGeolocating(false);
        return;
      }
      
      // If search engine doesn't have country yet, try direct detection
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.country_name) {
        setUserCountry(data.country_name);
        // Get country flag emoji
        const countryCode = data.country_code;
        if (countryCode) {
          const flagEmoji = getFlagEmoji(countryCode);
          setCountryFlag(flagEmoji);
        }
      } else {
        // Default to Global if geolocation fails
        setUserCountry('Global');
        setCountryFlag('🌍');
      }
    } catch (error) {
      console.error('Error detecting country:', error);
      // Default to Global if geolocation fails
      setUserCountry('Global');
      setCountryFlag('🌍');
    } finally {
      setIsGeolocating(false);
    }
  };

  const getFlagEmoji = (countryCode: string) => {
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch (error) {
      console.warn('Error generating flag emoji:', error);
      return '🌍'; // Fallback to world emoji
    }
  };

  const handlePurchase = (packageId: string) => {
    // Navigate to a dedicated purchase page with the package ID
    navigate(`/purchase/${packageId}`);
  };

  const getCreditsPerDollar = (pkg: CreditPackage) => {
    const totalCredits = pkg.credits + (pkg.bonus || 0);
    return Math.round(totalCredits / pkg.price);
  };

  const creditUsageExamples = [
    {
      action: 'AI Proposal Generation',
      credits: 5,
      icon: <FileText className="w-5 h-5" />,
      description: 'Generate comprehensive, professional proposals'
    },
    {
      action: 'AI-Enhanced Donor Search',
      credits: 15,
      icon: <Search className="w-5 h-5" />,
      description: 'Find and match with relevant funding opportunities'
    },
    {
      action: 'Application Submission',
      credits: 15,
      icon: <ArrowLeft className="w-5 h-5 transform rotate-180" />,
      description: 'Submit applications to donor portals'
    },
    {
      action: 'Basic Search',
      credits: 5,
      icon: <Search className="w-5 h-5" />,
      description: 'Search donor database without AI enhancement'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Gem className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credits & Billing</h1>
            <p className="text-gray-700">Manage your credits and payment methods</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>
      </motion.div>

      {/* Current Credits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm max-w-3xl mx-auto"
        id="credits-header"
      >
        <div className="flex items-center justify-center space-x-4">
          <Gem className="w-6 h-6 text-emerald-600" />
          <span className="text-2xl font-bold text-gray-900">
            {user?.credits.toLocaleString()} Credits Available
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6 max-w-xs">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('packages')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'packages'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            Buy Credits
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            History
          </motion.button>
        </div>

        {activeTab === 'packages' && (
          <>
            {/* Credit Usage Guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm max-w-6xl mx-auto mb-8"
              id="credit-usage"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">How Credits Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {creditUsageExamples.map((example, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600 flex-shrink-0">
                      {example.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-gray-800 font-medium">{example.action}</h4>
                        <span className="text-emerald-600 font-bold">{example.credits} credits</span>
                      </div>
                      <p className="text-gray-600 text-sm">{example.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pricing Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto" id="credit-packages">
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`relative bg-white rounded-2xl p-6 border transition-all cursor-pointer shadow-sm ${
                    pkg.popular 
                      ? 'border-emerald-300 ring-2 ring-emerald-100' 
                      : selectedPackage === pkg.id
                      ? 'border-blue-300 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-500 text-white text-sm font-medium rounded-full">
                        <Star className="w-3 h-3" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}

                  {pkg.savings && (
                    <div className="absolute -top-3 -right-3">
                      <div className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                        {pkg.savings}
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{pkg.id}</h3>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900">${pkg.price}</span>
                      <span className="text-gray-600">USD</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Gem className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">
                        {pkg.credits.toLocaleString()} credits
                      </span>
                      {pkg.bonus && (
                        <span className="text-green-600 text-sm">
                          +{pkg.bonus} bonus
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {getCreditsPerDollar(pkg)} credits per $1
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePurchase(pkg.id)}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Purchase Credits
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Payment Methods Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200 max-w-6xl mx-auto mt-8"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Multiple Payment Options</h3>
                <p className="text-gray-700">Choose from various payment methods including mobile money for Africa</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <CardIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-800 font-medium">Cards</p>
                  <p className="text-gray-600 text-xs">Visa, Mastercard</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <Smartphone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-800 font-medium">M-Pesa</p>
                  <p className="text-gray-600 text-xs">Kenya, Tanzania</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <Smartphone className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-gray-800 font-medium">Airtel Money</p>
                  <p className="text-gray-600 text-xs">Multiple countries</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <Wallet className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-800 font-medium">Bank Transfer</p>
                  <p className="text-gray-600 text-xs">Global</p>
                </div>
              </div>
            </motion.div>

            {/* Security & Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8"
            >
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Shield className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="text-gray-800 font-medium">Secure Payments</h4>
                  <p className="text-gray-600 text-sm">256-bit SSL encryption</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <CardIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="text-gray-800 font-medium">Flexible Billing</h4>
                  <p className="text-gray-600 text-sm">Pay as you go, no subscriptions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Clock className="w-6 h-6 text-purple-600" />
                <div>
                  <h4 className="text-gray-800 font-medium">Instant Access</h4>
                  <p className="text-gray-600 text-sm">Credits available immediately</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonials Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-6xl mx-auto mt-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Our Users Say</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="User" 
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">Michael Okonkwo</h4>
                      <p className="text-gray-600 text-sm">Executive Director, Clean Water Initiative</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    "Granada's credit system is incredibly flexible. We've secured over $500,000 in grants using their proposal tools and donor matching."
                  </p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      alt="User" 
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">Sarah Johnson</h4>
                      <p className="text-gray-600 text-sm">Program Manager, Education First</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    "The AI proposal generator saved us countless hours. We created a professional grant application in minutes that secured $75,000 in funding."
                  </p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src="https://randomuser.me/api/portraits/men/67.jpg" 
                      alt="User" 
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">David Kimani</h4>
                      <p className="text-gray-600 text-sm">Founder, Tech for Good</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    "The professional help feature is worth every credit. Their experts helped us refine our approach and we've now secured three major grants."
                  </p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm max-w-6xl mx-auto"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Type</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">Amount</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map((transaction, index) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">
                        {transaction.timestamp.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{transaction.description}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          transaction.type === 'purchase' 
                            ? 'bg-green-100 text-green-700' 
                            : transaction.type === 'usage'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        transaction.amount > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {transactionHistory.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">No Transactions Yet</h4>
                <p className="text-gray-600">Your transaction history will appear here</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CreditsPage;