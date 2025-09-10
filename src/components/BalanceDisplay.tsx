'use client'

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface } from 'starknet'
import { SwapRouter } from '@/utils/swapRouter'
import { CONTRACT_ADDRESSES, TOKEN_INFO } from '@/config/contracts'
import { safeStringify, formatBalanceWithDecimals } from '@/utils/serialization'
import { CurrencyDollarIcon, BanknotesIcon, ArrowPathIcon, BoltIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline'

interface BalanceDisplayProps {
  account: AccountInterface | null
  provider: ProviderInterface | null
}

interface TokenBalance {
  symbol: string
  name: string
  balance: any
  formattedBalance: string
  decimals: number
  icon: React.ReactNode
}

const BalanceDisplay = ({ account, provider }: BalanceDisplayProps) => {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [swapRouter, setSwapRouter] = useState<SwapRouter | null>(null)

  useEffect(() => {
    if (account && provider) {
      try {
        const router = new SwapRouter(account, provider)
        setSwapRouter(router)
        loadBalances()
      } catch (error) {
        console.error('Error creating SwapRouter:', error)
        setError('Không thể khởi tạo SwapRouter')
      }
    }
  }, [account, provider])

  const formatBalance = (balance: any, decimals: number): string => {
    if (typeof window !== 'undefined') {
      console.log('Raw balance data:', balance, 'Type:', typeof balance)
    }
    return formatBalanceWithDecimals(balance, decimals)
  }

  const loadBalances = async () => {
    if (!account || !swapRouter) return

    setIsLoading(true)
    setError(null)

    try {
      const userAddress = account.address
      
      // Load all token balances
      const usdcBalance = await swapRouter.getTokenBalance(
        CONTRACT_ADDRESSES.USDC,
        userAddress
      )
      
      const spikoBalance = await swapRouter.getTokenBalance(
        CONTRACT_ADDRESSES.SPIKO_TBILLS,
        userAddress
      )

      const strkBalance = await swapRouter.getTokenBalance(
        CONTRACT_ADDRESSES.STRK,
        userAddress
      )

      const ethBalance = await swapRouter.getTokenBalance(
        CONTRACT_ADDRESSES.ETH,
        userAddress
      )

      const newBalances: TokenBalance[] = [
        {
          symbol: TOKEN_INFO.USDC.symbol,
          name: TOKEN_INFO.USDC.name,
          balance: usdcBalance,
          formattedBalance: formatBalance(usdcBalance, TOKEN_INFO.USDC.decimals),
          decimals: TOKEN_INFO.USDC.decimals,
          icon: <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
        },
        {
          symbol: TOKEN_INFO.SPIKO.symbol,
          name: TOKEN_INFO.SPIKO.name,
          balance: spikoBalance,
          formattedBalance: formatBalance(spikoBalance, TOKEN_INFO.SPIKO.decimals),
          decimals: TOKEN_INFO.SPIKO.decimals,
          icon: <BanknotesIcon className="w-8 h-8 text-green-500" />
        },
        {
          symbol: TOKEN_INFO.STRK.symbol,
          name: TOKEN_INFO.STRK.name,
          balance: strkBalance,
          formattedBalance: formatBalance(strkBalance, TOKEN_INFO.STRK.decimals),
          decimals: TOKEN_INFO.STRK.decimals,
          icon: <BoltIcon className="w-8 h-8 text-yellow-500" />
        },
        {
          symbol: TOKEN_INFO.ETH.symbol,
          name: TOKEN_INFO.ETH.name,
          balance: ethBalance,
          formattedBalance: formatBalance(ethBalance, TOKEN_INFO.ETH.decimals),
          decimals: TOKEN_INFO.ETH.decimals,
          icon: <CurrencyEuroIcon className="w-8 h-8 text-purple-500" />
        }
      ]

      setBalances(newBalances)
    } catch (err) {
      console.error('Error loading balances:', err)
      setError('Không thể tải số dư. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadBalances()
  }

  if (!account) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body text-center">
          <h3 className="card-title justify-center">Số dư Token</h3>
          <p className="text-base-content/70">Vui lòng kết nối ví để xem số dư</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">Số dư Token</h3>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-ghost btn-sm"
            title="Làm mới số dư"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="space-y-4">
            {balances.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  {token.icon}
                  <div>
                    <h4 className="font-bold text-lg">{token.symbol}</h4>
                    <p className="text-sm text-base-content/70">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {token.formattedBalance}
                  </p>
                  <p className="text-xs text-base-content/50">
                    Raw: {safeStringify(token.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-primary btn-sm"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Đang tải...
              </>
            ) : (
              'Làm mới'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BalanceDisplay
