"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  TrophyIcon,
  WalletIcon,
  EnvelopeIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BanknotesIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import HeaderActions from "./HeaderActions";

interface UserRow {
  id: number;
  wallet: string;
  email: string;
  olympPoints: number;
  usdcAdded: number;
  avatar: string;
}

type SortField = keyof Pick<
  UserRow,
  "wallet" | "email" | "olympPoints" | "usdcAdded"
>;
type SortDirection = "asc" | "desc";

/** Count-up component: animate numbers from 0 -> value (with decimals + prefix) */
const CountUp: React.FC<{
  value: number;
  decimals?: number;
  prefix?: string;
  duration?: number; // ms
  className?: string;
}> = ({
  value,
  decimals = 0,
  prefix = "",
  duration = 1200,
  className = "",
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const delta = value - from;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(p);
      setDisplay(from + delta * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const factor = Math.pow(10, decimals);
  const rounded = Math.round(display * factor) / factor;
  const formatted = rounded.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formatted}
    </span>
  );
};

const Leaderboard: React.FC = () => {
  const [users] = useState<UserRow[]>([
    {
      id: 1,
      wallet: "0x1234...5678",
      email: "user1@example.com",
      olympPoints: 15420,
      usdcAdded: 2850.75,
      avatar: "🏆",
    },
    {
      id: 2,
      wallet: "0x8765...4321",
      email: "user2@example.com",
      olympPoints: 12340,
      usdcAdded: 2150.5,
      avatar: "🥈",
    },
    {
      id: 3,
      wallet: "0x9876...1234",
      email: "user3@example.com",
      olympPoints: 9875,
      usdcAdded: 1890.25,
      avatar: "🥉",
    },
    {
      id: 4,
      wallet: "0x4567...8901",
      email: "user4@example.com",
      olympPoints: 8760,
      usdcAdded: 1650.0,
      avatar: "⭐",
    },
    {
      id: 5,
      wallet: "0x2468...1357",
      email: "user5@example.com",
      olympPoints: 7654,
      usdcAdded: 1420.8,
      avatar: "🌟",
    },
    {
      id: 6,
      wallet: "0x1357...2468",
      email: "user6@example.com",
      olympPoints: 6543,
      usdcAdded: 1250.3,
      avatar: "💎",
    },
    {
      id: 7,
      wallet: "0x9753...8642",
      email: "user7@example.com",
      olympPoints: 5432,
      usdcAdded: 980.75,
      avatar: "🚀",
    },
    {
      id: 8,
      wallet: "0x8642...9753",
      email: "user8@example.com",
      olympPoints: 4321,
      usdcAdded: 850.5,
      avatar: "⚡",
    },
  ]);

  const [sortBy, setSortBy] = useState<SortField>("olympPoints");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [search, setSearch] = useState("");

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const key = search.toLowerCase();
    return users.filter(
      (u) =>
        u.wallet.toLowerCase().includes(key) ||
        u.email.toLowerCase().includes(key)
    );
  }, [users, search]);

  const sortedUsers = useMemo(() => {
    const copy = [...filteredUsers];
    copy.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filteredUsers, sortBy, sortDirection]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <TrophyIcon className="w-6 h-6 text-yellow-400" aria-label="Gold" />
        );
      case 1:
        return (
          <StarIcon className="w-6 h-6 text-gray-400" aria-label="Silver" />
        );
      case 2:
        return (
          <StarIcon className="w-6 h-6 text-amber-600" aria-label="Bronze" />
        );
      default:
        return (
          <SparklesIcon className="w-5 h-5 text-olympay-cyan" aria-hidden />
        );
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-b from-base-100 to-base-200 border-yellow-400/30 shadow-lg";
      case 1:
        return "bg-gradient-to-b from-base-100 to-base-200 border-gray-400/30 shadow-lg";
      case 2:
        return "bg-gradient-to-b from-base-100 to-base-200 border-amber-600/30 shadow-lg";
      default:
        return "bg-gradient-to-b from-base-100 to-base-200 border-base-300/50 hover:border-olympay-cyan/30 shadow-md";
    }
  };

  const topPoints = Math.max(...users.map((u) => u.olympPoints));
  const totalPoints = users.reduce((sum, u) => sum + u.olympPoints, 0);
  const totalUSDC = users.reduce((sum, u) => sum + u.usdcAdded, 0);

  return (
    <div className="min-h-screen bg-olympay-dark p-10">
      <HeaderActions />

      <div className="max-w-6xl mx-auto py-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-olympay-green mb-2">
            🏆 Spending Leaderboard
          </h1>
          <p className="text-olympay-cyan text-lg">
            Top users by spending in the Olympay app
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-olympay-cyan/70" />
          <input
            type="text"
            placeholder="Search by wallet address or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-base-200/70 border border-base-300/50 focus:outline-none focus:ring-2 focus:ring-olympay-cyan text-olympay-green placeholder:text-olympay-cyan/50 transition-all duration-300"
          />
        </div>

        {/* Stats Cards (animated numbers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-olympay-green/20 to-olympay-green/10 border border-olympay-green/30 rounded-xl p-6 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-base-100/80 border border-base-300/50">
              <UsersIcon className="w-6 h-6 text-olympay-cyan" />
            </div>
            <div>
              <div className="text-2xl font-bold text-olympay-green">
                <CountUp value={users.length} />
              </div>
              <div className="text-olympay-cyan">Total Users</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-olympay-cyan/20 to-olympay-cyan/10 border border-olympay-cyan/30 rounded-xl p-6 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-base-100/80 border border-base-300/50">
              <ArrowTrendingUpIcon className="w-6 h-6 text-olympay-cyan" />
            </div>
            <div>
              <div className="text-2xl font-bold text-olympay-cyan">
                <CountUp value={totalPoints} />
              </div>
              <div className="text-olympay-green">Total OlymPoints</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-base-100/80 border border-base-300/50">
              <BanknotesIcon className="w-6 h-6 text-olympay-cyan" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                <CountUp value={totalUSDC} decimals={2} prefix="$" />
              </div>
              <div className="text-olympay-cyan">Total USDC</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-base-200/50 backdrop-blur-sm border border-base-300/50 rounded-2xl overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-olympay-dark to-base-300 border-b border-base-300 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 text-center text-olympay-cyan font-semibold">
                #
              </div>
              <div className="col-span-5 md:col-span-6">
                <div className="flex items-center gap-2 text-olympay-green font-semibold">
                  <SparklesIcon className="w-5 h-5" /> Wallet ID
                </div>
              </div>
              <div className="col-span-3 md:col-span-2 text-center">
                <button
                  onClick={() => handleSort("olympPoints")}
                  className="flex items-center gap-2 w-full justify-center font-semibold text-olympay-green hover:text-olympay-cyan transition-colors duration-200"
                >
                  OlymPoints
                  {sortBy === "olympPoints" &&
                    (sortDirection === "desc" ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronUpIcon className="w-4 h-4" />
                    ))}
                </button>
              </div>
              <div className="col-span-3 md:col-span-3 text-center">
                <button
                  onClick={() => handleSort("usdcAdded")}
                  className="flex items-center gap-2 w-full justify-center font-semibold text-olympay-green hover:text-olympay-cyan transition-colors duration-200"
                >
                  USDC Added
                  {sortBy === "usdcAdded" &&
                    (sortDirection === "desc" ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronUpIcon className="w-4 h-4" />
                    ))}
                </button>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-base-300/30">
            {sortedUsers.map((user, index) => (
              <div
                key={user.id}
                className={`px-6 py-4 transition-all duration-300 hover:scale-[1.01] ${getRankBg(
                  index
                )} border-l-4`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      {getRankIcon(index)}
                      <span className="text-sm font-bold text-olympay-cyan mt-1">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="col-span-5 md:col-span-6">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl" aria-hidden>
                        {user.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-mono text-sm text-olympay-green font-semibold">
                          <WalletIcon className="w-4 h-4" /> {user.wallet}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-olympay-cyan">
                          <EnvelopeIcon className="w-4 h-4" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OlymPoints (animated) */}
                  <div className="col-span-3 md:col-span-2 text-center">
                    <div className="inline-flex items-center justify-center gap-1 font-bold text-lg text-olympay-green">
                      <ArrowTrendingUpIcon className="w-5 h-5" />
                      <CountUp value={user.olympPoints} />
                    </div>
                    <div className="text-xs text-olympay-cyan">points</div>
                  </div>

                  {/* USDC (animated) */}
                  <div className="col-span-3 md:col-span-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1 font-bold text-lg text-yellow-400">
                      <BanknotesIcon className="w-5 h-5" />
                      <CountUp value={user.usdcAdded} decimals={2} prefix="$" />
                    </div>
                    <div className="text-xs text-olympay-cyan">USDC</div>
                  </div>
                </div>

                {/* Progress Bar (giữ hiệu ứng width transition) */}
                <div className="mt-3">
                  <div className="bg-base-300/30 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-olympay-green to-olympay-cyan h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(user.olympPoints / topPoints) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-olympay-cyan/70">
          <p>Last updated: {new Date().toLocaleString("en-US")}</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
