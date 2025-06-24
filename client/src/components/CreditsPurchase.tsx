import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  Clock,
  Star,
  CreditCard,
  Smartphone,
  Globe,
  Shield,
  MapPin,
  Flag,
  FileText,
  ArrowRight,
  Send,
  Check,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

const CreditsPurchase: React.FC = () => {
  const { user, deductCredits } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [userCountry, setUserCountry] = useState<string>('');
  const [countryFlag, setCountryFlag] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [isGeolocating, setIsGeolocating] = useState(true);

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

  const countries = [
    'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ghana', 'Nigeria', 'South Africa',
    'Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Ivory Coast', 'Cameroon', 'Zambia',
    'Zimbabwe', 'Malawi', 'Madagascar', 'Lesotho', 'Mozambique', 'Chad', 'Guinea',
    'Benin', 'Congo', 'United States', 'United Kingdom', 'Canada', 'Australia'
  ];

  useEffect(() => {
    // Get user's country using geolocation
    detectUserCountry();
  }, []);

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
    setSelectedPackage(packageId);
    setShowPaymentModal(true);
    setPaymentStep('method');
  };

  const getAvailablePaymentMethods = (): PaymentMethod[] => {
    // Filter payment methods by country
    const countryMethods = paymentService.getPaymentMethodsForCountry(userCountry);
    
    // If no country-specific methods found, return global methods
    if (countryMethods.length === 0) {
      return paymentService.getPaymentMethodsForCountry('Global');
    }
    
    return countryMethods;
  };

  const getMobileMoneyProviders = (): MobileMoneyProvider[] => {
    return paymentService.getMobileMoneyProvidersForCountry(userCountry);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setPaymentStep('details');
  };

  const processPayment = async () => {
    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      const selectedMethod = getAvailablePaymentMethods().find(m => m.id === selectedPaymentMethod);
      
      if (selectedMethod?.type === 'mobile_money') {
        // Process mobile money payment
        const result = await paymentService.initiateMobileMoneyPayment(
          selectedPaymentMethod,
          pkg.price,
          'USD',
          phoneNumber,
          `Granada Credits - ${pkg.credits + (pkg.bonus || 0)} credits`
        );

        if (result.success) {
          // Simulate payment completion after 3 seconds
          setTimeout(() => {
            const totalCredits = pkg.credits + (pkg.bonus || 0);
            deductCredits(-totalCredits); // Add credits (negative deduction)
            setPaymentStep('success');
            setIsProcessing(false);
          }, 3000);
        }
      } else {
        // Process card or other payment via DoDo
        const paymentRequest = {
          amount: pkg.price,
          currency: 'USD',
          description: `Granada Credits - ${pkg.credits + (pkg.bonus || 0)} credits`,
          customer: {
            email: user?.email || 'user@example.com',
            name: user?.fullName || 'User',
            phone: phoneNumber
          },
          paymentMethods: [selectedPaymentMethod],
          redirectUrl: `${window.location.origin}/credits`,
          metadata: {
            packageId: pkg.id,
            credits: pkg.credits + (pkg.bonus || 0)
          }
        };

        const payment = await paymentService.createDodoPayment(paymentRequest);
        
        // Redirect to payment page
        window.open(payment.paymentUrl, '_blank');
        
        // Simulate successful payment for demo
        setTimeout(() => {
          const totalCredits = pkg.credits + (pkg.bonus || 0);
          deductCredits(-totalCredits); // Add credits (negative deduction)
          setPaymentStep('success');
          setIsProcessing(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setPaymentStep('method');
      alert('Payment failed. Please try again.');
    }
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
      icon: <ArrowRight className="w-5 h-5" />,
      description: 'Submit applications to donor portals'
    },
    {
      action: 'Basic Search',
      credits: 5,
      icon: <Search className="w-5 h-5" />,
      description: 'Search donor database without AI enhancement'
    }
  ];

  const renderPaymentModal = () => (
    <AnimatePresence>
      {showPaymentModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 max-h-[80vh] overflow-y-auto w-[90%] max-w-md bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 z-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Complete Purchase</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {paymentStep === 'method' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-2">Choose Payment Method</h4>
                    <p className="text-slate-400">Select your preferred payment option</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-slate-300 font-medium mb-2">Your Country</label>
                    <div className="relative">
                      <select
                        value={userCountry}
                        onChange={(e) => setUserCountry(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {getAvailablePaymentMethods().map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                        className="w-full flex items-center space-x-4 p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-slate-600 transition-all"
                      >
                        <div className="text-2xl">{method.icon}</div>
                        <div className="flex-1 text-left">
                          <h5 className="text-white font-medium">{method.name}</h5>
                          <p className="text-slate-400 text-sm">{method.processingTime}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                      </motion.button>
                    ))}
                  </div>

                  {getMobileMoneyProviders().length > 0 && (
                    <div className="border-t border-slate-700/50 pt-6">
                      <h5 className="text-white font-medium mb-4 flex items-center space-x-2">
                        <Smartphone className="w-5 h-5" />
                        <span>Mobile Money Options</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getMobileMoneyProviders().map((provider) => (
                          <motion.button
                            key={provider.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handlePaymentMethodSelect(provider.id)}
                            className="flex items-center space-x-3 p-3 bg-green-600/20 border border-green-500/30 rounded-xl hover:bg-green-600/30 transition-all"
                          >
                            <div className="text-xl">{provider.icon}</div>
                            <div className="flex-1 text-left">
                              <h6 className="text-green-400 font-medium text-sm">{provider.name}</h6>
                              {provider.ussdCode && (
                                <p className="text-green-300 text-xs">{provider.ussdCode}</p>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {paymentStep === 'details' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-2">Payment Details</h4>
                    <p className="text-slate-400">Enter your payment information</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Package:</span>
                      <span className="text-white font-medium capitalize">{selectedPackage}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-slate-300">Amount:</span>
                      <span className="text-white font-medium">${packages.find(p => p.id === selectedPackage)?.price}</span>
                    </div>
                  </div>

                  {selectedPaymentMethod.includes('mobile') || selectedPaymentMethod.includes('mpesa') || selectedPaymentMethod.includes('airtel') || selectedPaymentMethod.includes('mtn') ? (
                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g., +254712345678"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-slate-400 text-sm mt-2">
                        You will receive a payment prompt on this number
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"
                        />
                      </div>
                      <p className="text-slate-400 text-sm">
                        You will be redirected to complete your payment securely
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setPaymentStep('method')}
                      className="flex-1 px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={processPayment}
                      disabled={!phoneNumber && (selectedPaymentMethod.includes('mobile') || selectedPaymentMethod.includes('mpesa'))}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      Pay Now
                    </motion.button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
                  />
                  <h4 className="text-xl font-bold text-white mb-2">Processing Payment</h4>
                  <p className="text-slate-400">Please wait while we process your payment...</p>
                  {selectedPaymentMethod.includes('mobile') && (
                    <p className="text-blue-400 text-sm mt-4">
                      Check your phone for the payment prompt
                    </p>
                  )}
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-white mb-2">Payment Successful!</h4>
                  <p className="text-slate-300 mb-6">Your credits have been added to your account</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowPaymentModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Continue
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
        id="credits-header"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-emerald-600/20 rounded-xl">
            <Gem className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Purchase Credits</h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Power your impact with AI. Each credit unlocks powerful features to accelerate your mission.
        </p>
      </motion.div>

      {/* Current Credits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 text-center max-w-3xl mx-auto"
      >
        <div className="flex items-center justify-center space-x-4">
          <Gem className="w-6 h-6 text-emerald-400" />
          <span className="text-2xl font-bold text-white">
            {user?.credits.toLocaleString()} Credits Available
          </span>
        </div>
      </motion.div>

      {/* Credit Usage Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 max-w-6xl mx-auto"
        id="credit-usage"
      >
        <h3 className="text-xl font-bold text-white mb-4">How Credits Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditUsageExamples.map((example, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-xl">
              <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400 flex-shrink-0">
                {example.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium">{example.action}</h4>
                  <span className="text-emerald-400 font-bold">{example.credits} credits</span>
                </div>
                <p className="text-slate-400 text-sm">{example.description}</p>
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
            className={`relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border transition-all cursor-pointer ${
              pkg.popular 
                ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' 
                : selectedPackage === pkg.id
                ? 'border-blue-500/50 ring-2 ring-blue-500/20'
                : 'border-slate-700/50 hover:border-slate-600/50'
            }`}
            onClick={() => setSelectedPackage(pkg.id)}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 text-white text-sm font-medium rounded-full">
                  <Star className="w-3 h-3" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}

            {pkg.savings && (
              <div className="absolute -top-3 -right-3">
                <div className="px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded-full">
                  {pkg.savings}
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2 capitalize">{pkg.id}</h3>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-3xl font-bold text-white">${pkg.price}</span>
                <span className="text-slate-400">USD</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Gem className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">
                  {pkg.credits.toLocaleString()} credits
                </span>
                {pkg.bonus && (
                  <span className="text-green-400 text-sm">
                    +{pkg.bonus} bonus
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {getCreditsPerDollar(pkg)} credits per $1
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {pkg.features.map((feature, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{feature}</span>
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
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
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
        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30 max-w-6xl mx-auto"
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Multiple Payment Options</h3>
          <p className="text-slate-300">Choose from various payment methods including mobile money for Africa</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-xl">
            <CreditCard className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-medium">Cards</p>
            <p className="text-slate-400 text-xs">Visa, Mastercard</p>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-xl">
            <Smartphone className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-medium">M-Pesa</p>
            <p className="text-slate-400 text-xs">Kenya, Tanzania</p>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-xl">
            <Smartphone className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-white font-medium">Airtel Money</p>
            <p className="text-slate-400 text-xs">Multiple countries</p>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-xl">
            <Globe className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white font-medium">Bank Transfer</p>
            <p className="text-slate-400 text-xs">Global</p>
          </div>
        </div>
      </motion.div>

      {/* Security & Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        <div className="flex items-center space-x-3 p-4 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
          <Shield className="w-6 h-6 text-green-400" />
          <div>
            <h4 className="text-white font-medium">Secure Payments</h4>
            <p className="text-slate-400 text-sm">256-bit SSL encryption</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
          <CreditCard className="w-6 h-6 text-blue-400" />
          <div>
            <h4 className="text-white font-medium">Flexible Billing</h4>
            <p className="text-slate-400 text-sm">Pay as you go, no subscriptions</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
          <Clock className="w-6 h-6 text-purple-400" />
          <div>
            <h4 className="text-white font-medium">Instant Access</h4>
            <p className="text-slate-400 text-sm">Credits available immediately</p>
          </div>
        </div>
      </motion.div>

      {renderPaymentModal()}
    </div>
  );
};

export default CreditsPurchase;