'use client'

import { CONTRACT_ADDRESSES } from '@/config/contracts'

const ContractInfo = () => {
  return (
    <div className="bg-base-200 rounded-lg p-4 mt-6">
      <h3 className="font-semibold mb-3 text-base-content">Contract Information</h3>
      <div className="space-y-3 text-sm">
        {/* USDC Contract */}
        <div className="flex items-center justify-between">
          <span className="text-base-content/70">USDC Contract:</span>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-base-300 px-2 py-1 rounded">
              {CONTRACT_ADDRESSES.USDC.slice(0, 10)}...
            </code>
            <a
              href={`https://sepolia.starkscan.co/contract/${CONTRACT_ADDRESSES.USDC}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-xs"
              title="View on Starkscan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* VaultPoints Contract */}
        <div className="flex items-center justify-between">
          <span className="text-base-content/70">VaultPoints Contract:</span>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-base-300 px-2 py-1 rounded">
              {CONTRACT_ADDRESSES.VAULT_POINTS.slice(0, 10)}...
            </code>
            <a
              href={`https://sepolia.starkscan.co/contract/${CONTRACT_ADDRESSES.VAULT_POINTS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-xs"
              title="View on Starkscan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* OlymPay Vault Contract */}
        <div className="flex items-center justify-between">
          <span className="text-base-content/70">OlymPay Vault Contract:</span>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-base-300 px-2 py-1 rounded">
              {CONTRACT_ADDRESSES.OLYMPAY_VAULT.slice(0, 10)}...
            </code>
            <a
              href={`https://sepolia.starkscan.co/contract/${CONTRACT_ADDRESSES.OLYMPAY_VAULT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-xs"
              title="View on Starkscan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-base-content/50">
        <p>Network: Starknet Sepolia Testnet</p>
        <p>All contracts are verified on <a href="https://sepolia.starkscan.co/" target="_blank" rel="noopener noreferrer" className="link link-primary">StarkScan</a></p>
      </div>
    </div>
  )
}

export default ContractInfo
