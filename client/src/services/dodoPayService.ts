import DodoPayments from 'dodopayments';

export interface DodoPaymentRequest {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  productInfo: {
    name: string;
    description: string;
    quantity: number;
  };
}

export interface DodoPaymentResponse {
  payment_id: string;
  payment_url: string;
  status: string;
  amount: number;
  currency: string;
}

export interface DodoWebhookPayload {
  id: string;
  status: 'completed' | 'failed' | 'pending' | 'cancelled';
  payment_id: string;
  amount: number;
  currency: string;
  customer_email: string;
  created_at: string;
}

class DodoPayService {
  private client: any;
  
  constructor() {
    // Initialize DodoPay client - API key should be provided via environment variable
    this.client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode'
    });
  }

  async createPayment(paymentData: DodoPaymentRequest): Promise<DodoPaymentResponse> {
    try {
      const payment = await this.client.payments.create({
        payment_link: true,
        billing: {
          city: paymentData.billingAddress.city,
          country: this.getCountryCode(paymentData.billingAddress.country),
          state: paymentData.billingAddress.state,
          street: paymentData.billingAddress.street,
          zipcode: parseInt(paymentData.billingAddress.zipcode)
        },
        customer: {
          email: paymentData.customerEmail,
          name: paymentData.customerName
        },
        product_cart: [{
          product_id: this.generateProductId(paymentData.productInfo.name),
          quantity: paymentData.productInfo.quantity,
          price: paymentData.amount,
          currency: paymentData.currency,
          name: paymentData.productInfo.name,
          description: paymentData.productInfo.description
        }]
      });

      return {
        payment_id: payment.id,
        payment_url: payment.payment_url,
        status: payment.status,
        amount: paymentData.amount,
        currency: paymentData.currency
      };
    } catch (error) {
      console.error('DodoPay payment creation failed:', error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const payment = await this.client.payments.retrieve(paymentId);
      return payment.status;
    } catch (error) {
      console.error('DodoPay payment status check failed:', error);
      throw new Error(`Payment status check failed: ${error.message}`);
    }
  }

  verifyWebhookSignature(payload: string, signature: string, timestamp: string, webhookId: string): boolean {
    try {
      const crypto = require('crypto');
      const secret = process.env.DODO_WEBHOOK_SECRET;
      
      if (!secret) {
        console.error('DODO_WEBHOOK_SECRET not configured');
        return false;
      }

      const signaturePayload = `${webhookId}.${timestamp}.${payload}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signaturePayload)
        .digest('hex');
        
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  private getCountryCode(countryName: string): string {
    const countryMap: Record<string, string> = {
      'United States': 'US',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'Australia': 'AU',
      'Germany': 'DE',
      'France': 'FR',
      'Italy': 'IT',
      'Spain': 'ES',
      'Netherlands': 'NL',
      'Belgium': 'BE',
      'Switzerland': 'CH',
      'Austria': 'AT',
      'Denmark': 'DK',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Finland': 'FI',
      'Poland': 'PL',
      'Brazil': 'BR',
      'Mexico': 'MX',
      'Argentina': 'AR',
      'Chile': 'CL',
      'Colombia': 'CO',
      'Peru': 'PE',
      'Japan': 'JP',
      'South Korea': 'KR',
      'Singapore': 'SG',
      'Malaysia': 'MY',
      'Thailand': 'TH',
      'Indonesia': 'ID',
      'Philippines': 'PH',
      'Vietnam': 'VN',
      'India': 'IN',
      'China': 'CN',
      'Hong Kong': 'HK',
      'Taiwan': 'TW',
      'South Africa': 'ZA',
      'Nigeria': 'NG',
      'Kenya': 'KE',
      'Ghana': 'GH',
      'Uganda': 'UG',
      'Tanzania': 'TZ',
      'Rwanda': 'RW',
      'Zambia': 'ZM',
      'Zimbabwe': 'ZW',
      'Egypt': 'EG',
      'Morocco': 'MA',
      'Tunisia': 'TN',
      'Algeria': 'DZ',
      'Israel': 'IL',
      'Turkey': 'TR',
      'Russia': 'RU',
      'Ukraine': 'UA',
      'Czech Republic': 'CZ',
      'Hungary': 'HU',
      'Romania': 'RO',
      'Bulgaria': 'BG',
      'Croatia': 'HR',
      'Slovenia': 'SI',
      'Slovakia': 'SK',
      'Estonia': 'EE',
      'Latvia': 'LV',
      'Lithuania': 'LT'
    };

    return countryMap[countryName] || 'US'; // Default to US if country not found
  }

  private generateProductId(productName: string): string {
    return `credit_package_${productName.toLowerCase().replace(/\s+/g, '_')}`;
  }

  // Format amount for display (DodoPay expects cents)
  formatAmount(amount: number): number {
    return Math.round(amount * 100); // Convert dollars to cents
  }

  // Parse amount from DodoPay response (convert cents to dollars)
  parseAmount(amount: number): number {
    return amount / 100;
  }
}

export const dodoPayService = new DodoPayService();
export default dodoPayService;