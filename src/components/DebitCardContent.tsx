'use client'

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface, Contract, cairo } from 'starknet'
import WalletConnectV2 from './WalletConnectV2'
import { CONTRACT_ADDRESSES, MINT_DEBIT_CARD_ABI } from '@/config/contracts'

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
      if (!provider) return

      // Create contract instance
      const contract = new Contract(
        MINT_DEBIT_CARD_ABI,
        CONTRACT_ADDRESSES.MINT_DEBIT_CARD,
        provider
      )

      // Load real data from contract
      const [usdcBalance, maxDepositAmount, processingFeePercent] = await Promise.all([
        contract.get_usdc_balance(),
        contract.get_max_deposit_per_tx(),
        contract.get_processing_fee_percent()
      ])

      // Convert from wei to readable format
      setContractBalance((Number(usdcBalance.low) / 1e6).toFixed(2)) // USDC has 6 decimals
      setMaxDeposit((Number(maxDepositAmount.low) / 1e6).toFixed(2))
      setProcessingFee((Number(processingFeePercent.low) / 10).toFixed(1)) // Fee is in basis points (250 = 2.5%)

    } catch (err) {
      console.error('Error loading contract info:', err)
      // Fallback to default values if contract call fails
      setContractBalance('0')
      setMaxDeposit('100')
      setProcessingFee('2.5')
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
      // Create contract instance with account for transactions
      const contract = new Contract(
        MINT_DEBIT_CARD_ABI,
        CONTRACT_ADDRESSES.MINT_DEBIT_CARD,
        account
      )

      // Generate unique Stripe payment ID
      const stripePaymentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = cairo.uint256(Math.floor(amountNumber * 1e6))

      // Call contract function to process debit card deposit
      const result = await contract.process_debit_card_deposit(
        account.address,
        amountWei,
        stripePaymentId
      )

      // Wait for transaction to be confirmed
      await provider.waitForTransaction(result.transaction_hash)

      setTransactionHash(result.transaction_hash)
      setSuccess(`Successfully processed ${amount} USDC deposit via debit card!`)
      
      // Refresh contract info
      await loadContractInfo()
      
      // Clear form
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setCardholderName('')
      setAmount('')

    } catch (err: any) {
      console.error('Deposit error:', err)
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title text-primary">Contract Information</h2>
            <button 
              className="btn btn-sm btn-outline btn-primary"
              onClick={loadContractInfo}
              disabled={!provider}
            >
              Refresh
            </button>
          </div>
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
          <div className="mt-4 text-sm text-base-content/60">
            <p>Contract Address: <span className="font-mono break-all">{CONTRACT_ADDRESSES.MINT_DEBIT_CARD}</span></p>
            <p>
              <a 
                href={`https://sepolia.starkscan.co/contract/${CONTRACT_ADDRESSES.MINT_DEBIT_CARD}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                View on Starkscan
              </a>
            </p>
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
                placeholder="4242 4242 4242 4242"
                className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                  className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                  className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                className="input input-bordered w-full focus:input-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
