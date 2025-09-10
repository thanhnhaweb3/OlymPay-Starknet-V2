'use client'

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface } from 'starknet'
import SimpleBalanceDisplay from '@/components/SimpleBalanceDisplay'
import WalletConnectV2 from '@/components/WalletConnectV2'
import WalletDebug from '@/components/WalletDebug'

export default function BalancePage() {
  const [account, setAccount] = useState<AccountInterface | null>(null)
  const [provider, setProvider] = useState<ProviderInterface | null>(null)

  // Remove automatic wallet connection check to avoid client-side errors
  // Wallet connection will be handled by WalletConnectV2 component

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Số dư Token
          </h1>
          <p className="text-xl text-base-content/70">
            Xem số dư USDC và US T-Bills Money của bạn
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletConnectV2 
            onAccountChange={setAccount}
            onProviderChange={setProvider}
          />
        </div>

        {/* Debug Info */}
        <div className="mb-8">
          <WalletDebug />
        </div>

        {/* Balance Display */}
        <div className="max-w-2xl mx-auto">
          <SimpleBalanceDisplay account={account} provider={provider} />
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-primary">💵 USDC</h3>
              <p className="text-base-content/70">
                USD Coin là stablecoin được hỗ trợ bởi đô la Mỹ, 
                được sử dụng rộng rãi trong DeFi và thanh toán.
              </p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">Stablecoin</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-secondary">🏦 US T-Bills Money</h3>
              <p className="text-base-content/70">
                Spiko US T-Bills là token đại diện cho trái phiếu kho bạc Mỹ, 
                mang lại lợi nhuận ổn định và an toàn.
              </p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">T-Bills</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-warning">⚡ STRK</h3>
              <p className="text-base-content/70">
                Starknet Token là native token của mạng Starknet, 
                được sử dụng để thanh toán gas fees và governance.
              </p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">Native Token</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-accent">🔷 ETH</h3>
              <p className="text-base-content/70">
                Ethereum trên Starknet là wrapped ETH, 
                cho phép sử dụng ETH trong hệ sinh thái Starknet.
              </p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">Wrapped ETH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-info/10 border-info/20 shadow-xl mt-8">
          <div className="card-body">
            <h3 className="card-title text-info">📋 Hướng dẫn</h3>
            <div className="space-y-2 text-base-content/80">
              <p>1. Kết nối ví Traavos hoặc Argent X của bạn</p>
              <p>2. Đảm bảo bạn đang sử dụng mạng Sepolia testnet</p>
              <p>3. Số dư sẽ được hiển thị tự động sau khi kết nối ví</p>
              <p>4. Nhấn nút "Làm mới" để cập nhật số dư mới nhất</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
