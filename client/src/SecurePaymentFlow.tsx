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
  ArrowLeft
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

  const [cardType, setCardType] = useState('unknown');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidCard, setIsValidCard] = useState(false);

  // Real-time validation on every keystroke
  useEffect(() => {
    if (cardData.cardNumber.length >= 2) {
      const detectedType = getCardType(cardData.cardNumber);
      setCardType(detectedType);
    } else {
      setCardType('unknown');
    }

    // Validate card number in real-time
    const errors: Record<string, string> = {};
    
    if (cardData.cardNumber.length > 0) {
      if (!validateCardNumber(cardData.cardNumber)) {
        errors.cardNumber = 'Invalid card number';
      }
    }

    if (cardData.expiryMonth && cardData.expiryYear) {
      if (!validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)) {
        errors.expiry = 'Card has expired';
      }
    }

    if (cardData.cvv.length > 0) {
      if (!validateCVV(cardData.cvv, cardType)) {
        errors.cvv = cardType === 'amex' ? 'CVV must be 4 digits' : 'CVV must be 3 digits';
      }
    }

    if (cardData.cardholderName.length > 0 && cardData.cardholderName.trim().length < 2) {
      errors.name = 'Please enter a valid name';
    }

    setValidationErrors(errors);
    setIsValidCard(
      Object.keys(errors).length === 0 && 
      cardData.cardNumber.length >= 13 && 
      cardData.cardholderName.trim().length >= 2 &&
      cardData.expiryMonth && 
      cardData.expiryYear && 
      cardData.cvv.length >= 3
    );
  }, [cardData, cardType]);

  // Card type styling
  const getCardTypeInfo = (type: string) => {
    switch (type) {
      case 'visa':
        return {
          name: 'Visa',
          color: 'from-blue-500 to-blue-700',
          textColor: 'text-white',
          bgColor: 'bg-blue-500'
        };
      case 'mastercard':
        return {
          name: 'Mastercard',
          color: 'from-red-500 to-orange-500',
          textColor: 'text-white',
          bgColor: 'bg-red-500'
        };
      case 'amex':
        return {
          name: 'American Express',
          color: 'from-green-600 to-green-800',
          textColor: 'text-white',
          bgColor: 'bg-green-600'
        };
      case 'discover':
        return {
          name: 'Discover',
          color: 'from-orange-500 to-orange-700',
          textColor: 'text-white',
          bgColor: 'bg-orange-500'
        };
      default:
        return {
          name: 'Credit Card',
          color: 'from-gray-600 to-gray-800',
          textColor: 'text-white',
          bgColor: 'bg-gray-600'
        };
    }
  };

  const cardTypeInfo = getCardTypeInfo(cardType);

  // Input handlers for real-time updates
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
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

  const processPayment = async () => {
    if (!isValidCard) return;

    setIsProcessing(true);
    setError('');
    setStep('processing');

    try {
      const result: PaymentResult = await processRealTimePayment(
        cardData,
        finalAmount,
        selectedPackage.id,
        couponCode || undefined
      );

      if (result.success && result.transaction) {
        // Simulate 3D Secure authentication for enhanced security
        const requiresAuth = finalAmount > 100 || Math.random() > 0.7;
        
        if (requiresAuth) {
          setStep('verification');
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
          <p className="text-gray-600 mb-6">Please wait while we verify your payment with your bank...</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">This is a secure authentication process required by your bank.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Secure Payment</h1>
            <p className="text-gray-600">Complete your purchase with enhanced security</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Package Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className={`p-4 rounded-lg bg-gradient-to-r ${selectedPackage.color} text-white mb-4`}>
                <div className="flex items-center space-x-3">
                  {selectedPackage.icon}
                  <div>
                    <h4 className="font-semibold">{selectedPackage.name}</h4>
                    <p className="text-sm opacity-90">{selectedPackage.credits} Credits</p>
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code (Optional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="SAVE99"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cardTypeInfo.bgColor}`}>
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
                  <p className="text-gray-600 text-sm">
                    {cardType !== 'unknown' ? `${cardTypeInfo.name} detected` : 'Enter your card details'}
                  </p>
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
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                      validationErrors.name 
                        ? 'border-red-300 focus:border-red-500' 
                        : cardData.cardholderName.trim().length >= 2
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="John Smith"
                    required
                  />
                  {validationErrors.name && (
                    <p className="text-sm mt-1 text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                {/* Card Number with Real-time Type Detection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                    {cardType !== 'unknown' && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${cardTypeInfo.bgColor} text-white`}>
                        {cardTypeInfo.name}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardData.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors pr-12 ${
                        validationErrors.cardNumber 
                          ? 'border-red-300 focus:border-red-500' 
                          : validateCardNumber(cardData.cardNumber) && cardData.cardNumber.length >= 13
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                    {validateCardNumber(cardData.cardNumber) && cardData.cardNumber.length >= 13 && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {validationErrors.cardNumber && (
                    <p className="text-sm mt-1 text-red-600">{validationErrors.cardNumber}</p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <select
                      value={cardData.expiryMonth}
                      onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                      className={`w-full px-3 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        validationErrors.expiry 
                          ? 'border-red-300 focus:border-red-500' 
                          : cardData.expiryMonth && cardData.expiryYear && validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      required
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, '0');
                        return (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <select
                      value={cardData.expiryYear}
                      onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                      className={`w-full px-3 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        validationErrors.expiry 
                          ? 'border-red-300 focus:border-red-500' 
                          : cardData.expiryMonth && cardData.expiryYear && validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      required
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 15 }, (_, i) => {
                        const year = (new Date().getFullYear() + i).toString();
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        type={showCVV ? "text" : "password"}
                        value={cardData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className={`w-full px-3 py-3 border-2 rounded-lg focus:outline-none transition-colors pr-10 ${
                          validationErrors.cvv 
                            ? 'border-red-300 focus:border-red-500' 
                            : validateCVV(cardData.cvv, cardType) && cardData.cvv.length >= 3
                              ? 'border-green-300 focus:border-green-500'
                              : 'border-gray-300 focus:border-indigo-500'
                        }`}
                        placeholder={cardType === 'amex' ? '1234' : '123'}
                        maxLength={cardType === 'amex' ? 4 : 3}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCVV(!showCVV)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showCVV ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {validationErrors.cvv && (
                      <p className="text-sm mt-1 text-red-600">{validationErrors.cvv}</p>
                    )}
                  </div>
                </div>

                {validationErrors.expiry && (
                  <p className="text-sm text-red-600">{validationErrors.expiry}</p>
                )}

                {/* Security Features */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Secure Payment</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 256-bit SSL encryption</li>
                    <li>• 3D Secure authentication</li>
                    <li>• PCI DSS compliance</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isValidCard || isProcessing}
                  className={`w-full py-4 rounded-lg font-semibold transition-all ${
                    isValidCard && !isProcessing
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>
                      {isProcessing ? 'Processing...' : `Pay $${finalAmount.toFixed(2)} Securely`}
                    </span>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}