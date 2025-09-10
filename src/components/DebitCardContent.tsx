'use client'

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface } from 'starknet'
import WalletConnectV2 from './WalletConnectV2'
import { CONTRACT_ADDRESSES } from '@/config/contracts'

interface DebitCardContentProps {}

const DebitCardContent: React.FC<DebitCardContentProps> = () => {
  // Wallet connection states
  const [account, setAccount] = useState<AccountInterface | null>(null)
  const [provider, setProvider] = useState<ProviderInterface | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Form states
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Contract states
  const [contractBalance, setContractBalance] = useState<string>('0')
  const [maxDeposit, setMaxDeposit] = useState<string>('100')
  const [processingFee, setProcessingFee] = useState<string>('2.5')

  // Handle wallet connection
  const handleAccountChange = (newAccount: AccountInterface | null) => {
    setAccount(newAccount)
    if (!newAccount) {
      setProvider(null)
      setError(null)
      setSuccess(null)
      setTransactionHash(null)
    }
  }

  const handleProviderChange = (newProvider: ProviderInterface | null) => {
    setProvider(newProvider)
  }

  // Load contract information
  useEffect(() => {
    if (account && provider) {
      loadContractInfo()
    }
  }, [account, provider])

  const loadContractInfo = async () => {
    try {
      // In a real implementation, these would be loaded from the contract
      setContractBalance('1000000') // 1M USDC
      setMaxDeposit('100') // 100 USDC max per transaction
      setProcessingFee('2.5') // 2.5% processing fee
    } catch (err) {
      console.error('Error loading contract info:', err)
    }
  }

  // Handle debit card deposit
  const handleDebitCardDeposit = async () => {
    if (!account || !provider) {
      setError('Please connect your wallet first')
      return
    }

    if (!cardNumber || !expiryDate || !cvv || !cardholderName || !amount) {
      setError('Please fill in all required fields')
      return
    }

    const amountNumber = parseFloat(amount)
    if (amountNumber <= 0 || amountNumber > parseFloat(maxDeposit)) {
      setError(`Amount must be between 0.01 and ${maxDeposit} USDC`)
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      // Simulate Stripe API call
      const stripePaymentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // In a real implementation, this would:
      // 1. Call Stripe API to process the debit card payment
      // 2. Wait for Stripe webhook confirmation
      // 3. Call the mint_debit_card contract to process the deposit
      // 4. Transfer USDC to the user's wallet

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Simulate successful transaction
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`
      setTransactionHash(mockTransactionHash)
      setSuccess(`Successfully processed ${amount} USDC deposit via debit card!`)
      
      // Clear form
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setCardholderName('')
      setAmount('')

    } catch (err: any) {
      setError(err.message || 'Failed to process debit card deposit')
    } finally {
      setIsProcessing(false)
    }
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Debit Card Deposit
        </h1>
        <p className="text-lg text-base-content/70">
          Deposit USDC directly from your debit card with secure Stripe processing
        </p>
      </div>

      {/* Contract Information */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-primary">Contract Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat">
              <div className="stat-title">Contract Balance</div>
              <div className="stat-value text-primary">{contractBalance} USDC</div>
            </div>
            <div className="stat">
              <div className="stat-title">Max Deposit</div>
              <div className="stat-value text-secondary">{maxDeposit} USDC</div>
            </div>
            <div className="stat">
              <div className="stat-title">Processing Fee</div>
              <div className="stat-value text-accent">{processingFee}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallet Connection */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Wallet Connection</h2>
            <WalletConnectV2
              onAccountChange={handleAccountChange}
              onProviderChange={handleProviderChange}
            />
            {account && (
              <div className="mt-4 p-4 bg-success/10 rounded-lg">
                <p className="text-success font-medium">Wallet Connected</p>
                <p className="text-sm text-base-content/70 break-all">
                  {account.address}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Debit Card Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Debit Card Information</h2>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Card Number</span>
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="input input-bordered w-full"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Expiry Date</span>
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="input input-bordered w-full"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">CVV</span>
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="input input-bordered w-full"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Cardholder Name</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="input input-bordered w-full"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Amount (USDC)</span>
                <span className="label-text-alt">Max: {maxDeposit} USDC</span>
              </label>
              <input
                type="number"
                placeholder="10.00"
                className="input input-bordered w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                max={maxDeposit}
                step="0.01"
              />
            </div>

            {/* Processing Fee Display */}
            {amount && parseFloat(amount) > 0 && (
              <div className="alert alert-info">
                <div>
                  <div className="font-medium">Processing Fee: {processingFee}%</div>
                  <div className="text-sm">
                    Fee Amount: {(parseFloat(amount) * parseFloat(processingFee) / 100).toFixed(2)} USDC
                  </div>
                  <div className="text-sm">
                    You will receive: {(parseFloat(amount) - (parseFloat(amount) * parseFloat(processingFee) / 100)).toFixed(2)} USDC
                  </div>
                </div>
              </div>
            )}

            <button
              className={`btn btn-primary w-full mt-4 ${
                isProcessing ? 'loading' : ''
              }`}
              onClick={handleDebitCardDeposit}
              disabled={!account || isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName || !amount}
            >
              {isProcessing ? 'Processing...' : 'Process Debit Card Deposit'}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      {(error || success || transactionHash) && (
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title text-primary">Transaction Status</h2>
            
            {error && (
              <div className="alert alert-error">
                <div>
                  <div className="font-medium">Error</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <div>
                  <div className="font-medium">Success</div>
                  <div className="text-sm">{success}</div>
                </div>
              </div>
            )}

            {transactionHash && (
              <div className="alert alert-info">
                <div>
                  <div className="font-medium">Transaction Hash</div>
                  <div className="text-sm break-all">{transactionHash}</div>
                  <div className="text-sm mt-2">
                    <a
                      href={`https://sepolia.starkscan.co/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      View on Starkscan
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title text-primary">Security Notice</h2>
          <div className="space-y-2">
            <p className="text-sm">
              • All debit card transactions are processed securely through Stripe
            </p>
            <p className="text-sm">
              • Your card information is encrypted and never stored on our servers
            </p>
            <p className="text-sm">
              • USDC will be transferred to your connected wallet after successful processing
            </p>
            <p className="text-sm">
              • Processing fees are clearly displayed before confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebitCardContent
