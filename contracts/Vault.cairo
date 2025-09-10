%lang starknet

from starknet.common.uint256 import Uint256
from starknet.common.cairo_builtins import HashBuiltin

// Storage variables
@storage_var
func owner() -> (res: felt) {
}

@storage_var
func usdc_token() -> (res: felt) {
}

@storage_var
func spiko_token() -> (res: felt) {
}

@storage_var
func exchange_rate() -> (res: Uint256) {
}

@storage_var
func total_usdc_deposited() -> (res: Uint256) {
}

@storage_var
func total_spiko_deposited() -> (res: Uint256) {
}

@storage_var
func user_deposits(user: felt, token: felt) -> (res: Uint256) {
}

// Events
@event
func Deposit(user: felt, token: felt, amount: Uint256) {
}

@event
func Withdraw(user: felt, token: felt, amount: Uint256) {
}

@event
func Swap(user: felt, token_in: felt, token_out: felt, amount_in: Uint256, amount_out: Uint256) {
}

@event
func ExchangeRateUpdated(new_rate: Uint256) {
}

// Constructor
@constructor
func constructor(
    _owner: felt,
    _usdc_token: felt,
    _spiko_token: felt,
    _initial_rate: Uint256
) {
    owner.write(_owner);
    usdc_token.write(_usdc_token);
    spiko_token.write(_spiko_token);
    exchange_rate.write(_initial_rate);
    total_usdc_deposited.write(Uint256(0, 0));
    total_spiko_deposited.write(Uint256(0, 0));
    return ();
}

// Modifiers
func only_owner() {
    let caller = get_caller_address();
    let _owner = owner.read();
    assert caller = _owner;
    return ();
}

// ERC20 interface functions
@view
func name() -> (res: felt) {
    return ('Olympay Vault', 0);
}

@view
func symbol() -> (res: felt) {
    return ('OLY-VAULT', 0);
}

@view
func decimals() -> (res: felt) {
    return (18, 0);
}

@view
func totalSupply() -> (res: Uint256) {
    let usdc_total = total_usdc_deposited.read();
    let spiko_total = total_spiko_deposited.read();
    let (total, _) = uint256_add(usdc_total, spiko_total);
    return (total, 0);
}

@view
func balanceOf(account: felt) -> (res: Uint256) {
    let usdc_balance = user_deposits.read(account, usdc_token.read());
    let spiko_balance = user_deposits.read(account, spiko_token.read());
    let (total, _) = uint256_add(usdc_balance, spiko_balance);
    return (total, 0);
}

// Vault specific functions
@external
func deposit{token: felt, amount: Uint256}() {
    let caller = get_caller_address();
    let current_balance = user_deposits.read(caller, token);
    let (new_balance, _) = uint256_add(current_balance, amount);
    user_deposits.write(caller, token, new_balance);
    
    // Update total deposits
    if token = usdc_token.read() {
        let current_total = total_usdc_deposited.read();
        let (new_total, _) = uint256_add(current_total, amount);
        total_usdc_deposited.write(new_total);
    } else {
        let current_total = total_spiko_deposited.read();
        let (new_total, _) = uint256_add(current_total, amount);
        total_spiko_deposited.write(new_total);
    }
    
    Deposit.emit(caller, token, amount);
    return ();
}

@external
func withdraw{token: felt, amount: Uint256}() {
    let caller = get_caller_address();
    let current_balance = user_deposits.read(caller, token);
    
    // Check if user has enough balance
    let (is_valid, _) = uint256_le(amount, current_balance);
    assert is_valid = 1;
    
    let (new_balance, _) = uint256_sub(current_balance, amount);
    user_deposits.write(caller, token, new_balance);
    
    // Update total deposits
    if token = usdc_token.read() {
        let current_total = total_usdc_deposited.read();
        let (new_total, _) = uint256_sub(current_total, amount);
        total_usdc_deposited.write(new_total);
    } else {
        let current_total = total_spiko_deposited.read();
        let (new_total, _) = uint256_sub(current_total, amount);
        total_spiko_deposited.write(new_total);
    }
    
    Withdraw.emit(caller, token, amount);
    return ();
}

@external
func swap{token_in: felt, token_out: felt, amount_in: Uint256, min_amount_out: Uint256}() {
    let caller = get_caller_address();
    
    // Validate tokens
    let usdc_addr = usdc_token.read();
    let spiko_addr = spiko_token.read();
    assert token_in = usdc_addr or token_in = spiko_addr;
    assert token_out = usdc_addr or token_out = spiko_addr;
    assert token_in != token_out;
    
    // Check user balance
    let user_balance = user_deposits.read(caller, token_in);
    let (is_valid, _) = uint256_le(amount_in, user_balance);
    assert is_valid = 1;
    
    // Calculate amount out based on exchange rate
    let rate = exchange_rate.read();
    let (amount_out, _) = uint256_mul(amount_in, rate);
    let (amount_out_scaled, _) = uint256_div(amount_out, Uint256(100, 0)); // Assuming rate is in basis points
    
    // Check minimum amount out
    let (is_min_valid, _) = uint256_le(min_amount_out, amount_out_scaled);
    assert is_min_valid = 1;
    
    // Update user balances
    let (new_balance_in, _) = uint256_sub(user_balance, amount_in);
    user_deposits.write(caller, token_in, new_balance_in);
    
    let current_balance_out = user_deposits.read(caller, token_out);
    let (new_balance_out, _) = uint256_add(current_balance_out, amount_out_scaled);
    user_deposits.write(caller, token_out, new_balance_out);
    
    // Update total deposits
    if token_in = usdc_addr {
        let current_total = total_usdc_deposited.read();
        let (new_total, _) = uint256_sub(current_total, amount_in);
        total_usdc_deposited.write(new_total);
        
        let current_total_out = total_spiko_deposited.read();
        let (new_total_out, _) = uint256_add(current_total_out, amount_out_scaled);
        total_spiko_deposited.write(new_total_out);
    } else {
        let current_total = total_spiko_deposited.read();
        let (new_total, _) = uint256_sub(current_total, amount_in);
        total_spiko_deposited.write(new_total);
        
        let current_total_out = total_usdc_deposited.read();
        let (new_total_out, _) = uint256_add(current_total_out, amount_out_scaled);
        total_usdc_deposited.write(new_total_out);
    }
    
    Swap.emit(caller, token_in, token_out, amount_in, amount_out_scaled);
    return ();
}

@external
func update_exchange_rate{new_rate: Uint256}() {
    only_owner();
    exchange_rate.write(new_rate);
    ExchangeRateUpdated.emit(new_rate);
    return ();
}

@external
func emergency_withdraw{token: felt, amount: Uint256}() {
    only_owner();
    // Emergency withdrawal function for owner
    return ();
}

// View functions
@view
func get_exchange_rate() -> (res: Uint256) {
    return exchange_rate.read();
}

@view
func get_total_deposits() -> (usdc_total: Uint256, spiko_total: Uint256) {
    return (total_usdc_deposited.read(), total_spiko_deposited.read());
}

@view
func get_user_balance(user: felt, token: felt) -> (res: Uint256) {
    return user_deposits.read(user, token);
}

@view
func get_token_addresses() -> (usdc: felt, spiko: felt) {
    return (usdc_token.read(), spiko_token.read());
}
