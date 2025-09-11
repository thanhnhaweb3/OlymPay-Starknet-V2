'use client'

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface, Contract, cairo } from 'starknet'
import WalletConnectV2 from './WalletConnectV2'
import { CONTRACT_ADDRESSES, MINT_DEBIT_CARD_ABI, USDC_ABI, TOKEN_CONFIG } from '@/config/contracts'
import { SwapRouter } from '@/utils/swapRouter'
import { formatBalanceWithDecimals } from '@/utils/serialization'
import { getStripe, createPaymentIntent, confirmPayment } from '@/utils/stripe'
import StripePaymentForm from './StripePaymentForm'

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
  
  // Stripe states
  const [isStripeLoading, setIsStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [showStripeForm, setShowStripeForm] = useState(false)

  // Contract states
  const [contractBalance, setContractBalance] = useState<string>('0')
  const [maxDeposit, setMaxDeposit] = useState<string>('100')
  const [processingFee, setProcessingFee] = useState<string>('2.5')
  
  // Token balance states
  const [userUsdcBalance, setUserUsdcBalance] = useState<string>('0')
  const [userStrkBalance, setUserStrkBalance] = useState<string>('0')
  const [userEthBalance, setUserEthBalance] = useState<string>('0')
  const [swapRouter, setSwapRouter] = useState<SwapRouter | null>(null)
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)

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

  // Initialize SwapRouter and load data when account and provider are available
  useEffect(() => {
    if (account && provider) {
      const router = new SwapRouter(account, provider)
      setSwapRouter(router)
      loadContractInfo()
      loadUserBalances(router)
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

      console.log('Loading contract info from:', CONTRACT_ADDRESSES.MINT_DEBIT_CARD)

      // Load real data from contract
      const [usdcBalance, maxDepositAmount, processingFeePercent] = await Promise.all([
        contract.get_usdc_balance(),
        contract.get_max_deposit_per_tx(),
        contract.get_processing_fee_percent()
      ])

      console.log('Contract data received:', {
        usdcBalance,
        maxDepositAmount,
        processingFeePercent
      })

      // Helper function to convert Uint256 to number
      const uint256ToNumber = (uint256: any) => {
        if (!uint256) return 0
        
        console.log('Converting uint256:', uint256)
        
        // Handle both object and array formats
        if (typeof uint256 === 'object') {
          if (uint256.low !== undefined && uint256.high !== undefined) {
            // Object format: {low: string, high: string}
            const low = BigInt(uint256.low || '0')
            const high = BigInt(uint256.high || '0')
            const result = low + (high << BigInt(128))
            console.log('Object format result:', result.toString())
            return Number(result)
          } else if (Array.isArray(uint256)) {
            // Array format: [low, high]
            const low = BigInt(uint256[0] || '0')
            const high = BigInt(uint256[1] || '0')
            const result = low + (high << BigInt(128))
            console.log('Array format result:', result.toString())
            return Number(result)
          }
        }
        
        // Direct number or string
        const result = Number(uint256 || 0)
        console.log('Direct format result:', result)
        return result
      }

      // Convert from wei to readable format
      const usdcBalanceNumber = uint256ToNumber(usdcBalance)
      const maxDepositNumber = uint256ToNumber(maxDepositAmount)
      const processingFeeNumber = uint256ToNumber(processingFeePercent)

      console.log('Converted numbers:', {
        usdcBalanceNumber,
        maxDepositNumber,
        processingFeeNumber
      })

      // Convert from wei to readable format
      // USDC balance: already in wei (6 decimals)
      setContractBalance((usdcBalanceNumber / 1e6).toFixed(2))
      
      // Max deposit: check if it's in wei or already in USDC units
      if (maxDepositNumber > 1e12) {
        // It's in wei, convert to USDC
        setMaxDeposit((maxDepositNumber / 1e6).toFixed(2))
      } else {
        // It's already in USDC units
        setMaxDeposit(maxDepositNumber.toFixed(2))
      }
      
      // Processing fee: check if it's in basis points or percentage
      if (processingFeeNumber > 100) {
        // It's in basis points (e.g., 250 = 2.5%)
        setProcessingFee((processingFeeNumber / 100).toFixed(1))
      } else {
        // It's already in percentage
        setProcessingFee(processingFeeNumber.toFixed(1))
      }

    } catch (err) {
      console.error('Error loading contract info:', err)
      // Fallback to default values if contract call fails
      setContractBalance('0')
      setMaxDeposit('100')
      setProcessingFee('2.5')
    }
  }

  // Load user token balances
  const loadUserBalances = async (router?: SwapRouter) => {
    const routerToUse = router || swapRouter
    if (!routerToUse || !account) return

    setIsLoadingBalances(true)
    try {
      // Load USDC balance
      try {
        const usdcBalance = await routerToUse.getTokenBalance(
          CONTRACT_ADDRESSES.USDC,
          account.address
        )
        setUserUsdcBalance(formatBalanceWithDecimals(usdcBalance, TOKEN_CONFIG.USDC.decimals))
      } catch (error) {
        console.error('Error loading USDC balance:', error)
        setUserUsdcBalance('0')
      }

      // Load STRK balance
      try {
        const strkBalance = await routerToUse.getTokenBalance(
          CONTRACT_ADDRESSES.STRK,
          account.address
        )
        setUserStrkBalance(formatBalanceWithDecimals(strkBalance, TOKEN_CONFIG.STRK.decimals))
      } catch (error) {
        console.error('Error loading STRK balance:', error)
        setUserStrkBalance('0')
      }

      // Skip ETH balance for now as contract doesn't exist on Sepolia
      setUserEthBalance('0')

    } catch (error) {
      console.error('Error loading user balances:', error)
      setUserUsdcBalance('0')
      setUserStrkBalance('0')
      setUserEthBalance('0')
    } finally {
      setIsLoadingBalances(false)
    }
  }

  // Handle Stripe payment
  const handleStripePayment = async () => {
    if (!account) {
      setError('Please connect your wallet first')
      return
    }

    const amountNumber = parseFloat(amount)
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amountNumber > parseFloat(maxDeposit)) {
      setError(`Amount cannot exceed ${maxDeposit} USDC`)
      return
    }

    setIsStripeLoading(true)
    setStripeError(null)
    setError(null)

    try {
      // Create payment intent
      const { clientSecret, paymentIntentId } = await createPaymentIntent({
        amount: amountNumber,
        currency: 'usd',
        metadata: {
          user_address: account.address,
          wallet_type: 'starknet',
          amount_usdc: amountNumber.toString(),
        },
      })

      // Initialize Stripe
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe failed to initialize')
      }

      // For testing, we'll simulate a successful payment
      // In production, you should use proper Stripe Elements integration
      setSuccess(`Payment successful! Processing ${amountNumber} USDC deposit...`)
      
      // Simulate payment success and call smart contract
      await handleSmartContractDeposit(paymentIntentId)

    } catch (error) {
      console.error('Stripe payment error:', error)
      setStripeError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsStripeLoading(false)
    }
  }

  // Handle smart contract deposit after successful Stripe payment
  const handleSmartContractDeposit = async (stripePaymentId: string) => {
    if (!account || !provider) {
      setError('Wallet not connected')
      return
    }

    const amountNumber = parseFloat(amount)
    setIsProcessing(true)
    setError(null)

    try {
      // Create contract instance
      const contract = new Contract(
        MINT_DEBIT_CARD_ABI,
        CONTRACT_ADDRESSES.MINT_DEBIT_CARD,
        provider
      )

      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = BigInt(Math.floor(amountNumber * 1e6))
      const amountUint256 = {
        low: (amountWei & BigInt('0xffffffffffffffffffffffffffffffff')).toString(),
        high: (amountWei >> BigInt(128)).toString()
      }

      // Call contract function to process debit card deposit
      const result = await contract.process_debit_card_deposit(
        account.address,
        amountUint256,
        stripePaymentId
      )

      // Wait for transaction to be confirmed
      await provider.waitForTransaction(result.transaction_hash)

      setTransactionHash(result.transaction_hash)
      setSuccess(`Successfully deposited ${amountNumber} USDC via debit card!`)

      // Clear form
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setCardholderName('')
      setAmount('')

      // Refresh contract info and user balances
      await loadContractInfo()
      await loadUserBalances()

    } catch (error) {
      console.error('Smart contract error:', error)
      setError(error instanceof Error ? error.message : 'Transaction failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Stripe payment success
  const handleStripeSuccess = async (paymentIntentId: string) => {
    setSuccess(`Payment successful! Processing ${amount} USDC deposit...`)
    await handleSmartContractDeposit(paymentIntentId)
  }

  // Handle Stripe payment error
  const handleStripeError = (error: string) => {
    setStripeError(error)
  }

  // Handle Stripe loading state
  const handleStripeLoading = (loading: boolean) => {
    setIsStripeLoading(loading)
  }

  // Function to set USDC token address in contract
  const setUSDCAddress = async () => {
    if (!account || !provider) {
      setError('Please connect your wallet first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create contract instance
      const contract = new Contract(
        MINT_DEBIT_CARD_ABI,
        CONTRACT_ADDRESSES.MINT_DEBIT_CARD,
        provider
      )

      console.log('Setting USDC address:', CONTRACT_ADDRESSES.USDC)

      // Set USDC token address
      const result = await contract.set_usdc_token(CONTRACT_ADDRESSES.USDC)

      // Wait for transaction to be confirmed
      await provider.waitForTransaction(result.transaction_hash)

      setTransactionHash(result.transaction_hash)
      setSuccess('Successfully set USDC token address!')

      // Refresh contract info
      await loadContractInfo()

    } catch (error) {
      console.error('Error setting USDC address:', error)
      setError(error instanceof Error ? error.message : 'Failed to set USDC address')
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to withdraw USDC from contract
  const withdrawUSDC = async (amount: number) => {
    if (!account || !provider) {
      setError('Please connect your wallet first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create contract instance
      const contract = new Contract(
        MINT_DEBIT_CARD_ABI,
        CONTRACT_ADDRESSES.MINT_DEBIT_CARD,
        provider
      )

      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = BigInt(amount * 1e6)
      const amountUint256 = {
        low: (amountWei & BigInt('0xffffffffffffffffffffffffffffffff')).toString(),
        high: (amountWei >> BigInt(128)).toString()
      }

      console.log('Withdrawing USDC from contract:', {
        amount: amount,
        amountWei: amountWei.toString(),
        amountUint256
      })

      // Call withdraw function
      const result = await contract.withdraw_usdc(amountUint256)

      // Wait for transaction to be confirmed
      await provider.waitForTransaction(result.transaction_hash)

      setTransactionHash(result.transaction_hash)
      setSuccess(`Successfully withdrew ${amount} USDC from contract!`)

      // Refresh contract info
      await loadContractInfo()

    } catch (error) {
      console.error('Error withdrawing USDC:', error)
      setError(error instanceof Error ? error.message : 'Failed to withdraw USDC')
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to withdraw all USDC from contract
  const withdrawAllUSDC = async () => {
    if (!account || !provider) {
      setError('Please connect your wallet first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create contract instance
      const contract = new Contract(
        MINT_DEBIT_CARD_ABI,
        CONTRACT_ADDRESSES.MINT_DEBIT_CARD,
        provider
      )

      console.log('Withdrawing all USDC from contract')

      // Call withdraw_all function
      const result = await contract.withdraw_all_usdc()

      // Wait for transaction to be confirmed
      await provider.waitForTransaction(result.transaction_hash)

      setTransactionHash(result.transaction_hash)
      setSuccess('Successfully withdrew all USDC from contract!')

      // Refresh contract info
      await loadContractInfo()

    } catch (error) {
      console.error('Error withdrawing all USDC:', error)
      setError(error instanceof Error ? error.message : 'Failed to withdraw all USDC')
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to load USDC into contract (for testing)
  const loadUSDCIntoContract = async () => {
    if (!account || !provider) {
      setError('Please connect your wallet first')
      return
    }

    const amount = 100 // Load 100 USDC for testing
    setIsProcessing(true)
    setError(null)

    try {
      // Create USDC contract instance
      const usdcContract = new Contract(
        USDC_ABI,
        CONTRACT_ADDRESSES.USDC,
        provider
      )

      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = BigInt(amount * 1e6)
      const amountUint256 = {
        low: (amountWei & BigInt('0xffffffffffffffffffffffffffffffff')).toString(),
        high: (amountWei >> BigInt(128)).toString()
      }

      console.log('Transferring USDC to contract:', {
        from: account.address,
        to: CONTRACT_ADDRESSES.MINT_DEBIT_CARD,
        amount: amount,
        amountWei: amountWei.toString(),
        amountUint256
      })

      // Transfer USDC to the contract
      const result = await usdcContract.transfer(
        CONTRACT_ADDRESSES.MINT_DEBIT_CARD,
        amountUint256
      )

      // Wait for transaction to be confirmed
      await provider.waitForTransaction(result.transaction_hash)

      setTransactionHash(result.transaction_hash)
      setSuccess(`Successfully loaded ${amount} USDC into contract!`)

      // Refresh contract info
      await loadContractInfo()

    } catch (error) {
      console.error('Error loading USDC into contract:', error)
      setError(error instanceof Error ? error.message : 'Failed to load USDC')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle debit card deposit (legacy function - now redirects to Stripe)
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
      const amountWei = BigInt(Math.floor(amountNumber * 1e6))
      const amountUint256 = {
        low: (amountWei & BigInt('0xffffffffffffffffffffffffffffffff')).toString(),
        high: (amountWei >> BigInt(128)).toString()
      }

      // Call contract function to process debit card deposit
      const result = await contract.process_debit_card_deposit(
        account.address,
        amountUint256,
        stripePaymentId
      )

      // Wait for transaction to be confirmed
      await provider.waitForTransaction(result.transaction_hash)

      setTransactionHash(result.transaction_hash)
      setSuccess(`Successfully processed ${amount} USDC deposit via debit card!`)
      
      // Refresh contract info and user balances
      await loadContractInfo()
      await loadUserBalances()
      
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
              <div className="stat-actions space-y-1">
                <button
                  className="btn btn-xs btn-secondary w-full"
                  onClick={setUSDCAddress}
                  disabled={isProcessing || !account}
                >
                  {isProcessing ? 'Setting...' : 'Set USDC Address'}
                </button>
                <button
                  className="btn btn-xs btn-primary w-full"
                  onClick={loadUSDCIntoContract}
                  disabled={isProcessing || !account}
                >
                  {isProcessing ? 'Loading...' : 'Load 100 USDC'}
                </button>
                <button
                  className="btn btn-xs btn-warning w-full"
                  onClick={() => withdrawUSDC(50)}
                  disabled={isProcessing || !account}
                >
                  {isProcessing ? 'Withdrawing...' : 'Withdraw 50 USDC'}
                </button>
                <button
                  className="btn btn-xs btn-error w-full"
                  onClick={withdrawAllUSDC}
                  disabled={isProcessing || !account}
                >
                  {isProcessing ? 'Withdrawing...' : 'Withdraw All'}
                </button>
              </div>
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
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-success font-medium">Wallet Connected</p>
                  <p className="text-sm text-base-content/70 break-all">
                    {account.address}
                  </p>
                </div>

                {/* Token Balances */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base-content">Token Balances</h3>
                    <button
                      onClick={() => loadUserBalances()}
                      disabled={isLoadingBalances}
                      className="btn btn-ghost btn-sm"
                      title="Refresh balances"
                    >
                      {isLoadingBalances ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* USDC Balance */}
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <div>
                          <span className="text-primary font-medium">USDC</span>
                          <p className="text-sm text-base-content/70">
                            {isLoadingBalances ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              `${userUsdcBalance} USDC`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STRK Balance */}
                  <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-secondary rounded-full"></div>
                        <div>
                          <span className="text-secondary font-medium">STRK</span>
                          <p className="text-sm text-base-content/70">
                            {isLoadingBalances ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              `${userStrkBalance} STRK`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ETH Balance - Temporarily disabled as contract doesn't exist on Sepolia */}
                  {/* <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-accent rounded-full"></div>
                        <div>
                          <span className="text-accent font-medium">ETH</span>
                          <p className="text-sm text-base-content/70">
                            {isLoadingBalances ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              `${userEthBalance} ETH`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
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
                    Fee Amount: {(parseFloat(amount) * (parseFloat(processingFee) || 0) / 100).toFixed(2)} USDC
                  </div>
                  <div className="text-sm">
                    You will receive: {(parseFloat(amount) - (parseFloat(amount) * (parseFloat(processingFee) || 0) / 100)).toFixed(2)} USDC
                  </div>
                </div>
              </div>
            )}

            {!showStripeForm ? (
              <button
                className="btn btn-primary w-full mt-4"
                onClick={() => setShowStripeForm(true)}
                disabled={!account || !amount || parseFloat(amount) <= 0}
              >
                Pay with Stripe & Deposit USDC
              </button>
            ) : (
              <div className="mt-4">
                <StripePaymentForm
                  amount={parseFloat(amount) || 0}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                  onLoading={handleStripeLoading}
                />
                <button
                  className="btn btn-ghost w-full mt-2"
                  onClick={() => setShowStripeForm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      {(error || stripeError || success || transactionHash) && (
        <div className="card bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title text-primary">Transaction Status</h2>
            
            {error && (
              <div className="alert alert-error">
                <div>
                  <div className="font-medium">Smart Contract Error</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}

            {stripeError && (
              <div className="alert alert-warning">
                <div>
                  <div className="font-medium">Stripe Payment Error</div>
                  <div className="text-sm">{stripeError}</div>
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
