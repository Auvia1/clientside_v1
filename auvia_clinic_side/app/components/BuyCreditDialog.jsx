"use client";

import { useState, useEffect } from "react";
import { X, Loader, Check, AlertCircle } from "lucide-react";
import { creditsApi } from "../lib/api";
import { useCreditsBalance } from "../hooks/useCreditsBalance";

function getClinicId() {
  return typeof window !== "undefined" ? localStorage.getItem("auvia_clinic_id") || "" : "";
}

export default function BuyCreditDialog({ isOpen, onClose, packageData }) {
  const { refetch: refetchBalance } = useCreditsBalance();
  const [step, setStep] = useState("confirmation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

    const [customAmount, setCustomAmount] = useState(100);

  useEffect(() => {
    if (isOpen) {
      setStep("confirmation");
      setError(null);
      setSuccessMessage(null);
      if (packageData?.id === "custom") {
        setCustomAmount(packageData.credits || 100);
      }
    }
  }, [isOpen, packageData]);

  const handleProceedToPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const clinicId = getClinicId();
      
      const creditsToBuy = packageData.id === "custom" ? parseInt(customAmount, 10) : packageData.credits;
      if (packageData.id === "custom" && (isNaN(creditsToBuy) || creditsToBuy <= 0)) {
        setError("Please enter a valid number of credits");
        setLoading(false);
        return;
      }

      const order = await creditsApi.createOrder(clinicId, packageData.id, packageData.id === "custom" ? creditsToBuy : undefined);

      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key: order.key_id,
        order_id: order.razorpay_order_id,
        amount: order.amount,
        currency: order.currency,
        handler: async (response) => {
          try {
            setStep("processing");
            await creditsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccessMessage(`${order.credits} credits added successfully!`);
            setStep("success");
            refetchBalance();

            setTimeout(() => {
              onClose();
            }, 1800);
          } catch (verifyError) {
            setError(verifyError.message || "Payment verification failed");
            setStep("error");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled");
            setStep("confirmation");
          },
        },
        prefill: {
          contact: "",
          email: "",
        },
        theme: {
          color: "#059669",
        },
        notes: {
          clinic_id: clinicId,
          package_id: packageData.id,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {step === "confirmation" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Buy Credits</h2>
              <p className="mt-1 text-sm text-slate-600">Complete your purchase</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-3">
                {packageData.id === "custom" ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-slate-600">Number of Credits</label>
                      <input 
                        type="number"
                        min="1"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-3">
                      <span className="text-sm text-slate-600">Amount</span>
                      <span className="font-semibold text-slate-900">₹{(parseInt(customAmount || 0) * 1.0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-3">
                      <span className="text-sm text-slate-600">Price per credit</span>
                      <span className="font-semibold text-slate-900">₹1.00</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Credits</span>
                      <span className="font-semibold text-slate-900">{packageData.credits?.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-3">
                      <span className="text-sm text-slate-600">Amount</span>
                      <span className="font-semibold text-slate-900">₹{packageData.price_inr?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-3">
                      <span className="text-sm text-slate-600">Price per credit</span>
                      <span className="font-semibold text-slate-900">₹{packageData.price_per_credit?.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Pay"
              )}
            </button>

            <p className="text-xs text-center text-slate-600">
              You will be redirected to Razorpay for payment
            </p>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-emerald-100 p-4">
              <Loader className="h-6 w-6 text-emerald-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">Processing Payment</p>
              <p className="mt-1 text-sm text-slate-600">Please wait...</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-emerald-100 p-4">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">Payment Successful!</p>
              <p className="mt-2 text-sm text-emerald-600">{successMessage}</p>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="font-semibold text-slate-900">Payment Failed</p>
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <button
              onClick={() => {
                setStep("confirmation");
                setError(null);
              }}
              className="w-full rounded-xl bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
