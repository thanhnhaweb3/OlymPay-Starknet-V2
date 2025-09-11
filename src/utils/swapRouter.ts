import { AccountInterface, ProviderInterface, Contract, Call } from "starknet";
import {
  CONTRACT_ADDRESSES,
  DEFAULT_EXCHANGE_RATE,
  DEFAULT_SLIPPAGE,
} from "@/config/contracts";

// ERC20 ABI
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "felt" }],
    outputs: [{ name: "balance", type: "Uint256" }],
    stateMutability: "view",
  },
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "recipient", type: "felt" },
      { name: "amount", type: "Uint256" },
    ],
    outputs: [{ name: "success", type: "felt" }],
    stateMutability: "external",
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "felt" },
      { name: "amount", type: "Uint256" },
    ],
    outputs: [{ name: "success", type: "felt" }],
    stateMutability: "external",
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "felt" },
      { name: "spender", type: "felt" },
    ],
    outputs: [{ name: "remaining", type: "Uint256" }],
    stateMutability: "view",
  },
];

// Vault ABI
export const VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    inputs: [
      { name: "token", type: "felt" },
      { name: "amount", type: "Uint256" },
    ],
    outputs: [],
    stateMutability: "external",
  },
  {
    name: "withdraw",
    type: "function",
    inputs: [
      { name: "token", type: "felt" },
      { name: "amount", type: "Uint256" },
    ],
    outputs: [],
    stateMutability: "external",
  },
  {
    name: "swap",
    type: "function",
    inputs: [
      { name: "token_in", type: "felt" },
      { name: "token_out", type: "felt" },
      { name: "amount_in", type: "Uint256" },
      { name: "min_amount_out", type: "Uint256" },
    ],
    outputs: [],
    stateMutability: "external",
  },
  {
    name: "get_exchange_rate",
    type: "function",
    inputs: [],
    outputs: [{ name: "rate", type: "Uint256" }],
    stateMutability: "view",
  },
];

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance: number; // in percentage (e.g., 5 for 5%)
}

export interface SwapResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  amountOut?: string;
}

export class SwapRouter {
  private account: AccountInterface;
  private provider: ProviderInterface;
  private vaultContract: Contract;

  constructor(account: AccountInterface, provider: ProviderInterface) {
    this.account = account;
    this.provider = provider;
    this.vaultContract = new Contract(
      VAULT_ABI,
      CONTRACT_ADDRESSES.VAULT,
      provider
    );
  }

  /**
   * Get token balance for a user
   */
  async getTokenBalance(
    tokenAddress: string,
    userAddress: string
  ): Promise<any> {
    try {
      const tokenContract = new Contract(
        ERC20_ABI,
        tokenAddress,
        this.provider
      );
      const balance = await tokenContract.balanceOf(userAddress);
      if (typeof window !== "undefined") {
        console.log(
          "Raw balance from contract:",
          balance,
          "Type:",
          typeof balance
        );
      }
      return balance;
    } catch (error) {
      console.error("Error getting token balance:", error);
      return { low: 0, high: 0 };
    }
  }

  /**
   * Get current exchange rate from vault
   */
  async getExchangeRate(): Promise<number> {
    try {
      const rate = await this.vaultContract.get_exchange_rate();
      return Number(rate) / 100; // Convert from basis points
    } catch (error) {
      console.error("Error getting exchange rate:", error);
      return DEFAULT_EXCHANGE_RATE; // Default rate
    }
  }

  /**
   * Calculate amount out for a given amount in
   */
  async calculateAmountOut(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    tokenInDecimals: number,
    tokenOutDecimals: number
  ): Promise<string> {
    try {
      const rate = await this.getExchangeRate();
      const amountInNumber = Number(amountIn);
      const amountOutNumber = amountInNumber * rate;

      // Adjust for decimals
      const decimalsDiff = tokenOutDecimals - tokenInDecimals;
      const adjustedAmount = amountOutNumber * Math.pow(10, decimalsDiff);

      return adjustedAmount.toFixed(6);
    } catch (error) {
      console.error("Error calculating amount out:", error);
      return "0";
    }
  }

  /**
   * Check if user has sufficient allowance for vault
   */
  async checkAllowance(
    tokenAddress: string,
    userAddress: string
  ): Promise<string> {
    try {
      const tokenContract = new Contract(
        ERC20_ABI,
        tokenAddress,
        this.provider
      );
      const allowance = await tokenContract.allowance(
        userAddress,
        CONTRACT_ADDRESSES.VAULT
      );
      return allowance.toString();
    } catch (error) {
      console.error("Error checking allowance:", error);
      return "0";
    }
  }

  /**
   * Approve vault to spend tokens
   */
  async approveToken(
    tokenAddress: string,
    amount: string
  ): Promise<SwapResult> {
    try {
      const tokenContract = new Contract(ERC20_ABI, tokenAddress, this.account);
      const result = await tokenContract.approve(
        CONTRACT_ADDRESSES.VAULT,
        amount
      );

      return {
        success: true,
        transactionHash: result.transaction_hash,
      };
    } catch (error) {
      console.error("Error approving token:", error);
      return {
        success: false,
        error: "Failed to approve token",
      };
    }
  }

  /**
   * Execute a swap through the vault
   */
  async executeSwap(params: SwapParams): Promise<SwapResult> {
    try {
      const { tokenIn, tokenOut, amountIn, slippageTolerance } = params;

      // Calculate expected amount out
      const tokenInInfo = this.getTokenInfo(tokenIn);
      const tokenOutInfo = this.getTokenInfo(tokenOut);

      const amountOut = await this.calculateAmountOut(
        tokenIn,
        tokenOut,
        amountIn,
        tokenInInfo.decimals,
        tokenOutInfo.decimals
      );

      // Calculate minimum amount out with slippage
      const minAmountOut = (
        (Number(amountOut) * (100 - slippageTolerance)) /
        100
      ).toString();

      // Convert amounts to proper format
      const amountInFormatted = (
        Number(amountIn) * Math.pow(10, tokenInInfo.decimals)
      ).toString();
      const minAmountOutFormatted = (
        Number(minAmountOut) * Math.pow(10, tokenOutInfo.decimals)
      ).toString();

      // Execute swap
      const result = await this.vaultContract.swap(
        tokenIn,
        tokenOut,
        amountInFormatted,
        minAmountOutFormatted
      );

      return {
        success: true,
        transactionHash: result.transaction_hash,
        amountOut,
      };
    } catch (error) {
      console.error("Error executing swap:", error);
      return {
        success: false,
        error: "Failed to execute swap",
      };
    }
  }

  /**
   * Deposit tokens to vault
   */
  async depositToken(
    tokenAddress: string,
    amount: string
  ): Promise<SwapResult> {
    try {
      const tokenInfo = this.getTokenInfo(tokenAddress);
      const amountFormatted = (
        Number(amount) * Math.pow(10, tokenInfo.decimals)
      ).toString();

      const result = await this.vaultContract.deposit(
        tokenAddress,
        amountFormatted
      );

      return {
        success: true,
        transactionHash: result.transaction_hash,
      };
    } catch (error) {
      console.error("Error depositing token:", error);
      return {
        success: false,
        error: "Failed to deposit token",
      };
    }
  }

  /**
   * Withdraw tokens from vault
   */
  async withdrawToken(
    tokenAddress: string,
    amount: string
  ): Promise<SwapResult> {
    try {
      const tokenInfo = this.getTokenInfo(tokenAddress);
      const amountFormatted = (
        Number(amount) * Math.pow(10, tokenInfo.decimals)
      ).toString();

      const result = await this.vaultContract.withdraw(
        tokenAddress,
        amountFormatted
      );

      return {
        success: true,
        transactionHash: result.transaction_hash,
      };
    } catch (error) {
      console.error("Error withdrawing token:", error);
      return {
        success: false,
        error: "Failed to withdraw token",
      };
    }
  }

  /**
   * Get token information
   */
  private getTokenInfo(tokenAddress: string): TokenInfo {
    if (tokenAddress === CONTRACT_ADDRESSES.USDC) {
      return {
        address: tokenAddress,
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      };
    } else if (tokenAddress === CONTRACT_ADDRESSES.SPIKO_TBILLS) {
      return {
        address: tokenAddress,
        symbol: "SPIKO",
        name: "Spiko US T-Bills",
        decimals: 18,
      };
    } else if (tokenAddress === CONTRACT_ADDRESSES.STRK) {
      return {
        address: tokenAddress,
        symbol: "STRK",
        name: "Starknet Token",
        decimals: 18,
      };
    } else if (tokenAddress === CONTRACT_ADDRESSES.ETH) {
      return {
        address: tokenAddress,
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
      };
    }

    throw new Error(`Unknown token address: ${tokenAddress}`);
  }

  /**
   * Get all supported tokens
   */
  getSupportedTokens(): TokenInfo[] {
    return [
      {
        address: CONTRACT_ADDRESSES.USDC,
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      {
        address: CONTRACT_ADDRESSES.SPIKO_TBILLS,
        symbol: "SPIKO",
        name: "Spiko US T-Bills",
        decimals: 18,
      },
      {
        address: CONTRACT_ADDRESSES.STRK,
        symbol: "STRK",
        name: "Starknet Token",
        decimals: 18,
      },
      {
        address: CONTRACT_ADDRESSES.ETH,
        symbol: "ETH",
        name: "Ethereum",
        decimals: 18,
      },
    ];
  }
}

export default SwapRouter;
