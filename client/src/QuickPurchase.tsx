import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Lock, CheckCircle, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import PaymentValidator from './services/paymentValidation';
import SavedPaymentMethods from './SavedPaymentMethods';
import { useAuth } from './contexts/AuthContext';

interface QuickPurchaseProps {
  packageId: string;
  onBack: () => void;
}

const QuickPurchase: React.FC<QuickPurchaseProps> = ({ packageId, onBack }) => {
  const { user, updateCredits } = useAuth();
  const [step, setStep] = useState<'method' | 'card' | 'processing' | 'success'>('method');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    zip: ''
  });

  const packages = {
    starter: { name: 'Starter', credits: 100, price: 15, description: 'Perfect for getting started' },
    standard: { name: 'Professional', credits: 550, price: 40, description: 'Most popular choice' },
    premium: { name: 'Premium', credits: 1200, price: 70, description: 'For power users' },
    enterprise: { name: 'Enterprise', credits: 2500, price: 150, description: 'Maximum value' }
  };

  const selectedPackage = packages[packageId as keyof typeof packages];
  const finalPrice = selectedPackage.price - discount;

  const validateCoupon = async () => {
    if (!couponCode) return;
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          couponCode, 
          packagePrice: selectedPackage.price,
          packageId 
        })
      });
      
      const result = await response.json();
      if (result.isValid) {
        setDiscount(result.discountAmount);
        setError('');
      } else {
        setError('Invalid coupon code');
        setDiscount(0);
      }
    } catch (err) {
      setError('Failed to validate coupon');
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const detectCardType = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('34') || cleaned.startsWith('37')) return 'amex';
    if (cleaned.startsWith('6')) return 'discover';
    return '';
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Real payment validation
      const result = await PaymentValidator.processRealPayment(cardData, finalPrice);
      
      if (!result.success) {
        setError(result.error || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Add credits to user account
      await updateCredits(selectedPackage.credits);
      
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSavedCard = (card: any) => {
    setCardData({
      ...cardData,
      cardholderName: card.cardholderName,
      cardNumber: `****${card.lastFour}`,
      expiryMonth: card.expiryMonth.toString(),
      expiryYear: card.expiryYear.toString()
    });
    setStep('card');
  };

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedPackage.credits} credits have been added to your account
          </p>
          {discount > 0 && (
            <p className="text-green-600 font-semibold mt-2">
              You saved ${discount.toFixed(2)} with coupon code!
            </p>
          )}
        </div>
        <button
          onClick={() => window.location.href = '/credits'}
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          View Credits
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Purchase</h2>
      </div>

      {/* Package Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{selectedPackage.name}</h3>
          <div className="text-right">
            {discount > 0 && (
              <div className="text-sm text-gray-500 line-through">${selectedPackage.price}</div>
            )}
            <div className="text-lg font-bold text-emerald-600">${finalPrice.toFixed(2)}</div>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedPackage.credits} credits • {selectedPackage.description}
        </div>
      </div>

      {/* Coupon Code */}
      <div className="space-y-2">
        <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Coupon Code (Optional)
        </label>
        <div className="flex gap-2">
          <input
            id="coupon"
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={validateCoupon}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {step === 'method' && (
        <div className="space-y-4">
          <SavedPaymentMethods onSelectCard={handleUseSavedCard} />
          
          <div className="text-center">
            <button
              onClick={() => setStep('card')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Add New Card
            </button>
          </div>
        </div>
      )}

      {step === 'card' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Shield className="w-5 h-5 opacity-80" />
            </div>
            <div className="space-y-2">
              <div className="text-xs opacity-80">CARD NUMBER</div>
              <div className="font-mono text-lg tracking-wider">
                {cardData.cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-80">CARDHOLDER</div>
                  <div className="font-semibold">
                    {cardData.cardholderName || 'YOUR NAME'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80">EXPIRES</div>
                  <div>
                    {cardData.expiryMonth && cardData.expiryYear 
                      ? `${cardData.expiryMonth.padStart(2, '0')}/${cardData.expiryYear.slice(-2)}`
                      : 'MM/YY'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(cardData.cardNumber)}
                onChange={(e) => setCardData({...cardData, cardNumber: e.target.value.replace(/\s/g, '')})}
                maxLength={19}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cardholder Name
              </label>
              <input
                id="cardholderName"
                type="text"
                placeholder="John Doe"
                value={cardData.cardholderName}
                onChange={(e) => setCardData({...cardData, cardholderName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Month
                </label>
                <input
                  id="expiryMonth"
                  type="text"
                  placeholder="MM"
                  value={cardData.expiryMonth}
                  onChange={(e) => setCardData({...cardData, expiryMonth: e.target.value})}
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year
                </label>
                <input
                  id="expiryYear"
                  type="text"
                  placeholder="YYYY"
                  value={cardData.expiryYear}
                  onChange={(e) => setCardData({...cardData, expiryYear: e.target.value})}
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CVV
                </label>
                <input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code
              </label>
              <input
                id="zip"
                type="text"
                placeholder="12345"
                value={cardData.zip}
                onChange={(e) => setCardData({...cardData, zip: e.target.value})}
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep('method')}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={processPayment}
              disabled={isProcessing}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay ${finalPrice.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Shield className="w-4 h-4" />
        <span>Secured by 256-bit SSL encryption</span>
      </div>
    </div>
  );
};

export default QuickPurchase;