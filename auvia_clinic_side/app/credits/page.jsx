"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ArrowRight, HelpCircle } from "lucide-react";
import CreditBalanceWidget from "../components/CreditBalanceWidget";
import BuyCreditDialog from "../components/BuyCreditDialog";
import { useCreditsPackages } from "../hooks/useCreditsPackages";
import { useCreditsTransactions } from "../hooks/useCreditsTransactions";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function CreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [transactionType, setTransactionType] = useState(null);
  const [activeMonitoring, setActiveMonitoring] = useState(true);
  const [customCredits, setCustomCredits] = useState("");

  const { packages, loading: packagesLoading, error: packagesError } = useCreditsPackages();
  const { transactions, pagination, loading: txLoading, error: txError, fetchTransactions } = useCreditsTransactions(transactionType);

  useEffect(() => {
    fetchTransactions(1, 20);
  }, [transactionType, fetchTransactions]);

  const handleBuyClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowBuyDialog(true);
  };

  const handleBuyFromWidget = () => {
    handleBuyClick({
      id: "custom",
      name: "Custom Package",
      credits: 100,
      price_inr: 100.0,
      price_per_credit: 1.0,
      custom_credits: 100
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col min-h-screen overflow-x-hidden">
          <div className="px-8 py-6 pb-0">
            <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />
          </div>

          <div className="flex-1 bg-slate-50 mt-4">
            <div className="border-b border-slate-200 bg-white">
              <div className="mx-auto max-w-7xl px-6 py-8">
                <h1 className="text-3xl font-bold text-slate-900">Buy Credits</h1>
                <p className="mt-2 text-slate-600">Manage your agent call credits and purchases</p>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CreditBalanceWidget showBuyCTA={true} onBuyClick={handleBuyFromWidget} />
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Available Packages</h2>

            {packagesError && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Failed to load packages: {packagesError}</span>
              </div>
            )}

            {packagesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : packages.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>No credit packages available</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Custom Package Card (Primary) */}
                <div className="rounded-2xl border p-6 transition-all hover:shadow-lg border-emerald-200 bg-emerald-50 ring-2 ring-emerald-100 flex flex-col">
                  <div className="mb-3 inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Custom Package</h3>
                  <p className="mt-1 text-sm text-slate-600">Enter custom amount</p>
                  
                  <div className="mt-4 space-y-2 border-t border-emerald-200 pt-4 flex-1">
                    <label className="text-sm font-medium text-slate-700">Number of Credits</label>
                    <input 
                      type="number" 
                      min="1"
                      value={customCredits} 
                      onChange={(e) => setCustomCredits(e.target.value)}
                      className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="e.g. 200"
                    />
                    <div className="flex justify-between mt-2 pt-2 border-t border-emerald-200/50">
                      <span className="text-sm text-slate-600">Total Price</span>
                      <span className="font-semibold text-slate-900">₹{customCredits && !isNaN(parseInt(customCredits)) ? (parseInt(customCredits) * 1.0).toFixed(2) : "0.00"}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      const credits = parseInt(customCredits, 10);
                      if (credits > 0) {
                        handleBuyClick({
                          id: "custom",
                          name: `Custom Package (${credits} credits)`,
                          credits: credits,
                          price_inr: credits * 1.0,
                          price_per_credit: 1.0,
                          custom_credits: credits
                        });
                      }
                    }}
                    disabled={!customCredits || parseInt(customCredits, 10) <= 0}
                    className="mt-6 w-full rounded-xl py-2.5 font-medium transition-colors flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Custom <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Pre-defined Packages */}
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg flex flex-col"
                  >
                    <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{pkg.credits.toFixed(0)} credits</p>

                    <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Price</span>
                        <span className="font-semibold text-slate-900">₹{pkg.price_inr.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Per Credit</span>
                        <span className="font-semibold text-slate-900">₹{pkg.price_per_credit.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyClick(pkg)}
                      className="mt-6 w-full rounded-xl py-2.5 font-medium transition-colors flex items-center justify-center gap-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      Buy Now <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Transaction History</h2>

            {txError && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Failed to load transactions: {txError}</span>
              </div>
            )}

            <div className="mb-4 flex gap-2">
              {["all", "recharge", "deduction"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTransactionType(type === "all" ? null : type)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    (type === "all" ? transactionType === null : transactionType === type)
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {type === "all" ? "All Transactions" : type === "recharge" ? "Recharges" : "Deductions"}
                </button>
              ))}
            </div>

            {txLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-12">
                <div className="text-center">
                  <HelpCircle className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">No transactions found</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {tx.type === "recharge" ? "Credit Purchase" : "Call Usage"}
                      </p>
                      <p className="text-sm text-slate-600">{tx.description}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.type === "recharge" ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {tx.type === "recharge" ? "+" : "-"} {Math.abs(parseFloat(tx.amount || 0)).toFixed(2)} credits
                      </p>
                      <p className="text-xs text-slate-600">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchTransactions(Math.max(1, pagination.page - 1), pagination.limit)}
                    disabled={pagination.page === 1}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchTransactions(Math.min(pagination.totalPages, pagination.page + 1), pagination.limit)}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <HelpCircle className="h-5 w-5 text-emerald-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">How do credits work?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Each minute of agent call usage consumes 1 credit (rounded up). Purchase credits to make more calls.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">How long are credits valid?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Credits remain valid indefinitely until used for agent calls.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">What happens when I run out of credits?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  You won't be able to start new agent calls. You'll need to purchase more credits first.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Can I get a refund?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Contact our support team to request a refund for unused credits.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      </div>

      {selectedPackage && (
        <BuyCreditDialog
          isOpen={showBuyDialog}
          onClose={() => {
            setShowBuyDialog(false);
            setSelectedPackage(null);
          }}
          packageData={selectedPackage}
        />
      )}
      </main>
      </div>
    </div>
  );
}
