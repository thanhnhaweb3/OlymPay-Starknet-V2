use starknet::ContractAddress;

#[starknet::interface]
pub trait IOlymPayVaultV2<TContractState> {
    fn set_max_deposit_per_tx(ref self: TContractState, new_limit: u256);
    fn stake_usdc_in_vault(ref self: TContractState, amount: u256);
    fn unstake_usdc_from_vault(ref self: TContractState, amount: u256);
    fn get_yield_balance(self: @TContractState) -> u256;
}

#[starknet::contract]
pub mod OlymPayVaultV2 {
    use super::IOlymPayVaultV2;
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        usdc_token: ContractAddress,
        vault_points_token: ContractAddress,
        total_yield: u256,
        max_deposit_per_tx: u256,
        contract_owner: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        usdc_address: ContractAddress,
        vault_points_address: ContractAddress,
        max_deposit: u256
    ) {
        let caller = get_caller_address();
        self.contract_owner.write(caller);
        self.usdc_token.write(usdc_address);
        self.vault_points_token.write(vault_points_address);
        self.max_deposit_per_tx.write(max_deposit);
        self.total_yield.write(0);
    }

    #[abi(embed_v0)]
    impl OlymPayVaultV2Impl of IOlymPayVaultV2<ContractState> {
        fn set_max_deposit_per_tx(ref self: ContractState, new_limit: u256) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            assert(caller == owner, 'Only owner');
            self.max_deposit_per_tx.write(new_limit);
        }

        fn stake_usdc_in_vault(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let max_limit = self.max_deposit_per_tx.read();
            assert(amount <= max_limit, 'Amount too large');

            // Auto-yield giả lập 2% mỗi lần stake
            let two_percent = amount * 2 / 100;
            let old_yield = self.total_yield.read();
            let new_yield = old_yield + two_percent;
            self.total_yield.write(new_yield);
        }

        fn unstake_usdc_from_vault(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            // Simplified unstaking logic
        }

        fn get_yield_balance(self: @ContractState) -> u256 {
            self.total_yield.read()
        }
    }
}
