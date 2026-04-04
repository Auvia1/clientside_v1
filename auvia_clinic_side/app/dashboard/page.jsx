
"use client";

import { useState, useEffect } from "react";
import {
  Calendar, PhoneCall,
  RefreshCw, AlertCircle, Loader2
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import NewAppointmentDialog from "../components/NewAppointmentDialog";
import DoctorDetailsCard from "../components/DoctorDetailsCard";
import LiveActivityPanel from "../components/LiveActivityPanel";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useSchedule } from "../hooks/useSchedule";
import { useOverallCallStats } from "../hooks/useOverallCallStats";
import { doctorsApi } from "../lib/api";
import { calculatePercentage } from "../lib/utils";

// ─── useDoctors ───────────────────────────────────────────────────────────────

function useDoctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    doctorsApi.list()
      .then((data) => setDoctors(data || []))
      .catch(() => {});
  }, []);

  return doctors;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(timeStr) {
  if (!timeStr) return { time: "--:--", period: "" };
  const [h, m] = timeStr.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour   = h % 12 || 12;
  return {
    time:   `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    period,
  };
}

function statusVariant(status) {
  const map = {
    confirmed:   "info",
    pending:     "warning",
    completed:   "success",
    cancelled:   "destructive",
    no_show:     "warning",
    rescheduled: "muted",
  };
  return map[status?.toLowerCase()] || "muted";
}

function statusLabel(status) {
  const map = {
    confirmed:   "Confirmed",
    pending:     "Pending",
    completed:   "Completed",
    cancelled:   "Cancelled",
    no_show:     "No Show",
    rescheduled: "Rescheduled",
  };
  return map[status] || status;
}

// ─── AppointmentRow ───────────────────────────────────────────────────────────

function AppointmentRow({ appt, onStatusChange }) {
  const { time, period } = formatTime(appt.start_time);
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try {
      await onStatusChange(appt.id, newStatus);
    } finally {
      setUpdating(false);
    }
  }

  const isActionable = appt.status === "confirmed" || appt.status === "pending";

  return (
    <div
      className={`grid grid-cols-[80px_1.6fr_1fr_140px_90px] items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow ${
        appt.status === "completed" ? "bg-green-50/50" : "bg-white"
      }`}
    >
      <div className="text-xs font-semibold">
        {time}
        <span className="block text-[10px] text-slate-400">{period}</span>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{appt.patient_name}</span>
          <span className="text-[10px] text-slate-400">{appt.patient_phone}</span>
        </div>
        <p className="text-xs text-slate-500 truncate max-w-[200px]">{appt.reason || "—"}</p>
      </div>

      <div className="text-sm text-slate-600 truncate">{appt.doctor_name}</div>

      <Badge variant={statusVariant(appt.status)}>{statusLabel(appt.status)}</Badge>

      <div className="flex gap-1 items-center">
        {isActionable && !updating && (
          <>
            <button
              title="Mark Completed"
              onClick={() => handleStatusChange("completed")}
              className="rounded-lg px-2 py-1 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              ✓
            </button>
            <button
              title="Mark No Show"
              onClick={() => handleStatusChange("no_show")}
              className="rounded-lg px-2 py-1 text-[10px] bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
            >
              ✕
            </button>
          </>
        )}
        {updating && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];

  const [activeMonitoring, setActiveMonitoring] = useState(true);
  // "all" | doctor.id
  const [providerFilter, setProviderFilter]     = useState("all");
  const [showAll, setShowAll]                   = useState(false);
  const [todayFormatted, setTodayFormatted]     = useState("");
  const [timeNow, setTimeNow]                   = useState("");

  const doctors                                 = useDoctors();
  const { stats: overallCallStats, loading: overallLoading } = useOverallCallStats();

  const { schedule, loading, error, lastRefresh, refresh, updateAppointmentStatus } =
    useSchedule(today);

  // Filter by selected doctor id (or show all)
  const filteredSchedule = schedule.filter((appt) => {
    if (providerFilter === "all") return true;
    return appt.doctor_id === providerFilter;
  });

  const visibleSchedule = showAll ? filteredSchedule : filteredSchedule.slice(0, 5);

  useEffect(() => {
    const now = new Date();
    setTodayFormatted(now.toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }));
    setTimeNow(now.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    }));
  }, []);

  // Reset filter to "all" if the selected doctor is no longer in the list
  useEffect(() => {
    if (providerFilter !== "all" && !doctors.find((d) => d.id === providerFilter)) {
      setProviderFilter("all");
    }
  }, [doctors, providerFilter]);

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-6 px-8 py-6">
          <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />

          {/* ── Header ── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Morning Overview</h1>
              <p className="text-sm text-slate-500">{todayFormatted} • {timeNow}</p>
              {lastRefresh && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Last updated: {lastRefresh.toLocaleTimeString("en-IN")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="rounded-full px-4 gap-2 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-4 transition-transform duration-200 hover:-translate-y-0.5"
              >
                Operational Audit
              </Button>
              <NewAppointmentDialog
                className="rounded-full px-4 transition-transform duration-200 hover:-translate-y-0.5"
                onBooked={refresh}
              />
            </div>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Failed to load schedule: {error}</span>
              <button onClick={refresh} className="ml-auto text-xs underline">Retry</button>
            </div>
          )}

          {/* ── Main Grid ── */}
          <div className="grid gap-6 lg:grid-cols-[2.1fr_1fr]">

            {/* ── Today's Schedule ── */}
            <Card className="border-slate-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Today&apos;s Schedule</p>
                    <p className="text-xs text-slate-400">
                      {loading
                        ? "Loading…"
                        : `${filteredSchedule.length} appointment${filteredSchedule.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>

                {/* ── Dynamic doctor tabs ── */}
                <Tabs value={providerFilter} onValueChange={(v) => { setProviderFilter(v); setShowAll(false); }}>
                  <TabsList className="bg-slate-100">
                    <TabsTrigger value="all">All Providers</TabsTrigger>
                    {doctors.map((d) => (
                      <TabsTrigger key={d.id} value={d.id}>
                        Dr. {d.name.split(" ").pop()}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[80px_1.6fr_1fr_140px_90px] text-[11px] uppercase tracking-[0.2em] text-slate-400 px-4">
                  <span>Time</span>
                  <span>Patient &amp; Reason</span>
                  <span>Provider</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                    ))
                  ) : filteredSchedule.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Calendar className="h-8 w-8 mb-3 opacity-40" />
                      <p className="text-sm">No appointments scheduled for today.</p>
                    </div>
                  ) : (
                    visibleSchedule.map((appt) => (
                      <AppointmentRow
                        key={appt.id}
                        appt={appt}
                        onStatusChange={updateAppointmentStatus}
                      />
                    ))
                  )}
                </div>

                {!loading && filteredSchedule.length > 5 && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowAll((s) => !s)}
                    className="mt-4 w-full text-emerald-600 transition-colors hover:bg-emerald-50"
                  >
                    {showAll ? "Show Less" : `View All ${filteredSchedule.length} Appointments`}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* ── Right Column ── */}
            <div className="flex flex-col gap-6">

              {/* ── Overall Calls Handled by Agent ── */}
              <Card className="border-slate-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md bg-gradient-to-br from-emerald-50 to-emerald-50/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <PhoneCall className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-emerald-900">Agent Calls</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {overallLoading ? (
                    <div className="space-y-2">
                      <div className="h-8 bg-emerald-200 rounded animate-pulse" />
                      <div className="h-4 bg-emerald-200 rounded animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-semibold text-emerald-900">{overallCallStats.ai_calls}</div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-emerald-700">
                        <Badge variant="success" className="bg-emerald-600">
                          {overallCallStats.total_calls > 0
                            ? `${calculatePercentage(overallCallStats.ai_calls, overallCallStats.total_calls)}%`
                            : "0%"}
                        </Badge>
                        <span>of Total Calls</span>
                      </div>
                      <p className="mt-3 text-xs text-emerald-600">
                        {overallCallStats.human_calls} calls by Staff
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>


              {/* ── Live Activity ── */}
              <LiveActivityPanel />
            </div>
          </div>

          {/* ── Doctor Details (shown when single doctor selected) ── */}
          {providerFilter !== "all" && (
            <DoctorDetailsCard doctorId={providerFilter} />
          )}

          {/* ── Footer ── */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>© 2026 Auvia Health Systems. Operations-first visibility interface.</span>
            <div className="flex items-center gap-4">
              <span>Help Center</span>
              <span>Privacy Policy</span>
              <span>System Status</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}