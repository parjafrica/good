export interface CardValidation {
  isValid: boolean;
  cardType: string;
  error?: string;
}

export interface PaymentValidation {
  cardNumber: CardValidation;
  expiry: { isValid: boolean; error?: string };
  cvv: { isValid: boolean; error?: string };
  zip: { isValid: boolean; error?: string };
}

export class PaymentValidator {
  
  static validateCardNumber(cardNumber: string): CardValidation {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      return { isValid: false, cardType: 'unknown', error: 'Card number must be 13-19 digits' };
    }

    // Luhn algorithm validation
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
    const cardType = this.detectCardType(cleaned);
    
    // Additional real-world validation
    if (cleaned === '4111111111111111' || cleaned === '4242424242424242') {
      return { isValid: false, cardType, error: 'Test card numbers are not accepted' };
    }
    
    return { 
      isValid, 
      cardType,
      error: isValid ? undefined : 'Invalid card number'
    };
  }

  static detectCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    
    return 'unknown';
  }

  static validateExpiry(month: string, year: string): { isValid: boolean; error?: string } {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
      return { isValid: false, error: 'Invalid month' };
    }
    
    if (isNaN(expYear) || expYear < currentYear) {
      return { isValid: false, error: 'Card is expired' };
    }
    
    if (expYear === currentYear && expMonth < currentMonth) {
      return { isValid: false, error: 'Card is expired' };
    }
    
    if (expYear > currentYear + 20) {
      return { isValid: false, error: 'Invalid expiry year' };
    }
    
    return { isValid: true };
  }

  static validateCVV(cvv: string, cardType: string): { isValid: boolean; error?: string } {
    const cleaned = cvv.replace(/\D/g, '');
    
    if (cardType === 'amex') {
      if (cleaned.length !== 4) {
        return { isValid: false, error: 'American Express requires 4-digit CVV' };
      }
    } else {
      if (cleaned.length !== 3) {
        return { isValid: false, error: 'CVV must be 3 digits' };
      }
    }
    
    return { isValid: true };
  }

  static validateZip(zip: string): { isValid: boolean; error?: string } {
    const cleaned = zip.replace(/\D/g, '');
    
    if (cleaned.length !== 5) {
      return { isValid: false, error: 'ZIP code must be 5 digits' };
    }
    
    return { isValid: true };
  }

  static validateFullPayment(cardData: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    zip: string;
  }): PaymentValidation {
    const cardValidation = this.validateCardNumber(cardData.cardNumber);
    
    return {
      cardNumber: cardValidation,
      expiry: this.validateExpiry(cardData.expiryMonth, cardData.expiryYear),
      cvv: this.validateCVV(cardData.cvv, cardValidation.cardType),
      zip: this.validateZip(cardData.zip)
    };
  }

  static checkInsufficientFunds(amount: number): { hasIssue: boolean; message?: string } {
    // Simulate real-world scenarios where payments might fail
    if (amount > 10000) {
      return { 
        hasIssue: true, 
        message: 'Transaction amount exceeds daily limit. Please contact your bank.' 
      };
    }
    
    // Random failure simulation for demonstration (10% chance)
    if (Math.random() < 0.1) {
      return { 
        hasIssue: true, 
        message: 'Insufficient funds. Please check your account balance or try a different card.' 
      };
    }
    
    return { hasIssue: false };
  }

  static processRealPayment(cardData: any, amount: number): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    return new Promise((resolve) => {
      // Simulate processing time
      setTimeout(() => {
        const validation = this.validateFullPayment(cardData);
        
        // Check for validation errors
        if (!validation.cardNumber.isValid) {
          resolve({ success: false, error: validation.cardNumber.error });
          return;
        }
        
        if (!validation.expiry.isValid) {
          resolve({ success: false, error: validation.expiry.error });
          return;
        }
        
        if (!validation.cvv.isValid) {
          resolve({ success: false, error: validation.cvv.error });
          return;
        }
        
        if (!validation.zip.isValid) {
          resolve({ success: false, error: validation.zip.error });
          return;
        }
        
        // Check for insufficient funds
        const fundsCheck = this.checkInsufficientFunds(amount);
        if (fundsCheck.hasIssue) {
          resolve({ success: false, error: fundsCheck.message });
          return;
        }
        
        // Success case
        resolve({ 
          success: true, 
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
        });
      }, 2000); // 2 second processing time
    });
  }
}

export default PaymentValidator;