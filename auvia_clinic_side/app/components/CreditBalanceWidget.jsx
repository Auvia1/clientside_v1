"use client";

import { AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreditsBalance } from "../hooks/useCreditsBalance";

export default function CreditBalanceWidget({ showBuyCTA = true, onBuyClick }) {
  const router = useRouter();
  const { balance, loading, error, refetch } = useCreditsBalance();

  const handleBuyClick = () => {
    if (onBuyClick) {
      onBuyClick();
    } else {
      router.push("/credits");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  const isLow = balance && balance.is_low;
  const currentBalance = balance?.balance || 0;

  return (
    <div className={`rounded-2xl border p-6 ${isLow ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
      {error ? (
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Failed to load balance</p>
            <button
              onClick={refetch}
              className="mt-2 text-xs text-red-600 underline hover:text-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Available Credits</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600">{currentBalance.toFixed(2)}</p>
              {isLow && (
                <p className="mt-2 text-xs text-amber-700 font-medium">Low balance — buy more credits</p>
              )}
            </div>
            <div className={`rounded-full p-2 ${isLow ? "bg-amber-100" : "bg-emerald-100"}`}>
              <TrendingUp className={`h-5 w-5 ${isLow ? "text-amber-600" : "text-emerald-600"}`} />
            </div>
          </div>

          {showBuyCTA && (
            <button
              onClick={handleBuyClick}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              Buy More Credits
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
