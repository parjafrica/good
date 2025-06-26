# DodoPay Integration Setup

## API Key Configuration

### Environment Variables Required:
Add these to your Replit Secrets:

```bash
DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_WEBHOOK_SECRET=your_webhook_secret_here
```

### Getting Your API Keys:

1. **Sign up/Login**: Visit https://app.dodopayments.com
2. **Get API Key**: Go to Settings → API Keys
3. **Get Webhook Secret**: Go to Webhooks → Create webhook endpoint

## Webhook Configuration

### Webhook URL for Your App:
```
https://your-replit-app-name.replit.dev/api/payments/webhook/dodo
```

### DodoPay Dashboard Settings:

1. **Login to DodoPay Dashboard**: https://app.dodopayments.com
2. **Navigate to Webhooks**: Settings → Webhooks
3. **Add New Webhook Endpoint**:
   - URL: `https://your-replit-app-name.replit.dev/api/payments/webhook/dodo`
   - Events to listen for:
     - `payment.completed`
     - `payment.failed`
     - `payment.cancelled`
4. **Save Webhook Secret**: Copy the generated secret to DODO_WEBHOOK_SECRET

## Test Configuration

### Test Mode Setup:
- Environment: `test_mode` (automatically set for development)
- Use test API keys for development
- Switch to `live_mode` for production

### Test Coupon Codes Available:
- `SAVE99` - 99% discount (for testing)
- `WELCOME50` - 50% discount
- `SAVE10` - $10 off (minimum $20 purchase)
- `STUDENT25` - 25% student discount
- `ENTERPRISE20` - 20% enterprise discount

## Integration Endpoints

### Payment Creation:
```
POST /api/payments/dodo/create
```

### Webhook Handler:
```
POST /api/payments/webhook/dodo
```

### Coupon Validation:
```
POST /api/coupons/validate
```

## Payment Flow:

1. User fills credit card form
2. System creates DodoPay payment with coupon (if applied)
3. User redirected to DodoPay checkout
4. Payment completion triggers webhook
5. Credits automatically added to user account

## Security:

- All webhook payloads verified with HMAC SHA256
- API keys stored securely in environment variables
- HTTPS required for webhook endpoints