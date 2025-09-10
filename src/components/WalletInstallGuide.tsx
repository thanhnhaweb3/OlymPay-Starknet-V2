'use client'

import { useState } from 'react'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

const WalletInstallGuide = ({ onClose }: { onClose: () => void }) => {
  const [selectedWallet, setSelectedWallet] = useState<'traavos' | 'argent'>('traavos')

  const wallets = {
    traavos: {
      name: 'Traavos Wallet',
      description: 'The most popular Starknet wallet',
      url: 'https://braavos.app/',
      steps: [
        'Visit braavos.app',
        'Click "Download" and install extension',
        'Create new wallet or import existing',
        'Switch to Sepolia Testnet',
        'Fund with test ETH from faucet'
      ]
    },
    argent: {
      name: 'Argent X Wallet',
      description: 'Secure and user-friendly Starknet wallet',
      url: 'https://www.argent.xyz/',
      steps: [
        'Visit argent.xyz',
        'Click "Get Started" and install extension',
        'Create new wallet or import existing',
        'Switch to Sepolia Testnet',
        'Fund with test ETH from faucet'
      ]
    }
  }

  const currentWallet = wallets[selectedWallet]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Install Starknet Wallet</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-base-content/70 mb-4">
            To use Olympay Marketplace, you need a Starknet wallet. Choose one of the options below:
          </p>

          {/* Wallet Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              className={`card cursor-pointer transition-all ${
                selectedWallet === 'traavos' 
                  ? 'ring-2 ring-primary bg-primary/10' 
                  : 'bg-base-200 hover:bg-base-300'
              }`}
              onClick={() => setSelectedWallet('traavos')}
            >
              <div className="card-body">
                <h3 className="card-title text-lg">Traavos Wallet</h3>
                <p className="text-sm text-base-content/70">
                  The most popular Starknet wallet
                </p>
                {selectedWallet === 'traavos' && (
                  <CheckIcon className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>

            <div
              className={`card cursor-pointer transition-all ${
                selectedWallet === 'argent' 
                  ? 'ring-2 ring-primary bg-primary/10' 
                  : 'bg-base-200 hover:bg-base-300'
              }`}
              onClick={() => setSelectedWallet('argent')}
            >
              <div className="card-body">
                <h3 className="card-title text-lg">Argent X Wallet</h3>
                <p className="text-sm text-base-content/70">
                  Secure and user-friendly
                </p>
                {selectedWallet === 'argent' && (
                  <CheckIcon className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">
            How to install {currentWallet.name}:
          </h3>
          <div className="space-y-3">
            {currentWallet.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-base-content/80">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="alert alert-warning mb-6">
          <div>
            <h4 className="font-semibold">Important Notes:</h4>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Make sure to switch to <strong>Sepolia Testnet</strong></li>
              <li>You'll need test ETH for gas fees</li>
              <li>Get test ETH from Starknet Sepolia faucet</li>
              <li>This is a testnet - don't use real money</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={currentWallet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary flex-1"
          >
            Install {currentWallet.name}
          </a>
          <a
            href="https://starknet-faucet.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline flex-1"
          >
            Get Test ETH
          </a>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            I'll install it later
          </button>
        </div>
      </div>
    </div>
  )
}

export default WalletInstallGuide
