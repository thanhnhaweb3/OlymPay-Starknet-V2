# Stripe Integration Setup Guide

## 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a new account or log in
3. Complete account verification

## 2. Get API Keys

### Test Mode (Development)
1. In Stripe Dashboard, make sure you're in **Test mode** (toggle in top-left)
2. Go to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Production Mode
1. Switch to **Live mode** in Stripe Dashboard
2. Get your live keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

## 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Stripe API Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Stripe Webhook Secret (for production)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Starknet Configuration
NEXT_PUBLIC_STARKNET_CHAIN=sepolia
```

## 4. Test Card Numbers

Use these test card numbers in development:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Visa - Success |
| `4000 0000 0000 0002` | Visa - Declined |
| `4000 0000 0000 9995` | Visa - Insufficient funds |
| `5555 5555 5555 4444` | Mastercard - Success |

**Test Details:**
- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

## 5. Webhook Setup (Production)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook secret to your environment variables

## 6. Smart Contract Integration

The integration works as follows:

1. **User fills form** → Card details + amount
2. **Stripe Payment** → Process payment with Stripe
3. **Smart Contract** → Transfer USDC to user's wallet
4. **Confirmation** → Show transaction hash

### Contract Function
```cairo
fn process_debit_card_deposit(
    ref self: ContractState,
    user_address: ContractAddress,
    amount: u256,
    stripe_payment_id: felt252
)
```

## 7. Security Notes

- ✅ Never commit API keys to version control
- ✅ Use test keys for development
- ✅ Validate webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement proper error handling

## 8. Testing

1. Start your development server: `npm run dev`
2. Go to `/debitcard` page
3. Connect your wallet
4. Fill in test card details
5. Test the payment flow

## 9. Production Deployment

1. Update environment variables with live keys
2. Set up webhook endpoint
3. Test with small amounts first
4. Monitor Stripe Dashboard for transactions

## 10. Troubleshooting

### Common Issues:

**"Stripe failed to initialize"**
- Check if `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify the key format (starts with `pk_test_` or `pk_live_`)

**"Payment failed"**
- Check if `STRIPE_SECRET_KEY` is set
- Verify the key format (starts with `sk_test_` or `sk_live_`)

**"Invalid signature" (Webhook)**
- Check if `STRIPE_WEBHOOK_SECRET` is correct
- Verify webhook URL is accessible

**Smart Contract Errors**
- Check if contract is deployed
- Verify user has sufficient gas
- Check contract balance

## 11. Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
