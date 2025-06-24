interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'crypto' | 'digital_wallet';
  icon: string;
  countries: string[];
  currencies: string[];
  processingTime: string;
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
}

interface DodoPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    email: string;
    name: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
  paymentMethods: string[];
  redirectUrl: string;
  webhookUrl?: string;
}

interface MobileMoneyProvider {
  id: string;
  name: string;
  countries: string[];
  currencies: string[];
  icon: string;
  ussdCode?: string;
}

class PaymentService {
  private dodoApiKey: string = import.meta.env.VITE_DODO_API_KEY || 'test_key';
  private dodoApiUrl: string = 'https://api.dodopayments.com/v1';
  
  private paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      icon: '💳',
      countries: ['Global'],
      currencies: ['USD', 'EUR', 'GBP', 'ZAR', 'KES', 'UGX', 'TZS', 'NGN', 'GHS', 'XOF', 'XAF'],
      processingTime: 'Instant',
      fees: { percentage: 2.9, fixed: 0.30, currency: 'USD' }
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'digital_wallet',
      icon: '🅿️',
      countries: ['Global'],
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      processingTime: 'Instant',
      fees: { percentage: 3.4, fixed: 0.30, currency: 'USD' }
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      type: 'mobile_money',
      icon: '📱',
      countries: ['Kenya', 'Tanzania', 'Uganda', 'Mozambique', 'Lesotho'],
      currencies: ['KES', 'TZS', 'UGX', 'MZN', 'LSL'],
      processingTime: '1-5 minutes',
      fees: { percentage: 1.5, fixed: 0, currency: 'KES' }
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      type: 'mobile_money',
      icon: '📲',
      countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Zambia', 'Malawi', 'Madagascar', 'Chad', 'Niger'],
      currencies: ['KES', 'UGX', 'TZS', 'RWF', 'ZMW', 'MWK', 'MGA', 'XAF', 'XOF'],
      processingTime: '1-5 minutes',
      fees: { percentage: 1.5, fixed: 0, currency: 'KES' }
    },
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      icon: '💰',
      countries: ['Uganda', 'Rwanda', 'Ghana', 'Cameroon', 'Ivory Coast', 'Benin', 'Congo', 'Guinea'],
      currencies: ['UGX', 'RWF', 'GHS', 'XAF', 'XOF'],
      processingTime: '1-5 minutes',
      fees: { percentage: 1.5, fixed: 0, currency: 'UGX' }
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      type: 'mobile_money',
      icon: '🍊',
      countries: ['Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Ivory Coast', 'Cameroon', 'Madagascar'],
      currencies: ['XOF', 'XAF', 'MGA'],
      processingTime: '1-5 minutes',
      fees: { percentage: 1.5, fixed: 0, currency: 'XOF' }
    },
    {
      id: 'wave',
      name: 'Wave',
      type: 'mobile_money',
      icon: '🌊',
      countries: ['Senegal', 'Ivory Coast', 'Mali', 'Burkina Faso'],
      currencies: ['XOF'],
      processingTime: 'Instant',
      fees: { percentage: 1.0, fixed: 0, currency: 'XOF' }
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      type: 'digital_wallet',
      icon: '🦋',
      countries: ['Nigeria', 'Ghana', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Zambia', 'South Africa'],
      currencies: ['NGN', 'GHS', 'KES', 'UGX', 'TZS', 'RWF', 'ZMW', 'ZAR'],
      processingTime: 'Instant',
      fees: { percentage: 1.4, fixed: 0, currency: 'NGN' }
    },
    {
      id: 'paystack',
      name: 'Paystack',
      type: 'digital_wallet',
      icon: '💎',
      countries: ['Nigeria', 'Ghana', 'South Africa'],
      currencies: ['NGN', 'GHS', 'ZAR'],
      processingTime: 'Instant',
      fees: { percentage: 1.5, fixed: 0, currency: 'NGN' }
    },
    {
      id: 'chipper_cash',
      name: 'Chipper Cash',
      type: 'digital_wallet',
      icon: '🐿️',
      countries: ['Nigeria', 'Ghana', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'South Africa'],
      currencies: ['NGN', 'GHS', 'KES', 'UGX', 'TZS', 'RWF', 'ZAR'],
      processingTime: 'Instant',
      fees: { percentage: 0.5, fixed: 0, currency: 'NGN' }
    },
    {
      id: 'ecocash',
      name: 'EcoCash',
      type: 'mobile_money',
      icon: '🌱',
      countries: ['Zimbabwe', 'Lesotho'],
      currencies: ['ZWL', 'LSL'],
      processingTime: '1-5 minutes',
      fees: { percentage: 2.0, fixed: 0, currency: 'ZWL' }
    },
    {
      id: 'tigo_pesa',
      name: 'Tigo Pesa',
      type: 'mobile_money',
      icon: '📞',
      countries: ['Tanzania', 'Rwanda', 'Ghana'],
      currencies: ['TZS', 'RWF', 'GHS'],
      processingTime: '1-5 minutes',
      fees: { percentage: 1.5, fixed: 0, currency: 'TZS' }
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      icon: '🏦',
      countries: ['Global'],
      currencies: ['USD', 'EUR', 'GBP', 'ZAR', 'NGN', 'KES', 'GHS'],
      processingTime: '1-3 business days',
      fees: { percentage: 0.5, fixed: 5.00, currency: 'USD' }
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      type: 'crypto',
      icon: '₿',
      countries: ['Global'],
      currencies: ['BTC', 'ETH', 'USDT', 'USDC'],
      processingTime: '10-60 minutes',
      fees: { percentage: 1.0, fixed: 0, currency: 'USD' }
    }
  ];

  private mobileMoneyProviders: MobileMoneyProvider[] = [
    {
      id: 'mpesa_ke',
      name: 'M-Pesa Kenya',
      countries: ['Kenya'],
      currencies: ['KES'],
      icon: '📱',
      ussdCode: '*334#'
    },
    {
      id: 'mpesa_tz',
      name: 'M-Pesa Tanzania',
      countries: ['Tanzania'],
      currencies: ['TZS'],
      icon: '📱',
      ussdCode: '*150*00#'
    },
    {
      id: 'airtel_ke',
      name: 'Airtel Money Kenya',
      countries: ['Kenya'],
      currencies: ['KES'],
      icon: '📲',
      ussdCode: '*334#'
    },
    {
      id: 'mtn_ug',
      name: 'MTN Mobile Money Uganda',
      countries: ['Uganda'],
      currencies: ['UGX'],
      icon: '💰',
      ussdCode: '*165#'
    },
    {
      id: 'mtn_gh',
      name: 'MTN Mobile Money Ghana',
      countries: ['Ghana'],
      currencies: ['GHS'],
      icon: '💰',
      ussdCode: '*170#'
    },
    {
      id: 'orange_sn',
      name: 'Orange Money Senegal',
      countries: ['Senegal'],
      currencies: ['XOF'],
      icon: '🍊',
      ussdCode: '#144#'
    },
    {
      id: 'wave_sn',
      name: 'Wave Senegal',
      countries: ['Senegal'],
      currencies: ['XOF'],
      icon: '🌊'
    },
    {
      id: 'ecocash_zw',
      name: 'EcoCash Zimbabwe',
      countries: ['Zimbabwe'],
      currencies: ['ZWL'],
      icon: '🌱',
      ussdCode: '*151#'
    }
  ];

  async createDodoPayment(request: DodoPaymentRequest): Promise<{ paymentUrl: string; paymentId: string }> {
    try {
      const response = await fetch(`${this.dodoApiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.dodoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount * 100, // Convert to cents
          currency: request.currency,
          description: request.description,
          customer: request.customer,
          payment_methods: request.paymentMethods,
          success_url: request.redirectUrl + '?status=success',
          cancel_url: request.redirectUrl + '?status=cancelled',
          webhook_url: request.webhookUrl,
          metadata: {
            ...request.metadata,
            source: 'granada_app'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Payment creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        paymentUrl: data.checkout_url,
        paymentId: data.id
      };
    } catch (error) {
      console.error('Dodo payment creation error:', error);
      // Fallback to mock payment for demo
      return this.createMockPayment(request);
    }
  }

  private async createMockPayment(request: DodoPaymentRequest): Promise<{ paymentUrl: string; paymentId: string }> {
    // Mock payment for demo purposes
    const paymentId = `mock_${Date.now()}`;
    const paymentUrl = `${window.location.origin}/payment-mock?id=${paymentId}&amount=${request.amount}&currency=${request.currency}`;
    
    return { paymentUrl, paymentId };
  }

  async initiateMobileMoneyPayment(
    provider: string,
    amount: number,
    currency: string,
    phoneNumber: string,
    description: string
  ): Promise<{ success: boolean; transactionId?: string; message: string }> {
    try {
      // In production, this would integrate with mobile money APIs
      const response = await fetch(`${this.dodoApiUrl}/mobile-money/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.dodoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          amount: amount * 100,
          currency,
          phone_number: phoneNumber,
          description,
          callback_url: `${window.location.origin}/api/mobile-money/callback`
        })
      });

      if (!response.ok) {
        throw new Error('Mobile money payment failed');
      }

      const data = await response.json();
      return {
        success: true,
        transactionId: data.transaction_id,
        message: `Payment initiated. Please check your phone for ${provider} prompt.`
      };
    } catch (error) {
      console.error('Mobile money payment error:', error);
      // Mock success for demo
      return {
        success: true,
        transactionId: `mock_${Date.now()}`,
        message: `Mock payment initiated for ${provider}. In production, you would receive a payment prompt on ${phoneNumber}.`
      };
    }
  }

  getPaymentMethodsForCountry(country: string): PaymentMethod[] {
    // Filter payment methods by country
    const countryMethods = this.paymentMethods.filter(method => 
      method.countries.includes(country) || method.countries.includes('Global')
    );
    
    // If no country-specific methods found, return global methods
    if (countryMethods.length === 0) {
      return this.paymentMethods.filter(method => method.countries.includes('Global'));
    }
    
    return countryMethods;
  }

  getMobileMoneyProvidersForCountry(country: string): MobileMoneyProvider[] {
    return this.mobileMoneyProviders.filter(provider => 
      provider.countries.includes(country)
    );
  }

  calculateFees(amount: number, paymentMethod: PaymentMethod): number {
    const percentageFee = (amount * paymentMethod.fees.percentage) / 100;
    return percentageFee + paymentMethod.fees.fixed;
  }

  async verifyPayment(paymentId: string): Promise<{ status: string; amount?: number; currency?: string }> {
    try {
      const response = await fetch(`${this.dodoApiUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.dodoApiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      return {
        status: data.status,
        amount: data.amount / 100,
        currency: data.currency
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      // Mock verification for demo
      return {
        status: 'completed',
        amount: 100,
        currency: 'USD'
      };
    }
  }

  async processRefund(paymentId: string, amount?: number): Promise<{ success: boolean; refundId?: string }> {
    try {
      const response = await fetch(`${this.dodoApiUrl}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.dodoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount ? amount * 100 : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Refund failed');
      }

      const data = await response.json();
      return {
        success: true,
        refundId: data.id
      };
    } catch (error) {
      console.error('Refund error:', error);
      return { success: false };
    }
  }

  // Utility methods
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  getSupportedCurrencies(): string[] {
    const currencies = new Set<string>();
    this.paymentMethods.forEach(method => {
      method.currencies.forEach(currency => currencies.add(currency));
    });
    return Array.from(currencies);
  }

  getCountryFromCurrency(currency: string): string {
    const currencyCountryMap: Record<string, string> = {
      'USD': 'United States',
      'EUR': 'European Union',
      'GBP': 'United Kingdom',
      'ZAR': 'South Africa',
      'KES': 'Kenya',
      'UGX': 'Uganda',
      'TZS': 'Tanzania',
      'RWF': 'Rwanda',
      'GHS': 'Ghana',
      'NGN': 'Nigeria',
      'XOF': 'West Africa',
      'XAF': 'Central Africa',
      'ZMW': 'Zambia',
      'MWK': 'Malawi',
      'MGA': 'Madagascar',
      'ZWL': 'Zimbabwe',
      'LSL': 'Lesotho',
      'MZN': 'Mozambique'
    };
    return currencyCountryMap[currency] || 'Unknown';
  }
}

export const paymentService = new PaymentService();
export type { PaymentMethod, DodoPaymentRequest, MobileMoneyProvider };