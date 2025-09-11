"use client";

import { useState, useEffect } from 'react'
import { AccountInterface, ProviderInterface } from 'starknet'
import WalletConnectV2 from './WalletConnectV2'
import WalletDebug from './WalletDebug'
import BalanceDisplay from './BalanceDisplay'
import SwapRouter from '@/utils/swapRouter'
import { CONTRACT_ADDRESSES, TOKEN_INFO } from '@/config/contracts'
import { ArrowsUpDownIcon, CurrencyDollarIcon, BanknotesIcon } from '@heroicons/react/24/outline'

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  icon: React.ReactNode;
}

const Marketplace = () => {
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [provider, setProvider] = useState<ProviderInterface | null>(null);
  const [swapRouter, setSwapRouter] = useState<SwapRouter | null>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([
    {
      address: TOKEN_INFO.USDC.address,
      symbol: TOKEN_INFO.USDC.symbol,
      name: TOKEN_INFO.USDC.name,
      decimals: TOKEN_INFO.USDC.decimals,
      balance: "0",
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
    },
    {
      address: TOKEN_INFO.SPIKO.address,
      symbol: TOKEN_INFO.SPIKO.symbol,
      name: TOKEN_INFO.SPIKO.name,
      decimals: TOKEN_INFO.SPIKO.decimals,
      balance: "0",
      icon: <BanknotesIcon className="w-6 h-6" />,
    },
  ]);
  const [fromToken, setFromToken] = useState(0);
  const [toToken, setToToken] = useState(1);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(1.02);

  useEffect(() => {
    if (account && provider) {
      const router = new SwapRouter(account, provider);
      setSwapRouter(router);
      loadBalances();
      loadExchangeRate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, provider]);

  const loadExchangeRate = async () => {
    if (swapRouter) {
      try {
        const rate = await swapRouter.getExchangeRate();
        setExchangeRate(rate);
      } catch (err) {
        console.error("Error loading exchange rate:", err);
      }
    }
  };

  const loadBalances = async () => {
    if (!account || !swapRouter) return;

    try {
      const updatedTokens = await Promise.all(
        tokens.map(async (token) => {
          try {
            const balance = await swapRouter.getTokenBalance(
              token.address,
              account.address
            );
            return {
              ...token,
              balance: (Number(balance) / Math.pow(10, token.decimals)).toFixed(
                6
              ),
            };
          } catch (err) {
            console.error(`Error loading balance for ${token.symbol}:`, err);
            return token;
          }
        })
      );
      setTokens(updatedTokens);
    } catch (err) {
      console.error("Error loading balances:", err);
    }
  };

  const handleAmountChange = (value: string, isFrom: boolean) => {
    if (isFrom) {
      setFromAmount(value);
      if (value && !isNaN(Number(value))) {
        const calculated = (Number(value) * exchangeRate).toFixed(6);
        setToAmount(calculated);
      } else {
        setToAmount("");
      }
    } else {
      setToAmount(value);
      if (value && !isNaN(Number(value))) {
        const calculated = (Number(value) / exchangeRate).toFixed(6);
        setFromAmount(calculated);
      } else {
        setFromAmount("");
      }
    }
  };

  const handleSwap = async () => {
    if (!account || !swapRouter || !fromAmount || !toAmount) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fromTokenInfo = tokens[fromToken];
      const toTokenInfo = tokens[toToken];

      // Check allowance first
      const allowance = await swapRouter.checkAllowance(
        fromTokenInfo.address,
        account.address
      );
      const amountIn = (
        Number(fromAmount) * Math.pow(10, fromTokenInfo.decimals)
      ).toString();

      if (Number(allowance) < Number(amountIn)) {
        // Approve tokens first
        const approveResult = await swapRouter.approveToken(
          fromTokenInfo.address,
          amountIn
        );
        if (!approveResult.success) {
          setError(approveResult.error || "Failed to approve tokens");
          return;
        }
      }

      // Execute swap
      const swapResult = await swapRouter.executeSwap({
        tokenIn: fromTokenInfo.address,
        tokenOut: toTokenInfo.address,
        amountIn: fromAmount,
        slippageTolerance: 5, // 5% slippage
      });

      if (swapResult.success) {
        setSuccess(
          `Swap successful! Transaction: ${swapResult.transactionHash}`
        );
        setFromAmount("");
        setToAmount("");

        // Reload balances
        setTimeout(() => {
          loadBalances();
        }, 2000);
      } else {
        setError(swapResult.error || "Failed to execute swap");
      }
    } catch (err) {
      console.error("Error executing swap:", err);
      setError("Failed to execute swap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Olympay Marketplace
          </h1>
          <p className="text-xl text-base-content/70">
            Trade USDC and Spiko US T-Bills seamlessly
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletConnectV2
            onAccountChange={setAccount}
            onProviderChange={setProvider}
          />
        </div>

        {/* Debug Info */}
        <div className="mb-8">
          <WalletDebug />
        </div>

        {account && (
          <>
            {/* Token Balances */}
            <div className="mb-8">
              <BalanceDisplay account={account} provider={provider} />
            </div>

            {/* Swap Interface */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Swap Tokens</h2>

                {/* From Token */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text text-lg font-medium">From</span>
                  </label>
                  <div className="flex space-x-2">
                    <select
                      className="select select-bordered flex-1"
                      value={fromToken}
                      onChange={(e) => setFromToken(Number(e.target.value))}
                    >
                      {tokens.map((token, index) => (
                        <option key={index} value={index}>
                          {token.symbol} - {token.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="input input-bordered flex-1"
                      value={fromAmount}
                      onChange={(e) => handleAmountChange(e.target.value, true)}
                    />
                  </div>
                  <div className="text-sm text-base-content/70 mt-1">
                    Balance: {tokens[fromToken]?.balance}{" "}
                    {tokens[fromToken]?.symbol}
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center my-4">
                  <button
                    onClick={switchTokens}
                    className="btn btn-circle btn-outline"
                  >
                    <ArrowsUpDownIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* To Token */}
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text text-lg font-medium">To</span>
                  </label>
                  <div className="flex space-x-2">
                    <select
                      className="select select-bordered flex-1"
                      value={toToken}
                      onChange={(e) => setToToken(Number(e.target.value))}
                    >
                      {tokens.map((token, index) => (
                        <option key={index} value={index}>
                          {token.symbol} - {token.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="input input-bordered flex-1"
                      value={toAmount}
                      onChange={(e) =>
                        handleAmountChange(e.target.value, false)
                      }
                    />
                  </div>
                  <div className="text-sm text-base-content/70 mt-1">
                    Balance: {tokens[toToken]?.balance}{" "}
                    {tokens[toToken]?.symbol}
                  </div>
                </div>

                {/* Exchange Rate */}
                <div className="bg-base-300 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-base-content/70">
                      Exchange Rate
                    </span>
                    <span className="font-medium">
                      1 {tokens[fromToken]?.symbol} = {exchangeRate}{" "}
                      {tokens[toToken]?.symbol}
                    </span>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="alert alert-error mb-4">
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="alert alert-success mb-4">
                    <span>{success}</span>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  disabled={isLoading || !fromAmount || !toAmount}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Swapping...
                    </>
                  ) : (
                    "Swap Tokens"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
