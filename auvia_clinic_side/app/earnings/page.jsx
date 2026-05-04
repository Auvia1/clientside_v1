

"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { TrendingUp, TrendingDown, DollarSign, Calendar, ChevronLeft, ChevronRight, X, Activity, Users, Star, RefreshCw, AlertCircle } from "lucide-react";
import EarningsChart from "../components/EarningsChart";
import { doctorsApi, paymentsApi } from "../lib/api";

const doctorEarningsData = {
  1: { id: 1, name: "Dr. Rajesh Kumar", weekly: [{ day: "Sun", earnings: 6500 }, { day: "Mon", earnings: 12000 }, { day: "Tue", earnings: 18500 }, { day: "Wed", earnings: 14500 }, { day: "Thu", earnings: 21000 }, { day: "Fri", earnings: 19500 }, { day: "Sat", earnings: 9200 }], appointments: 24 },
  2: { id: 2, name: "Dr. Priya Singh", weekly: [{ day: "Sun", earnings: 8000 }, { day: "Mon", earnings: 9500 }, { day: "Tue", earnings: 12000 }, { day: "Wed", earnings: 11200 }, { day: "Thu", earnings: 13500 }, { day: "Fri", earnings: 14800 }, { day: "Sat", earnings: 7600 }], appointments: 18 },
  3: { id: 3, name: "Dr. Amit Patel", weekly: [{ day: "Sun", earnings: 5200 }, { day: "Mon", earnings: 8900 }, { day: "Tue", earnings: 15600 }, { day: "Wed", earnings: 16800 }, { day: "Thu", earnings: 18200 }, { day: "Fri", earnings: 16500 }, { day: "Sat", earnings: 11200 }], appointments: 22 },
};

// ─── Inline sparkline bar chart ───────────────────────────────────────────────
function SparkBars({ data = [] }) {
  const max = Math.max(...data.map((d) => d.earnings), 1);
  return (
    <div className="flex items-end gap-[3px] h-8">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-300"
          style={{
            height: `${Math.max(4, (d.earnings / max) * 32)}px`,
            backgroundColor: d.earnings === max ? "#059669" : "#d1fae5",
          }}
          title={`${d.day}: ₹${d.earnings.toLocaleString("en-IN")}`}
        />
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent = "emerald", trend, sparkData }) {
  const accents = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500" },
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    icon: "text-blue-500"    },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600",   icon: "text-amber-500"   },
    slate:   { bg: "bg-slate-100",  text: "text-slate-700",   icon: "text-slate-500"   },
  };
  const a = accents[accent];

  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
          <div className={`h-8 w-8 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-4 w-4 ${a.icon}`} />
          </div>
        </div>
        <p className={`text-2xl font-bold ${a.text} leading-none mb-1`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {trend >= 0
              ? <TrendingUp className="h-3 w-3 text-emerald-500" />
              : <TrendingDown className="h-3 w-3 text-red-400" />
            }
            <span className={`text-[10px] font-semibold ${trend >= 0 ? "text-emerald-500" : "text-red-400"}`}>
              {trend >= 0 ? "+" : ""}{trend}% vs last week
            </span>
          </div>
        )}
        {sparkData && <div className="mt-3"><SparkBars data={sparkData} /></div>}
      </CardContent>
    </Card>
  );
}

// ─── Doctor pill selector ─────────────────────────────────────────────────────
function DoctorPills({ doctors, selectedId, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {doctors.map((d) => (
        <button
          key={d.id}
          onClick={() => onSelect(d.id)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all duration-150 ${
            selectedId === d.id
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          Dr. {d.name.split(" ").pop()}
        </button>
      ))}
    </div>
  );
}

// ─── Day breakdown row ────────────────────────────────────────────────────────
function DayBreakdownRow({ day, earnings, total, isHighest }) {
  const pct = total > 0 ? Math.round((earnings / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-[11px] font-semibold text-slate-400 w-8 shrink-0">{day}</span>
      <div className="flex-1 relative h-[6px] bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${isHighest ? "bg-emerald-500" : "bg-slate-300 group-hover:bg-slate-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-slate-700 w-16 text-right tabular-nums">
        ₹{(earnings / 1000).toFixed(1)}k
      </span>
      {isHighest && (
        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">peak</span>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EarningsPage() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [doctorAppointmentCount, setDoctorAppointmentCount] = useState(0);
  const [doctorWeeklyEarnings, setDoctorWeeklyEarnings] = useState(0);
  const [doctorLoading, setDoctorLoading] = useState(false);

  const getWeekBounds = (dateStr) => {
    const d = new Date(dateStr);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end, startStr: start.toISOString().split("T")[0], endStr: end.toISOString().split("T")[0] };
  };

  const weekOffset = (() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.floor((new Date(selectedDate) - today) / 86_400_000);
    return Math.floor(diff / 7);
  })();

  const weekLabel = (() => {
    const { start, end } = getWeekBounds(selectedDate);
    const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${fmt(start)} – ${fmt(end)}`;
  })();

  const weekTag = weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : weekOffset === 1 ? "Next Week" : `Week ${weekOffset > 0 ? "+" : ""}${weekOffset}`;

  const fetchEarnings = async (date = selectedDate) => {
    try {
      setLoading(true); setError(null);
      const { startStr, endStr } = getWeekBounds(date);
      const payments = await paymentsApi.list({ status: "paid", start_date: startStr, end_date: endStr, limit: 100 });

      const dayMap = [0,1,2,3,4,5,6].map((i) => ({ day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i], earnings: 0 }));
      payments.forEach((p) => {
        const dow = new Date(p.created_at).getDay();
        dayMap[dow].earnings += parseFloat(p.amount) || 0;
      });

      setWeeklyData(dayMap);
      setTotalEarnings(dayMap.reduce((s, d) => s + d.earnings, 0));
    } catch (err) {
      setError(err.message);
      setWeeklyData([
        { day: "Sun", earnings: 6500 }, { day: "Mon", earnings: 12000 },
        { day: "Tue", earnings: 18500 }, { day: "Wed", earnings: 14500 },
        { day: "Thu", earnings: 21000 }, { day: "Fri", earnings: 19500 },
        { day: "Sat", earnings: 9200  },
      ]);
      setTotalEarnings(101200);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { fetchEarnings(selectedDate); }, [selectedDate]);

  useEffect(() => {
    doctorsApi.list()
      .then((data) => { setDoctors(data); if (data.length) setSelectedDoctorId(data[0].id); })
      .catch(() => {
        const fallback = Object.values(doctorEarningsData).map((d) => ({ id: d.id, name: d.name }));
        setDoctors(fallback);
        setSelectedDoctorId(fallback[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedDoctorId) return;
    setDoctorLoading(true);
    const { startStr, endStr } = getWeekBounds(selectedDate);
    doctorsApi.getAppointments(selectedDoctorId, { status: "completed", start_date: startStr, end_date: endStr, limit: 100 })
      .then((res) => {
        setDoctorAppointmentCount(res?.length || 0);
        setDoctorWeeklyEarnings(res?.reduce((s, a) => s + (parseFloat(a.payment_amount) || 0), 0) || 0);
      })
      .catch(() => { setDoctorAppointmentCount(0); setDoctorWeeklyEarnings(0); })
      .finally(() => setDoctorLoading(false));
  }, [selectedDoctorId, selectedDate]);

  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const highestDay = weeklyData.length ? weeklyData.reduce((m, d) => d.earnings > m.earnings ? d : m) : null;
  const avgDaily   = weeklyData.length ? Math.round(totalEarnings / weeklyData.length) : 0;
  const perAppt    = doctorAppointmentCount > 0 ? Math.round(doctorWeeklyEarnings / doctorAppointmentCount) : 0;
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-6 px-8 py-6">
          <Navbar />

          {/* ── Page header ── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Revenue</h1>
              <p className="text-sm text-slate-500">{weekTag} · {weekLabel}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Date picker */}
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-8 border-none bg-transparent p-0 text-xs w-32"
                />
                <Button variant="ghost" size="sm" className="h-6 w-6 rounded-full p-0"
                  onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Button variant="outline" className="rounded-full px-3" onClick={() => shiftDate(-7)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-full px-4 text-xs"
                onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}>
                This week
              </Button>
              <Button variant="outline" className="rounded-full px-3" onClick={() => shiftDate(7)}>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm" className="rounded-full px-3 gap-1"
                onClick={() => { setRefreshing(true); fetchEarnings(selectedDate); }}
                disabled={loading || refreshing}>
                <RefreshCw className={`h-4 w-4 ${(loading || refreshing) ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Using cached data — {error}</span>
            </div>
          )}

          {/* ── Top stat cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Revenue"
              value={loading ? "—" : `₹${totalEarnings.toLocaleString("en-IN")}`}
              sub="This week · all doctors"
              icon={DollarSign}
              accent="emerald"
              sparkData={weeklyData}
            />
            <StatCard
              label="Daily Average"
              value={loading ? "—" : `₹${avgDaily.toLocaleString("en-IN")}`}
              sub="Across 7 days"
              icon={Activity}
              accent="blue"
            />
            <StatCard
              label="Peak Day"
              value={loading || !highestDay ? "—" : highestDay.day}
              sub={highestDay ? `₹${highestDay.earnings.toLocaleString("en-IN")}` : "—"}
              icon={Star}
              accent="amber"
            />
            <StatCard
              label="Total Appointments"
              value={doctorLoading ? "—" : doctorAppointmentCount}
              sub={selectedDoctor ? `Dr. ${selectedDoctor.name.split(" ").pop()}` : "Select a doctor"}
              icon={Users}
              accent="slate"
            />
          </div>

          {/* ── Main content row ── */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

            {/* Chart */}
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-700">Weekly Earnings</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">{weekLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      ₹{totalEarnings.toLocaleString("en-IN")} total
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
                ) : (
                  <EarningsChart data={weeklyData} />
                )}
              </CardContent>
            </Card>

            {/* Right column */}
            <div className="flex flex-col gap-6">

              {/* Day breakdown */}
              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">Day Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading
                    ? Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-4 animate-pulse rounded bg-slate-100" />
                      ))
                    : weeklyData.map((d) => (
                        <DayBreakdownRow
                          key={d.day}
                          day={d.day}
                          earnings={d.earnings}
                          total={totalEarnings}
                          isHighest={highestDay?.day === d.day}
                        />
                      ))
                  }
                </CardContent>
              </Card>

              {/* Doctor summary */}
              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-3">
                    <CardTitle className="text-sm font-semibold text-slate-700">Doctor Summary</CardTitle>
                    <DoctorPills
                      doctors={doctors}
                      selectedId={selectedDoctorId}
                      onSelect={setSelectedDoctorId}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-emerald-50 px-4 py-3">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Weekly</p>
                      <p className="text-xl font-bold text-emerald-600 leading-none">
                        {doctorLoading ? "…" : `₹${(doctorWeeklyEarnings / 1000).toFixed(1)}k`}
                      </p>
                    </div>
                    <div className="rounded-xl bg-blue-50 px-4 py-3">
                      <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-1">Appts</p>
                      <p className="text-xl font-bold text-blue-600 leading-none">
                        {doctorLoading ? "…" : doctorAppointmentCount}
                      </p>
                    </div>
                  </div>

                  {/* Per-appointment */}
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Revenue / Appointment</p>
                    <p className="text-xl font-bold text-slate-700 leading-none">
                      {doctorLoading ? "…" : (perAppt > 0 ? `₹${perAppt.toLocaleString("en-IN")}` : "—")}
                    </p>
                  </div>

                  {/* Divider stats */}
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    {[
                      { label: "Total weekly earnings", value: `₹${doctorWeeklyEarnings.toLocaleString("en-IN")}` },
                      { label: "Completed appointments", value: doctorLoading ? "…" : doctorAppointmentCount },
                      { label: "Avg per appointment",    value: perAppt > 0 ? `₹${perAppt.toLocaleString("en-IN")}` : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-semibold text-slate-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
            <span>© 2026 Auvia Health Systems · Revenue Analytics</span>
            <span>Last updated {new Date().toLocaleTimeString("en-IN")}</span>
          </div>
        </main>
      </div>
    </div>
  );
}