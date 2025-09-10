'use client'

import { useState, useEffect } from 'react'

const WalletDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const checkWalletAvailability = () => {
      const info: any = {
        isBrowser: typeof window !== 'undefined',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
        starknet: typeof window !== 'undefined' ? !!(window as any).starknet : false,
        starknet_braavos: typeof window !== 'undefined' ? !!(window as any).starknet_braavos : false,
        availableWallets: []
      }

      if (typeof window !== 'undefined') {
        // Check for various wallet objects
        const walletChecks = [
          'starknet',
          'starknet_braavos', 
          'starknet_argentX',
          'starknet_okx',
          'starknet_rabby'
        ]

        walletChecks.forEach(wallet => {
          if ((window as any)[wallet]) {
            info.availableWallets.push(wallet)
          }
        })

        // Check for get-starknet-core
        try {
          const { getStarknet } = require('get-starknet-core')
          info.getStarknetCore = true
          info.connectFunction = typeof getStarknet === 'function'
        } catch (e) {
          info.getStarknetCore = false
          info.connectFunction = false
        }
      }

      setDebugInfo(info)
    }

    checkWalletAvailability()
  }, [])

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Wallet Debug Info</h2>
        <div className="space-y-2">
          <div><strong>Browser:</strong> {debugInfo.isBrowser ? 'Yes' : 'No'}</div>
          <div><strong>User Agent:</strong> {debugInfo.userAgent}</div>
          <div><strong>get-starknet-core:</strong> {debugInfo.getStarknetCore ? 'Available' : 'Not Available'}</div>
          {debugInfo.getStarknetCore && (
            <div><strong>Connect Function:</strong> {debugInfo.connectFunction ? 'Available' : 'Not Available'}</div>
          )}
          <div><strong>Available Wallets:</strong></div>
          <ul className="list-disc list-inside ml-4">
            {debugInfo.availableWallets?.map((wallet: string) => (
              <li key={wallet}>{wallet}</li>
            ))}
          </ul>
          {debugInfo.availableWallets?.length === 0 && (
            <div className="text-warning">No wallets detected</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletDebug
