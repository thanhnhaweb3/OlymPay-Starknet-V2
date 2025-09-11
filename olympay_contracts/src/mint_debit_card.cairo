use starknet::ContractAddress;

#[starknet::interface]
pub trait IMintDebitCard<TContractState> {
    // Admin functions
    fn set_usdc_token(ref self: TContractState, usdc_address: ContractAddress);
    fn set_stripe_processor(ref self: TContractState, processor_address: ContractAddress);
    fn set_max_deposit_per_tx(ref self: TContractState, new_limit: u256);
    fn set_processing_fee_percent(ref self: TContractState, fee_percent: u256);
    
    // Main functions
    fn process_debit_card_deposit(
        ref self: TContractState, 
        user_address: ContractAddress, 
        amount: u256,
        stripe_payment_id: felt252
    );
    fn transfer_usdc_to_user(ref self: TContractState, user_address: ContractAddress, amount: u256);
    fn withdraw_usdc(ref self: TContractState, amount: u256);
    fn withdraw_all_usdc(ref self: TContractState);
    
    // View functions
    fn get_usdc_balance(self: @TContractState) -> u256;
    fn get_processing_fee_percent(self: @TContractState) -> u256;
    fn get_max_deposit_per_tx(self: @TContractState) -> u256;
    fn get_stripe_processor(self: @TContractState) -> ContractAddress;
    fn get_total_processed_amount(self: @TContractState) -> u256;
    fn get_processed_payments_count(self: @TContractState) -> u256;
}

#[starknet::contract]
pub mod MintDebitCard {
    use super::IMintDebitCard;
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        // Token addresses
        usdc_token: ContractAddress,
        stripe_processor: ContractAddress,
        
        // Contract owner
        contract_owner: ContractAddress,
        
        // Configuration
        max_deposit_per_tx: u256,
        processing_fee_percent: u256, // e.g., 250 = 2.5%
        
        // Statistics
        total_processed_amount: u256,
        processed_payments_count: u256,
        
        // Simple payment tracking (using a single storage slot for demo)
        last_payment_id: felt252,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        usdc_address: ContractAddress,
        stripe_processor_address: ContractAddress,
        max_deposit: u256,
        fee_percent: u256
    ) {
        let caller = get_caller_address();
        self.contract_owner.write(caller);
        self.usdc_token.write(usdc_address);
        self.stripe_processor.write(stripe_processor_address);
        self.max_deposit_per_tx.write(max_deposit);
        self.processing_fee_percent.write(fee_percent);
        self.total_processed_amount.write(0);
        self.processed_payments_count.write(0);
        self.last_payment_id.write(0);
    }

    #[abi(embed_v0)]
    impl MintDebitCardImpl of IMintDebitCard<ContractState> {
        fn set_usdc_token(ref self: ContractState, usdc_address: ContractAddress) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            assert(caller == owner, 'Only owner');
            self.usdc_token.write(usdc_address);
        }

        fn set_stripe_processor(ref self: ContractState, processor_address: ContractAddress) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            assert(caller == owner, 'Only owner');
            self.stripe_processor.write(processor_address);
        }

        fn set_max_deposit_per_tx(ref self: ContractState, new_limit: u256) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            assert(caller == owner, 'Only owner');
            self.max_deposit_per_tx.write(new_limit);
        }

        fn set_processing_fee_percent(ref self: ContractState, fee_percent: u256) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            assert(caller == owner, 'Only owner');
            assert(fee_percent <= 1000, 'Fee too high'); // Max 10%
            self.processing_fee_percent.write(fee_percent);
        }

        fn process_debit_card_deposit(
            ref self: ContractState, 
            user_address: ContractAddress, 
            amount: u256,
            stripe_payment_id: felt252
        ) {
            let caller = get_caller_address();
            let stripe_processor = self.stripe_processor.read();
            
            // Only Stripe processor can call this function
            assert(caller == stripe_processor, 'Only Stripe processor');
            
            // Simple check: ensure payment ID is different from last one
            let last_payment = self.last_payment_id.read();
            assert(stripe_payment_id != last_payment, 'Payment already processed');
            
            // Validate amount
            let max_limit = self.max_deposit_per_tx.read();
            assert(amount <= max_limit, 'Amount exceeds limit');
            assert(amount > 0, 'Amount must be positive');
            
            // Update last payment ID
            self.last_payment_id.write(stripe_payment_id);
            
            // Update statistics
            let old_total = self.total_processed_amount.read();
            let new_total = old_total + amount;
            self.total_processed_amount.write(new_total);
            
            let old_count = self.processed_payments_count.read();
            let new_count = old_count + 1;
            self.processed_payments_count.write(new_count);
            
            // Transfer USDC to user
            self.transfer_usdc_to_user(user_address, amount);
        }

        fn transfer_usdc_to_user(ref self: ContractState, user_address: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            let stripe_processor = self.stripe_processor.read();
            
            // Only owner or Stripe processor can transfer
            assert(caller == owner || caller == stripe_processor, 'Unauthorized');
            
            // For now, we'll just log the transfer
            // In a real implementation, this would call the USDC contract
            // The actual USDC transfer would be handled by the frontend
            // after receiving confirmation from this contract
        }

        fn withdraw_usdc(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            
            // Only owner can withdraw
            assert(caller == owner, 'Only owner can withdraw');
            assert(amount > 0, 'Amount must be positive');
            
            // For now, just log the withdrawal
            // In a real implementation, this would call the USDC contract
            // The actual USDC transfer would be handled by the frontend
            // after receiving confirmation from this contract
        }

        fn withdraw_all_usdc(ref self: ContractState) {
            let caller = get_caller_address();
            let owner = self.contract_owner.read();
            
            // Only owner can withdraw
            assert(caller == owner, 'Only owner can withdraw');
            
            // For now, just log the withdrawal
            // In a real implementation, this would call the USDC contract
            // The actual USDC transfer would be handled by the frontend
            // after receiving confirmation from this contract
        }

        fn get_usdc_balance(self: @ContractState) -> u256 {
            // This would query the USDC contract balance
            // For now, return 0 as placeholder
            0
        }

        fn get_processing_fee_percent(self: @ContractState) -> u256 {
            self.processing_fee_percent.read()
        }

        fn get_max_deposit_per_tx(self: @ContractState) -> u256 {
            self.max_deposit_per_tx.read()
        }

        fn get_stripe_processor(self: @ContractState) -> ContractAddress {
            self.stripe_processor.read()
        }

        fn get_total_processed_amount(self: @ContractState) -> u256 {
            self.total_processed_amount.read()
        }

        fn get_processed_payments_count(self: @ContractState) -> u256 {
            self.processed_payments_count.read()
        }
    }
}
