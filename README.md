# Olympay - Revolutionary DeFi Infrastructure on Starknet

> **Bridge the Future** - A comprehensive StableCoin payment infrastructure with seamless on-ramp, off-ramp, cross-chain transfers, and Real-World Asset (RWA) tokenization built on Starknet.

## 🚀 Solution Overview

Olympay is a next-generation decentralized finance (DeFi) platform that revolutionizes how users interact with stablecoins and real-world assets. Built on Starknet's cutting-edge zero-knowledge proof technology, Olympay provides:

- **Fast & Secure Transactions**: Leveraging Starknet's ZK-proof technology for instant finality
- **Low-Cost Operations**: Minimal transaction fees compared to Ethereum mainnet
- **Seamless User Experience**: Intuitive interface for both beginners and advanced users
- **Real-World Asset Integration**: Tokenization of traditional financial instruments

## 🏗️ Architecture

### Frontend (Next.js Application)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS + DaisyUI for modern UI components
- **Wallet Integration**: Starknet React hooks with multi-wallet support
- **State Management**: React Context for wallet and application state

### Smart Contracts (Cairo 2.0)
- **VaultPoints Token**: ERC20-compatible token representing vault shares
- **OlymPayVault**: Main vault contract managing USDC deposits and VaultPoints minting
- **Deployment**: Starknet Sepolia testnet with verified contracts

## ✨ Key Features Implemented

### 🔄 On-Ramp Functionality
- **USDC Deposit**: Users can deposit USDC into the vault
- **VaultPoints Minting**: Automatic minting of VaultPoints based on deposit amount
- **Real-time Balance Tracking**: Live updates of user and vault balances
- **Transaction History**: Complete transaction tracking with Starkscan integration

### 💰 Balance Management
- **Multi-Token Support**: USDC, VaultPoints, STRK, ETH balance display
- **Real-time Updates**: Automatic balance refresh after transactions
- **Cross-Contract Integration**: Seamless interaction between multiple contracts

### 🏪 Marketplace Integration
- **Token Trading**: Buy and sell various tokens
- **Price Discovery**: Real-time price information
- **Liquidity Management**: Efficient token exchange mechanisms

### 🔗 Wallet Connectivity
- **Multi-Wallet Support**: Argent X, Braavos, OKX, Rabby, and more
- **Auto-Connect**: Seamless wallet reconnection
- **Error Handling**: Comprehensive error management and user feedback

## 🛠️ Technical Implementation

### Smart Contract Architecture
```cairo
// VaultPoints Contract
- ERC20-compatible token
- Minting and burning functionality
- Owner-based access control
- Total supply tracking

// OlymPayVault Contract  
- USDC deposit management
- VaultPoints minting trigger
- Yield generation logic
- Maximum deposit limits
```

### Frontend Components
```
src/
├── app/
│   ├── onramp/          # On-ramp functionality
│   ├── balance/         # Balance management
│   ├── marketplace/     # Trading interface
│   └── about/           # Company information
├── components/
│   ├── OnRampContent.tsx    # Core on-ramp logic
│   ├── WalletConnectV2.tsx  # Wallet integration
│   ├── BalanceDisplay.tsx   # Balance visualization
│   └── StarknetProvider.tsx # Context provider
└── config/
    └── contracts.ts     # Contract addresses & ABIs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Starknet-compatible wallet (Argent X, Braavos, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thanhnhaweb3/OlymPay-Starknet-V2.git
   cd OlymPay-Starknet-V2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Smart Contract Development

1. **Navigate to contracts directory**
   ```bash
   cd olympay_contracts
   ```

2. **Build contracts**
   ```bash
   scarb build
   ```

3. **Run tests**
   ```bash
   scarb test
   ```

## 📊 Deployed Contracts

### Starknet Sepolia Testnet

| Contract | Address | Purpose |
|----------|---------|---------|
| **VaultPoints** | `0x04a438e74431af323aa014efb79849143bce54c300efbdb6d2447361be2aa1cd` | ERC20 token for vault shares |
| **OlymPayVault** | `0x02ff5b07bc8c99d18770e4fb5ee7c7874629741f274bfef3a613911291efef88` | Main vault contract |
| **USDC** | `0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080` | USDC token on Sepolia |

### Contract Verification
All contracts are verified on [Starkscan](https://sepolia.starkscan.co/):
- [VaultPoints Contract](https://sepolia.starkscan.co/contract/0x04a438e74431af323aa014efb79849143bce54c300efbdb6d2447361be2aa1cd)
- [OlymPayVault Contract](https://sepolia.starkscan.co/contract/0x02ff5b07bc8c99d18770e4fb5ee7c7874629741f274bfef3a613911291efef88)

## 🔧 Configuration

### Environment Setup
The application is configured for Starknet Sepolia testnet by default. Key configurations:

```typescript
// src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  USDC: '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080',
  VAULT_POINTS: '0x04a438e74431af323aa014efb79849143bce54c300efbdb6d2447361be2aa1cd',
  OLYMPAY_VAULT: '0x02ff5b07bc8c99d18770e4fb5ee7c7874629741f274bfef3a613911291efef88'
}
```

### Wallet Configuration
Supported wallets are automatically detected and configured:
- Argent X
- Braavos  
- OKX Wallet
- Rabby Wallet
- And more via `get-starknet-core`

## 🎯 Usage Guide

### On-Ramp Process
1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Check Balance**: View your USDC balance and vault capacity
3. **Enter Amount**: Specify the USDC amount to deposit (0.01 - 100 USDC)
4. **Approve Transaction**: Approve USDC spending for the vault
5. **Deposit**: Complete the deposit and receive VaultPoints

### Balance Management
- **Real-time Updates**: Balances update automatically after transactions
- **Multi-Token View**: See all your token balances in one place
- **Transaction History**: Track all your interactions with the platform

## 🛡️ Security Features

- **Smart Contract Audits**: All contracts follow best practices
- **Access Control**: Owner-based permissions for critical functions
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Handling**: Graceful error handling with user-friendly messages

## 🚀 Performance Optimizations

- **Lazy Loading**: Components load only when needed
- **Optimized Builds**: Tree-shaking and code splitting
- **Fast Transactions**: Starknet's ZK-proof technology for instant finality
- **Responsive Design**: Mobile-first approach with smooth animations

## 🔮 Future Roadmap

- [ ] **Cross-Chain Integration**: CCIP-based cross-chain transfers
- [ ] **Real-World Assets**: T-Bills and other RWA tokenization
- [ ] **Advanced Trading**: DEX integration and liquidity pools
- [ ] **Mobile App**: Native mobile application
- [ ] **Governance**: DAO-based platform governance

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [Olympay Platform](https://olympay.fi)
- **Documentation**: [GitHub Wiki](https://github.com/thanhnhaweb3/OlymPay-Starknet-V2/wiki)
- **Starkscan**: [Contract Explorer](https://sepolia.starkscan.co/)
- **Starknet**: [Official Documentation](https://docs.starknet.io/)

## 📞 Support

- **Discord**: [Join our community](https://discord.gg/olympay)
- **Twitter**: [@OlympayFi](https://twitter.com/OlympayFi)
- **Email**: support@olympay.fi

---

**Built with ❤️ on Starknet** | **Bridge the Future** 🌉