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
  
  // Length check
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

export function getCardType(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (cleanNumber.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
  
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