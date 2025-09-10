use starknet::ContractAddress;

#[starknet::interface]
pub trait IVaultPoints<TContractState> {
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256);
    fn burn(ref self: TContractState, from: ContractAddress, amount: u256);
    fn get_balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn get_total_supply(self: @TContractState) -> u256;
}

#[starknet::contract]
pub mod VaultPoints {
    use super::IVaultPoints;
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        total_supply: u256,
        contract_owner: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        let caller = get_caller_address();
        self.contract_owner.write(caller);
        self.total_supply.write(0);
    }

    #[abi(embed_v0)]
    impl VaultPointsImpl of IVaultPoints<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            assert(caller == owner, 'Only owner');

            let old_supply = self.total_supply.read();
            let new_supply = old_supply + amount;
            self.total_supply.write(new_supply);
        }

        fn burn(ref self: ContractState, from: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            assert(caller == owner, 'Only owner');

            let old_supply = self.total_supply.read();
            let new_supply = old_supply - amount;
            self.total_supply.write(new_supply);
        }

        fn get_balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            // Simplified - return 0 for now
            0
        }

        fn get_total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }
    }
}
