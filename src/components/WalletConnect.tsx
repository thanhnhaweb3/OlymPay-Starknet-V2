'use client'

import { useState, useEffect } from 'react'
// Import get-starknet-core
import { getStarknet } from 'get-starknet-core'
import { AccountInterface, ProviderInterface } from 'starknet'

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined'

interface WalletConnectProps {
  onAccountChange?: (account: AccountInterface | null) => void
  onProviderChange?: (provider: ProviderInterface | null) => void
}

const WalletConnect = ({ onAccountChange, onProviderChange }: WalletConnectProps) => {
  const [account, setAccount] = useState<AccountInterface | null>(null)
  const [provider, setProvider] = useState<ProviderInterface | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (!isBrowser) return
      
      try {
        const starknet = getStarknet()
        const wallets = await starknet.getAvailableWallets()
        if (wallets && wallets.length > 0) {
          const wallet = wallets[0]
          if (wallet.isConnected) {
            setAccount(wallet.account)
            setProvider(wallet.provider)
            onAccountChange?.(wallet.account)
            onProviderChange?.(wallet.provider)
          }
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err)
      }
    }

    checkConnection()
  }, [onAccountChange, onProviderChange])

  const handleConnect = async () => {
    if (!isBrowser) {
      setError('Wallet connection is only available in browser')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Try to get available wallets
      const starknet = getStarknet()
      const wallets = await starknet.getAvailableWallets()
      
      console.log('Available wallets:', wallets)

      if (wallets && wallets.length > 0) {
        const wallet = wallets[0]
        if (wallet.isConnected) {
          setAccount(wallet.account)
          setProvider(wallet.provider)
          onAccountChange?.(wallet.account)
          onProviderChange?.(wallet.provider)
          console.log('Wallet connected successfully:', wallet.account?.address)
        } else {
          // Try to connect to the wallet
          console.log('Attempting to connect to wallet:', wallet.name)
          try {
            const connectedWallet = await wallet.enable()
            console.log('Connected wallet result:', connectedWallet)
            // The enable() method should return the wallet object
            if (connectedWallet && typeof connectedWallet === 'object' && 'isConnected' in connectedWallet) {
              const walletObj = connectedWallet as any
              console.log('Wallet connected successfully:', walletObj.account?.address)
              setAccount(walletObj.account)
              setProvider(walletObj.provider)
              onAccountChange?.(walletObj.account)
              onProviderChange?.(walletObj.provider)
            } else {
              setError('Failed to connect to wallet. Please try again.')
            }
          } catch (connectErr: any) {
            console.error('Error connecting to wallet:', connectErr)
            if (connectErr.message?.includes('User rejected')) {
              setError('Connection was rejected by user')
            } else {
              setError('Failed to connect to wallet. Please try again.')
            }
          }
        }
      } else {
        setError('No wallets found. Please install Traavos or Argent X wallet.')
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err)
      setError(`Failed to connect wallet: ${err.message || 'Please make sure Traavos wallet is installed and try again.'}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      // Disconnect by clearing the state
      setAccount(null)
      setProvider(null)
      onAccountChange?.(null)
      onProviderChange?.(null)
    } catch (err) {
      console.error('Error disconnecting wallet:', err)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (account) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-base-content">
            {formatAddress(account.address)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="btn btn-outline btn-sm"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="btn btn-primary"
      >
        {isConnecting ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Connecting...
          </>
        ) : (
          'Connect Traavos Wallet'
        )}
      </button>
      {error && (
        <div className="alert alert-error alert-sm">
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default WalletConnect
