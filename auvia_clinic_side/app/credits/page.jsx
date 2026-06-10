"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Coins,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Zap,
  RefreshCw,
  CheckCircle2,
  XCircle,
  IndianRupee,
} from "lucide-react";
import CreditBalanceWidget from "../components/CreditBalanceWidget";
import BuyCreditDialog from "../components/BuyCreditDialog";
import { useCreditsPackages } from "../hooks/useCreditsPackages";
import { useCreditsTransactions } from "../hooks/useCreditsTransactions";
import { useCreditsBalance } from "../hooks/useCreditsBalance";
import { useCreditssSummary } from "../hooks/useCreditsBalance";
import { usePaymentHistory } from "../hooks/usePaymentHistory";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({ active, onClick, children, icon: Icon, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
        active
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      {count !== undefined && (
        <span
          className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
            active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subValue, color, trend }) {
  const colors = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
      icon: "bg-emerald-100 text-emerald-600",
      border: "border-emerald-200/60",
      value: "text-emerald-700",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      icon: "bg-blue-100 text-blue-600",
      border: "border-blue-200/60",
      value: "text-blue-700",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
      icon: "bg-amber-100 text-amber-600",
      border: "border-amber-200/60",
      value: "text-amber-700",
    },
    violet: {
      bg: "bg-gradient-to-br from-violet-50 to-violet-100/50",
      icon: "bg-violet-100 text-violet-600",
      border: "border-violet-200/60",
      value: "text-violet-700",
    },
  };
  const c = colors[color] || colors.emerald;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
          {subValue && (
            <p className="text-xs text-slate-500">{subValue}</p>
          )}
        </div>
        <div className={`rounded-xl p-2.5 ${c.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-[0.07] bg-current" />
    </div>
  );
}

// ─── Transaction type badge ──────────────────────────────────────────────────
function TypeBadge({ type }) {
  const config = {
    recharge: {
      label: "Recharge",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ArrowUpRight,
    },
    deduction: {
      label: "Deduction",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: ArrowDownRight,
    },
    adjustment: {
      label: "Adjustment",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: RefreshCw,
    },
  };
  const c = config[type] || config.adjustment;
  const BadgeIcon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${c.color}`}
    >
      <BadgeIcon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

// ─── Payment status badge ────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    success: {
      label: "Success",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    failed: {
      label: "Failed",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
    pending: {
      label: "Pending",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
  };
  const c = config[status] || config.pending;
  const BadgeIcon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${c.color}`}
    >
      <BadgeIcon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

// ─── Pagination Component ─────────────────────────────────────────────────────
function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-1 pt-4">
      <p className="text-sm text-slate-500">
        Page <span className="font-medium text-slate-700">{pagination.page}</span> of{" "}
        <span className="font-medium text-slate-700">{pagination.totalPages}</span>
        {pagination.total > 0 && (
          <span className="ml-1">
            ({pagination.total} total)
          </span>
        )}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
          disabled={pagination.page === 1}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          onClick={() =>
            onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
          }
          disabled={pagination.page === pagination.totalPages}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-2xl bg-slate-100 p-4 mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-50">
      <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-6 w-16 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function CreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions"); // transactions | payments | packages
  const [transactionFilter, setTransactionFilter] = useState(null); // null = all
  const [activeMonitoring, setActiveMonitoring] = useState(true);
  const [customCredits, setCustomCredits] = useState("");

  // Data hooks
  const { packages, loading: packagesLoading, error: packagesError } = useCreditsPackages();
  const { balance, loading: balanceLoading } = useCreditsBalance();
  const { summary, loading: summaryLoading } = useCreditssSummary();
  const {
    transactions,
    pagination: txPagination,
    loading: txLoading,
    error: txError,
    fetchTransactions,
  } = useCreditsTransactions(transactionFilter);
  const {
    payments,
    pagination: payPagination,
    loading: payLoading,
    error: payError,
    fetchPayments,
  } = usePaymentHistory();

  useEffect(() => {
    fetchTransactions(1, 1000);
  }, [transactionFilter, fetchTransactions]);

  useEffect(() => {
    if (activeTab === "payments") {
      fetchPayments(1, 1000);
    }
  }, [activeTab, fetchPayments]);

  const handleBuyClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowBuyDialog(true);
  };

  const currentBalance = balance?.balance || 0;
  const isLow = balance?.is_low || false;
  const consumedThisMonth = summary?.total_consumed_this_month || 0;
  const lastRecharge = summary?.last_recharged_at;

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col min-h-screen overflow-x-hidden">
          <div className="px-8 py-6 pb-0">
            <Navbar
              activeMonitoring={activeMonitoring}
              onToggleMonitoring={setActiveMonitoring}
            />
          </div>

          <div className="flex-1 px-8 py-6">
            {/* ── Page Header ────────────────────────────────────── */}
            <div className="mb-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Credit Management
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Monitor your credit balance, purchase credits, and track all
                    transactions
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("packages")}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Coins className="h-4 w-4" />
                  Buy Credits
                </button>
              </div>
            </div>

            {/* ── Summary Cards ──────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Wallet}
                label="Current Balance"
                value={
                  balanceLoading
                    ? "..."
                    : `${currentBalance.toFixed(1)} credits`
                }
                subValue={isLow ? "⚠️ Low balance — recharge soon" : "Sufficient balance"}
                color={isLow ? "amber" : "emerald"}
              />
              <StatCard
                icon={TrendingDown}
                label="Consumed This Month"
                value={
                  summaryLoading
                    ? "..."
                    : `${consumedThisMonth.toFixed(1)} credits`
                }
                subValue="Agent call usage"
                color="blue"
              />
              <StatCard
                icon={Calendar}
                label="Last Recharge"
                value={
                  summaryLoading
                    ? "..."
                    : lastRecharge
                    ? new Date(lastRecharge).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Never"
                }
                subValue={
                  lastRecharge
                    ? new Date(lastRecharge).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "No recharges yet"
                }
                color="violet"
              />
              <StatCard
                icon={Zap}
                label="Credit Rate"
                value="₹5.00 / credit"
                subValue="1 credit = 1 min of call"
                color="amber"
              />
            </div>

            {/* ── Tab Navigation ─────────────────────────────────── */}
            <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm w-fit">
              <TabButton
                active={activeTab === "transactions"}
                onClick={() => setActiveTab("transactions")}
                icon={TrendingUp}
              >
                Transactions
              </TabButton>
              <TabButton
                active={activeTab === "payments"}
                onClick={() => setActiveTab("payments")}
                icon={CreditCard}
              >
                Payment History
              </TabButton>
              <TabButton
                active={activeTab === "packages"}
                onClick={() => setActiveTab("packages")}
                icon={Coins}
              >
                Buy Credits
              </TabButton>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ── TRANSACTIONS TAB ─────────────────────────────────── */}
            {/* ═══════════════════════════════════════════════════════ */}
            {activeTab === "transactions" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Header + Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        All Transactions
                      </h2>
                      <p className="text-xs text-slate-500">
                        Credit recharges, deductions, and adjustments
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    {[
                      { label: "All", value: null },
                      { label: "Recharges", value: "recharge" },
                      { label: "Deductions", value: "deduction" },
                      { label: "Adjustments", value: "adjustment" },
                    ].map((f) => (
                      <button
                        key={f.label}
                        onClick={() => setTransactionFilter(f.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          transactionFilter === f.value
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error banner */}
                {txError && (
                  <div className="flex items-center gap-3 bg-red-50 border-b border-red-100 px-6 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Failed to load transactions: {txError}</span>
                    <button
                      onClick={() => fetchTransactions(1, 20)}
                      className="ml-auto text-xs underline hover:no-underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_120px_140px_120px_160px] gap-3 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-50 bg-slate-50/50">
                  <span>Description</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span>Balance After</span>
                  <span>Date</span>
                </div>

                {/* Rows */}
                {txLoading ? (
                  <div>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <EmptyState
                    icon={HelpCircle}
                    title="No transactions found"
                    description={
                      transactionFilter
                        ? `No ${transactionFilter} transactions yet`
                        : "Your transaction history will appear here"
                    }
                  />
                ) : (
                  <div>
                    {transactions.map((tx) => {
                      const isRecharge = tx.type === "recharge";
                      const isDeduction = tx.type === "deduction";
                      return (
                        <div
                          key={tx.id}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_120px_140px_120px_160px] gap-2 sm:gap-3 items-center px-6 py-4 border-b border-slate-50 transition-colors hover:bg-slate-50/50 group"
                        >
                          {/* Description */}
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-xl p-2 transition-transform group-hover:scale-105 ${
                                isRecharge
                                  ? "bg-emerald-50"
                                  : isDeduction
                                  ? "bg-red-50"
                                  : "bg-blue-50"
                              }`}
                            >
                              {isRecharge ? (
                                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                              ) : isDeduction ? (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                              ) : (
                                <RefreshCw className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {tx.description ||
                                  (isRecharge
                                    ? "Credit Recharge"
                                    : isDeduction
                                    ? "Call Usage"
                                    : "Credit Adjustment")}
                              </p>
                              {tx.reference_id && (
                                <p className="text-xs text-slate-400 truncate">
                                  Ref: {tx.reference_id.slice(0, 8)}...
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Type Badge */}
                          <div>
                            <TypeBadge type={tx.type} />
                          </div>

                          {/* Amount */}
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                isRecharge
                                  ? "text-emerald-600"
                                  : isDeduction
                                  ? "text-red-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {isRecharge ? "+" : isDeduction ? "-" : ""}
                              {Math.abs(parseFloat(tx.amount || 0)).toFixed(2)}{" "}
                              credits
                            </span>
                          </div>

                          {/* Balance After */}
                          <div>
                            <span className="text-sm text-slate-600">
                              {tx.balance_after
                                ? parseFloat(tx.balance_after).toFixed(2)
                                : "—"}
                            </span>
                          </div>

                          {/* Date */}
                          <div>
                            <p className="text-sm text-slate-600">
                              {new Date(tx.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(tx.created_at).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                <div className="px-6 py-3">
                  <PaginationControls
                    pagination={txPagination}
                    onPageChange={(page) => fetchTransactions(page, txPagination.limit)}
                  />
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ── PAYMENT HISTORY TAB ──────────────────────────────── */}
            {/* ═══════════════════════════════════════════════════════ */}
            {activeTab === "payments" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                  <div className="rounded-xl bg-blue-50 p-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Payment History
                    </h2>
                    <p className="text-xs text-slate-500">
                      All Razorpay payment attempts and their statuses
                    </p>
                  </div>
                </div>

                {/* Error banner */}
                {payError && (
                  <div className="flex items-center gap-3 bg-red-50 border-b border-red-100 px-6 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Failed to load payments: {payError}</span>
                    <button
                      onClick={() => fetchPayments(1, 20)}
                      className="ml-auto text-xs underline hover:no-underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_100px_120px_100px_80px_150px] gap-3 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-50 bg-slate-50/50">
                  <span>Payment ID</span>
                  <span>Amount</span>
                  <span>Credits</span>
                  <span>Status</span>
                  <span>Currency</span>
                  <span>Date</span>
                </div>

                {/* Rows */}
                {payLoading ? (
                  <div>
                    {[1, 2, 3, 4].map((i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </div>
                ) : payments.length === 0 ? (
                  <EmptyState
                    icon={CreditCard}
                    title="No payment records"
                    description="Your payment history will appear here after your first purchase"
                  />
                ) : (
                  <div>
                    {payments.map((pay) => (
                      <div
                        key={pay.id}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_100px_80px_150px] gap-2 sm:gap-3 items-center px-6 py-4 border-b border-slate-50 transition-colors hover:bg-slate-50/50 group"
                      >
                        {/* Payment ID */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-xl p-2 ${
                              pay.status === "success"
                                ? "bg-emerald-50"
                                : pay.status === "failed"
                                ? "bg-red-50"
                                : "bg-amber-50"
                            }`}
                          >
                            <IndianRupee
                              className={`h-4 w-4 ${
                                pay.status === "success"
                                  ? "text-emerald-600"
                                  : pay.status === "failed"
                                  ? "text-red-500"
                                  : "text-amber-600"
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate font-mono">
                              {pay.razorpay_payment_id || pay.razorpay_order_id || "—"}
                            </p>
                            {pay.razorpay_order_id && pay.razorpay_payment_id && (
                              <p className="text-xs text-slate-400 truncate font-mono">
                                Order: {pay.razorpay_order_id}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount */}
                        <div>
                          <span className="text-sm font-semibold text-slate-800">
                            ₹{parseFloat(pay.amount || 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Credits */}
                        <div>
                          <span className="text-sm text-emerald-600 font-medium">
                            +{parseFloat(pay.credits_purchased || 0).toFixed(0)} credits
                          </span>
                        </div>

                        {/* Status */}
                        <div>
                          <StatusBadge status={pay.status} />
                        </div>

                        {/* Currency */}
                        <div>
                          <span className="text-sm text-slate-600">
                            {pay.currency || "INR"}
                          </span>
                        </div>

                        {/* Date */}
                        <div>
                          <p className="text-sm text-slate-600">
                            {new Date(pay.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(pay.created_at).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div className="px-6 py-3">
                  <PaginationControls
                    pagination={payPagination}
                    onPageChange={(page) => fetchPayments(page, payPagination.limit)}
                  />
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ── PACKAGES TAB ─────────────────────────────────────── */}
            {/* ═══════════════════════════════════════════════════════ */}
            {activeTab === "packages" && (
              <div className="space-y-6">
                {packagesError && (
                  <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-5 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Failed to load packages: {packagesError}</span>
                  </div>
                )}

                {packagesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-72 animate-pulse rounded-2xl bg-slate-100"
                      />
                    ))}
                  </div>
                ) : packages.length === 0 && !packagesError ? (
                  <EmptyState
                    icon={Coins}
                    title="No packages available"
                    description="Credit packages are not configured yet"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* ── Custom Package Card ──────────────────────── */}
                    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col">
                      {/* Popular ribbon */}
                      <div className="absolute top-3 right-3">
                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-md shadow-emerald-200">
                          Flexible
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-xl bg-emerald-100 p-2">
                            <Zap className="h-5 w-5 text-emerald-600" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Custom Amount
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Buy exactly what you need
                        </p>
                      </div>

                      <div className="space-y-3 flex-1">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
                            Credits
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={customCredits}
                            onChange={(e) =>
                              setCustomCredits(e.target.value)
                            }
                            className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                            placeholder="e.g. 200"
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2.5">
                          <span className="text-sm text-slate-600">Total</span>
                          <span className="text-lg font-bold text-emerald-700">
                            ₹
                            {customCredits &&
                            !isNaN(parseInt(customCredits))
                              ? (parseInt(customCredits) * 5.0).toFixed(0)
                              : "0"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 text-center">
                          ₹5.00 per credit
                        </p>
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
                              custom_credits: credits,
                            });
                          }
                        }}
                        disabled={
                          !customCredits ||
                          parseInt(customCredits, 10) <= 0
                        }
                        className="mt-5 w-full rounded-xl bg-emerald-600 py-3 font-medium text-white transition-all flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      >
                        Buy Now <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* ── Pre-defined Packages ────────────────────── */}
                    {packages.map((pkg, idx) => (
                      <div
                        key={pkg.id}
                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col"
                      >
                        {idx === 0 && (
                          <div className="absolute top-3 right-3">
                            <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-md shadow-blue-200">
                              Starter
                            </span>
                          </div>
                        )}

                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-xl bg-slate-100 p-2">
                              <Coins className="h-5 w-5 text-slate-600" />
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {pkg.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {pkg.credits.toFixed(0)} credits included
                          </p>
                        </div>

                        <div className="space-y-3 flex-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900">
                              ₹{pkg.price_inr.toFixed(0)}
                            </span>
                          </div>
                          <div className="space-y-2 pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">
                                Credits
                              </span>
                              <span className="font-medium text-slate-800">
                                {pkg.credits.toFixed(0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">
                                Per Credit
                              </span>
                              <span className="font-medium text-slate-800">
                                ₹{pkg.price_per_credit.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBuyClick(pkg)}
                          className="mt-5 w-full rounded-xl border-2 border-emerald-600 py-3 font-medium text-emerald-600 transition-all flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-200"
                        >
                          Buy Now <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* FAQ Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="rounded-xl bg-amber-50 p-2">
                      <HelpCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Frequently Asked Questions
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      {
                        q: "How do credits work?",
                        a: "Each minute of agent call usage consumes 1 credit (rounded up). Purchase credits to enable more agent calls for your clinic.",
                      },
                      {
                        q: "How long are credits valid?",
                        a: "Credits remain valid indefinitely until used for agent calls. There is no expiry date.",
                      },
                      {
                        q: "What happens when I run out?",
                        a: "Agent calls will be paused when your balance reaches zero. Recharge to resume immediately.",
                      },
                      {
                        q: "Can I get a refund?",
                        a: "Contact our support team to request a refund for unused credits. Refunds are processed within 5-7 business days.",
                      },
                    ].map((faq, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-sm"
                      >
                        <h3 className="text-sm font-semibold text-slate-800">
                          {faq.q}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Footer ──────────────────────────────────────────── */}
            <div className="mt-8 flex items-center justify-between text-xs text-slate-400 pb-4">
              <span>© 2026 Auvia Health Systems</span>
              <div className="flex items-center gap-4">
                <span>Help Center</span>
                <span>Privacy Policy</span>
              </div>
            </div>
          </div>

          {/* Buy Credit Dialog */}
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
