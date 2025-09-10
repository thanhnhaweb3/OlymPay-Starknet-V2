'use client'

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface } from 'starknet'
import WalletInstallGuide from './WalletInstallGuide'
import WalletConnectionGuide from './WalletConnectionGuide'

// Import get-starknet-core
import { getStarknet } from 'get-starknet-core'

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined'

interface WalletConnectProps {
  onAccountChange?: (account: AccountInterface | null) => void
  onProviderChange?: (provider: ProviderInterface | null) => void
}

const WalletConnectV2 = ({ onAccountChange, onProviderChange }: WalletConnectProps) => {
  const [account, setAccount] = useState<AccountInterface | null>(null)
  const [provider, setProvider] = useState<ProviderInterface | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableWallets, setAvailableWallets] = useState<string[]>([])
  const [showInstallGuide, setShowInstallGuide] = useState(false)
  const [showConnectionGuide, setShowConnectionGuide] = useState(false)
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(true)

  useEffect(() => {

    // Check available wallets
    const checkAvailableWallets = () => {
      if (!isBrowser) return

      const wallets: string[] = []
      
      // Check for various wallet objects
      const walletChecks = [
        { name: 'Traavos', key: 'starknet_braavos' },
        { name: 'Argent X', key: 'starknet_argentX' },
        { name: 'OKX', key: 'starknet_okx' },
        { name: 'Rabby', key: 'starknet_rabby' },
        { name: 'Generic Starknet', key: 'starknet' }
      ]

        walletChecks.forEach(wallet => {
          if ((window as any)[wallet.key]) {
            wallets.push(wallet.name)
          }
        })

      setAvailableWallets(wallets)
    }

    checkAvailableWallets()

    // Check if wallet is already connected
    const checkConnection = async () => {
      if (!isBrowser) return
      
      try {
        const starknet = getStarknet()
        const wallets = await starknet.getAvailableWallets()
        if (wallets && wallets.length > 0) {
          // Try to connect to the first available wallet
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
      console.log('Attempting to connect wallet...')
      
      // Try to connect with get-starknet-core
      const starknet = getStarknet()
      const wallets = await starknet.getAvailableWallets()
      
      console.log('Available wallets:', wallets)

      if (wallets && wallets.length > 0) {
        // Try to connect to the first available wallet
        const wallet = wallets[0]
        if (wallet.isConnected) {
          console.log('Wallet connected successfully:', wallet.account?.address)
          setAccount(wallet.account)
          setProvider(wallet.provider)
          onAccountChange?.(wallet.account)
          onProviderChange?.(wallet.provider)
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
      
      // Provide more specific error messages
      if (err.message?.includes('User rejected')) {
        setError('Connection was rejected by user')
      } else if (err.message?.includes('No wallet found')) {
        setError('No Starknet wallet found. Please install Traavos or Argent X wallet.')
      } else if (err.message?.includes('Network')) {
        setError('Network error. Please check your internet connection.')
      } else {
        setError(`Connection failed: ${err.message || 'Please try again'}`)
      }
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
    <div className="flex flex-col items-center space-y-4">
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
          'Connect Wallet'
        )}
      </button>
      
      {availableWallets.length > 0 && (
        <div className="text-center">
          <div className="text-sm text-base-content/70 mb-2">
            Available wallets: {availableWallets.join(', ')}
          </div>
          <button
            onClick={() => setShowConnectionGuide(true)}
            className="btn btn-outline btn-sm"
          >
            Need help connecting?
          </button>
        </div>
      )}
      
      {availableWallets.length === 0 && (
        <div className="text-center">
          <div className="text-sm text-warning mb-2">
            No wallets detected.
          </div>
          <button
            onClick={() => setShowInstallGuide(true)}
            className="btn btn-outline btn-sm"
          >
            How to install wallet?
          </button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error alert-sm max-w-md">
          <span>{error}</span>
          {error.includes('not connected') && (
            <button
              onClick={handleConnect}
              className="btn btn-sm btn-outline mt-2"
            >
              Try Connect Again
            </button>
          )}
        </div>
      )}

      {showInstallGuide && (
        <WalletInstallGuide onClose={() => setShowInstallGuide(false)} />
      )}

      {showConnectionGuide && (
        <WalletConnectionGuide onClose={() => setShowConnectionGuide(false)} />
      )}
    </div>
  )
}

export default WalletConnectV2
