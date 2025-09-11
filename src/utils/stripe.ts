import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      throw new Error('Stripe publishable key is not set')
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

export interface PaymentIntentData {
  amount: number
  currency?: string
  metadata?: Record<string, string>
}

export const createPaymentIntent = async (data: PaymentIntentData) => {
  const response = await fetch('/api/stripe/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create payment intent')
  }

  return response.json()
}

export const confirmPayment = async (
  stripe: Stripe,
  clientSecret: string,
  paymentMethodData?: any
) => {
  const result = await stripe.confirmPayment({
    clientSecret,
    confirmParams: {
      payment_method_data: paymentMethodData,
      return_url: `${window.location.origin}/debitcard?payment=success`,
    },
  })

  if (result.error) {
    throw new Error(result.error.message || 'Payment confirmation failed')
  }

  // Return the result object which contains paymentIntent when successful
  return result
}
