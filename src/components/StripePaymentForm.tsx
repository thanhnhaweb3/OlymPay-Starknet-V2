'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { createPaymentIntent, confirmPayment } from '@/utils/stripe'

interface StripePaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  onLoading: (loading: boolean) => void
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ amount, onSuccess, onError, onLoading }) => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Validate form
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      onError('Please fill in all card details')
      return
    }

    // Validate card number (basic check)
    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      onError('Please enter a valid card number')
      return
    }

    // Validate expiry date
    const [month, year] = expiryDate.split('/')
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      onError('Please enter expiry date in MM/YY format')
      return
    }

    // Validate CVV
    if (cvv.length < 3 || cvv.length > 4) {
      onError('Please enter a valid CVV')
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

      // Load Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      
      if (!stripe) {
        throw new Error('Failed to load Stripe')
      }

      // Confirm payment with card details
      const result = await confirmPayment(stripe, paymentIntent.id, {
        payment_method: {
          card: {
            number: cleanCardNumber,
            exp_month: parseInt(month),
            exp_year: parseInt('20' + year),
            cvc: cvv,
          },
          billing_details: {
            name: cardholderName,
          },
        },
      })

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed')
      }

      // Check if payment was successful
      if ('paymentIntent' in result && result.paymentIntent) {
        const paymentIntent = result.paymentIntent as any
        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent.id)
        } else {
          throw new Error('Payment was not successful')
        }
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
          <span className="label-text">Card Number</span>
        </label>
        <input
          type="text"
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(e) => {
            // Format card number with spaces
            const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
            setCardNumber(value)
          }}
          className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          maxLength={19}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Expiry Date</span>
          </label>
          <input
            type="text"
            placeholder="MM/YY"
            value={expiryDate}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '')
              if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4)
              }
              setExpiryDate(value)
            }}
            className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            maxLength={5}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">CVV</span>
          </label>
          <input
            type="text"
            placeholder="123"
            value={cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              setCvv(value)
            }}
            className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            maxLength={4}
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

export default StripePaymentForm
