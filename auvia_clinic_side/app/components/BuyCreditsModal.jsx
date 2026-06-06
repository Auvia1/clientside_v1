"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { useCreditsPackages } from "../hooks/useCreditsPackages";
import BuyCreditDialog from "./BuyCreditDialog";

export default function BuyCreditsModal({ isOpen, onClose }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [customCredits, setCustomCredits] = useState("");

  const { packages, loading: packagesLoading, error: packagesError } = useCreditsPackages();

  const handleBuyClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowBuyDialog(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-50 shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Buy Credits</h2>
              <p className="text-sm text-slate-600">Purchase credits to make more agent calls</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {packagesError && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-6">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Failed to load packages: {packagesError}</span>
              </div>
            )}

            {packagesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                ))}
              </div>
            ) : packages.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>No credit packages available</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Custom Package Card (Primary) */}
                <div className="rounded-2xl border p-6 transition-all hover:shadow-lg border-emerald-200 bg-emerald-50 ring-2 ring-emerald-100 flex flex-col">
                  <div className="mb-3 inline-block self-start rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    Custom Amount
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
                      <span className="font-semibold text-slate-900">₹{customCredits && !isNaN(parseInt(customCredits)) ? (parseInt(customCredits) * 5.0).toFixed(2) : "0.00"}</span>
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
                          price_inr: credits * 5.0,
                          price_per_credit: 5.0,
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
          </div>
        </div>
      </div>

      {selectedPackage && (
        <BuyCreditDialog
          isOpen={showBuyDialog}
          onClose={() => {
            setShowBuyDialog(false);
            setSelectedPackage(null);
            onClose(); // Optional: close the main modal after purchase
          }}
          packageData={selectedPackage}
        />
      )}
    </>
  );
}
