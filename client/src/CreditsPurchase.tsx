import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Gem,
  ArrowLeft,
  CreditCard,
  Shield,
  Lock,
  Check,
  RefreshCw,
  Star,
  Crown,
  Zap,
  Award,
  Target,
  Gift,
  CheckCircle,
  CheckCircle2,
  ExternalLink,
  Loader,
  Eye,
  EyeOff,
  Calendar,
  User,
  Mail,
  Smartphone,
  MapPin,
  Building,
  Globe,
  Sparkles,
  AlertCircle,
  Tag,
  Percent
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { couponService, CouponValidationResult } from './services/couponService';

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

interface CardFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  email: string;
  phone: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const CreditsPurchase: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const { user, deductCredits } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'package' | 'payment' | 'processing' | 'success'>('package');
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [showCvv, setShowCvv] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<CouponValidationResult | null>(null);
  const [showCouponField, setShowCouponField] = useState(false);

  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    email: user?.email || '',
    phone: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Uganda'
    }
  });

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
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh',
    'Belgium', 'Brazil', 'Canada', 'China', 'Denmark', 'Egypt', 'France', 'Germany',
    'Ghana', 'India', 'Indonesia', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Netherlands',
    'Nigeria', 'Norway', 'Pakistan', 'Philippines', 'Poland', 'Rwanda', 'Singapore',
    'South Africa', 'Spain', 'Sweden', 'Switzerland', 'Tanzania', 'Thailand', 'Turkey',
    'Uganda', 'United Kingdom', 'United States', 'Vietnam', 'Zambia', 'Zimbabwe'
  ];

  useEffect(() => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
    } else {
      navigate('/credits');
    }
  }, [packageId, navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return { type: 'visa', color: 'from-blue-600 to-blue-700' };
    if (/^5[1-5]/.test(number)) return { type: 'mastercard', color: 'from-red-600 to-orange-600' };
    if (/^3[47]/.test(number)) return { type: 'amex', color: 'from-green-600 to-teal-600' };
    if (/^6/.test(number)) return { type: 'discover', color: 'from-orange-600 to-yellow-600' };
    return { type: 'default', color: 'from-gray-600 to-gray-700' };
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.cardNumber.replace(/\s/g, '') || formData.cardNumber.replace(/\s/g, '').length < 13) {
      errors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!formData.expiryMonth || !formData.expiryYear) {
      errors.expiry = 'Please enter expiry date';
    }
    
    if (!formData.cvv || formData.cvv.length < 3) {
      errors.cvv = 'Please enter valid CVV';
    }
    
    if (!formData.cardholderName.trim()) {
      errors.cardholderName = 'Please enter cardholder name';
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter valid email';
    }
    
    if (!formData.billingAddress.street.trim()) {
      errors.street = 'Please enter street address';
    }
    
    if (!formData.billingAddress.city.trim()) {
      errors.city = 'Please enter city';
    }
    
    if (!formData.billingAddress.zipCode.trim()) {
      errors.zipCode = 'Please enter zip code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string, nested?: string) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field as keyof CardFormData] as any,
          [nested]: value
        }
      }));
    } else if (field === 'cardNumber') {
      setFormData(prev => ({ ...prev, [field]: formatCardNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear specific field error
    if (formErrors[field] || formErrors[nested || '']) {
      setFormErrors(prev => ({ ...prev, [field]: '', [nested || '']: '' }));
    }
  };

  const handleCouponCodeChange = (value: string) => {
    setCouponCode(value);
    if (value.length >= 3 && selectedPackage) {
      const validation = couponService.validateCoupon(value, selectedPackage.price, selectedPackage.id);
      setCouponValidation(validation);
    } else {
      setCouponValidation(null);
    }
  };

  const applyCoupon = () => {
    if (couponValidation?.isValid && selectedPackage) {
      couponService.applyCoupon(couponCode);
    }
  };

  const getDiscountedPrice = () => {
    if (!selectedPackage) return 0;
    return couponValidation?.isValid ? couponValidation.finalPrice : selectedPackage.price;
  };

  const getDiscountAmount = () => {
    if (!selectedPackage || !couponValidation?.isValid) return 0;
    return couponValidation.discount;
  };

  const processPayment = async () => {
    if (!validateForm() || !selectedPackage) return;

    setIsValidating(true);
    setCurrentStep('processing');

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
            email: formData.email,
            cardholderName: formData.cardholderName,
            userId: user?.id || 'user_' + Date.now()
          },
          billingAddress: {
            street: formData.billingAddress.street,
            city: formData.billingAddress.city,
            state: formData.billingAddress.state,
            zipCode: formData.billingAddress.zipCode,
            country: formData.billingAddress.country
          },
          couponCode: couponCode || undefined
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
      setIsValidating(false);
      setCurrentStep('payment');
      alert(`Payment failed: ${error.message}`);
    }
  };

  const cardType = getCardType(formData.cardNumber);

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

      <div className="relative p-6 max-w-7xl mx-auto">
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
              <CreditCard className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Secure Payment
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Complete your {selectedPackage.name} package purchase
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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 max-w-2xl mx-auto">
            {[
              { id: 'package', label: 'Package', icon: <Gem className="w-5 h-5" /> },
              { id: 'payment', label: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
              { id: 'processing', label: 'Processing', icon: <Loader className="w-5 h-5" /> },
              { id: 'success', label: 'Complete', icon: <CheckCircle className="w-5 h-5" /> }
            ].map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = ['package', 'payment', 'processing', 'success'].indexOf(currentStep) > index;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    isActive ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' :
                    isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.icon}
                    <span className="font-medium">{step.label}</span>
                  </div>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Package Summary - Left Column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${selectedPackage.color} rounded-3xl blur-xl opacity-20`} />
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/20 shadow-2xl">
                  
                  {selectedPackage.popular && (
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-full shadow-lg">
                        <Crown className="w-4 h-4" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}

                  {selectedPackage.savings && (
                    <div className="text-center mb-4">
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                        {selectedPackage.savings}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`p-3 bg-gradient-to-r ${selectedPackage.color} rounded-2xl w-fit mx-auto mb-4`}>
                      <div className="text-white">
                        {selectedPackage.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedPackage.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedPackage.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center space-x-2 mb-3">
                        <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          ${selectedPackage.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">USD</span>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">
                          {selectedPackage.credits.toLocaleString()} credits
                        </span>
                        {selectedPackage.bonus && (
                          <span className="text-green-600 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full text-sm">
                            +{selectedPackage.bonus} bonus
                          </span>
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
                  <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Features:</h4>
                    {selectedPackage.features.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Security Badges */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4" />
                        <span>SSL Protected</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Lock className="w-4 h-4" />
                        <span>256-bit Encryption</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment Form - Right Columns */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 'package' && (
                <motion.div
                  key="package"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Your Package</h3>
                    <p className="text-gray-600 dark:text-gray-400">Review your selection and proceed to payment</p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep('payment')}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all font-semibold text-lg shadow-lg"
                  >
                    Proceed to Payment
                  </motion.button>
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Information</h3>
                    <p className="text-gray-600 dark:text-gray-400">Enter your card details to complete the purchase</p>
                  </div>

                  {/* Virtual Credit Card */}
                  <div className="mb-8">
                    <motion.div
                      whileHover={{ rotateY: 5 }}
                      className={`relative w-full max-w-md mx-auto h-56 bg-gradient-to-r ${cardType.color} rounded-2xl shadow-2xl overflow-hidden`}
                      style={{ perspective: '1000px' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                      <div className="p-6 h-full flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded opacity-80" />
                          <div className="text-right">
                            <div className="text-sm opacity-75">Granada OS</div>
                            <div className="text-xs opacity-60">Credits Card</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-mono tracking-wider mb-4">
                            {formData.cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-xs opacity-60 mb-1">CARDHOLDER</div>
                              <div className="text-sm font-medium">
                                {formData.cardholderName || 'YOUR NAME'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs opacity-60 mb-1">EXPIRES</div>
                              <div className="text-sm font-medium">
                                {formData.expiryMonth && formData.expiryYear 
                                  ? `${formData.expiryMonth}/${formData.expiryYear}` 
                                  : 'MM/YY'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <form className="space-y-6">
                    {/* Card Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className={`w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono ${
                              formErrors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          {formErrors.cardNumber && (
                            <div className="flex items-center space-x-1 mt-1">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-500 text-sm">{formErrors.cardNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                          Expiry Month
                        </label>
                        <div className="relative">
                          <select
                            value={formData.expiryMonth}
                            onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                            className={`w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              formErrors.expiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="">Month</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                              <option key={month} value={month.toString().padStart(2, '0')}>
                                {month.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                          Expiry Year
                        </label>
                        <div className="relative">
                          <select
                            value={formData.expiryYear}
                            onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                            className={`w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              formErrors.expiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="">Year</option>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                              <option key={year} value={year.toString().slice(-2)}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                        {formErrors.expiry && (
                          <div className="flex items-center space-x-1 mt-1">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 text-sm">{formErrors.expiry}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                          CVV
                        </label>
                        <div className="relative">
                          <input
                            type={showCvv ? 'text' : 'password'}
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            maxLength={4}
                            className={`w-full px-4 py-3 pl-12 pr-12 bg-white dark:bg-gray-700 border rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono ${
                              formErrors.cvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <button
                            type="button"
                            onClick={() => setShowCvv(!showCvv)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCvv ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          {formErrors.cvv && (
                            <div className="flex items-center space-x-1 mt-1">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-500 text-sm">{formErrors.cvv}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                          Cardholder Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.cardholderName}
                            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                            placeholder="John Doe"
                            className={`w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              formErrors.cardholderName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          {formErrors.cardholderName && (
                            <div className="flex items-center space-x-1 mt-1">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-500 text-sm">{formErrors.cardholderName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="john@example.com"
                              className={`w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            {formErrors.email && (
                              <div className="flex items-center space-x-1 mt-1">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-red-500 text-sm">{formErrors.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+256 700 000 000"
                              className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing Address</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Street Address
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.billingAddress.street}
                              onChange={(e) => handleInputChange('billingAddress', e.target.value, 'street')}
                              placeholder="123 Main Street"
                              className={`w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                formErrors.street ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            />
                            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            {formErrors.street && (
                              <div className="flex items-center space-x-1 mt-1">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-red-500 text-sm">{formErrors.street}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                              City
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.billingAddress.city}
                                onChange={(e) => handleInputChange('billingAddress', e.target.value, 'city')}
                                placeholder="Kampala"
                                className={`w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                  formErrors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                              />
                              <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              {formErrors.city && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-red-500 text-sm">{formErrors.city}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                              State/Province
                            </label>
                            <input
                              type="text"
                              value={formData.billingAddress.state}
                              onChange={(e) => handleInputChange('billingAddress', e.target.value, 'state')}
                              placeholder="Central"
                              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                              ZIP/Postal Code
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.billingAddress.zipCode}
                                onChange={(e) => handleInputChange('billingAddress', e.target.value, 'zipCode')}
                                placeholder="12345"
                                className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                  formErrors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                              />
                              {formErrors.zipCode && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-red-500 text-sm">{formErrors.zipCode}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Country
                          </label>
                          <div className="relative">
                            <select
                              value={formData.billingAddress.country}
                              onChange={(e) => handleInputChange('billingAddress', e.target.value, 'country')}
                              className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              {countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                              ))}
                            </select>
                            <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coupon Code Section */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Coupon Code</h4>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowCouponField(!showCouponField)}
                          className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                        >
                          <Tag className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {showCouponField ? 'Hide coupon' : 'Have a coupon?'}
                          </span>
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {showCouponField && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <div className="flex space-x-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={couponCode}
                                  onChange={(e) => handleCouponCodeChange(e.target.value)}
                                  placeholder="Enter coupon code (try SAVE99)"
                                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </div>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={applyCoupon}
                                disabled={!couponValidation?.isValid}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                Apply
                              </motion.button>
                            </div>

                            {/* Coupon Validation Feedback */}
                            {couponValidation && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl border ${
                                  couponValidation.isValid
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {couponValidation.isValid ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                  )}
                                  <span
                                    className={`font-medium ${
                                      couponValidation.isValid
                                        ? 'text-green-800 dark:text-green-200'
                                        : 'text-red-800 dark:text-red-200'
                                    }`}
                                  >
                                    {couponValidation.isValid
                                      ? `Coupon applied! Save $${couponValidation.discount.toFixed(2)}`
                                      : couponValidation.error}
                                  </span>
                                </div>
                                {couponValidation.isValid && (
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Original Price:</span>
                                    <span className="line-through text-gray-500">${selectedPackage.price}</span>
                                  </div>
                                )}
                              </motion.div>
                            )}

                            {/* Price Summary with Discount */}
                            {couponValidation?.isValid && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-700"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                                  <span className="text-gray-700 dark:text-gray-300">${selectedPackage.price}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                                    <Percent className="w-4 h-4" />
                                    <span>Discount ({couponCode}):</span>
                                  </span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    -${getDiscountAmount().toFixed(2)}
                                  </span>
                                </div>
                                <div className="border-t border-emerald-200 dark:border-emerald-700 pt-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                      ${getDiscountedPrice().toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Payment Buttons */}
                    <div className="flex space-x-4 pt-6">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep('package')}
                        className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={processPayment}
                        disabled={isValidating}
                        className="flex-2 py-3 px-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                      >
                        {isValidating ? 'Validating...' : `Pay $${getDiscountedPrice().toFixed(2)}`}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {currentStep === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CreditCard className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Securely processing your payment of ${selectedPackage.price}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3 }}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full"
                    />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Please do not close this window</p>
                </motion.div>
              )}

              {currentStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Thank you for your purchase! Your credits have been added to your account.
                  </p>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <Sparkles className="w-6 h-6 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-lg">Credits Added</span>
                    </div>
                    <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                      +{(selectedPackage.credits + (selectedPackage.bonus || 0)).toLocaleString()}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400">
                      Total Credits Available: {((user?.credits || 0) + selectedPackage.credits + (selectedPackage.bonus || 0)).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/funding')}
                      className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all font-semibold text-lg shadow-lg"
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
        </div>
      </div>
    </div>
  );
};

export default CreditsPurchase;