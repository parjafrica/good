export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  expiresAt?: Date;
  usageLimit?: number;
  usedCount: number;
  description: string;
  minPurchaseAmount?: number;
  applicablePackages?: string[];
}

export interface CouponValidationResult {
  isValid: boolean;
  discount: number;
  finalPrice: number;
  error?: string;
  coupon?: Coupon;
}

class CouponService {
  private coupons: Coupon[] = [
    {
      code: 'SAVE99',
      discountType: 'percentage',
      discountValue: 99,
      isActive: true,
      expiresAt: new Date('2025-12-31'),
      usageLimit: 100,
      usedCount: 0,
      description: '99% off all credit packages - Limited time!'
    },
    {
      code: 'WELCOME50',
      discountType: 'percentage',
      discountValue: 50,
      isActive: true,
      expiresAt: new Date('2025-12-31'),
      usageLimit: 1000,
      usedCount: 0,
      description: '50% off for new users'
    },
    {
      code: 'SAVE10',
      discountType: 'fixed',
      discountValue: 10,
      isActive: true,
      expiresAt: new Date('2025-12-31'),
      usageLimit: 500,
      usedCount: 0,
      description: '$10 off any purchase',
      minPurchaseAmount: 20
    },
    {
      code: 'STUDENT25',
      discountType: 'percentage',
      discountValue: 25,
      isActive: true,
      expiresAt: new Date('2025-12-31'),
      usageLimit: 200,
      usedCount: 0,
      description: '25% student discount',
      applicablePackages: ['starter', 'standard']
    },
    {
      code: 'ENTERPRISE20',
      discountType: 'percentage',
      discountValue: 20,
      isActive: true,
      expiresAt: new Date('2025-12-31'),
      usageLimit: 50,
      usedCount: 0,
      description: '20% enterprise discount',
      applicablePackages: ['professional', 'enterprise']
    }
  ];

  validateCoupon(couponCode: string, packagePrice: number, packageId: string): CouponValidationResult {
    const coupon = this.coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());

    if (!coupon) {
      return {
        isValid: false,
        discount: 0,
        finalPrice: packagePrice,
        error: 'Invalid coupon code'
      };
    }

    if (!coupon.isActive) {
      return {
        isValid: false,
        discount: 0,
        finalPrice: packagePrice,
        error: 'This coupon is no longer active'
      };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return {
        isValid: false,
        discount: 0,
        finalPrice: packagePrice,
        error: 'This coupon has expired'
      };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        discount: 0,
        finalPrice: packagePrice,
        error: 'This coupon has reached its usage limit'
      };
    }

    if (coupon.minPurchaseAmount && packagePrice < coupon.minPurchaseAmount) {
      return {
        isValid: false,
        discount: 0,
        finalPrice: packagePrice,
        error: `Minimum purchase amount of $${coupon.minPurchaseAmount} required`
      };
    }

    if (coupon.applicablePackages && !coupon.applicablePackages.includes(packageId)) {
      return {
        isValid: false,
        discount: 0,
        finalPrice: packagePrice,
        error: 'This coupon is not applicable to the selected package'
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (packagePrice * coupon.discountValue) / 100;
    } else {
      discount = Math.min(coupon.discountValue, packagePrice);
    }

    const finalPrice = Math.max(0.01, packagePrice - discount); // Minimum price of $0.01

    return {
      isValid: true,
      discount: discount,
      finalPrice: finalPrice,
      coupon: coupon
    };
  }

  applyCoupon(couponCode: string): boolean {
    const coupon = this.coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
    if (coupon) {
      coupon.usedCount++;
      return true;
    }
    return false;
  }

  formatDiscount(coupon: Coupon): string {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else {
      return `$${coupon.discountValue} OFF`;
    }
  }

  getActiveCoupons(): Coupon[] {
    return this.coupons.filter(c => 
      c.isActive && 
      (!c.expiresAt || new Date() <= c.expiresAt) &&
      (!c.usageLimit || c.usedCount < c.usageLimit)
    );
  }

  // Test function for the 99% discount
  testCoupon99(): CouponValidationResult {
    return this.validateCoupon('SAVE99', 100, 'standard');
  }
}

export const couponService = new CouponService();
export default couponService;