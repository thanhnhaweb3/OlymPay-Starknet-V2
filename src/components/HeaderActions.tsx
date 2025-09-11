"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeftIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import AccountButton from "./AccountButton";

type NavItem = { name: string; path: string };

export default function AppHeader({
  email,
  olymPoints = 0,
  title = "Olympay",
  navItems = [
    { name: "On/Off Ramp", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Leaderboard", path: "/leaderboard" },
  ],
  showBack,
}: {
  email?: string | null;
  olymPoints?: number;
  title?: string;
  navItems?: NavItem[];
  showBack?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof showBack === "boolean") setCanGoBack(showBack);
    else setCanGoBack(window.history.length > 1);
  }, [showBack]);

  const handleNav = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const copyEmail = async () => {
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <header className="bg-base-100 border-b border-base-300 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            {canGoBack && (
              <button
                onClick={() => router.back()}
                className="btn btn-ghost btn-sm gap-1 text-olympay-green"
                aria-label="Go back"
                title="Back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer select-none"
              onClick={() => handleNav("/")}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-base-100 font-bold text-lg">O</span>
              </div>
              <span className="text-3xl font-bold text-base-content">
                {title}
              </span>
            </div>
          </div>

          {/* Desktop Navigation (center) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const active = pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNav(item.path)}
                    className={
                      "px-3 py-2 rounded-md text-md font-medium transition-colors duration-200 " +
                      (active
                        ? "text-primary"
                        : "text-base-content hover:text-primary")
                    }
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* (Email | Wallet | Points) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Email */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-base-300 bg-base-200">
              <UserIcon className="w-4 h-4 shrink-0 text-white" />
              <span className="text-sm max-w-[180px] text-white truncate">
                {email ?? "Guest"}
              </span>
              {email && (
                <button
                  className="btn btn-ghost btn-xs"
                  title={copied ? "Copied!" : "Copy email"}
                  onClick={copyEmail}
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Wallet */}
            <AccountButton />

            {/* OlymPoint */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50">
              <TrophyIcon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">
                {Number(olymPoints || 0).toLocaleString()}
                <span className="hidden lg:inline ml-1">OlymPoint</span>
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-base-content hover:text-primary p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation + the same 3 actions */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 bg-base-200 rounded-lg mt-2">
              {navItems.map((item) => {
                const active = pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNav(item.path)}
                    className={
                      "block px-3 py-2 rounded-md text-xl font-medium w-full text-left transition-colors duration-200 " +
                      (active
                        ? "text-primary"
                        : "text-base-content hover:text-primary")
                    }
                  >
                    {item.name}
                  </button>
                );
              })}

              <div className="my-2 h-px bg-base-300" />

              {/* Email */}
              <div className="flex items-center justify-between px-3 py-2 rounded-md bg-base-100">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  <span className="text-base">{email ?? "Guest"}</span>
                </div>
                {email && (
                  <button
                    className="btn btn-ghost btn-xs"
                    title={copied ? "Copied!" : "Copy email"}
                    onClick={copyEmail}
                  >
                    <ClipboardDocumentIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Wallet */}
              <AccountButton />

              {/* OlymPoint */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-300">
                <TrophyIcon className="w-5 h-5" />
                <span className="text-base font-medium">
                  {Number(olymPoints || 0).toLocaleString()} OlymPoint
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
