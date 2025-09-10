'use client'

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface } from 'starknet'
import { Contract, Uint256, cairo } from 'starknet'
import { 
  CONTRACT_ADDRESSES, 
  USDC_ABI, 
  VAULT_POINTS_ABI, 
  OLYMPAY_VAULT_ABI,
  TOKEN_CONFIG,
  LIMITS
} from '@/config/contracts'
import { SwapRouter } from '@/utils/swapRouter'
import { formatBalanceWithDecimals } from '@/utils/serialization'
import ContractInfo from './ContractInfo'
import WalletConnectV2 from './WalletConnectV2'

const OnRampContent = () => {
  const [account, setAccount] = useState<AccountInterface | null>(null)
  const [provider, setProvider] = useState<ProviderInterface | null>(null)
  const [usdcAmount, setUsdcAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [vaultBalance, setVaultBalance] = useState<string>('0')
  const [userBalance, setUserBalance] = useState<string>('0')
  const [userVaultPoints, setUserVaultPoints] = useState<string>('0')
  const [swapRouter, setSwapRouter] = useState<SwapRouter | null>(null)

  const MIN_USDC = LIMITS.MIN_USDC_DEPOSIT
  const MAX_USDC = LIMITS.MAX_USDC_DEPOSIT

  const handleAccountChange = (newAccount: AccountInterface | null) => {
    setAccount(newAccount)
    if (newAccount) {
      setSuccess('Wallet connected successfully!')
      setError('')
    } else {
      setSuccess('')
      setError('')
      setTransactionHash('')
      setUsdcAmount('')
    }
  }

  const handleProviderChange = (newProvider: ProviderInterface | null) => {
    setProvider(newProvider)
  }

  // Initialize SwapRouter when account and provider are available
  useEffect(() => {
    if (account && provider) {
      try {
        const router = new SwapRouter(account, provider)
        setSwapRouter(router)
        checkVaultBalance(router)
        checkUserBalance(router)
        checkUserVaultPoints(router)
      } catch (error) {
        console.error('Error creating SwapRouter:', error)
        setError('Không thể khởi tạo SwapRouter')
      }
    }
  }, [account, provider])

  // Check vault USDC balance
  const checkVaultBalance = async (router?: SwapRouter) => {
    const routerToUse = router || swapRouter
    if (!routerToUse) return

    setIsCheckingBalance(true)
    try {
      console.log('Checking vault balance for address:', CONTRACT_ADDRESSES.OLYMPAY_VAULT)
      const balance = await routerToUse.getTokenBalance(
        CONTRACT_ADDRESSES.USDC,
        CONTRACT_ADDRESSES.OLYMPAY_VAULT
      )
      const formattedBalance = formatBalanceWithDecimals(balance, TOKEN_CONFIG.USDC.decimals)
      setVaultBalance(formattedBalance)
      console.log('Vault USDC balance:', formattedBalance, 'Raw balance:', balance)
    } catch (error) {
      console.error('Error checking vault balance:', error)
      setError('Không thể kiểm tra số dư vault')
    } finally {
      setIsCheckingBalance(false)
    }
  }

  // Check user USDC balance
  const checkUserBalance = async (router?: SwapRouter) => {
    const routerToUse = router || swapRouter
    if (!routerToUse || !account) return

    try {
      console.log('Checking user balance for address:', account.address)
      const balance = await routerToUse.getTokenBalance(
        CONTRACT_ADDRESSES.USDC,
        account.address
      )
      const formattedBalance = formatBalanceWithDecimals(balance, TOKEN_CONFIG.USDC.decimals)
      setUserBalance(formattedBalance)
      console.log('User USDC balance:', formattedBalance, 'Raw balance:', balance)
    } catch (error) {
      console.error('Error checking user balance:', error)
      setUserBalance('0')
    }
  }

  // Check user VaultPoints balance
  const checkUserVaultPoints = async (router?: SwapRouter) => {
    const routerToUse = router || swapRouter
    if (!routerToUse || !account) return

    try {
      console.log('Checking user VaultPoints balance for address:', account.address)
      const balance = await routerToUse.getTokenBalance(
        CONTRACT_ADDRESSES.VAULT_POINTS,
        account.address
      )
      const formattedBalance = formatBalanceWithDecimals(balance, TOKEN_CONFIG.VAULT_POINTS.decimals)
      setUserVaultPoints(formattedBalance)
      console.log('User VaultPoints balance:', formattedBalance, 'Raw balance:', balance)
    } catch (error) {
      console.error('Error checking user VaultPoints balance:', error)
      setUserVaultPoints('0')
    }
  }

  const handleDeposit = async () => {
    if (!account) {
      setError('Please connect your wallet first')
      return
    }

    if (!swapRouter) {
      setError('SwapRouter not initialized. Please try again.')
      return
    }

    const amount = parseFloat(usdcAmount)
    if (isNaN(amount) || amount < MIN_USDC || amount > MAX_USDC) {
      setError(`Amount must be between ${MIN_USDC} and ${MAX_USDC} USDC`)
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')
    setTransactionHash('')

    try {
      // First, check user's USDC balance
      console.log('Checking user USDC balance...')
      const userBalanceRaw = await swapRouter.getTokenBalance(
        CONTRACT_ADDRESSES.USDC,
        account.address
      )
      
      const userBalanceFormatted = formatBalanceWithDecimals(userBalanceRaw, TOKEN_CONFIG.USDC.decimals)
      const userBalanceNumber = parseFloat(userBalanceFormatted)
      
      console.log('User balance:', userBalanceNumber, 'Requested amount:', amount)
      
      // Check if user has enough USDC
      if (userBalanceNumber < amount) {
        setError(`Insufficient USDC balance. Available: ${userBalanceFormatted} USDC, Requested: ${amount} USDC`)
        return
      }

      // Convert USDC amount to wei (6 decimals)
      const usdcWei = BigInt(Math.floor(amount * Math.pow(10, TOKEN_CONFIG.USDC.decimals)))
      
      // Create contract instances
      const usdcContract = new Contract(USDC_ABI, CONTRACT_ADDRESSES.USDC, account)
      const vaultPointsContract = new Contract(VAULT_POINTS_ABI, CONTRACT_ADDRESSES.VAULT_POINTS, account)
      
      // Convert to Uint256 format - try different approaches
      const low = (usdcWei & BigInt('0xffffffffffffffffffffffffffffffff')).toString()
      const high = (usdcWei >> BigInt(128)).toString()
      
      // Try multiple formats
      const usdcAmountUint256Array = [low, high]
      const usdcAmountUint256Object = { low, high }
      const usdcAmountUint256BigInt = usdcWei
      
      console.log('USDC amount in wei:', usdcWei.toString())
      console.log('Uint256 format (array):', usdcAmountUint256Array)
      console.log('Uint256 format (object):', usdcAmountUint256Object)
      console.log('Uint256 format (BigInt):', usdcAmountUint256BigInt)
      
      // Use array format first
      const usdcAmountUint256 = usdcAmountUint256Array
      
      console.log('Step 1: Checking allowance...')
      // Check current allowance
      const currentAllowance = await usdcContract.allowance(
        account.address,
        CONTRACT_ADDRESSES.OLYMPAY_VAULT
      )
      console.log('Current allowance:', currentAllowance)
      
      // Convert allowance to number for comparison
      const currentAllowanceFormatted = formatBalanceWithDecimals(currentAllowance, TOKEN_CONFIG.USDC.decimals)
      const currentAllowanceNumber = parseFloat(currentAllowanceFormatted)
      
      if (currentAllowanceNumber < amount) {
        console.log('Step 1: Approving USDC transfer to vault...')
        // Approve USDC transfer to vault
        const approveResult = await usdcContract.approve(
          CONTRACT_ADDRESSES.OLYMPAY_VAULT,
          usdcAmountUint256
        )
        
        console.log('Approve transaction hash:', approveResult.transaction_hash)
        await account.waitForTransaction(approveResult.transaction_hash)
        console.log('Approve completed successfully')
      } else {
        console.log('Sufficient allowance already exists')
      }
      
      console.log('Step 2: Depositing USDC to vault...')
      // Deposit USDC to vault (this should trigger minting of VaultPoints)
      const vaultContract = new Contract(OLYMPAY_VAULT_ABI, CONTRACT_ADDRESSES.OLYMPAY_VAULT, account)
      const depositResult = await vaultContract.stake_usdc_in_vault(usdcAmountUint256)
      
      console.log('Deposit transaction hash:', depositResult.transaction_hash)
      await account.waitForTransaction(depositResult.transaction_hash)
      console.log('Deposit completed successfully')
      
      setTransactionHash(depositResult.transaction_hash)
      setSuccess(`Successfully deposited ${amount} USDC to vault! You should receive VaultPoints automatically.`)
      
      // Refresh all balances
      await checkVaultBalance()
      await checkUserBalance()
      await checkUserVaultPoints()
      
    } catch (err) {
      console.error('Deposit error:', err)
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-base-content mb-6">
            On-Ramp to 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {' '}OlymPay
            </span>
          </h1>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Deposit USDC and earn VaultPoints instantly. Start your journey with secure, 
            fast, and reliable on-ramp services.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <div className="card bg-base-100 shadow-2xl">
            <div className="card-body p-8">
              <h2 className="card-title text-2xl mb-8 justify-center">
                Deposit USDC
              </h2>

              {/* Wallet Connection */}
              <div className="mb-8">
                <div className="flex justify-center">
                  <WalletConnectV2 
                    onAccountChange={handleAccountChange}
                    onProviderChange={handleProviderChange}
                  />
                </div>
              </div>

              {/* Balance Displays */}
              {account && (
                <div className="space-y-4 mb-6">
                  {/* User Balance Display */}
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <div>
                          <span className="text-success font-medium">Your USDC Balance</span>
                          <p className="text-sm text-base-content/70">
                            {userBalance} USDC
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => checkUserBalance()}
                        className="btn btn-ghost btn-sm"
                        title="Refresh your balance"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* User VaultPoints Display */}
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-warning rounded-full"></div>
                        <div>
                          <span className="text-warning font-medium">Your VaultPoints</span>
                          <p className="text-sm text-base-content/70">
                            {userVaultPoints} VP
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => checkUserVaultPoints()}
                        className="btn btn-ghost btn-sm"
                        title="Refresh VaultPoints balance"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Vault Balance Display */}
                  <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-info rounded-full"></div>
                        <div>
                          <span className="text-info font-medium">OlymPay Vault Balance</span>
                          <p className="text-sm text-base-content/70">
                            {isCheckingBalance ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              `${vaultBalance} USDC`
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => checkVaultBalance()}
                        disabled={isCheckingBalance}
                        className="btn btn-ghost btn-sm"
                        title="Refresh vault balance"
                      >
                        {isCheckingBalance ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">USDC Amount</span>
                  <span className="label-text-alt">
                    Min: {MIN_USDC} | Max: {MAX_USDC}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="input input-bordered w-full pr-16"
                    value={usdcAmount}
                    onChange={(e) => setUsdcAmount(e.target.value)}
                    min={MIN_USDC}
                    max={MAX_USDC}
                    step="0.01"
                    disabled={!account || isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-base-content/50 text-sm">USDC</span>
                  </div>
                </div>
                {account && (
                  <div className="label">
                    <span className="label-text-alt text-success">
                      Your USDC balance: {userBalance} USDC
                    </span>
                    <span className="label-text-alt text-info">
                      Vault total: {vaultBalance} USDC
                    </span>
                  </div>
                )}
              </div>

              {/* Deposit Button */}
              <div className="mb-6">
                <button
                  onClick={handleDeposit}
                  disabled={!account || isLoading || !usdcAmount}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Processing...
                    </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Deposit USDC to Vault
                          </>
                        )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="alert alert-success mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              {/* Transaction Hash */}
              {transactionHash && (
                <div className="bg-base-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-base-content">Transaction Hash:</h3>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-base-300 px-2 py-1 rounded flex-1 break-all">
                      {transactionHash}
                    </code>
                    <a
                      href={`https://sepolia.starkscan.co/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                    >
                      View on Starkscan
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Contract Information */}
            <ContractInfo />

            {/* Additional Info */}
            <div className="mt-8 text-center text-base-content/60">
              <p>Secure • Fast • Reliable</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OnRampContent
