

// app/schedule/page.jsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
  FiCheck, FiUserX,
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

// Helper: Extract minutes from time label (e.g., "09:30 AM" -> 30)
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
  return date.toISOString().slice(0, 10);
}

/** Returns "30 Mar – 5 Apr 2026" for a given anchor date string */
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
  const [errorMsg, setErrorMsg]       = useState(null);
  const [toastMsg, setToastMsg]       = useState(null);
  const [localStatus, setLocalStatus] = useState(appt.status);

  useEffect(() => { setLocalStatus(appt.status); }, [appt.status]);

  async function handleChange(newStatus) {
    if (updating) return;
    setUpdating(true);
    setErrorMsg(null);
    const previous = localStatus;
    setLocalStatus(newStatus);
    try {
      await onStatusChange(appt.id, newStatus);
      setToastMsg(newStatus === "completed" ? "Marked complete ✓" : "Marked no-show");
      setTimeout(() => setToastMsg(null), 2_000);
    } catch (err) {
      setLocalStatus(previous);
      setErrorMsg(err?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  const isActionable = localStatus === "confirmed" || localStatus === "pending";

  const borderColor = {
    confirmed:   "border-l-sky-400",
    pending:     "border-l-amber-400",
    completed:   "border-l-emerald-600",
    cancelled:   "border-l-red-400",
    no_show:     "border-l-orange-400",
    rescheduled: "border-l-violet-400",
  }[localStatus] || "border-l-slate-200";

  const bgColor = {
    confirmed:   "bg-sky-50",
    pending:     "bg-amber-50",
    completed:   "bg-emerald-50",
    cancelled:   "bg-red-50",
    no_show:     "bg-orange-50",
    rescheduled: "bg-violet-50",
  }[localStatus] || "bg-white";

  const textColor = {
    confirmed:   "text-sky-900",
    pending:     "text-amber-900",
    completed:   "text-emerald-900",
    cancelled:   "text-red-900",
    no_show:     "text-orange-900",
    rescheduled: "text-violet-900",
  }[localStatus] || "text-slate-800";

  return (
    <div
      className={`${slotCardHeightClass} overflow-hidden relative border-l-4 ${borderColor} ${bgColor} rounded-r-lg p-2 flex flex-col justify-between shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold truncate" style={{color: textColor}}>
          {appt.patient_name || "Unknown"}
        </p>
        <p className="text-[10px] text-slate-600 truncate">
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
    return <div className={slotCardHeightClass} />;
  }
  return (
    <div className={`${slotCardHeightClass} relative`}>
      <AppointmentCell appt={appts[0]} onStatusChange={onStatusChange} slotCardHeightClass={slotCardHeightClass} />
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
// Renders only the calendar grid — no navigation controls, no week label.
// Both of those now live in the page header (SchedulePage) so they appear
// outside the card, consistent with the All Doctors date controls.

function WeekView({ doctor, anchorDate }) {
  const { weekData, loading } = useWeekSchedule(doctor.id, anchorDate);
  const { slotDurationMinutes, timeSlots, loading: slotsLoading } = useDoctorScheduleSlots(doctor.id);
  const weekDays = getWeekDays(anchorDate);
  const todayStr = new Date().toISOString().slice(0, 10);

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
      <div className="space-y-3">
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
      {/* Day headers - sticky */}
      <div className="schedule-grid sticky top-0 bg-white border-b border-slate-100 z-[5]">
        <div className="h-16 flex items-center justify-center border-r border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Time</span>
        </div>
        {weekDays.map((d, i) => {
          const ymd     = toYMD(d);
          const isToday = ymd === todayStr;
          const count   = (weekData[ymd] || []).length;
          return (
            <div key={ymd} className={`flex flex-col items-center justify-center h-16 border-r border-slate-100 ${isToday ? "bg-slate-50/50" : ""}`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{DAY_LABELS[i]}</span>
              <span className={`text-sm font-extrabold ${isToday ? "text-slate-900" : "text-slate-900"}`}>
                {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full mt-1"
                style={{
                  backgroundColor: count > 0 ? "#d1fae5" : "#f1f5f9",
                  color: count > 0 ? "#047857" : "#64748b"
                }}>
                {count} appt{count !== 1 ? "s" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time rows */}
      <div className="relative">
        {timeSlots.map((slot) => (
          <div key={slot} className="schedule-grid border-b border-slate-50 appointment-slot">
            <div className="flex items-center justify-center border-r border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums leading-none">
                {slot}
              </span>
            </div>
            {weekDays.map((d) => {
              const ymd   = toYMD(d);
              const appts = slotMaps[ymd]?.[slot] ?? [];
              return (
                <SlotCell
                  key={ymd}
                  appts={appts}
                  onStatusChange={(id, status) => appointmentsApi.updateStatus(id, status)}
                  slotCardHeightClass="appointment-slot"
                />
              );
            })}
          </div>
        ))}
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

  useEffect(() => {
    setIsClient(true);
  }, []);

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

      {/* Patient Details Dialog */}
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
  const [selectedDate, setSelectedDate]         = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const { doctors, appointmentMap, loading, error, refresh, updateStatus } =
    useClinicSchedule(selectedDate);

  const { activities, wsStatus } = useLiveActivity();

  // Initialize doctorFilter to the first doctor when doctors load
  useEffect(() => {
    if (doctors.length > 0 && !doctorFilter) {
      setDoctorFilter(doctors[0].id);
    }
  }, [doctors, doctorFilter]);

  const selectedDoctor = doctors.find((d) => d.id === doctorFilter) ?? null;

  // Single-doctor subtitle: "30 Mar – 5 Apr 2026"
  const weekLabel = useMemo(
    () => buildWeekLabel(selectedDate),
    [selectedDate]
  );

  const shiftDate = (offset) => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const visibleDoctors = doctors;

  const handleShiftWeek = (offset) => {
    if (offset === "today") { setSelectedDate(new Date().toISOString().slice(0, 10)); return; }
    shiftDate(offset);
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-6 px-8 py-6">
          <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />

          {/* ── Page header ─────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Clinic Schedule</h1>
              {/*
                All-doctors  → "Monday, March 30, 2026"
                Single doctor → "Dr. Smith · 30 Mar – 5 Apr 2026 · Week View"
              */}
              <p className="text-sm text-slate-500">
                {selectedDoctor && `${selectedDoctor.name} · ${weekLabel} · Week View`}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">

              {/*
                Single-doctor: prev-week / this-week / next-week buttons.
                Placed here in the page header so the week range + navigation
                sit OUTSIDE the calendar card, mirroring the All-doctors controls.
              */}
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
                      onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                    >
                      <FiX />
                    </Button>
                  </div>
                  <Button
                    variant="outline" className="rounded-full px-3"
                    onClick={() => handleShiftWeek(-7)}
                  >
                    <FiChevronLeft />
                  </Button>
                  <Button
                    variant="outline" className="rounded-full px-4 text-xs"
                    onClick={() => handleShiftWeek("today")}
                  >
                    This week
                  </Button>
                  <Button
                    variant="outline" className="rounded-full px-3"
                    onClick={() => handleShiftWeek(7)}
                  >
                    <FiChevronRight />
                  </Button>
                </>
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
          {/* ── /Page header ─────────────────────────────────────────────────── */}

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

              <CardContent>
                {/* Single-doctor week grid — navigation is now in the page header */}
                {loading ? (
                  <div className="space-y-3 mt-2">
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
                    <WeekView
                      doctor={selectedDoctor}
                      anchorDate={selectedDate}
                    />
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