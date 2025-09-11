"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { AccountInterface, ProviderInterface } from "starknet";
import { getStarknet } from "get-starknet-core";
import {
  WalletIcon,
  ClipboardDocumentIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

type WalletInfo = {
  id?: string;
  name?: string;
  icon?: string;
  isConnected?: boolean;
  account?: AccountInterface | null;
  provider?: ProviderInterface | null;
  enable?: () => Promise<void> | Promise<any>;
};

function short(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function AccountButton({
  onAccountChange,
  onProviderChange,
  className = "",
}: {
  onAccountChange?: (a: AccountInterface | null) => void;
  onProviderChange?: (p: ProviderInterface | null) => void;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [provider, setProvider] = useState<ProviderInterface | null>(null);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false); // modal chọn ví
  const [menuOpen, setMenuOpen] = useState(false); // dropdown khi đã connect

  const connected = !!account?.address;

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      try {
        const starknet = getStarknet();
        const w = (await starknet.getAvailableWallets()) as
          | WalletInfo[]
          | undefined;
        setWallets(w ?? []);

        // Nếu ví đầu tiên đang connected (nhiều ví có thể khác nhau)
        const already = w?.find((x) => x.isConnected);
        if (already?.account) {
          setAccount(already.account);
          setProvider(already.provider ?? null);
          onAccountChange?.(already.account);
          onProviderChange?.(already.provider ?? null);
        }
      } catch (e) {}
    })();
  }, [onAccountChange, onProviderChange]);

  async function connectSelected(w: WalletInfo) {
    setBusy(true);
    setError(null);
    try {
      if (!w.isConnected) {
        await w.enable?.();
      }
      if (!w.account?.address)
        throw new Error("Failed to get account from wallet");
      setAccount(w.account);
      setProvider(w.provider ?? null);
      onAccountChange?.(w.account);
      onProviderChange?.(w.provider ?? null);
      setPickerOpen(false);
    } catch (e: any) {
      const msg = e?.message || "Failed to connect wallet";
      setError(
        msg.includes("User") && msg.includes("reject")
          ? "User rejected request"
          : msg
      );
    } finally {
      setBusy(false);
    }
  }

  function disconnect() {
    setAccount(null);
    setProvider(null);
    onAccountChange?.(null);
    onProviderChange?.(null);
    setMenuOpen(false);
  }

  async function copyAddress() {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address);
      setMenuOpen(false);
    } catch {}
  }

  const buttonLabel = useMemo(() => {
    if (busy) return "Connecting…";
    if (connected) return short(account!.address);
    return "Connect Wallet";
  }, [busy, connected, account]);

  if (connected) {
    return (
      <div className={`dropdown dropdown-end shrink-0 ${className}`}>
        <button
          className="btn btn-sm btn-outline flex items-center gap-2 whitespace-nowrap shrink-0 px-2 lg:px-3 md:gap-2"
          onClick={() => setMenuOpen((s) => !s)}
        >
          <WalletIcon className="w-4 h-4" />
          <span className="font-mono hidden lg:inline">{buttonLabel}</span>
          <ChevronDownIcon className="w-4 h-4 hidden lg:inline" />
        </button>

        {menuOpen && (
          <ul
            tabIndex={0}
            className="
        dropdown-content menu menu-sm
        p-2 mt-2 w-56
        bg-base-100 border border-base-300 rounded-xl shadow-lg
      "
          >
            {/* item: Copy */}
            <li>
              <button
                onClick={copyAddress}
                className="
            gap-2 justify-start
            text-base-content/90
            hover:bg-base-200 focus:bg-base-200
            rounded-lg
          "
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                <span>Copy address</span>
              </button>
            </li>

            <div className="my-1 h-px bg-base-300/60" />

            <li>
              <button
                onClick={disconnect}
                className="
            gap-2 justify-start
            text-base-content/80
            hover:bg-base-200 focus:bg-base-200
            rounded-lg
          "
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </li>
          </ul>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        className={`btn btn-sm btn-primary whitespace-nowrap shrink-0 px-2 lg:px-3 ${className}`}
        onClick={() => setPickerOpen(true)}
        disabled={busy}
      >
        <WalletIcon className="w-4 h-4" />
        <span className="hidden lg:inline">{buttonLabel}</span>
      </button>

      {/* Modal */}
      {pickerOpen && (
        <div className="modal modal-open">
          <div
            className="modal-backdrop bg-black/55 backdrop-blur-[2px]"
            onClick={() => setPickerOpen(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-modal-title"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="
        modal-box p-0 max-w-lg rounded-2xl
        bg-base-100 text-base-content
        border border-base-300/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]
      "
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between rounded-t-2xl bg-base-200/70">
              <h3 id="wallet-modal-title" className="font-semibold text-base">
                Connect a Starknet wallet
              </h3>
              <button
                aria-label="Close"
                className="btn btn-ghost btn-sm hover:bg-base-300/50"
                onClick={() => setPickerOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              {wallets.length === 0 ? (
                <div className="rounded-xl border border-base-300/80 bg-base-200/70 px-4 py-3 text-sm">
                  No wallet detected. Install Braavos or Argent X.
                </div>
              ) : (
                <ul className="space-y-2">
                  {wallets.map((w, idx) => (
                    <li key={`${w.id ?? w.name ?? "wallet"}-${idx}`}>
                      <button
                        onClick={() => connectSelected(w)}
                        disabled={busy}
                        className="
                    w-full text-left px-4 py-3
                    rounded-xl border border-base-300/80
                    bg-base-100 hover:bg-primary/5
                    focus:outline-none focus:ring-2 focus:ring-primary/30
                    transition-colors
                    flex items-center justify-between
                  "
                      >
                        <div className="flex items-center gap-3">
                          {w.icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={w.icon}
                              alt=""
                              className="w-7 h-7 rounded"
                            />
                          ) : (
                            <WalletIcon className="w-6 h-6" />
                          )}
                          <div className="leading-tight">
                            <div className="font-medium">
                              {w.name || "Starknet Wallet"}
                            </div>
                            {w.isConnected && (
                              <div className="text-xs opacity-70">
                                Previously connected
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {busy && (
                            <span className="loading loading-spinner loading-xs" />
                          )}
                          {w.isConnected ? (
                            <span className="badge badge-primary badge-outline badge-sm">
                              Connected
                            </span>
                          ) : (
                            <span className="badge badge-ghost badge-sm">
                              Select
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {error && (
                <div className="mt-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-2 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex items-center justify-end gap-2 rounded-b-2xl bg-base-200/70">
              <button
                className="btn btn-ghost"
                onClick={() => setPickerOpen(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
