// Real-time credit card validation service using DodoPay integration
import { apiRequest } from '@/lib/queryClient';

export interface CardData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface PaymentResult {
  success: boolean;
  transaction?: {
    id: string;
    amount: number;
    originalAmount: number;
    discount: number;
    status: string;
    cardLast4: string;
    cardType: string;
    timestamp: string;
    packageId: string;
    couponCode?: string;
    realTimeValidation?: boolean;
    processorName?: string;
  };
  error?: string;
  validationFailed?: boolean;
  details?: any;
}

export async function processRealTimePayment(
  cardData: CardData,
  amount: number,
  packageId: string,
  couponCode?: string
): Promise<PaymentResult> {
  try {
    const response = await fetch('/api/payments/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardData,
        amount,
        packageId,
        couponCode
      })
    });

    const result = await response.json();
    return result as PaymentResult;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment processing failed',
      validationFailed: true
    };
  }
}

export function validateCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }
  
  // Length check based on card type
  const cardType = getCardType(cleanNumber);
  if (cardType === 'amex' && cleanNumber.length !== 15) return false;
  if ((cardType === 'visa' || cardType === 'mastercard' || cardType === 'discover') && cleanNumber.length !== 16) return false;
  if (cardType === 'unknown' && (cleanNumber.length < 13 || cleanNumber.length > 19)) return false;
  
  // Luhn algorithm (corrected implementation)
  let sum = 0;
  let shouldDouble = false;
  
  // Process digits from right to left
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

export function getCardType(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Visa: starts with 4
  if (/^4/.test(cleanNumber)) return 'visa';
  
  // Mastercard: 5[1-5] or 2[2-7]
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'mastercard';
  
  // American Express: 34 or 37
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  
  // Discover: 6011, 622126-622925, 644-649, 65
  if (/^6(?:011|5[0-9]{2}|4[4-9][0-9]|22(?:1(?:2[6-9]|[3-9][0-9])|[2-8][0-9]{2}|9(?:[01][0-9]|2[0-5])))/.test(cleanNumber)) {
    return 'discover';
  }
  
  // Diners Club: 30[0-5], 36, 38
  if (/^3(?:0[0-5]|[68])/.test(cleanNumber)) return 'diners';
  
  // JCB: 35
  if (/^35/.test(cleanNumber)) return 'jcb';
  
  return 'unknown';
}

export function formatCardNumber(value: string): string {
  const cleanValue = value.replace(/\s/g, '');
  const formatted = cleanValue.replace(/(.{4})/g, '$1 ').trim();
  return formatted;
}

export function validateExpiryDate(month: string, year: string): boolean {
  const currentDate = new Date();
  const expiryDate = new Date(parseInt(year), parseInt(month) - 1);
  return expiryDate > currentDate;
}

export function validateCVV(cvv: string, cardType: string): boolean {
  if (cardType === 'amex') {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
}