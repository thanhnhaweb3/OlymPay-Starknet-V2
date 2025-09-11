// Contract addresses for Sepolia testnet
export const CONTRACT_ADDRESSES = {
  USDC: "0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080",
  SPIKO_TBILLS:
    "0x0644cde05c78a12f5a3c71ab3fd87151db57a74c8db06442228d9c15b161c8ba",
  STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // STRK native token
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH on Starknet
  VAULT: "0x0", // Update this after deploying the vault contract
};

// Network configuration
export const NETWORK_CONFIG = {
  SEPOLIA_RPC_URL: "https://starknet-sepolia.public.blastapi.io",
  CHAIN_ID: "SN_SEPOLIA",
};

// Default exchange rate (1 USDC = 1.02 SPIKO)
export const DEFAULT_EXCHANGE_RATE = 1.02;

// Slippage tolerance (5%)
export const DEFAULT_SLIPPAGE = 5;

// Token information
export const TOKEN_INFO = {
  USDC: {
    address: CONTRACT_ADDRESSES.USDC,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "💵",
  },
  SPIKO: {
    address: CONTRACT_ADDRESSES.SPIKO_TBILLS,
    symbol: "SPIKO",
    name: "Spiko US T-Bills",
    decimals: 18,
    icon: "🏦",
  },
  STRK: {
    address: CONTRACT_ADDRESSES.STRK,
    symbol: "STRK",
    name: "Starknet Token",
    decimals: 18,
    icon: "⚡",
  },
  ETH: {
    address: CONTRACT_ADDRESSES.ETH,
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    icon: "🔷",
  },
};
