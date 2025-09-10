'use client'

import { ReactNode } from 'react'
import { StarknetConfig, publicProvider } from '@starknet-react/core'
import { sepolia } from '@starknet-react/chains'

interface StarknetProviderProps {
  children: ReactNode
}

const StarknetProvider = ({ children }: StarknetProviderProps) => {
  const chains = [sepolia]
  const provider = publicProvider()

  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}

export default StarknetProvider
