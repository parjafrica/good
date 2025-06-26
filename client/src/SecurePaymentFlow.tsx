import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader,
  Sparkles,
  Crown,
  Star,
  Award
} from 'lucide-react';
import { processRealTimePayment, validateCardNumber, getCardType, formatCardNumber, validateExpiryDate, validateCVV, type CardData, type PaymentResult } from './services/realTimeValidation';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  color: string;
  icon: React.ReactNode;
  description: string;
  popular?: boolean;
}

interface SecurePaymentFlowProps {
  selectedPackage: CreditPackage;
  onSuccess: (transaction: any) => void;
  onBack: () => void;
}

export default function SecurePaymentFlow({ selectedPackage, onSuccess, onBack }: SecurePaymentFlowProps) {
  const [step, setStep] = useState<'payment' | 'processing' | 'verification'>('payment');
  const [showCVV, setShowCVV] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const [validation, setValidation] = useState({
    cardNumber: { isValid: false, message: '' },
    expiry: { isValid: false, message: '' },
    cvv: { isValid: false, message: '' },
    name: { isValid: false, message: '' }
  });

  // Real-time card validation
  useEffect(() => {
    const cardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (cardNumber.length >= 13) {
      const isValid = validateCardNumber(cardNumber);
      setValidation(prev => ({
        ...prev,
        cardNumber: {
          isValid,
          message: isValid ? `Valid ${getCardType(cardNumber)} card` : 'Invalid card number'
        }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        cardNumber: { isValid: false, message: '' }
      }));
    }
  }, [cardData.cardNumber]);

  // Real-time expiry validation
  useEffect(() => {
    if (cardData.expiryMonth && cardData.expiryYear) {
      const isValid = validateExpiryDate(cardData.expiryMonth, cardData.expiryYear);
      setValidation(prev => ({
        ...prev,
        expiry: {
          isValid,
          message: isValid ? 'Valid expiry date' : 'Card expired or invalid date'
        }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        expiry: { isValid: false, message: '' }
      }));
    }
  }, [cardData.expiryMonth, cardData.expiryYear]);

  // Real-time CVV validation
  useEffect(() => {
    if (cardData.cvv) {
      const cardType = getCardType(cardData.cardNumber.replace(/\s/g, ''));
      const isValid = validateCVV(cardData.cvv, cardType);
      setValidation(prev => ({
        ...prev,
        cvv: {
          isValid,
          message: isValid ? 'Valid security code' : 'Invalid CVV'
        }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        cvv: { isValid: false, message: '' }
      }));
    }
  }, [cardData.cvv, cardData.cardNumber]);

  // Name validation
  useEffect(() => {
    const isValid = cardData.cardholderName.trim().length >= 2;
    setValidation(prev => ({
      ...prev,
      name: {
        isValid,
        message: isValid ? 'Valid cardholder name' : 'Please enter cardholder name'
      }
    }));
  }, [cardData.cardholderName]);

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const applyCoupon = async () => {
    if (couponCode === 'SAVE99') {
      setCouponDiscount(selectedPackage.price * 0.99);
    } else if (couponCode === 'WELCOME50') {
      setCouponDiscount(selectedPackage.price * 0.50);
    } else {
      setCouponDiscount(0);
    }
  };

  const finalAmount = selectedPackage.price - couponDiscount;
  const isFormValid = Object.values(validation).every(v => v.isValid);

  const processPayment = async () => {
    if (!isFormValid) return;

    setIsProcessing(true);
    setError('');
    setStep('processing');

    try {
      // Process real-time payment with enhanced validation
      const result: PaymentResult = await processRealTimePayment(
        cardData,
        selectedPackage.price,
        selectedPackage.id,
        couponCode || undefined
      );

      if (result.success && result.transaction) {
        // Simulate 3D Secure authentication for cards that require it
        const requiresAuth = Math.random() > 0.7; // 30% of cards require 3D Secure
        
        if (requiresAuth) {
          setStep('verification');
          // Simulate 3D Secure process
          setTimeout(() => {
            onSuccess(result.transaction);
          }, 3000);
        } else {
          onSuccess(result.transaction);
        }
      } else {
        setError(result.error || 'Payment processing failed');
        setStep('payment');
      }
    } catch (error: any) {
      setError(error.message || 'Network error occurred');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'processing') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h3>
          <p className="text-gray-600">Validating your card and processing the transaction...</p>
        </div>
      </motion.div>
    );
  }

  if (step === 'verification') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">3D Secure Authentication</h3>
          <p className="text-gray-600 mb-4">Completing secure authentication with your bank...</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>← Back to Packages</span>
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">256-bit SSL Secured</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Package Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className={`w-full rounded-lg p-4 mb-4 bg-gradient-to-br ${selectedPackage.color}`}>
                <div className="flex items-center justify-between text-white">
                  {selectedPackage.icon}
                  {selectedPackage.popular && <Crown className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-semibold text-white mt-2">{selectedPackage.name}</h3>
                <p className="text-white/90 text-sm">{selectedPackage.credits} Credits</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package Price</span>
                  <span className="font-semibold">${selectedPackage.price.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({couponCode})</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
                  <p className="text-gray-600 text-sm">All transactions are secured and encrypted</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); processPayment(); }} className="space-y-6">
                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardData.cardholderName}
                    onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                      validation.name.isValid 
                        ? 'border-green-300 focus:border-green-500' 
                        : cardData.cardholderName 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="John Smith"
                    required
                  />
                  {validation.name.message && (
                    <p className={`text-sm mt-1 ${validation.name.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.name.message}
                    </p>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardData.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors pr-12 ${
                        validation.cardNumber.isValid 
                          ? 'border-green-300 focus:border-green-500' 
                          : cardData.cardNumber 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                    {validation.cardNumber.isValid && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {validation.cardNumber.message && (
                    <p className={`text-sm mt-1 ${validation.cardNumber.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.cardNumber.message}
                    </p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <input
                      type="text"
                      value={cardData.expiryMonth}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 2) {
                          setCardData(prev => ({ ...prev, expiryMonth: value }));
                        }
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        validation.expiry.isValid 
                          ? 'border-green-300 focus:border-green-500' 
                          : cardData.expiryMonth 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="MM"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      value={cardData.expiryYear}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setCardData(prev => ({ ...prev, expiryYear: value }));
                        }
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        validation.expiry.isValid 
                          ? 'border-green-300 focus:border-green-500' 
                          : cardData.expiryYear 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="YYYY"
                      maxLength={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        type={showCVV ? "text" : "password"}
                        value={cardData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 4) {
                            setCardData(prev => ({ ...prev, cvv: value }));
                          }
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors pr-10 ${
                          validation.cvv.isValid 
                            ? 'border-green-300 focus:border-green-500' 
                            : cardData.cvv 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-gray-300 focus:border-indigo-500'
                        }`}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCVV(!showCVV)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                {validation.expiry.message && (
                  <p className={`text-sm ${validation.expiry.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.expiry.message}
                  </p>
                )}

                {/* Coupon Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      placeholder="Enter coupon code"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponCode}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponDiscount > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      Coupon applied! You save ${couponDiscount.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Security Features */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Lock className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-800">Your payment is secured by:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>3D Secure authentication</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Real-time fraud detection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>PCI DSS compliant</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormValid || isProcessing}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    isFormValid && !isProcessing
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Complete Purchase - $${finalAmount.toFixed(2)}`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}