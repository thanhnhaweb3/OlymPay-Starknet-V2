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

# Contract addresses (Sepolia testnet)
USDC_ADDRESS = 0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080
SPIKO_TBILLS_ADDRESS = 0x0644cde05c78a12f5a3c71ab3fd87151db57a74c8db06442228d9c15b161c8ba

# Initial exchange rate: 1 USDC = 1.02 SPIKO (102 basis points)
INITIAL_EXCHANGE_RATE = 102

async def deploy_vault():
    """Deploy the Vault contract to Sepolia testnet"""
    
    # You need to provide your private key and account address
    # For security, these should be loaded from environment variables
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
    
    # Read the compiled contract
    with open("contracts/Vault_compiled.json", "r") as f:
        compiled_contract = f.read()
    
    # Deploy the contract
    print("Deploying Vault contract...")
    
    deployment_result = await Contract.deploy_contract(
        account=account,
        class_hash="YOUR_CLASS_HASH_HERE",  # You need to declare the contract first
        abi=json.loads(compiled_contract)["abi"],
        constructor_args=[
            ACCOUNT_ADDRESS,  # owner
            USDC_ADDRESS,     # usdc_token
            SPIKO_TBILLS_ADDRESS,  # spiko_token
            INITIAL_EXCHANGE_RATE  # initial_rate
        ],
        max_fee=int(1e16),  # 0.01 ETH
    )
    
    await deployment_result.wait_for_acceptance()
    
    print(f"Vault contract deployed at: {deployment_result.deployed_contract.address}")
    print(f"Transaction hash: {deployment_result.hash}")
    
    # Save deployment info
    deployment_info = {
        "contract_address": hex(deployment_result.deployed_contract.address),
        "transaction_hash": hex(deployment_result.hash),
        "owner": hex(ACCOUNT_ADDRESS),
        "usdc_token": hex(USDC_ADDRESS),
        "spiko_token": hex(SPIKO_TBILLS_ADDRESS),
        "initial_exchange_rate": INITIAL_EXCHANGE_RATE,
        "network": "sepolia"
    }
    
    with open("deployment_info.json", "w") as f:
        json.dump(deployment_info, f, indent=2)
    
    print("Deployment info saved to deployment_info.json")
    
    return deployment_result.deployed_contract.address

async def main():
    """Main function"""
    try:
        contract_address = await deploy_vault()
        print(f"\n✅ Vault contract successfully deployed!")
        print(f"Contract address: {hex(contract_address)}")
        print("\nNext steps:")
        print("1. Update the VAULT_ADDRESS in Marketplace.tsx with the deployed address")
        print("2. Test the contract functions")
        print("3. Update the frontend to use the new contract address")
        
    except Exception as e:
        print(f"❌ Error deploying contract: {e}")

if __name__ == "__main__":
    asyncio.run(main())
