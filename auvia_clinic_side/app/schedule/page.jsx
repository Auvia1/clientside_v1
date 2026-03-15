
// "use client";

// import { useMemo, useState, useEffect, useRef } from "react";
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
// import NewAppointmentDialog from "../components/NewAppointmentDialog";
// import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
// import { Button } from "../components/ui/button";
// import { Badge } from "../components/ui/badge";
// import { Input } from "../components/ui/input";
// import {
//   FiChevronLeft,
//   FiChevronRight,
//   FiSearch,
//   FiCalendar,
//   FiX,
//   FiRefreshCw,
//   FiAlertCircle,
//   FiLoader,
//   FiActivity,
// } from "react-icons/fi";
// import { useClinicSchedule, usePatientSearch } from "../hooks/useSchedule";

// const CLINIC_ID = "433e6186-e408-4b01-bcad-1fa449b41d63";

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// /** "HH:MM:SS" → "09:00 AM" */
// function formatTimeLabel(timeStr) {
//   if (!timeStr) return "";
//   const [h, m] = timeStr.split(":").map(Number);
//   const period = h < 12 ? "AM" : "PM";
//   const hour = h % 12 || 12;
//   return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
// }

// /** "09:00 AM" → "09:00:00" (for matching against DB time) */
// function labelToDbTime(label) {
//   const [timePart, period] = label.split(" ");
//   let [h, m] = timePart.split(":").map(Number);
//   if (period === "PM" && h !== 12) h += 12;
//   if (period === "AM" && h === 12) h = 0;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
// }

// function statusVariant(status) {
//   const map = {
//     booked: "info",
//     completed: "success",
//     cancelled: "destructive",
//     no_show: "warning",
//     rescheduled: "muted",
//   };
//   return map[status?.toLowerCase()] || "muted";
// }

// function statusLabel(status) {
//   const map = {
//     booked: "Confirmed",
//     completed: "Completed",
//     cancelled: "Cancelled",
//     no_show: "No Show",
//     rescheduled: "Rescheduled",
//   };
//   return map[status] || status;
// }

// /** Get initials from full name */
// function initials(name = "") {
//   return name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);
// }

// /** Relative time from ISO date */
// function relativeDate(dateStr) {
//   if (!dateStr) return "No visits yet";
//   const diff = Math.floor(
//     (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
//   );
//   if (diff === 0) return "Today";
//   if (diff === 1) return "Yesterday";
//   if (diff < 30) return `${diff} days ago`;
//   return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
// }

// /** Relative time from createdAt timestamp */
// function activityAge(createdAt) {
//   const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
//   if (mins < 1) return "just now";
//   if (mins < 60) return `${mins}m ago`;
//   return `${Math.floor(mins / 60)}h ago`;
// }

// /** Dot color per event type */
// function activityDot(type) {
//   return (
//     {
//       agent_booking:  "bg-emerald-400",
//       manual_booking: "bg-sky-400",
//       active_call:    "bg-amber-400 animate-pulse",
//       cancellation:   "bg-red-400",
//       reschedule:     "bg-violet-400",
//     }[type] || "bg-slate-300"
//   );
// }

// // Fixed time slots shown on the grid (every hour 08:00–15:00)
// const TIME_SLOTS = [
//   "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
//   "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
// ];

// // ─── useLiveActivity hook ─────────────────────────────────────────────────────

// function useLiveActivity(clinic_id) {
//   const [activities, setActivities] = useState([]);
//   const [wsStatus, setWsStatus]     = useState("connecting");
//   const wsRef                       = useRef(null);
//   const reconnectTimer              = useRef(null);

//   function connect() {
//     if (!clinic_id) return;

//     fetch(`/api/activity?limit=10&clinic_id=${clinic_id}`)
//       .then((r) => r.json())
//       .then((json) => { if (json.success) setActivities(json.data); })
//       .catch(() => {});

//     const proto = window.location.protocol === "https:" ? "wss" : "ws";
//     const backendHost = process.env.NEXT_PUBLIC_BACKEND_WS_HOST;
//     const ws = new WebSocket(`${proto}://${backendHost}/ws/activity`);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       setWsStatus("open");
//       clearTimeout(reconnectTimer.current);
//     };
//     ws.onmessage = (e) => {
//       try {
//         const msg = JSON.parse(e.data);
//         if (msg.type === "activity") {
//           setActivities((prev) => [msg.data, ...prev].slice(0, 20));
//         }
//       } catch (_) {}
//     };
//     ws.onclose = () => {
//       setWsStatus("closed");
//       reconnectTimer.current = setTimeout(connect, 5000);
//     };
//     ws.onerror = () => ws.close();
//   }

//   useEffect(() => {
//     if (!clinic_id) return;
//     connect();
//     return () => {
//       clearTimeout(reconnectTimer.current);
//       wsRef.current?.close();
//     };
//   }, [clinic_id]);

//   return { activities, wsStatus };
// }

// // ─── AppointmentCell ──────────────────────────────────────────────────────────

// function AppointmentCell({ appt, onStatusChange }) {
//   const [updating, setUpdating] = useState(false);

//   async function handleChange(newStatus) {
//     setUpdating(true);
//     try { await onStatusChange(appt.id, newStatus); }
//     finally { setUpdating(false); }
//   }

//   return (
//     <div className="h-full rounded-xl border border-slate-200 bg-white p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
//       <div className="flex items-start justify-between gap-1">
//         <p className="text-sm font-semibold text-slate-800 leading-tight">
//           {appt.patient_name}
//         </p>
//         <Badge variant={statusVariant(appt.status)} className="text-[9px] shrink-0">
//           {statusLabel(appt.status)}
//         </Badge>
//       </div>
//       <p className="text-xs text-slate-500 mt-0.5 truncate">{appt.reason || "—"}</p>
//       <div className="mt-2 flex items-center justify-between">
//         <div className="flex items-center gap-1 text-[10px] text-slate-400">
//           <FiCalendar className="shrink-0" />
//           <span>{formatTimeLabel(appt.start_time)} – {formatTimeLabel(appt.end_time)}</span>
//         </div>
//         {appt.status === "booked" && !updating && (
//           <div className="flex gap-1">
//             <button
//               title="Mark Completed"
//               onClick={() => handleChange("completed")}
//               className="rounded px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
//             >✓</button>
//             <button
//               title="No Show"
//               onClick={() => handleChange("no_show")}
//               className="rounded px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
//             >✕</button>
//           </div>
//         )}
//         {updating && (
//           <FiLoader className="h-3 w-3 animate-spin text-slate-400" />
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── PatientLookup ────────────────────────────────────────────────────────────

// function PatientLookup({ clinic_id }) {
//   const { query, setQuery, results, loading, error } = usePatientSearch(clinic_id);

//   return (
//     <Card className="border-slate-100 shadow-sm">
//       <CardHeader>
//         <CardTitle>Patient Look-up</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="relative">
//           <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
//           <Input
//             className="h-9 rounded-full border-slate-200 pl-9 text-sm"
//             placeholder="Name or Phone..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//           {loading && (
//             <FiLoader className="absolute right-3 top-2.5 animate-spin text-slate-400" />
//           )}
//         </div>

//         {error && (
//           <p className="text-xs text-red-500 flex items-center gap-1">
//             <FiAlertCircle /> {error}
//           </p>
//         )}

//         <div className="space-y-2 max-h-64 overflow-y-auto">
//           {results.length === 0 && query.trim() && !loading ? (
//             <p className="text-xs text-slate-400 text-center py-4">No patients found.</p>
//           ) : results.length === 0 && !query.trim() ? (
//             [{name: "Jayanth Rao", meta: "Last visit: 2 days ago"},
//              {name: "Saranya Krishnan", meta: "New Patient"}].map((p) => (
//               <div key={p.name}
//                 className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow"
//               >
//                 <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
//                   {initials(p.name)}
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-slate-700">{p.name}</p>
//                   <p className="text-xs text-slate-400">{p.meta}</p>
//                 </div>
//               </div>
//             ))
//           ) : (
//             results.map((patient) => (
//               <div
//                 key={patient.id}
//                 className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow cursor-pointer"
//               >
//                 <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
//                   {initials(patient.name)}
//                 </div>
//                 <div className="min-w-0">
//                   <p className="text-sm font-semibold text-slate-700 truncate">{patient.name}</p>
//                   <p className="text-xs text-slate-400">
//                     {patient.phone} • {relativeDate(patient.last_visit)}
//                   </p>
//                 </div>
//                 <Badge variant="muted" className="ml-auto shrink-0 text-[9px]">
//                   {patient.total_appointments} visits
//                 </Badge>
//               </div>
//             ))
//           )}
//         </div>

//         <Button variant="outline" className="w-full rounded-full">
//           View All Patients
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── SchedulePage ─────────────────────────────────────────────────────────────

// export default function SchedulePage() {
//   const [activeMonitoring, setActiveMonitoring] = useState(true);
//   const [doctorFilter, setDoctorFilter] = useState("all");
//   const [selectedDate, setSelectedDate] = useState(
//     () => new Date().toISOString().slice(0, 10)
//   );

//   // ── LIVE from API ──
//   const { doctors, appointmentMap, loading, error, refresh, updateStatus } =
//     useClinicSchedule(selectedDate);

//   // ── LIVE activity feed ──
//   const { activities, wsStatus } = useLiveActivity(CLINIC_ID);

//   const formattedDate = useMemo(() => {
//     const date = new Date(`${selectedDate}T00:00:00`);
//     return date.toLocaleDateString("en-US", {
//       weekday: "long", month: "long", day: "numeric", year: "numeric",
//     });
//   }, [selectedDate]);

//   const shiftDate = (offset) => {
//     const date = new Date(`${selectedDate}T00:00:00`);
//     date.setDate(date.getDate() + offset);
//     setSelectedDate(date.toISOString().slice(0, 10));
//   };

//   const visibleDoctors = useMemo(() => {
//     if (doctorFilter === "all") return doctors;
//     return doctors.filter((d) =>
//       d.name.toLowerCase().includes(doctorFilter.toLowerCase())
//     );
//   }, [doctors, doctorFilter]);

//   function getAppointment(doctorId, slotLabel) {
//     const dbTime = labelToDbTime(slotLabel);
//     const doctorAppts = appointmentMap[doctorId] || {};
//     if (doctorAppts[dbTime]) return doctorAppts[dbTime];
//     const slotHour = parseInt(dbTime.split(":")[0]);
//     for (const [timeKey, appt] of Object.entries(doctorAppts)) {
//       const apptHour = parseInt(timeKey.split(":")[0]);
//       if (apptHour === slotHour) return appt;
//     }
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
//       <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
//         <Sidebar />
//         <main className="flex flex-col gap-6 px-8 py-6">
//           <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />

//           {/* ── Header ── */}
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div>
//               <h1 className="text-xl font-semibold">Clinic Schedule</h1>
//               <p className="text-sm text-slate-500">{formattedDate}</p>
//             </div>
//             <div className="flex items-center gap-3 flex-wrap">
//               <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
//                 <FiCalendar className="text-slate-400 shrink-0" />
//                 <Input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="h-8 border-none bg-transparent p-0 text-xs w-32"
//                 />
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-6 w-6 rounded-full p-0"
//                   onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
//                 >
//                   <FiX />
//                 </Button>
//               </div>

//               <Button variant="outline" className="rounded-full px-3" onClick={() => shiftDate(-1)}>
//                 <FiChevronLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="rounded-full px-4 text-xs"
//                 onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
//               >
//                 Today
//               </Button>
//               <Button variant="outline" className="rounded-full px-3" onClick={() => shiftDate(1)}>
//                 <FiChevronRight />
//               </Button>

//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={refresh}
//                 disabled={loading}
//                 className="rounded-full px-3 gap-1"
//               >
//                 <FiRefreshCw className={loading ? "animate-spin" : ""} />
//               </Button>

//               <NewAppointmentDialog
//                 className="rounded-full px-4 transition-transform duration-200 hover:-translate-y-0.5"
//                 onBooked={refresh}
//               />
//             </div>
//           </div>

//           {/* ── Error Banner ── */}
//           {error && (
//             <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
//               <FiAlertCircle className="shrink-0" />
//               <span>Failed to load schedule: {error}</span>
//               <button onClick={refresh} className="ml-auto text-xs underline">Retry</button>
//             </div>
//           )}

//           <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
//             {/* ── LIVE: Schedule Grid ── */}
//             <Card className="border-slate-100 shadow-sm overflow-x-auto">
//               <CardHeader className="pb-2">
//                 <div className="flex flex-wrap items-center gap-2 mb-4">
//                   <Button
//                     variant={doctorFilter === "all" ? "default" : "outline"}
//                     className="rounded-full px-4 text-xs"
//                     onClick={() => setDoctorFilter("all")}
//                   >
//                     All Doctors
//                   </Button>
//                   {doctors.map((d) => (
//                     <Button
//                       key={d.id}
//                       variant={doctorFilter === d.name ? "default" : "outline"}
//                       className="rounded-full px-4 text-xs"
//                       onClick={() => setDoctorFilter(doctorFilter === d.name ? "all" : d.name)}
//                     >
//                       Dr. {d.name.split(" ").pop()}
//                     </Button>
//                   ))}
//                 </div>

//                 {loading ? (
//                   <div className="flex gap-3">
//                     <div className="w-[90px] shrink-0" />
//                     {[1, 2, 3].map((i) => (
//                       <div key={i} className="flex-1 h-16 animate-pulse rounded-xl bg-slate-100" />
//                     ))}
//                   </div>
//                 ) : visibleDoctors.length === 0 ? null : (
//                   <div
//                     className="grid gap-3 text-xs text-slate-500"
//                     style={{ gridTemplateColumns: `90px repeat(${visibleDoctors.length}, minmax(160px, 1fr))` }}
//                   >
//                     <span />
//                     {visibleDoctors.map((doctor) => (
//                       <div key={doctor.id} className="rounded-xl border border-slate-100 bg-white p-3">
//                         <div className="flex items-center gap-2">
//                           <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
//                             {initials(doctor.name)}
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-sm font-semibold text-slate-800 truncate">{doctor.name}</p>
//                             <p className="text-[10px] text-slate-400">{doctor.speciality}</p>
//                           </div>
//                         </div>
//                         <p className="mt-1.5 text-[10px] text-slate-400">
//                           {doctor.consultation_duration_minutes}min slots
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardHeader>

//               <CardContent>
//                 {loading ? (
//                   <div className="space-y-3 mt-2">
//                     {Array.from({ length: 6 }).map((_, i) => (
//                       <div key={i} className="flex gap-3">
//                         <div className="w-[90px] h-[70px] animate-pulse rounded-xl bg-slate-100 shrink-0" />
//                         {[1, 2, 3].map((j) => (
//                           <div key={j} className="flex-1 h-[70px] animate-pulse rounded-xl bg-slate-50" />
//                         ))}
//                       </div>
//                     ))}
//                   </div>
//                 ) : visibleDoctors.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center py-16 text-slate-400">
//                     <FiCalendar className="h-8 w-8 mb-3 opacity-40" />
//                     <p className="text-sm">No doctors found.</p>
//                   </div>
//                 ) : (
//                   <div className="mt-2 space-y-3">
//                     {TIME_SLOTS.map((slot) => (
//                       <div
//                         key={slot}
//                         className="grid gap-3"
//                         style={{
//                           gridTemplateColumns: `90px repeat(${visibleDoctors.length}, minmax(160px, 1fr))`,
//                         }}
//                       >
//                         <div className="text-xs font-semibold text-slate-400 pt-2">{slot}</div>
//                         {visibleDoctors.map((doctor) => {
//                           const appt = getAppointment(doctor.id, slot);
//                           return (
//                             <div
//                               key={`${slot}-${doctor.id}`}
//                               className="min-h-[70px] rounded-xl border border-slate-100 bg-white/60"
//                             >
//                               {appt ? (
//                                 <AppointmentCell
//                                   appt={appt}
//                                   onStatusChange={updateStatus}
//                                 />
//                               ) : null}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* ── Right Column ── */}
//             <div className="flex flex-col gap-6">
//               {/* ── LIVE: Patient Lookup ── */}
//               <PatientLookup clinic_id={CLINIC_ID} />

//               {/* ── LIVE: Activity Feed ── */}
//               <Card className="border-slate-100 shadow-sm">
//                 <CardHeader className="flex flex-row items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <CardTitle>Live Activity</CardTitle>
//                     <Badge
//                       variant={wsStatus === "open" ? "success" : "warning"}
//                       className="text-[9px]"
//                     >
//                       {wsStatus === "open" ? "Live" : "Reconnecting…"}
//                     </Badge>
//                   </div>
//                   <FiActivity className={`h-4 w-4 ${wsStatus === "open" ? "text-emerald-500" : "text-slate-300"}`} />
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {activities.length === 0 ? (
//                     <p className="text-xs text-slate-400 text-center py-6">
//                       No recent activity yet.
//                     </p>
//                   ) : (
//                     activities.map((item) => (
//                       <div key={item.id} className="flex gap-3 items-start">
//                         <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${activityDot(item.event_type)}`} />
//                         <div className="min-w-0">
//                           <p className="text-xs text-slate-400">{activityAge(item.created_at)}</p>
//                           <p className="text-sm text-slate-700 leading-snug">{item.title}</p>
//                           {item.meta && (
//                             <p className="text-xs text-slate-400 truncate">{item.meta}</p>
//                           )}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                   <Button className="w-full bg-slate-800 text-white hover:bg-slate-700">
//                     Return Call
//                   </Button>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import NewAppointmentDialog from "../components/NewAppointmentDialog";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  FiChevronLeft, FiChevronRight, FiSearch, FiCalendar,
  FiX, FiRefreshCw, FiAlertCircle, FiLoader, FiActivity,
} from "react-icons/fi";
import { useClinicSchedule, usePatientSearch } from "../hooks/useSchedule";
import { CLINIC_ID } from "../lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeLabel(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour   = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function labelToDbTime(label) {
  const [timePart, period] = label.split(" ");
  let [h, m] = timePart.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
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

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function relativeDate(dateStr) {
  if (!dateStr) return "No visits yet";
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
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
    active_call:    "bg-amber-400 animate-pulse",
    cancellation:   "bg-red-400",
    reschedule:     "bg-violet-400",
  }[type] || "bg-slate-300";
}

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
];

// ─── useLiveActivity ──────────────────────────────────────────────────────────

function useLiveActivity() {
  const [activities, setActivities] = useState([]);
  const [wsStatus, setWsStatus]     = useState("connecting");
  const wsRef                       = useRef(null);
  const reconnectTimer              = useRef(null);
  const mountedRef                  = useRef(true);

  function connect() {
    if (!mountedRef.current) return;

    fetch(`/api/activity?limit=10&clinic_id=${CLINIC_ID}`)
      .then((r) => r.json())
      .then((json) => { if (json.success && mountedRef.current) setActivities(json.data); })
      .catch(() => {});

    const backendHost = process.env.NEXT_PUBLIC_BACKEND_WS_HOST;
    if (!backendHost) {
      console.warn("NEXT_PUBLIC_BACKEND_WS_HOST is not set — live activity disabled");
      setWsStatus("closed");
      return;
    }

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws    = new WebSocket(`${proto}://${backendHost}/ws/activity`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return; }
      setWsStatus("open");
      clearTimeout(reconnectTimer.current);
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "activity" && mountedRef.current) {
          setActivities((prev) => [msg.data, ...prev].slice(0, 20));
        }
      } catch (_) {}
    };
    ws.onclose = () => {
      if (!mountedRef.current) return;
      setWsStatus("closed");
      reconnectTimer.current = setTimeout(connect, 5000);
    };
    ws.onerror = () => ws.close();
  }

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  return { activities, wsStatus };
}

// ─── AppointmentCell ──────────────────────────────────────────────────────────

function AppointmentCell({ appt, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  async function handleChange(newStatus) {
    setUpdating(true);
    try { await onStatusChange(appt.id, newStatus); }
    finally { setUpdating(false); }
  }

  const isActionable = appt.status === "confirmed" || appt.status === "pending";

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-semibold text-slate-800 leading-tight">
          {appt.patient_name}
        </p>
        <Badge variant={statusVariant(appt.status)} className="text-[9px] shrink-0">
          {statusLabel(appt.status)}
        </Badge>
      </div>
      <p className="text-xs text-slate-500 mt-0.5 truncate">{appt.reason || "—"}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <FiCalendar className="shrink-0" />
          <span>{formatTimeLabel(appt.start_time)} – {formatTimeLabel(appt.end_time)}</span>
        </div>
        {isActionable && !updating && (
          <div className="flex gap-1">
            <button
              title="Mark Completed"
              onClick={() => handleChange("completed")}
              className="rounded px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >✓</button>
            <button
              title="No Show"
              onClick={() => handleChange("no_show")}
              className="rounded px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
            >✕</button>
          </div>
        )}
        {updating && <FiLoader className="h-3 w-3 animate-spin text-slate-400" />}
      </div>
    </div>
  );
}

// ─── PatientLookup ────────────────────────────────────────────────────────────

function PatientLookup() {
  const { query, setQuery, results, loading, error } = usePatientSearch();

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle>Patient Look-up</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
          <Input
            className="h-9 rounded-full border-slate-200 pl-9 text-sm"
            placeholder="Name or Phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <FiLoader className="absolute right-3 top-2.5 animate-spin text-slate-400" />
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <FiAlertCircle /> {error}
          </p>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.length === 0 && query.trim() && !loading ? (
            <p className="text-xs text-slate-400 text-center py-4">No patients found.</p>
          ) : results.length === 0 && !query.trim() ? (
            [
              { name: "Jayanth Rao",      meta: "Last visit: 2 days ago" },
              { name: "Saranya Krishnan", meta: "New Patient"             },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {initials(p.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.meta}</p>
                </div>
              </div>
            ))
          ) : (
            results.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow cursor-pointer"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
                  {initials(patient.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{patient.name}</p>
                  <p className="text-xs text-slate-400">
                    {patient.phone} • {relativeDate(patient.last_visit)}
                  </p>
                </div>
                <Badge variant="muted" className="ml-auto shrink-0 text-[9px]">
                  {patient.total_appointments} visits
                </Badge>
              </div>
            ))
          )}
        </div>

        <Button variant="outline" className="w-full rounded-full">
          View All Patients
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── SchedulePage ─────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [activeMonitoring, setActiveMonitoring] = useState(true);
  const [doctorFilter, setDoctorFilter]         = useState("all");
  const [selectedDate, setSelectedDate]         = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const { doctors, appointmentMap, loading, error, refresh, updateStatus } =
    useClinicSchedule(selectedDate);

  const { activities, wsStatus } = useLiveActivity();

  const formattedDate = useMemo(() => {
    const date = new Date(`${selectedDate}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  }, [selectedDate]);

  const shiftDate = (offset) => {
    const date = new Date(`${selectedDate}T00:00:00`);
    date.setDate(date.getDate() + offset);
    setSelectedDate(date.toISOString().slice(0, 10));
  };

  const visibleDoctors = useMemo(() => {
    if (doctorFilter === "all") return doctors;
    return doctors.filter((d) =>
      d.name.toLowerCase().includes(doctorFilter.toLowerCase())
    );
  }, [doctors, doctorFilter]);

  function getAppointment(doctorId, slotLabel) {
    const dbTime     = labelToDbTime(slotLabel);
    const doctorAppts = appointmentMap[doctorId] || {};
    // Exact match first
    if (doctorAppts[dbTime]) return doctorAppts[dbTime];
    // Hour-level fallback
    const slotHour = parseInt(dbTime.split(":")[0]);
    for (const [timeKey, appt] of Object.entries(doctorAppts)) {
      if (parseInt(timeKey.split(":")[0]) === slotHour) return appt;
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-6 px-8 py-6">
          <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />

          {/* ── Header ── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Clinic Schedule</h1>
              <p className="text-sm text-slate-500">{formattedDate}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <FiCalendar className="text-slate-400 shrink-0" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-8 border-none bg-transparent p-0 text-xs w-32"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 rounded-full p-0"
                  onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                >
                  <FiX />
                </Button>
              </div>

              <Button variant="outline" className="rounded-full px-3" onClick={() => shiftDate(-1)}>
                <FiChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-4 text-xs"
                onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              >
                Today
              </Button>
              <Button variant="outline" className="rounded-full px-3" onClick={() => shiftDate(1)}>
                <FiChevronRight />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
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

          {/* ── Error Banner ── */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <FiAlertCircle className="shrink-0" />
              <span>Failed to load schedule: {error}</span>
              <button onClick={refresh} className="ml-auto text-xs underline">Retry</button>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">

            {/* ── Schedule Grid ── */}
            <Card className="border-slate-100 shadow-sm overflow-x-auto">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Button
                    variant={doctorFilter === "all" ? "default" : "outline"}
                    className="rounded-full px-4 text-xs"
                    onClick={() => setDoctorFilter("all")}
                  >
                    All Doctors
                  </Button>
                  {doctors.map((d) => (
                    <Button
                      key={d.id}
                      variant={doctorFilter === d.name ? "default" : "outline"}
                      className="rounded-full px-4 text-xs"
                      onClick={() => setDoctorFilter(doctorFilter === d.name ? "all" : d.name)}
                    >
                      Dr. {d.name.split(" ").pop()}
                    </Button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex gap-3">
                    <div className="w-[90px] shrink-0" />
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 h-16 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : visibleDoctors.length === 0 ? null : (
                  <div
                    className="grid gap-3 text-xs text-slate-500"
                    style={{ gridTemplateColumns: `90px repeat(${visibleDoctors.length}, minmax(160px, 1fr))` }}
                  >
                    <span />
                    {visibleDoctors.map((doctor) => (
                      <div key={doctor.id} className="rounded-xl border border-slate-100 bg-white p-3">
                        <div className="flex items-center gap-2">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
                            {initials(doctor.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{doctor.name}</p>
                            <p className="text-[10px] text-slate-400">{doctor.speciality}</p>
                          </div>
                        </div>
                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {doctor.consultation_duration_minutes}min slots
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="space-y-3 mt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-[90px] h-[70px] animate-pulse rounded-xl bg-slate-100 shrink-0" />
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="flex-1 h-[70px] animate-pulse rounded-xl bg-slate-50" />
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
                  <div className="mt-2 space-y-3">
                    {TIME_SLOTS.map((slot) => (
                      <div
                        key={slot}
                        className="grid gap-3"
                        style={{
                          gridTemplateColumns: `90px repeat(${visibleDoctors.length}, minmax(160px, 1fr))`,
                        }}
                      >
                        <div className="text-xs font-semibold text-slate-400 pt-2">{slot}</div>
                        {visibleDoctors.map((doctor) => {
                          const appt = getAppointment(doctor.id, slot);
                          return (
                            <div
                              key={`${slot}-${doctor.id}`}
                              className="min-h-[70px] rounded-xl border border-slate-100 bg-white/60"
                            >
                              {appt ? (
                                <AppointmentCell appt={appt} onStatusChange={updateStatus} />
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Right Column ── */}
            <div className="flex flex-col gap-6">
              <PatientLookup />

              {/* ── Live Activity ── */}
              <Card className="border-slate-100 shadow-sm">
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
                  <FiActivity className={`h-4 w-4 ${wsStatus === "open" ? "text-emerald-500" : "text-slate-300"}`} />
                </CardHeader>
                <CardContent className="space-y-4">
                  {activities.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
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
                  <Button className="w-full bg-slate-800 text-white hover:bg-slate-700">
                    Return Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}