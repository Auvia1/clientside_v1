

// app/schedule/page.jsx
"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import NewAppointmentDialog from "../components/NewAppointmentDialog";
import PatientDetailsDialog from "../components/PatientDetailsDialog";
import LiveActivityPanel from "../components/LiveActivityPanel";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  FiChevronLeft, FiChevronRight, FiSearch, FiCalendar,
  FiX, FiRefreshCw, FiAlertCircle, FiLoader, FiActivity,
  FiCheck, FiUserX, FiGrid, FiList, FiArchive, FiClock, FiColumns, FiChevronDown,
} from "react-icons/fi";
import { useClinicSchedule, usePatientSearch, useDoctorScheduleSlots } from "../hooks/useSchedule";
import { useLiveActivity } from "../hooks/useLiveActivity";
import { appointmentsApi, doctorsApi } from "../lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IST = "Asia/Kolkata";

function formatTimeLabel(tsStr) {
  if (!tsStr) return "";
  return new Date(tsStr)
    .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: IST })
    .toUpperCase();
}

function getISTHour(tsStr) {
  if (!tsStr) return -1;
  const d = new Date(tsStr);
  return parseInt(
    new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: IST }).format(d),
    10
  );
}

function extractMinutesFromLabel(label) {
  const [timePart] = label.split(" ");
  const [, m] = timePart.split(":").map(Number);
  return m || 0;
}

function slotLabelToHour(label) {
  const [timePart, period] = label.split(" ");
  let [h] = timePart.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h;
}

function buildSlotMap(appts = [], timeSlots, slotDurationMinutes) {
  const map = {};
  for (const slot of timeSlots) {
    const slotStartHour = slotLabelToHour(slot);
    const slotStartMinutes = slotStartHour * 60 + extractMinutesFromLabel(slot);
    const slotEndMinutes = slotStartMinutes + slotDurationMinutes;

    map[slot] = appts.filter((a) => {
      const apptHour = getISTHour(a.appointment_start);
      const apptMinutes = apptHour * 60 + extractMinutesFromLabel(a.appointment_start);
      return apptMinutes >= slotStartMinutes && apptMinutes < slotEndMinutes;
    });
  }
  return map;
}

function statusVariant(status) {
  return {
    confirmed:   "info",
    pending:     "warning",
    completed:   "success",
    cancelled:   "destructive",
    no_show:     "warning",
    rescheduled: "muted",
  }[status?.toLowerCase()] || "muted";
}

function statusLabel(status) {
  return {
    confirmed:   "Confirmed",
    pending:     "Pending",
    completed:   "Completed",
    cancelled:   "Cancelled",
    no_show:     "No Show",
    rescheduled: "Rescheduled",
  }[status] || status;
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function relativeDate(dateStr) {
  if (!dateStr) return "No visits yet";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30)  return `${diff} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function activityAge(createdAt) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function activityDot(type) {
  return {
    agent_booking:  "bg-emerald-400",
    manual_booking: "bg-sky-400",
    completion:     "bg-emerald-500",
    active_call:    "bg-amber-400 animate-pulse",
    cancellation:   "bg-red-400",
    reschedule:     "bg-violet-400",
  }[type] || "bg-slate-300";
}

function activityTypeLabel(type) {
  return {
    agent_booking:  "Agent booked",
    manual_booking: "Receptionist booked",
    completion:     "Completed",
    active_call:    "Active call",
    cancellation:   "Cancelled",
    reschedule:     "Rescheduled",
  }[type] || type;
}

function metaSubline(meta) {
  if (!meta) return null;
  const obj = typeof meta === "string" ? JSON.parse(meta) : meta;
  if (obj.appointment_start) {
    try {
      return new Date(obj.appointment_start).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true, timeZone: IST,
      });
    } catch (_) {}
  }
  if (obj.doctor_name) return `Dr. ${obj.doctor_name}`;
  return null;
}

function getWeekStart(dateStr) {
  const d   = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function getWeekDays(dateStr) {
  const monday = getWeekStart(dateStr);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function toYMD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildWeekLabel(anchorDate) {
  const days = getWeekDays(anchorDate);
  const s = days[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const e = days[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return `${s} – ${e}`;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── useWeekSchedule ─────────────────────────────────────────────────────────

function useWeekSchedule(doctorId, anchorDate) {
  const [weekData, setWeekData] = useState({});
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!doctorId || doctorId === "all") { setWeekData({}); return; }
    setLoading(true);
    const days = getWeekDays(anchorDate).map(toYMD);

    Promise.all(
      days.map((date) =>
        appointmentsApi.getSchedule(date, doctorId)
          .then((data) => ({ date, appts: data || [] }))
          .catch(() => ({ date, appts: [] }))
      )
    ).then((results) => {
      const map = {};
      for (const { date, appts } of results) map[date] = appts;
      setWeekData(map);
      setLoading(false);
    });
  }, [doctorId, anchorDate]);

  return { weekData, loading };
}

// ─── AppointmentCell ──────────────────────────────────────────────────────────

function AppointmentCell({ appt, onStatusChange, slotCardHeightClass = "appointment-slot" }) {
  const [updating, setUpdating]       = useState(false);
  const [localStatus, setLocalStatus] = useState(appt.status);

  useEffect(() => { setLocalStatus(appt.status); }, [appt.status]);

  async function handleChange(newStatus) {
    if (updating) return;
    setUpdating(true);
    const previous = localStatus;
    setLocalStatus(newStatus);
    try {
      await onStatusChange(appt.id, newStatus);
    } catch (err) {
      setLocalStatus(previous);
    } finally {
      setUpdating(false);
    }
  }

  const statusColorMap = {
    confirmed:   { bg: "#f0f9ff", border: "#0ea5e9", text: "#075985" },
    pending:     { bg: "#fffbeb", border: "#f59e0b", text: "#92400e" },
    completed:   { bg: "#f0fdf4", border: "#059669", text: "#065f46" },
    cancelled:   { bg: "#fef2f2", border: "#dc2626", text: "#7f1d1d" },
    no_show:     { bg: "#fff7ed", border: "#f97316", text: "#7c2d12" },
    rescheduled: { bg: "#faf5ff", border: "#a855f7", text: "#5b21b6" },
  };

  const colors = statusColorMap[localStatus] || { bg: "#ffffff", border: "#cbd5e1", text: "#1e293b" };

  return (
    <div
      className={`${slotCardHeightClass} overflow-hidden relative border-l-4 rounded-r-lg flex flex-col justify-between shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer`}
      style={{
        backgroundColor: colors.bg,
        borderLeftColor: colors.border,
        /* ── ENHANCED: more comfortable inner padding ── */
        padding: "6px 8px 6px 10px",
        margin: "2px 3px 2px 0",
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold truncate leading-tight" style={{ color: colors.text }}>
          {appt.patient_name || "Unknown"}
        </p>
        <p className="text-[10px] text-slate-500 truncate mt-0.5 leading-tight">
          {appt.reason || "—"}
        </p>
      </div>

      {updating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-r-lg">
          <FiLoader className="h-3 w-3 animate-spin text-slate-600" />
        </div>
      )}
    </div>
  );
}

// ─── SlotCell ─────────────────────────────────────────────────────────────────

function SlotCell({ appts = [], onStatusChange, slotCardHeightClass = "appointment-slot" }) {
  if (appts.length === 0) {
    return (
      <div
        className={`${slotCardHeightClass}`}
        style={{ padding: "2px 3px" }}
      />
    );
  }
  return (
    <div className={`${slotCardHeightClass} relative`} style={{ padding: "2px 3px" }}>
      <AppointmentCell
        appt={appts[0]}
        onStatusChange={onStatusChange}
        slotCardHeightClass={slotCardHeightClass}
      />
      {appts.length > 1 && (
        <div className="absolute bottom-0 inset-x-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm py-0.5 border-t border-slate-100 rounded-b-lg">
          <p className="text-[9px] font-semibold text-slate-400">
            +{appts.length - 1} more
          </p>
        </div>
      )}
    </div>
  );
}

// ─── WeekView ─────────────────────────────────────────────────────────────────

function WeekView({ doctor, anchorDate }) {
  const { weekData, loading } = useWeekSchedule(doctor.id, anchorDate);
  const { slotDurationMinutes, timeSlots, loading: slotsLoading } = useDoctorScheduleSlots(doctor.id);
  const weekDays = getWeekDays(anchorDate);
  const todayStr = toYMD(new Date());

  const slotMaps = useMemo(() => {
    const maps = {};
    for (const d of weekDays) {
      const ymd = toYMD(d);
      maps[ymd] = buildSlotMap(weekData[ymd] || [], timeSlots, slotDurationMinutes);
    }
    return maps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekData, timeSlots, slotDurationMinutes]);

  if (loading || slotsLoading) {
    return (
      <div className="space-y-3 px-1 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-[80px] appointment-slot animate-pulse rounded-xl bg-slate-100 shrink-0" />
            {[0,1,2,3,4,5,6].map((j) => (
              <div key={j} className="flex-1 appointment-slot animate-pulse rounded-xl bg-slate-50" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto hide-scrollbar">

      {/* ── Day-header row ── */}
      <div
        className="sticky top-0 bg-white z-[5]"
        style={{
          display: "grid",
          gridTemplateColumns: "80px repeat(7, 140px)",
          borderBottom: "2px solid #f1f5f9",
          minWidth: "max-content",
        }}
      >

        {/* Time-column header */}
        <div
          className="flex items-center justify-center border-r border-slate-100"
          style={{ height: "72px", paddingBottom: "6px" }}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</span>
        </div>

        {weekDays.map((d, i) => {
          const ymd     = toYMD(d);
          const isToday = ymd === todayStr;
          const count   = (weekData[ymd] || []).length;
          return (
            <div
              key={ymd}
              className={`flex flex-col items-center justify-center border-r border-slate-100 ${isToday ? "bg-slate-50/60" : ""}`}
              style={{ height: "72px", paddingBottom: "6px" }}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                {DAY_LABELS[i]}
              </span>
              <span className={`text-[15px] font-extrabold leading-none ${isToday ? "text-emerald-600" : "text-slate-800"}`}>
                {d.toLocaleDateString("en-IN", { day: "numeric" })}
              </span>
              <span
                className="text-[9px] font-medium text-slate-400 leading-none mb-1"
                style={{ marginTop: "2px" }}
              >
                {d.toLocaleDateString("en-IN", { month: "short" })}
              </span>
              <span
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: count > 0 ? "#d1fae5" : "#f1f5f9",
                  color: count > 0 ? "#047857" : "#94a3b8",
                }}
              >
                {count} appt{count !== 1 ? "s" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Spacer between header and first time row ── */}
      <div style={{ height: "10px", backgroundColor: "#fafbfc", borderBottom: "1px solid #f1f5f9" }} />

      {/* ── Time rows ── */}
      <div className="relative" style={{ paddingTop: "2px", minWidth: "max-content" }}>
        {timeSlots.map((slot, idx) => (
          <div
            key={slot}
            className="appointment-slot"
            style={{
              display: "grid",
              gridTemplateColumns: "80px repeat(7, 140px)",
              borderBottom: "1px solid #f4f6f8",
              backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafbfc",
            }}
          >
            {/* Time label cell */}
            <div
              className="flex items-center justify-center border-r border-slate-100"
              style={{ paddingLeft: "4px", paddingRight: "4px" }}
            >
              <span className="text-[10px] font-semibold text-slate-400 tabular-nums leading-none tracking-tight">
                {slot}
              </span>
            </div>

            {/* Day slot cells */}
            {weekDays.map((d) => {
              const ymd   = toYMD(d);
              const isToday = ymd === todayStr;
              const appts = slotMaps[ymd]?.[slot] ?? [];
              return (
                <div
                  key={ymd}
                  className="relative"
                  style={{
                    /* subtle today column tint */
                    backgroundColor: isToday ? "rgba(16,185,129,0.03)" : "transparent",
                    borderRight: "1px solid #f1f5f9",
                  }}
                >
                  <SlotCell
                    appts={appts}
                    onStatusChange={(id, status) => appointmentsApi.updateStatus(id, status)}
                    slotCardHeightClass="appointment-slot"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DayView ──────────────────────────────────────────────────────────────────

function DayView({ doctor, anchorDate, onDateChange }) {
  const { weekData, loading } = useWeekSchedule(doctor.id, anchorDate);
  const ymd = toYMD(new Date(`${anchorDate}T00:00:00`));
  const appts = weekData[ymd] || [];
  const { timeSlots, slotDurationMinutes, loading: slotsLoading } = useDoctorScheduleSlots(doctor.id);

  const currentDate = new Date(`${anchorDate}T00:00:00`);
  const isToday = anchorDate === toYMD(new Date());

  const handlePrevDay = useCallback(() => {
    const d = new Date(`${anchorDate}T00:00:00`);
    d.setDate(d.getDate() - 1);
    onDateChange(toYMD(d));
  }, [anchorDate, onDateChange]);

  const handleNextDay = useCallback(() => {
    const d = new Date(`${anchorDate}T00:00:00`);
    d.setDate(d.getDate() + 1);
    onDateChange(toYMD(d));
  }, [anchorDate, onDateChange]);

  const handleToday = useCallback(() => {
    const today = new Date();
    onDateChange(toYMD(today));
  }, [onDateChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); handlePrevDay(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); handleNextDay(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevDay, handleNextDay]);

  const slotMap = useMemo(() => {
    return buildSlotMap(appts, timeSlots, slotDurationMinutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appts, timeSlots, slotDurationMinutes]);

  if (loading || slotsLoading) {
    return (
      <div className="space-y-3 px-1 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-[80px] appointment-slot animate-pulse rounded-xl bg-slate-100 shrink-0" />
            <div className="flex-1 appointment-slot animate-pulse rounded-xl bg-slate-50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Date navigation header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 w-8 p-0 rounded-full hover:bg-slate-200 transition-colors flex items-center justify-center"
            onClick={handlePrevDay}
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-col min-w-max">
            <h3 className="text-sm font-semibold text-slate-700">
              {currentDate.toLocaleDateString("en-IN", {
                weekday: "short", year: "numeric", month: "short", day: "numeric"
              })} · <span className="text-slate-500 font-normal">{appts.length} appt{appts.length !== 1 ? "s" : ""}</span>
            </h3>
            {isToday && <span className="text-[10px] text-emerald-600 font-semibold">Today</span>}
          </div>
          <button
            type="button"
            className="h-8 w-8 p-0 rounded-full hover:bg-slate-200 transition-colors flex items-center justify-center"
            onClick={handleNextDay}
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {!isToday && (
            <Button variant="outline" size="sm" className="rounded-full px-2 h-7 text-[11px]" onClick={handleToday}>
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Day grid view */}
      <div className="overflow-x-auto hide-scrollbar">

        {/* ── Time rows with single day column ── */}
        <div className="relative" style={{ paddingTop: "2px", minWidth: "max-content" }}>
          {timeSlots.map((slot, idx) => (
            <div
              key={slot}
              className="appointment-slot"
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                borderBottom: "1px solid #f4f6f8",
                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafbfc",
              }}
            >
              {/* Time label cell */}
              <div
                className="flex items-center justify-center border-r border-slate-100"
                style={{ paddingLeft: "4px", paddingRight: "4px" }}
              >
                <span className="text-[10px] font-semibold text-slate-400 tabular-nums leading-none tracking-tight">
                  {slot}
                </span>
              </div>

              {/* Day slot cell */}
              <div
                className="relative"
                style={{
                  backgroundColor: isToday ? "rgba(16,185,129,0.03)" : "transparent",
                }}
              >
                <SlotCell
                  appts={slotMap[slot] ?? []}
                  onStatusChange={(id, status) => appointmentsApi.updateStatus(id, status)}
                  slotCardHeightClass="appointment-slot"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MonthView ────────────────────────────────────────────────────────────────

function MonthView({ doctor, anchorDate }) {
  const year = new Date(`${anchorDate}T00:00:00`).getFullYear();
  const month = new Date(`${anchorDate}T00:00:00`).getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const [monthData, setMonthData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const requests = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toYMD(new Date(year, month, day));
      requests.push(
        appointmentsApi
          .getSchedule(dateStr, doctor.id)
          .then((appts) => ({ date: dateStr, appts: Array.isArray(appts) ? appts : [] }))
          .catch(() => ({ date: dateStr, appts: [] }))
      );
    }
    Promise.all(requests).then((results) => {
      const map = {};
      for (const { date, appts } of results) map[date] = appts;
      setMonthData(map);
      setLoading(false);
    });
  }, [doctor.id, year, month]);

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);

  const monthName = new Date(year, month).toLocaleDateString("en-IN", {
    month: "long", year: "numeric"
  });

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-2 p-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      <h3 className="text-sm font-semibold text-slate-700">{monthName}</h3>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-24 bg-slate-50 rounded-lg" />;
          }

          const dateStr = toYMD(new Date(year, month, day));
          const appts = monthData[dateStr] || [];
          const isToday = dateStr === toYMD(new Date());

          return (
            <div
              key={dateStr}
              className={`h-24 p-2 rounded-lg border-2 overflow-hidden hover:border-slate-300 transition-colors ${
                isToday ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={`text-xs font-bold ${isToday ? "text-emerald-700" : "text-slate-600"}`}>
                  {day}
                </span>
                {appts.length > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    {appts.length}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 text-[10px] max-h-16 overflow-y-auto">
                {appts.slice(0, 2).map((appt) => (
                  <div
                    key={appt.id}
                    className="truncate px-1.5 py-1 rounded bg-blue-100 text-blue-700 font-semibold"
                    title={appt.patient_name}
                  >
                    {appt.patient_name?.split(" ")[0]}
                  </div>
                ))}
                {appts.length > 2 && (
                  <div className="text-slate-500 text-[9px] px-1.5">
                    +{appts.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PatientLookup ────────────────────────────────────────────────────────────

function PatientLookup() {
  const { query, setQuery, results, loading, error } = usePatientSearch();
  const [isClient, setIsClient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader><CardTitle>Patient Look-up</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
          <Input
            className="h-9 rounded-full border-slate-200 pl-9 text-sm"
            placeholder="Name or Phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <FiLoader className="absolute right-3 top-2.5 animate-spin text-slate-400" />}
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <FiAlertCircle />{error}
          </p>
        )}
        {!isClient ? (
          <div className="space-y-2 max-h-64">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.length === 0 && query.trim() && !loading ? (
              <p className="text-xs text-slate-400 text-center py-4">No patients found.</p>
            ) : results.length === 0 && !query.trim() && !loading ? (
              <p className="text-xs text-slate-400 text-center py-4">No patients available.</p>
            ) : (
              results.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 hover:-translate-y-0.5 hover:shadow transition-transform cursor-pointer"
                  onClick={() => {
                    setSelectedPatient(patient);
                    setIsDialogOpen(true);
                  }}
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
                    {initials(patient.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{patient.name}</p>
                    <p className="text-xs text-slate-400">{patient.phone} • {relativeDate(patient.last_visit)}</p>
                  </div>
                  <Badge variant="muted" className="ml-auto shrink-0 text-[9px]">
                    {patient.total_appointments} visits
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}
        <Link href="/view-all-patients">
          <Button variant="outline" className="w-full rounded-full">View All Patients</Button>
        </Link>
      </CardContent>

      <PatientDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patient={selectedPatient}
      />
    </Card>
  );
}

// ─── SchedulePage ─────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [activeMonitoring, setActiveMonitoring] = useState(true);
  const [doctorFilter, setDoctorFilter]         = useState(null);
  const [viewMode, setViewMode]                 = useState("week");
  const [viewModeDropdownOpen, setViewModeDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate]         = useState(
    () => {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const day = String(new Date().getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  );
  const viewModeDropdownRef = useRef(null);

  const { doctors, appointmentMap, loading, error, refresh, updateStatus } =
    useClinicSchedule(selectedDate);

  const { activities, wsStatus } = useLiveActivity();

  useEffect(() => {
    if (doctors.length > 0 && !doctorFilter) {
      setDoctorFilter(doctors[0].id);
    }
  }, [doctors, doctorFilter]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (viewModeDropdownRef.current && !viewModeDropdownRef.current.contains(e.target)) {
        setViewModeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDoctor = doctors.find((d) => d.id === doctorFilter) ?? null;

  const weekLabel = useMemo(() => buildWeekLabel(selectedDate), [selectedDate]);

  const shiftDate = (offset) => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + offset);
    setSelectedDate(toYMD(d));
  };

  const visibleDoctors = doctors;

  const handleShiftWeek = (offset) => {
    if (offset === "today") { setSelectedDate(toYMD(new Date())); return; }
    shiftDate(offset);
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-6 px-8 py-6">
          <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />

          {/* ── Page header ── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Clinic Schedule</h1>
              <p className="text-sm text-slate-500">
                {selectedDoctor && `${selectedDoctor.name} · ${weekLabel} · ${viewMode === "week" ? "Week" : viewMode === "day" ? "Day" : "Month"} View`}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {selectedDoctor && (
                <>
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                    <FiCalendar className="text-slate-400 shrink-0" />
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-8 border-none bg-transparent p-0 text-xs w-32"
                    />
                    <Button
                      variant="ghost" size="sm" className="h-6 w-6 rounded-full p-0"
                      onClick={() => setSelectedDate(toYMD(new Date()))}
                    >
                      <FiX />
                    </Button>
                  </div>
                  <Button variant="outline" className="rounded-full px-3" onClick={() => handleShiftWeek(-7)}>
                    <FiChevronLeft />
                  </Button>
                  <Button variant="outline" className="rounded-full px-4 text-xs" onClick={() => handleShiftWeek("today")}>
                    This week
                  </Button>
                  <Button variant="outline" className="rounded-full px-3" onClick={() => handleShiftWeek(7)}>
                    <FiChevronRight />
                  </Button>
                </>
              )}

              {selectedDoctor && (
                <div className="relative" ref={viewModeDropdownRef}>
                  <Button
                    variant="outline"
                    className="rounded-full px-3 gap-2"
                    onClick={() => setViewModeDropdownOpen(!viewModeDropdownOpen)}
                  >
                    {viewMode === "week" && <FiColumns className="h-4 w-4" />}
                    {viewMode === "day"  && <FiClock    className="h-4 w-4" />}
                    {viewMode === "month"&& <FiGrid     className="h-4 w-4" />}
                    <span className="text-xs capitalize">{viewMode} View</span>
                    <FiChevronDown className={`h-4 w-4 transition-transform ${viewModeDropdownOpen ? "rotate-180" : ""}`} />
                  </Button>
                  {viewModeDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                      {[
                        { mode: "week",  Icon: FiColumns, label: "Week View" },
                        { mode: "day",   Icon: FiClock,   label: "Day View"  },
                        { mode: "month", Icon: FiGrid,    label: "Month View"},
                      ].map(({ mode, Icon, label }) => (
                        <button
                          key={mode}
                          onClick={() => { setViewMode(mode); setViewModeDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                            viewMode === mode ? "bg-slate-100 text-emerald-600 font-semibold" : "text-slate-700"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="outline" size="sm" onClick={refresh} disabled={loading}
                className="rounded-full px-3 gap-1"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
              </Button>

              <NewAppointmentDialog
                className="rounded-full px-4 transition-transform duration-200 hover:-translate-y-0.5"
                onBooked={refresh}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <FiAlertCircle className="shrink-0" />
              <span>Failed to load schedule: {error}</span>
              <button onClick={refresh} className="ml-auto text-xs underline">Retry</button>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">

            <Card className="border-slate-100 shadow-sm overflow-x-auto">
              <CardHeader className="pb-2">
                {/* Doctor filter pills */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {doctors.map((d) => (
                    <Button
                      key={d.id}
                      variant={doctorFilter === d.id ? "default" : "outline"}
                      className="rounded-full px-4 text-xs"
                      onClick={() => setDoctorFilter(d.id)}
                    >
                      Dr. {d.name.split(" ").pop()}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="px-0 pb-4">
                {loading ? (
                  <div className="space-y-3 px-4 mt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-[90px] h-[120px] animate-pulse rounded-xl bg-slate-100 shrink-0" />
                        {[1,2,3].map((j) => (
                          <div key={j} className="flex-1 h-[120px] animate-pulse rounded-xl bg-slate-50" />
                        ))}
                      </div>
                    ))}
                  </div>

                ) : visibleDoctors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <FiCalendar className="h-8 w-8 mb-3 opacity-40" />
                    <p className="text-sm">No doctors found.</p>
                  </div>

                ) : (
                  selectedDoctor && (
                    <>
                      {viewMode === "week" && (
                        <WeekView doctor={selectedDoctor} anchorDate={selectedDate} />
                      )}
                      {viewMode === "day" && (
                        <DayView
                          doctor={selectedDoctor}
                          anchorDate={selectedDate}
                          onDateChange={setSelectedDate}
                        />
                      )}
                      {viewMode === "month" && (
                        <MonthView doctor={selectedDoctor} anchorDate={selectedDate} />
                      )}
                    </>
                  )
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <PatientLookup />
              <LiveActivityPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}