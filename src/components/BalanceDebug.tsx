'use client'

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface } from 'starknet'
import { SwapRouter } from '@/utils/swapRouter'
import { CONTRACT_ADDRESSES, TOKEN_INFO } from '@/config/contracts'
import { safeStringify } from '@/utils/serialization'

interface BalanceDebugProps {
  account: AccountInterface | null
  provider: ProviderInterface | null
}

const BalanceDebug = ({ account, provider }: BalanceDebugProps) => {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadDebugInfo = async () => {
    if (!account || !provider) return

    setIsLoading(true)
    try {
      const router = new SwapRouter(account, provider)
      const userAddress = account.address

      const usdcBalance = await router.getTokenBalance(CONTRACT_ADDRESSES.USDC, userAddress)
      const spikoBalance = await router.getTokenBalance(CONTRACT_ADDRESSES.SPIKO_TBILLS, userAddress)
      const strkBalance = await router.getTokenBalance(CONTRACT_ADDRESSES.STRK, userAddress)
      const ethBalance = await router.getTokenBalance(CONTRACT_ADDRESSES.ETH, userAddress)

      setDebugInfo({
        userAddress,
        usdc: {
          contract: CONTRACT_ADDRESSES.USDC,
          balance: usdcBalance,
          balanceType: typeof usdcBalance,
          balanceString: safeStringify(usdcBalance)
        },
        spiko: {
          contract: CONTRACT_ADDRESSES.SPIKO_TBILLS,
          balance: spikoBalance,
          balanceType: typeof spikoBalance,
          balanceString: safeStringify(spikoBalance)
        },
        strk: {
          contract: CONTRACT_ADDRESSES.STRK,
          balance: strkBalance,
          balanceType: typeof strkBalance,
          balanceString: safeStringify(strkBalance)
        },
        eth: {
          contract: CONTRACT_ADDRESSES.ETH,
          balance: ethBalance,
          balanceType: typeof ethBalance,
          balanceString: safeStringify(ethBalance)
        }
      })
    } catch (error) {
      console.error('Debug error:', error)
      setDebugInfo({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (account && provider) {
      loadDebugInfo()
    }
  }, [account, provider])

  if (!account) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-warning">🐛 Balance Debug</h3>
          <p>Kết nối ví để xem thông tin debug</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-warning">🐛 Balance Debug</h3>
          <button
            onClick={loadDebugInfo}
            disabled={isLoading}
            className="btn btn-ghost btn-sm"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner"></span>
          </div>
        ) : debugInfo ? (
          <div className="space-y-4">
            <div className="bg-base-100 p-4 rounded-lg">
              <h4 className="font-bold mb-2">User Address:</h4>
              <p className="text-sm font-mono break-all">{debugInfo.userAddress}</p>
            </div>

            <div className="bg-base-100 p-4 rounded-lg">
              <h4 className="font-bold mb-2">USDC Balance:</h4>
              <p className="text-sm"><strong>Type:</strong> {debugInfo.usdc?.balanceType}</p>
              <p className="text-sm"><strong>Raw:</strong> {debugInfo.usdc?.balanceString}</p>
              <p className="text-sm"><strong>Contract:</strong> {debugInfo.usdc?.contract}</p>
            </div>

            <div className="bg-base-100 p-4 rounded-lg">
              <h4 className="font-bold mb-2">SPIKO Balance:</h4>
              <p className="text-sm"><strong>Type:</strong> {debugInfo.spiko?.balanceType}</p>
              <p className="text-sm"><strong>Raw:</strong> {debugInfo.spiko?.balanceString}</p>
              <p className="text-sm"><strong>Contract:</strong> {debugInfo.spiko?.contract}</p>
            </div>

            <div className="bg-base-100 p-4 rounded-lg">
              <h4 className="font-bold mb-2">STRK Balance:</h4>
              <p className="text-sm"><strong>Type:</strong> {debugInfo.strk?.balanceType}</p>
              <p className="text-sm"><strong>Raw:</strong> {debugInfo.strk?.balanceString}</p>
              <p className="text-sm"><strong>Contract:</strong> {debugInfo.strk?.contract}</p>
            </div>

            <div className="bg-base-100 p-4 rounded-lg">
              <h4 className="font-bold mb-2">ETH Balance:</h4>
              <p className="text-sm"><strong>Type:</strong> {debugInfo.eth?.balanceType}</p>
              <p className="text-sm"><strong>Raw:</strong> {debugInfo.eth?.balanceString}</p>
              <p className="text-sm"><strong>Contract:</strong> {debugInfo.eth?.contract}</p>
            </div>

            {debugInfo.error && (
              <div className="alert alert-error">
                <span>Error: {debugInfo.error}</span>
              </div>
            )}
          </div>
        ) : (
          <p>No debug info available</p>
        )}
      </div>
    </div>
  )
}

export default BalanceDebug
