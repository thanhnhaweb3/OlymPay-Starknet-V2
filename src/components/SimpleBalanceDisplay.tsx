'use client'

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface } from 'starknet'
import { CONTRACT_ADDRESSES, TOKEN_INFO } from '@/config/contracts'
import { CurrencyDollarIcon, BanknotesIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface SimpleBalanceDisplayProps {
  account: AccountInterface | null
  provider: ProviderInterface | null
}

interface TokenBalance {
  symbol: string
  name: string
  balance: string
  formattedBalance: string
  decimals: number
  icon: React.ReactNode
}

const SimpleBalanceDisplay = ({ account, provider }: SimpleBalanceDisplayProps) => {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatBalance = (balance: string, decimals: number): string => {
    try {
      const balanceNumber = Number(balance)
      if (isNaN(balanceNumber) || balanceNumber === 0) return '0.00'
      
      // Convert from wei/smallest unit to human readable format
      const formatted = balanceNumber / Math.pow(10, decimals)
      
      // Format with appropriate decimal places
      if (formatted >= 1000000) {
        return (formatted / 1000000).toFixed(2) + 'M'
      } else if (formatted >= 1000) {
        return (formatted / 1000).toFixed(2) + 'K'
      } else if (formatted >= 1) {
        return formatted.toFixed(2)
      } else {
        return formatted.toFixed(6)
      }
    } catch (error) {
      console.error('Error formatting balance:', error)
      return '0.00'
    }
  }

  const loadBalances = async () => {
    if (!account || !provider) return

    setIsLoading(true)
    setError(null)

    try {
      // For now, show mock data to avoid blockchain connection issues
      const mockBalances: TokenBalance[] = [
        {
          symbol: TOKEN_INFO.USDC.symbol,
          name: TOKEN_INFO.USDC.name,
          balance: '1000000', // 1 USDC in smallest unit
          formattedBalance: formatBalance('1000000', TOKEN_INFO.USDC.decimals),
          decimals: TOKEN_INFO.USDC.decimals,
          icon: <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
        },
        {
          symbol: TOKEN_INFO.SPIKO.symbol,
          name: TOKEN_INFO.SPIKO.name,
          balance: '1020000000000000000', // 1.02 SPIKO in smallest unit
          formattedBalance: formatBalance('1020000000000000000', TOKEN_INFO.SPIKO.decimals),
          decimals: TOKEN_INFO.SPIKO.decimals,
          icon: <BanknotesIcon className="w-8 h-8 text-green-500" />
        }
      ]

      setBalances(mockBalances)
    } catch (err) {
      console.error('Error loading balances:', err)
      setError('Không thể tải số dư. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (account && provider) {
      loadBalances()
    }
  }, [account, provider])

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
                    Raw: {token.balance}
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

        <div className="alert alert-info mt-4">
          <span>📝 Hiện đang hiển thị dữ liệu mẫu. Kết nối ví để xem số dư thực tế.</span>
        </div>
      </div>
    </div>
  )
}

export default SimpleBalanceDisplay
