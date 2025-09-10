#!/bin/bash

# Setup permissions for address: 0x0691f8fdcaea9cbc08ef1428aea675aa8b28ba09b42774af173b1e7ded63f0eb

PERMISSION_MANAGER="0x03ca9c099f7d0e8e537865ea69dfc9d2a310eebaa7cf5c8dc6d513caa1a7dcff"
TOKEN_CONTRACT="0x006eae897735bbda43c8ae3066e35909ff240594f12c0ad03a8cb88dca300604"
ADDRESS="0x0691f8fdcaea9cbc08ef1428aea675aa8b28ba09b42774af173b1e7ded63f0eb"

echo "Setting up permissions for address: $ADDRESS"

# Grant MINTER_ROLE
echo "Granting MINTER_ROLE..."
sncast --profile myaccount call --contract-address $PERMISSION_MANAGER --function grant_role --calldata 0x8392f301 $ADDRESS

# Grant BURNER_ROLE  
echo "Granting BURNER_ROLE..."
sncast --profile myaccount call --contract-address $PERMISSION_MANAGER --function grant_role --calldata 0x6ac91b80 $ADDRESS

# Grant PAUSER_ROLE
echo "Granting PAUSER_ROLE..."
sncast --profile myaccount call --contract-address $PERMISSION_MANAGER --function grant_role --calldata 0x9c655f8e $ADDRESS

# Grant WHITELISTED_ROLE
echo "Granting WHITELISTED_ROLE..."
sncast --profile myaccount call --contract-address $PERMISSION_MANAGER --function grant_role --calldata 0xf3cf5dc2 $ADDRESS

# Grant WHITELISTER_ROLE
echo "Granting WHITELISTER_ROLE..."
sncast --profile myaccount call --contract-address $PERMISSION_MANAGER --function grant_role --calldata 0xcaddc1d4 $ADDRESS

# Grant REDEMPTION_EXECUTOR_ROLE
echo "Granting REDEMPTION_EXECUTOR_ROLE..."
sncast --profile myaccount call --contract-address $PERMISSION_MANAGER --function grant_role --calldata 0xe466547e $ADDRESS

echo "All permissions granted!"
