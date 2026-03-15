



"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar, PhoneCall, Activity,
  RefreshCw, AlertCircle, Loader2
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import NewAppointmentDialog from "../components/NewAppointmentDialog";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useSchedule } from "../hooks/useSchedule";
import { useRouter } from "next/navigation";

// ─── Static Data (no API needed) ─────────────────────────────────────────────

function activityDot(type) {
  return {
    agent_booking:  "bg-emerald-400",
    manual_booking: "bg-sky-400",
    active_call:    "bg-amber-400 animate-pulse",
    cancellation:   "bg-red-400",
  }[type] || "bg-slate-300";
}

function activityAge(createdAt) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function useLiveActivity() {
  const [activities, setActivities] = useState([]);
  const [wsStatus, setWsStatus]     = useState("connecting");
  const wsRef                       = useRef(null);
  const reconnectTimer              = useRef(null);

  function connect() {
    fetch("/api/activity?limit=10")
      .then((r) => r.json())
      .then((json) => { if (json.success) setActivities(json.data); })
      .catch(() => {});

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    // CORRECT
    const wsHost = process.env.NEXT_PUBLIC_BACKEND_HOST || "localhost:4002";
    const ws = new WebSocket(`${proto}://${wsHost}/ws/activity`);
    wsRef.current = ws;

    ws.onopen    = () => {
      setWsStatus("open");
      clearTimeout(reconnectTimer.current);
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "activity") {
          setActivities((prev) => [msg.data, ...prev].slice(0, 20));
        }
      } catch (_) {}
    };
    ws.onclose = () => {
      setWsStatus("closed");
      reconnectTimer.current = setTimeout(connect, 5000);
    };
    ws.onerror = () => ws.close();
  }

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  return { activities, wsStatus };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(timeStr) {
  if (!timeStr) return { time: "--:--", period: "" };
  const [h, m] = timeStr.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return {
    time: `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    period,
  };
}

function statusVariant(status) {
  const map = {
    booked: "info",
    completed: "success",
    cancelled: "destructive",
    no_show: "warning",
    rescheduled: "muted",
  };
  return map[status?.toLowerCase()] || "muted";
}

function statusLabel(status) {
  const map = {
    booked: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
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
        {appt.status === "booked" && !updating && (
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
  const [providerFilter, setProviderFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const { activities, wsStatus } = useLiveActivity();

  const router = useRouter();

useEffect(() => {
  const user = localStorage.getItem("auvia_user");
  if (!user) {
    router.push("/");
  }
}, [router]);

  // ── LIVE from API ──────────────────────────────────────────────
  const { schedule, stats, loading, error, lastRefresh, refresh, updateAppointmentStatus } =
    useSchedule(today);

  const filteredSchedule = schedule.filter((appt) => {
    if (providerFilter === "all") return true;
    return appt.doctor_name?.toLowerCase().includes(
      providerFilter === "rao" ? "rao" : "reddy"
    );
  });

  const visibleSchedule = showAll ? filteredSchedule : filteredSchedule.slice(0, 5);

  const [todayFormatted, setTodayFormatted] = useState("");
  const [timeNow, setTimeNow] = useState("");

  useEffect(() => {
    const now = new Date();
    setTodayFormatted(now.toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }));
    setTimeNow(now.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    }));
  }, []);

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

          {/* ── Error Banner (only shows if API fails) ── */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Failed to load schedule: {error}</span>
              <button onClick={refresh} className="ml-auto text-xs underline">Retry</button>
            </div>
          )}

          {/* ── Main Grid ── */}
          <div className="grid gap-6 lg:grid-cols-[2.1fr_1fr]">

            {/* ── LIVE: Today's Schedule ── */}
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
                <Tabs value={providerFilter} onValueChange={setProviderFilter}>
                  <TabsList className="bg-slate-100">
                    <TabsTrigger value="all">All Providers</TabsTrigger>
                    <TabsTrigger value="rao">Dr. Rao</TabsTrigger>
                    <TabsTrigger value="reddy">Dr. Reddy</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[80px_1.6fr_1fr_140px_90px] text-[11px] uppercase tracking-[0.2em] text-slate-400">
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

              {/* ── STATIC: Inbound Calls ── */}
              <Card className="border-slate-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
                      <PhoneCall className="h-4 w-4" />
                    </div>
                    <CardTitle>Inbound Calls</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">128</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Badge variant="success">98.5%</Badge>
                    <span>Answered</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">84 calls handled by Agent</p>
                </CardContent>
              </Card>

              {/* ── STATIC: Live Activity ── */}
              <Card className="border-slate-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
  <CardHeader className="flex flex-row items-center justify-between">
    <div className="flex items-center gap-2">
      <CardTitle>Live Activity</CardTitle>
      <Badge
        variant={wsStatus === "open" ? "success" : "warning"}
        className="text-[9px]"
      >
        {wsStatus === "open" ? "Live" : "Reconnecting…"}
      </Badge>
    </div>
    <Activity className={`h-4 w-4 ${wsStatus === "open" ? "text-emerald-500" : "text-slate-300"}`} />
  </CardHeader>
  <CardContent>
    <div className="flex flex-col gap-4">
      {activities.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">
          No recent activity yet.
        </p>
      ) : (
        activities.map((item) => (
          <div key={item.id} className="flex gap-3 items-start">
            <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${activityDot(item.event_type)}`} />
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{activityAge(item.created_at)}</p>
              <p className="text-sm text-slate-700 leading-snug">{item.title}</p>
              {item.meta && (
                <p className="text-xs text-slate-400 truncate">{item.meta}</p>
              )}
            </div>
          </div>
        ))
      )}
      <Button className="mt-2 w-full bg-slate-800 text-white hover:bg-slate-700">
        Return Call
      </Button>
    </div>
  </CardContent>
</Card>
            </div>
          </div>

          {/* ── Bottom Grid ── */}
          <div className="grid gap-6">

            {/* ── STATIC: Revenue + LIVE: bar widths from stats ── */}
            <Card className="border-slate-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Total Revenue Today</CardTitle>
                <Badge variant="success">+12.4%</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">₹54,250</div>
                <div className="mt-4 space-y-4">
                  {[
                    {
                      label: "Standard Bookings",
                      display: "₹32,400",
                      color: "bg-slate-900",
                      // Use live stats if available, else static fallback width
                      pct: stats && stats.total > 0
                        ? (Number(stats.booked) / Number(stats.total)) * 100
                        : 70,
                    },
                    {
                      label: "Agent Generated",
                      display: "₹21,850",
                      color: "bg-emerald-400",
                      pct: stats && stats.total > 0
                        ? (Number(stats.completed) / Number(stats.total)) * 100
                        : 48,
                    },
                  ].map(({ label, display, color, pct }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{label}</span>
                        <span>{display}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${Math.min(Math.max(pct, 4), 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <span>Toggle Breakdown</span>
                  <Tabs defaultValue="agent">
                    <TabsList className="bg-slate-100">
                      <TabsTrigger value="agent">Agent</TabsTrigger>
                      <TabsTrigger value="clinic">Clinic</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

          </div>

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