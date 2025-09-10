// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  // USDC on Sepolia (testnet) - Updated correct address
  USDC: '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080',
  
  // Our deployed contracts
  VAULT_POINTS: '0x04a438e74431af323aa014efb79849143bce54c300efbdb6d2447361be2aa1cd',
  OLYMPAY_VAULT: '0x02ff5b07bc8c99d18770e4fb5ee7c7874629741f274bfef3a613911291efef88',
  VAULT: '0x02ff5b07bc8c99d18770e4fb5ee7c7874629741f274bfef3a613911291efef88', // Same as OLYMPAY_VAULT
  
  // Additional tokens (placeholder addresses for now)
  SPIKO_TBILLS: '0x0000000000000000000000000000000000000000000000000000000000000000',
  STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c7b7f092bf2403c5ef04',
  
  // MintDebitCard contract (placeholder - will be updated after deployment)
  MINT_DEBIT_CARD: '0x0000000000000000000000000000000000000000000000000000000000000000',
  
  // Class hashes
  VAULT_POINTS_CLASS_HASH: '0x59a725d42d056d6a505c4e36d012176332454ce1d1d3b26d6ef77a72ef8bc57',
  OLYMPAY_VAULT_CLASS_HASH: '0x2aef5406910847d9fc471b89ae089fcb8edcd79fdb53a1f9eaa0fc8e60e193b',
  MINT_DEBIT_CARD_CLASS_HASH: '0x3b6c73317ba973503e9768df0837ca4905c7007ed5d503fdf9c0fff05938fe9'
}

// USDC ABI (simplified for our use case)
export const USDC_ABI = [
  {
    "name": "transfer",
    "type": "function",
    "inputs": [
      { "name": "recipient", "type": "felt" },
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [
      { "name": "success", "type": "felt" }
    ],
    "stateMutability": "external"
  },
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [
      { "name": "account", "type": "felt" }
    ],
    "outputs": [
      { "name": "balance", "type": "Uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "name": "transferFrom",
    "type": "function",
    "inputs": [
      { "name": "sender", "type": "felt" },
      { "name": "recipient", "type": "felt" },
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [
      { "name": "success", "type": "felt" }
    ],
    "stateMutability": "external"
  },
  {
    "name": "approve",
    "type": "function",
    "inputs": [
      { "name": "spender", "type": "felt" },
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [
      { "name": "success", "type": "felt" }
    ],
    "stateMutability": "external"
  },
  {
    "name": "allowance",
    "type": "function",
    "inputs": [
      { "name": "owner", "type": "felt" },
      { "name": "spender", "type": "felt" }
    ],
    "outputs": [
      { "name": "remaining", "type": "Uint256" }
    ],
    "stateMutability": "view"
  }
]

// VaultPoints ABI
export const VAULT_POINTS_ABI = [
  {
    "name": "mint",
    "type": "function",
    "inputs": [
      { "name": "to", "type": "felt" },
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [],
    "stateMutability": "external"
  },
  {
    "name": "burn",
    "type": "function",
    "inputs": [
      { "name": "from", "type": "felt" },
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [],
    "stateMutability": "external"
  },
  {
    "name": "get_balance_of",
    "type": "function",
    "inputs": [
      { "name": "account", "type": "felt" }
    ],
    "outputs": [
      { "name": "balance", "type": "Uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "name": "get_total_supply",
    "type": "function",
    "inputs": [],
    "outputs": [
      { "name": "supply", "type": "Uint256" }
    ],
    "stateMutability": "view"
  }
]

// OlymPayVault ABI
export const OLYMPAY_VAULT_ABI = [
  {
    "name": "stake_usdc_in_vault",
    "type": "function",
    "inputs": [
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [],
    "stateMutability": "external"
  },
  {
    "name": "unstake_usdc_from_vault",
    "type": "function",
    "inputs": [
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [],
    "stateMutability": "external"
  },
  {
    "name": "get_yield_balance",
    "type": "function",
    "inputs": [],
    "outputs": [
      { "name": "yield", "type": "Uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "name": "set_max_deposit_per_tx",
    "type": "function",
    "inputs": [
      { "name": "new_limit", "type": "Uint256" }
    ],
    "outputs": [],
    "stateMutability": "external"
  }
]

// Token configuration
export const TOKEN_CONFIG = {
  USDC: {
    address: '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin'
  },
  VAULT_POINTS: {
    address: '0x04a438e74431af323aa014efb79849143bce54c300efbdb6d2447361be2aa1cd',
    decimals: 18,
    symbol: 'VP',
    name: 'Vault Points'
  },
  SPIKO: {
    address: '0x0000000000000000000000000000000000000000000000000000000000000000',
    decimals: 18,
    symbol: 'SPIKO',
    name: 'Spiko T-Bills'
  },
  STRK: {
    address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    decimals: 18,
    symbol: 'STRK',
    name: 'Starknet Token'
  },
  ETH: {
    address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c7b7f092bf2403c5ef04',
    decimals: 18,
    symbol: 'ETH',
    name: 'Ethereum'
  }
}

// MintDebitCard ABI
export const MINT_DEBIT_CARD_ABI = [
  {
    "name": "process_debit_card_deposit",
    "type": "function",
    "inputs": [
      { "name": "user_address", "type": "felt" },
      { "name": "amount", "type": "Uint256" },
      { "name": "stripe_payment_id", "type": "felt" }
    ],
    "outputs": [],
    "stateMutability": "external"
  },
  {
    "name": "transfer_usdc_to_user",
    "type": "function",
    "inputs": [
      { "name": "user_address", "type": "felt" },
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [],
    "stateMutability": "external"
  },
  {
    "name": "get_usdc_balance",
    "type": "function",
    "inputs": [],
    "outputs": [
      { "name": "balance", "type": "Uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "name": "get_processing_fee_percent",
    "type": "function",
    "inputs": [],
    "outputs": [
      { "name": "fee_percent", "type": "Uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "name": "get_max_deposit_per_tx",
    "type": "function",
    "inputs": [],
    "outputs": [
      { "name": "max_deposit", "type": "Uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "name": "get_total_processed_amount",
    "type": "function",
    "inputs": [],
    "outputs": [
      { "name": "total_amount", "type": "Uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "name": "get_processed_payments_count",
    "type": "function",
    "inputs": [],
    "outputs": [
      { "name": "count", "type": "Uint256" }
    ],
    "stateMutability": "view"
  }
]

// Transaction limits
export const LIMITS = {
  MAX_USDC_DEPOSIT: 100, // 100 USDC
  MIN_USDC_DEPOSIT: 0.01 // 0.01 USDC
}

// Legacy exports for backward compatibility
export const TOKEN_INFO = TOKEN_CONFIG
export const DEFAULT_EXCHANGE_RATE = 1.0
export const DEFAULT_SLIPPAGE = 0.5 // 0.5%