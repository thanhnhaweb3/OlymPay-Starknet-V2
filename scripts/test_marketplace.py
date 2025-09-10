#!/usr/bin/env python3

import asyncio
import json
from starknet_py.contract import Contract
from starknet_py.net import AccountClient, KeyPair
from starknet_py.net.gateway_client import GatewayClient
from starknet_py.net.models import StarknetChainId
from starknet_py.net.signer.stark_curve_signer import StarkCurveSigner

# Configuration
SEPOLIA_RPC_URL = "https://starknet-sepolia.public.blastapi.io"
CHAIN_ID = StarknetChainId.SEPOLIA

# Contract addresses
USDC_ADDRESS = 0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080
SPIKO_TBILLS_ADDRESS = 0x0644cde05c78a12f5a3c71ab3fd87151db57a74c8db06442228d9c15b161c8ba

# ERC20 ABI (simplified)
ERC20_ABI = [
    {
        "name": "balanceOf",
        "type": "function",
        "inputs": [{"name": "account", "type": "felt"}],
        "outputs": [{"name": "balance", "type": "Uint256"}],
        "stateMutability": "view"
    },
    {
        "name": "transfer",
        "type": "function",
        "inputs": [
            {"name": "recipient", "type": "felt"},
            {"name": "amount", "type": "Uint256"}
        ],
        "outputs": [{"name": "success", "type": "felt"}],
        "stateMutability": "external"
    }
]

async def test_marketplace():
    """Test marketplace functionality"""
    
    # You need to provide your private key and account address
    PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"  # Replace with your private key
    ACCOUNT_ADDRESS = "YOUR_ACCOUNT_ADDRESS_HERE"  # Replace with your account address
    
    if PRIVATE_KEY == "YOUR_PRIVATE_KEY_HERE":
        print("Please set your private key and account address in the script")
        return
    
    # Create client
    client = GatewayClient(SEPOLIA_RPC_URL)
    
    # Create key pair and signer
    key_pair = KeyPair.from_private_key(int(PRIVATE_KEY, 16))
    signer = StarkCurveSigner(ACCOUNT_ADDRESS, key_pair, CHAIN_ID)
    
    # Create account client
    account = AccountClient(
        address=ACCOUNT_ADDRESS,
        client=client,
        key_pair=key_pair,
        chain=CHAIN_ID,
    )
    
    print("🔍 Testing Marketplace Functionality")
    print("=" * 50)
    
    # Test 1: Check USDC balance
    print("\n1. Checking USDC balance...")
    try:
        usdc_contract = Contract(ERC20_ABI, USDC_ADDRESS, account)
        usdc_balance = await usdc_contract.balanceOf(ACCOUNT_ADDRESS)
        print(f"   USDC Balance: {usdc_balance}")
    except Exception as e:
        print(f"   ❌ Error checking USDC balance: {e}")
    
    # Test 2: Check Spiko T-Bills balance
    print("\n2. Checking Spiko T-Bills balance...")
    try:
        spiko_contract = Contract(ERC20_ABI, SPIKO_TBILLS_ADDRESS, account)
        spiko_balance = await spiko_contract.balanceOf(ACCOUNT_ADDRESS)
        print(f"   Spiko Balance: {spiko_balance}")
    except Exception as e:
        print(f"   ❌ Error checking Spiko balance: {e}")
    
    # Test 3: Check if contracts are accessible
    print("\n3. Testing contract accessibility...")
    try:
        # Test USDC contract
        usdc_contract = Contract(ERC20_ABI, USDC_ADDRESS, client)
        usdc_balance = await usdc_contract.balanceOf(ACCOUNT_ADDRESS)
        print(f"   ✅ USDC contract accessible")
        
        # Test Spiko contract
        spiko_contract = Contract(ERC20_ABI, SPIKO_TBILLS_ADDRESS, client)
        spiko_balance = await spiko_contract.balanceOf(ACCOUNT_ADDRESS)
        print(f"   ✅ Spiko contract accessible")
        
    except Exception as e:
        print(f"   ❌ Error accessing contracts: {e}")
    
    # Test 4: Check network connectivity
    print("\n4. Testing network connectivity...")
    try:
        block = await client.get_block("latest")
        print(f"   ✅ Network connected - Latest block: {block.block_number}")
    except Exception as e:
        print(f"   ❌ Network connection error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Test Summary:")
    print("   - If all tests pass, your marketplace should work correctly")
    print("   - Make sure you have test tokens in your wallet")
    print("   - Deploy the Vault contract before testing swaps")
    print("   - Update VAULT_ADDRESS in the frontend after deployment")

async def main():
    """Main function"""
    try:
        await test_marketplace()
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
