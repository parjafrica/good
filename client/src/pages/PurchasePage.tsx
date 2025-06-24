import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Gem,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Mail,
  ExternalLink,
  Check,
  X,
  RefreshCw,
  Star,
  Shield,
  Clock,
  CreditCard as CardIcon,
  Wallet,
  MapPin
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

const PurchasePage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const { user, deductCredits } = useAuth();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [userCountry, setUserCountry] = useState<string>('');
  const [countryFlag, setCountryFlag] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [isGeolocating, setIsGeolocating] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

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

  // Available countries for dropdown
  const countries = [
    'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ghana', 'Nigeria', 'South Africa',
    'Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Ivory Coast', 'Cameroon', 'Zambia',
    'Zimbabwe', 'Malawi', 'Madagascar', 'Lesotho', 'Mozambique', 'Chad', 'Guinea',
    'Benin', 'Congo', 'United States', 'United Kingdom', 'Canada', 'Australia'
  ];

  useEffect(() => {
    // Find the selected package
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
    } else {
      // If package not found, redirect to credits page
      navigate('/credits');
    }
    
    // Get user's country using geolocation
    detectUserCountry();
  }, [packageId, navigate]);

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
    if (!selectedPackage) return;

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      const selectedMethod = getAvailablePaymentMethods().find(m => m.id === selectedPaymentMethod);
      
      if (selectedMethod?.type === 'mobile_money') {
        // Process mobile money payment
        const result = await paymentService.initiateMobileMoneyPayment(
          selectedPaymentMethod,
          selectedPackage.price,
          'USD',
          phoneNumber,
          `Granada Credits - ${selectedPackage.credits + (selectedPackage.bonus || 0)} credits`
        );

        if (result.success) {
          // Simulate payment completion after 3 seconds
          setTimeout(() => {
            const totalCredits = selectedPackage.credits + (selectedPackage.bonus || 0);
            deductCredits(-totalCredits); // Add credits (negative deduction)
            setPaymentStep('success');
            setIsProcessing(false);
          }, 3000);
        }
      } else {
        // Process card or other payment via DoDo
        const paymentRequest = {
          amount: selectedPackage.price,
          currency: 'USD',
          description: `Granada Credits - ${selectedPackage.credits + (selectedPackage.bonus || 0)} credits`,
          customer: {
            email: user?.email || 'user@example.com',
            name: user?.fullName || 'User',
            phone: phoneNumber
          },
          paymentMethods: [selectedPaymentMethod],
          redirectUrl: `${window.location.origin}/credits`,
          metadata: {
            packageId: selectedPackage.id,
            credits: selectedPackage.credits + (selectedPackage.bonus || 0)
          }
        };

        const payment = await paymentService.createDodoPayment(paymentRequest);
        
        // Redirect to payment page
        window.open(payment.paymentUrl, '_blank');
        
        // Simulate successful payment for demo
        setTimeout(() => {
          const totalCredits = selectedPackage.credits + (selectedPackage.bonus || 0);
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

  if (!selectedPackage) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Package Details</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Gem className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Purchase Credits</h1>
            <p className="text-gray-700">Complete your purchase of the {selectedPackage.id} package</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/credits')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Credits</span>
        </motion.button>
      </motion.div>

      {/* Package Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Package Summary</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className={`relative bg-white rounded-xl p-6 border ${
              selectedPackage.popular ? 'border-emerald-300' : 'border-gray-200'
            }`}>
              {selectedPackage.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-500 text-white text-sm font-medium rounded-full">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{selectedPackage.id}</h3>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">${selectedPackage.price}</span>
                  <span className="text-gray-600">USD</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Gem className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">
                    {selectedPackage.credits.toLocaleString()} credits
                  </span>
                  {selectedPackage.bonus && (
                    <span className="text-green-600 text-sm">
                      +{selectedPackage.bonus} bonus
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {selectedPackage.features.map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-gray-50 rounded-xl p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              
              {paymentStep === 'method' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Your Country</label>
                    <div className="relative">
                      <select
                        value={userCountry}
                        onChange={(e) => setUserCountry(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Select Payment Method</h4>
                    {getAvailablePaymentMethods().map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                        className="w-full flex items-center space-x-4 p-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        <div className="text-2xl">{method.icon}</div>
                        <div className="flex-1 text-left">
                          <h5 className="text-gray-800 font-medium">{method.name}</h5>
                          <p className="text-gray-600 text-sm">{method.processingTime}</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-gray-500 transform rotate-180" />
                      </motion.button>
                    ))}
                  </div>

                  {getMobileMoneyProviders().length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                        <Smartphone className="w-5 h-5 text-gray-700" />
                        <span>Mobile Money Options</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {getMobileMoneyProviders().map((provider) => (
                          <motion.button
                            key={provider.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handlePaymentMethodSelect(provider.id)}
                            className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all"
                          >
                            <div className="text-xl">{provider.icon}</div>
                            <div className="flex-1 text-left">
                              <h6 className="text-green-700 font-medium text-sm">{provider.name}</h6>
                              {provider.ussdCode && (
                                <p className="text-green-600 text-xs">{provider.ussdCode}</p>
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
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Package:</span>
                      <span className="text-gray-800 font-medium capitalize">{selectedPackage.id}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-700">Amount:</span>
                      <span className="text-gray-800 font-medium">${selectedPackage.price}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-700">Total Credits:</span>
                      <span className="text-emerald-600 font-medium">
                        {selectedPackage.credits + (selectedPackage.bonus || 0)} credits
                      </span>
                    </div>
                  </div>

                  {selectedPaymentMethod.includes('mobile') || selectedPaymentMethod.includes('mpesa') || selectedPaymentMethod.includes('airtel') || selectedPaymentMethod.includes('mtn') ? (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g., +254712345678"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-gray-600 text-sm mt-2">
                        You will receive a payment prompt on this number
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700"
                        />
                      </div>
                      <p className="text-gray-600 text-sm">
                        You will be redirected to complete your payment securely
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setPaymentStep('method')}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
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
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
                  />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h4>
                  <p className="text-gray-600">Please wait while we process your payment...</p>
                  {selectedPaymentMethod.includes('mobile') && (
                    <p className="text-blue-600 text-sm mt-4">
                      Check your phone for the payment prompt
                    </p>
                  )}
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-8 h-8 text-white" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h4>
                  <p className="text-gray-600 mb-6">Your credits have been added to your account</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/credits')}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Return to Credits
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security & Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
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

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">How soon will I receive my credits?</h3>
            <p className="text-gray-600">Credits are added to your account immediately after your payment is processed.</p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">We accept credit/debit cards, mobile money (M-Pesa, Airtel Money, etc.), and bank transfers depending on your location.</p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Do credits expire?</h3>
            <p className="text-gray-600">Yes, credits have different validity periods depending on the package you purchase. The validity period is listed in the package details.</p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Can I get a refund?</h3>
            <p className="text-gray-600">Refunds are available within 7 days of purchase if you haven't used any of the credits. Contact our support team for assistance.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Need more help?</h3>
            <p className="text-gray-600">Contact our support team at support@granada.to or visit our help center for more information.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PurchasePage;