'use client'

import { useState } from 'react'
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const WalletConnectionGuide = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'Open Traavos Wallet',
      description: 'Click on the Traavos extension icon in your browser toolbar',
      icon: '🔗'
    },
    {
      title: 'Check Network',
      description: 'Make sure you are connected to Sepolia Testnet (not Mainnet)',
      icon: '🌐'
    },
    {
      title: 'Connect to Olympay',
      description: 'Click "Connect" in the wallet popup when prompted',
      icon: '✅'
    },
    {
      title: 'Approve Connection',
      description: 'Approve the connection request in your wallet',
      icon: '🔐'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">How to Connect Traavos Wallet</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                index === currentStep
                  ? 'bg-primary/10 border border-primary'
                  : index < currentStep
                  ? 'bg-success/10 border border-success'
                  : 'bg-base-200'
              }`}
            >
              <div className="flex-shrink-0">
                {index < currentStep ? (
                  <CheckCircleIcon className="w-6 h-6 text-success" />
                ) : (
                  <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base-content">{step.title}</h3>
                <p className="text-sm text-base-content/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn btn-outline btn-sm"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-base-300'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="btn btn-primary btn-sm"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn btn-success btn-sm"
            >
              Got it!
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-base-content/50">
            Still having trouble? Make sure Traavos is unlocked and you're on Sepolia testnet.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WalletConnectionGuide
