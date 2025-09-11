'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { createPaymentIntent } from '@/utils/stripe'

interface StripePaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  onLoading: (loading: boolean) => void
}

const PaymentForm: React.FC<StripePaymentFormProps> = ({ amount, onSuccess, onError, onLoading }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [cardholderName, setCardholderName] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe not loaded')
      return
    }

    if (!cardholderName) {
      onError('Please enter cardholder name')
      return
    }

    onLoading(true)

    try {
      // Create payment intent
      const paymentIntent = await createPaymentIntent({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          source: 'olympay_debit_card'
        }
      })
      
      if (!paymentIntent) {
        throw new Error('Failed to create payment intent')
      }

      // Get card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Confirm payment
      const result = await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
          },
        },
      })

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed')
      }

      // Check if payment was successful
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent.id)
      } else {
        throw new Error('Payment was not successful')
      }

    } catch (error) {
      console.error('Stripe payment error:', error)
      onError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      onLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Card Details</span>
        </label>
        <div className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Cardholder Name</span>
        </label>
        <input
          type="text"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>
      
      <button
        type="submit"
        className="btn btn-primary w-full"
      >
        Pay ${amount.toFixed(2)}
      </button>
    </form>
  )
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}

export default StripePaymentForm
