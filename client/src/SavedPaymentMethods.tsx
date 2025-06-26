import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, Star, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SavedCard {
  id: string;
  cardholderName: string;
  lastFour: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  billingZip: string;
}

interface SavedPaymentMethodsProps {
  onSelectCard?: (card: SavedCard) => void;
  onAddCard?: (cardData: any) => void;
}

const SavedPaymentMethods: React.FC<SavedPaymentMethodsProps> = ({ onSelectCard, onAddCard }) => {
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: '1',
      cardholderName: 'John Doe',
      lastFour: '4242',
      cardType: 'visa',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
      billingZip: '12345'
    }
  ]);
  
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingZip: ''
  });

  const getCardIcon = (type: string) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳'
    };
    return icons[type as keyof typeof icons] || '💳';
  };

  const getCardColor = (type: string) => {
    const colors = {
      visa: 'from-blue-500 to-blue-600',
      mastercard: 'from-red-500 to-red-600',
      amex: 'from-green-500 to-green-600',
      discover: 'from-orange-500 to-orange-600'
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const validateCard = (cardNumber: string) => {
    // Remove spaces and non-digits
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Basic length check
    if (cleaned.length < 13 || cleaned.length > 19) {
      return { isValid: false, error: 'Invalid card number length' };
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    const isValid = sum % 10 === 0;
    return { 
      isValid, 
      error: isValid ? null : 'Invalid card number',
      cardType: detectCardType(cleaned)
    };
  };

  const detectCardType = (cardNumber: string) => {
    if (cardNumber.startsWith('4')) return 'visa';
    if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) return 'mastercard';
    if (cardNumber.startsWith('34') || cardNumber.startsWith('37')) return 'amex';
    if (cardNumber.startsWith('6')) return 'discover';
    return 'unknown';
  };

  const handleAddCard = async () => {
    const validation = validateCard(newCard.cardNumber);
    
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    if (!newCard.cardholderName || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv) {
      alert('Please fill in all required fields');
      return;
    }

    // Ensure card type matches the SavedCard interface
    const validCardTypes = ['visa', 'mastercard', 'amex', 'discover'] as const;
    const cardType = validCardTypes.includes(validation.cardType as any) 
      ? validation.cardType as 'visa' | 'mastercard' | 'amex' | 'discover'
      : 'visa'; // Default fallback

    const cardData = {
      cardholderName: newCard.cardholderName,
      lastFour: newCard.cardNumber.slice(-4),
      cardType,
      expiryMonth: parseInt(newCard.expiryMonth),
      expiryYear: parseInt(newCard.expiryYear),
      billingZip: newCard.billingZip,
      encryptedCardNumber: btoa(newCard.cardNumber), // Basic encoding for demo
      isDefault: savedCards.length === 0
    };

    // Save to localStorage for persistence
    const stored = localStorage.getItem('savedPaymentMethods') || '[]';
    const existing = JSON.parse(stored);
    const newCardWithId = { ...cardData, id: Date.now().toString() };
    existing.push(newCardWithId);
    localStorage.setItem('savedPaymentMethods', JSON.stringify(existing));

    setSavedCards([...savedCards, newCardWithId]);
    setNewCard({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      billingZip: ''
    });
    setShowAddCard(false);

    if (onAddCard) {
      onAddCard(newCardWithId);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      const updated = savedCards.filter(card => card.id !== cardId);
      setSavedCards(updated);
      localStorage.setItem('savedPaymentMethods', JSON.stringify(updated));
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-500" />
          Saved Payment Methods
        </h3>
        <Button
          onClick={() => setShowAddCard(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </div>

      {/* Saved Cards */}
      <div className="grid gap-4">
        {savedCards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-4 rounded-xl bg-gradient-to-r ${getCardColor(card.cardType)} text-white cursor-pointer hover:scale-105 transition-transform`}
            onClick={() => onSelectCard?.(card)}
          >
            {card.isDefault && (
              <div className="absolute top-2 right-2">
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="text-2xl">{getCardIcon(card.cardType)}</div>
              <div className="text-right">
                <div className="text-sm opacity-80">**** **** **** {card.lastFour}</div>
                <div className="text-xs opacity-60">{card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <div className="font-semibold">{card.cardholderName}</div>
                <div className="text-xs opacity-80 capitalize">{card.cardType}</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCard(card.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add New Card Modal */}
      {showAddCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                Add Payment Method
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddCard(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(newCard.cardNumber)}
                  onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value.replace(/\s/g, '')})}
                  maxLength={19}
                />
              </div>

              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={newCard.cardholderName}
                  onChange={(e) => setNewCard({...newCard, cardholderName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="expiryMonth">Month</Label>
                  <Input
                    id="expiryMonth"
                    type="text"
                    placeholder="12"
                    value={newCard.expiryMonth}
                    onChange={(e) => setNewCard({...newCard, expiryMonth: e.target.value})}
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryYear">Year</Label>
                  <Input
                    id="expiryYear"
                    type="text"
                    placeholder="2027"
                    value={newCard.expiryYear}
                    onChange={(e) => setNewCard({...newCard, expiryYear: e.target.value})}
                    maxLength={4}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                    maxLength={4}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="billingZip">Billing ZIP Code</Label>
                <Input
                  id="billingZip"
                  type="text"
                  placeholder="12345"
                  value={newCard.billingZip}
                  onChange={(e) => setNewCard({...newCard, billingZip: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddCard(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleAddCard}
                >
                  Save Card
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {savedCards.length === 0 && !showAddCard && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No saved payment methods</p>
          <p className="text-sm">Add a card to get started</p>
        </div>
      )}
    </div>
  );
};

export default SavedPaymentMethods;