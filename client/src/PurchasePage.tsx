import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Gem,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Shield,
  Check,
  RefreshCw,
  Star,
  Clock,
  Wallet,
  MapPin,
  Globe,
  Sparkles,
  Crown,
  Zap,
  Award,
  Target,
  Gift,
  CheckCircle,
  ExternalLink,
  Loader
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { paymentService, PaymentMethod, MobileMoneyProvider } from './services/paymentService';
import { realDonorSearchEngine } from './services/realDonorSearchEngine';

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

const PurchasePage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const { user, deductCredits } = useAuth();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [userCountry, setUserCountry] = useState<string>('Uganda');
  const [countryFlag, setCountryFlag] = useState<string>('🇺🇬');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

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

  const countries = [
    'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ghana', 'Nigeria', 'South Africa',
    'Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Ivory Coast', 'Cameroon', 'Zambia',
    'Zimbabwe', 'Malawi', 'Madagascar', 'Lesotho', 'Mozambique', 'Chad', 'Guinea',
    'Benin', 'Congo', 'United States', 'United Kingdom', 'Canada', 'Australia'
  ];

  useEffect(() => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
    } else {
      navigate('/credits');
    }
  }, [packageId, navigate]);

  const getAvailablePaymentMethods = (): PaymentMethod[] => {
    return paymentService.getPaymentMethodsForCountry(userCountry);
  };

  const getMobileMoneyProviders = (): MobileMoneyProvider[] => {
    return paymentService.getMobileMoneyProvidersForCountry(userCountry);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setPaymentStep('details');
  };

  const processPayment = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Create payment with DodoPay
      const response = await fetch('/api/payments/dodo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          customerData: {
            email: user?.email || 'user@example.com',
            cardholderName: user?.firstName || 'Card Holder',
            userId: user?.id || 'user_' + Date.now()
          },
          billingAddress: {
            street: '123 Main Street',
            city: 'Kampala',
            state: 'Central',
            zipCode: '00000',
            country: userCountry
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment creation failed');
      }

      const paymentData = await response.json();
      
      // Redirect to DodoPay checkout
      window.location.href = paymentData.payment_url;
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setPaymentStep('method');
      alert(`Payment failed: ${error.message}`);
    }
  };

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Package Details</h3>
          <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
        </div>
      </div>
    );
  }

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
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-xl"
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
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-xl"
        />
      </div>

      <div className="relative p-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
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
                Purchase Credits
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Complete your purchase of the {selectedPackage.name} package
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/credits')}
            className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Credits</span>
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Package Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${selectedPackage.color} rounded-3xl blur-xl opacity-20`} />
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                    Package Summary
                  </h2>
                </div>

                {selectedPackage.popular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center mb-6"
                  >
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-full shadow-lg">
                      <Crown className="w-4 h-4" />
                      <span>Most Popular Choice</span>
                    </div>
                  </motion.div>
                )}

                {selectedPackage.savings && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                      {selectedPackage.savings}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`p-4 bg-gradient-to-r ${selectedPackage.color} rounded-2xl w-fit mx-auto mb-4`}>
                    <div className="text-white">
                      {selectedPackage.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedPackage.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedPackage.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center space-x-2 mb-4">
                      <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        ${selectedPackage.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-lg">USD</span>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold text-xl">
                        {selectedPackage.credits.toLocaleString()} credits
                      </span>
                      {selectedPackage.bonus && (
                        <motion.span 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-green-600 font-semibold bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full"
                        >
                          +{selectedPackage.bonus} bonus
                        </motion.span>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <span className="text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        Total: {(selectedPackage.credits + (selectedPackage.bonus || 0)).toLocaleString()} credits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's Included:</h4>
                  {selectedPackage.features.map((feature, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl h-fit">
              <AnimatePresence mode="wait">
                {paymentStep === 'method' && (
                  <motion.div
                    key="method"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Payment Method</h3>
                      <p className="text-gray-600 dark:text-gray-400">Select your preferred payment option</p>
                    </div>

                    {/* Country Selection */}
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3">Your Country</label>
                      <div className="relative">
                        <select
                          value={userCountry}
                          onChange={(e) => setUserCountry(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none font-medium"
                        >
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">Select Payment Method</h4>
                      {getAvailablePaymentMethods().map((method) => (
                        <motion.button
                          key={method.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePaymentMethodSelect(method.id)}
                          className="w-full flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="text-2xl">{method.icon}</div>
                          <div className="flex-1 text-left">
                            <h5 className="text-gray-800 dark:text-gray-200 font-semibold">{method.name}</h5>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{method.processingTime}</p>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400" />
                        </motion.button>
                      ))}
                    </div>

                    {/* Mobile Money Options */}
                    {getMobileMoneyProviders().length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
                          <Smartphone className="w-5 h-5 text-emerald-600" />
                          <span>Mobile Money Options</span>
                        </h4>
                        <div className="space-y-3">
                          {getMobileMoneyProviders().map((provider) => (
                            <motion.button
                              key={provider.id}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handlePaymentMethodSelect(provider.id)}
                              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 transition-all shadow-sm hover:shadow-md"
                            >
                              <div className="text-xl">{provider.icon}</div>
                              <div className="flex-1 text-left">
                                <h6 className="text-emerald-700 dark:text-emerald-300 font-semibold">{provider.name}</h6>
                                <p className="text-emerald-600 dark:text-emerald-400 text-sm">{provider.currency}</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-emerald-500" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {paymentStep === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Details</h3>
                      <p className="text-gray-600 dark:text-gray-400">Enter your payment information</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+256 700 000 000"
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentStep('method')}
                        className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={processPayment}
                        disabled={!phoneNumber}
                        className="flex-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                      >
                        Pay ${selectedPackage.price}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {paymentStep === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Loader className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Please wait while we process your payment...</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
                      />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">This may take a few moments</p>
                  </motion.div>
                )}

                {paymentStep === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {(selectedPackage.credits + (selectedPackage.bonus || 0)).toLocaleString()} credits have been added to your account
                    </p>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Gift className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Credits Added</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        +{(selectedPackage.credits + (selectedPackage.bonus || 0)).toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/funding')}
                        className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all font-semibold shadow-lg"
                      >
                        Start Finding Funding
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/credits')}
                        className="w-full py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium"
                      >
                        Back to Credits
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;