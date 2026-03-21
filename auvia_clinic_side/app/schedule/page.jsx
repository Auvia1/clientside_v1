
// // app/schedule/page.jsx
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
//   FiChevronLeft, FiChevronRight, FiSearch, FiCalendar,
//   FiX, FiRefreshCw, FiAlertCircle, FiLoader, FiActivity,
//   FiCheck, FiUserX,
// } from "react-icons/fi";
// import { useClinicSchedule, usePatientSearch } from "../hooks/useSchedule";
// import { CLINIC_ID } from "../lib/api";

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function formatTimeLabel(timeStr) {
//   if (!timeStr) return "";
//   const [h, m] = timeStr.split(":").map(Number);
//   const period = h < 12 ? "AM" : "PM";
//   const hour   = h % 12 || 12;
//   return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
// }

// function labelToDbTime(label) {
//   const [timePart, period] = label.split(" ");
//   let [h, m] = timePart.split(":").map(Number);
//   if (period === "PM" && h !== 12) h += 12;
//   if (period === "AM" && h === 12) h = 0;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
// }

// function statusVariant(status) {
//   const map = {
//     confirmed:   "info",
//     pending:     "warning",
//     completed:   "success",
//     cancelled:   "destructive",
//     no_show:     "warning",
//     rescheduled: "muted",
//   };
//   return map[status?.toLowerCase()] || "muted";
// }

// function statusLabel(status) {
//   const map = {
//     confirmed:   "Confirmed",
//     pending:     "Pending",
//     completed:   "Completed",
//     cancelled:   "Cancelled",
//     no_show:     "No Show",
//     rescheduled: "Rescheduled",
//   };
//   return map[status] || status;
// }

// function initials(name = "") {
//   return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
// }

// function relativeDate(dateStr) {
//   if (!dateStr) return "No visits yet";
//   const diff = Math.floor(
//     (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
//   );
//   if (diff === 0) return "Today";
//   if (diff === 1) return "Yesterday";
//   if (diff < 30)  return `${diff} days ago`;
//   return new Date(dateStr).toLocaleDateString("en-IN", {
//     month: "short", day: "numeric",
//   });
// }

// function activityAge(createdAt) {
//   const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
//   if (mins < 1)  return "just now";
//   if (mins < 60) return `${mins}m ago`;
//   return `${Math.floor(mins / 60)}h ago`;
// }

// /**
//  * Maps activity event_type → a Tailwind background colour class.
//  * "completion" is now its own type (previously it was incorrectly logged
//  * as "manual_booking"), so it gets a distinct colour here.
//  */
// function activityDot(type) {
//   const map = {
//     agent_booking:  "bg-emerald-400",
//     manual_booking: "bg-sky-400",
//     completion:     "bg-emerald-500",   // ← fixed: was missing, fell through to grey
//     active_call:    "bg-amber-400 animate-pulse",
//     cancellation:   "bg-red-400",
//     reschedule:     "bg-violet-400",
//   };
//   return map[type] || "bg-slate-300";
// }

// /**
//  * Maps activity event_type → a short human-readable label shown
//  * next to the coloured dot in the Live Activity panel.
//  */
// function activityTypeLabel(type) {
//   const map = {
//     agent_booking:  "Agent booked",
//     manual_booking: "Receptionist booked",
//     completion:     "Completed",
//     active_call:    "Active call",
//     cancellation:   "Cancelled",
//     reschedule:     "Rescheduled",
//   };
//   return map[type] || type;
// }

// /**
//  * Extracts a concise secondary line from the activity's meta JSONB object.
//  * The server now stores meta as a structured object, e.g.:
//  *   { appointment_start, appointment_end, doctor_name, ... }
//  * We display the appointment time in IST.
//  */
// function metaSubline(meta) {
//   if (!meta) return null;

//   // Server returns JSONB — pg driver deserialises it to a plain JS object,
//   // but over WebSocket the row is re-serialised to JSON string and then
//   // parsed again, so meta will always be a plain object at this point.
//   const obj = typeof meta === "string" ? JSON.parse(meta) : meta;

//   if (obj.appointment_start) {
//     try {
//       return new Date(obj.appointment_start).toLocaleTimeString("en-IN", {
//         hour:     "2-digit",
//         minute:   "2-digit",
//         hour12:   true,
//         timeZone: "Asia/Kolkata",
//       });
//     } catch (_) {}
//   }

//   if (obj.doctor_name) return `Dr. ${obj.doctor_name}`;

//   return null;
// }

// const TIME_SLOTS = [
//   "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
//   "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
// ];

// // ─── useLiveActivity ──────────────────────────────────────────────────────────
// //
// // Connects to the Express WebSocket server at /ws/activity.
// //
// // In development Next.js runs on port 3000 and Express on port 4002, so
// // window.location.host would point to the wrong server. Set the env var
// //   NEXT_PUBLIC_WS_HOST=localhost:4002
// // in .env.local to override. In production (single host / reverse proxy)
// // leave it unset and it falls back to window.location.host.
// //
// function useLiveActivity() {
//   const [activities, setActivities] = useState([]);
//   const [wsStatus, setWsStatus]     = useState("connecting");
//   const wsRef          = useRef(null);
//   const reconnectTimer = useRef(null);
//   const mountedRef     = useRef(false);
//   const retryCount     = useRef(0);

//   useEffect(() => {
//     mountedRef.current = true;

//     // ── Seed from REST on mount ───────────────────────────────────────────────
//     fetch(`/api/activity?limit=15&clinic_id=${CLINIC_ID}`)
//       .then((r) => r.json())
//       .then((json) => {
//         if (json.success && mountedRef.current) setActivities(json.data);
//       })
//       .catch(() => {});

//     // ── WebSocket connection with exponential back-off reconnect ──────────────
//     function connectWs() {
//       if (!mountedRef.current) return;

//       // Tear down any existing socket cleanly
//       if (wsRef.current) {
//         wsRef.current.onclose = null;
//         wsRef.current.onerror = null;
//         wsRef.current.close();
//         wsRef.current = null;
//       }

//       const proto  = window.location.protocol === "https:" ? "wss" : "ws";
//       // NEXT_PUBLIC_WS_HOST lets you point at the Express server in dev.
//       // Falls back to the current host (works in production with a reverse proxy).
//       const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
//       const ws     = new WebSocket(`${proto}://${wsHost}/ws/activity`);
//       wsRef.current = ws;

//       ws.onopen = () => {
//         if (!mountedRef.current) { ws.close(); return; }
//         setWsStatus("open");
//         retryCount.current = 0;
//         clearTimeout(reconnectTimer.current);
//       };

//       ws.onmessage = (e) => {
//         try {
//           const msg = JSON.parse(e.data);
//           if (msg.type === "activity" && mountedRef.current) {
//             // Prepend new event and keep the list at ≤ 20 items
//             setActivities((prev) => [msg.data, ...prev].slice(0, 20));
//           }
//         } catch (_) {}
//       };

//       const scheduleReconnect = () => {
//         if (!mountedRef.current) return;
//         setWsStatus("closed");
//         // Exponential back-off capped at 30 s
//         const delay = Math.min(3_000 * Math.pow(2, retryCount.current), 30_000);
//         retryCount.current += 1;
//         reconnectTimer.current = setTimeout(connectWs, delay);
//       };

//       ws.onclose = scheduleReconnect;
//       ws.onerror = () => {
//         ws.onclose = null;
//         ws.close();
//         scheduleReconnect();
//       };
//     }

//     // Small delay so the component is fully mounted before we open the socket
//     const initTimer = setTimeout(connectWs, 150);

//     return () => {
//       mountedRef.current = false;
//       clearTimeout(initTimer);
//       clearTimeout(reconnectTimer.current);
//       if (wsRef.current) {
//         wsRef.current.onclose = null;
//         wsRef.current.onerror = null;
//         wsRef.current.close();
//         wsRef.current = null;
//       }
//     };
//   }, []);

//   return { activities, wsStatus };
// }

// // ─── AppointmentCell ──────────────────────────────────────────────────────────
// //
// // Renders a single appointment card inside a schedule grid cell.
// //
// // UX details:
// //   • localStatus mirrors appt.status and flips immediately on button click
// //     (optimistic update). If the PATCH fails, the hook rolls it back.
// //   • Both buttons are disabled while a PATCH is in-flight to prevent
// //     double-clicks sending two concurrent requests.
// //   • A 2-second success toast appears after a confirmed update.
// //   • Inline error message shown if the PATCH fails.
// //
// function AppointmentCell({ appt, onStatusChange }) {
//   const [updating, setUpdating]       = useState(false);
//   const [errorMsg, setErrorMsg]       = useState(null);
//   const [toastMsg, setToastMsg]       = useState(null);
//   const [localStatus, setLocalStatus] = useState(appt.status);

//   // Sync localStatus when the parent re-fetches after a server round-trip
//   useEffect(() => {
//     setLocalStatus(appt.status);
//   }, [appt.status]);

//   async function handleChange(newStatus) {
//     if (updating) return;
//     setUpdating(true);
//     setErrorMsg(null);

//     const previous = localStatus;
//     setLocalStatus(newStatus); // optimistic flip

//     try {
//       await onStatusChange(appt.id, newStatus);
//       const label = newStatus === "completed" ? "Marked complete ✓" : "Marked no-show";
//       setToastMsg(label);
//       setTimeout(() => setToastMsg(null), 2_000);
//     } catch (err) {
//       setLocalStatus(previous); // rollback
//       setErrorMsg(err?.message || "Update failed — please retry");
//     } finally {
//       setUpdating(false);
//     }
//   }

//   const isActionable = localStatus === "confirmed" || localStatus === "pending";

//   return (
//     <div className="relative h-full rounded-xl border border-slate-200 bg-white p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">

//       {/* Success toast */}
//       {toastMsg && (
//         <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-center rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
//           {toastMsg}
//         </div>
//       )}

//       {/* Header: patient name + status badge */}
//       <div className="flex items-start justify-between gap-1">
//         <p className="text-sm font-semibold text-slate-800 leading-tight">
//           {appt.patient_name}
//         </p>
//         <Badge variant={statusVariant(localStatus)} className="text-[9px] shrink-0">
//           {statusLabel(localStatus)}
//         </Badge>
//       </div>

//       {/* Reason */}
//       <p className="text-xs text-slate-500 mt-0.5 truncate">{appt.reason || "—"}</p>

//       {/* Inline error */}
//       {errorMsg && (
//         <p className="mt-1 flex items-center gap-1 text-[10px] text-red-500">
//           <FiAlertCircle className="shrink-0" />
//           <span className="truncate">{errorMsg}</span>
//         </p>
//       )}

//       {/* Footer: time + action buttons / spinner */}
//       <div className="mt-2 flex items-center justify-between gap-1">
//         <div className="flex items-center gap-1 text-[10px] text-slate-400 min-w-0">
//           <FiCalendar className="shrink-0" />
//           <span className="truncate">
//             {formatTimeLabel(appt.start_time)} – {formatTimeLabel(appt.end_time)}
//           </span>
//         </div>

//         {updating && (
//           <FiLoader className="h-3 w-3 shrink-0 animate-spin text-slate-400" />
//         )}

//         {isActionable && !updating && (
//           <div className="flex gap-1 shrink-0">
//             <button
//               title="Mark as Completed"
//               onClick={() => handleChange("completed")}
//               disabled={updating}
//               className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium
//                          bg-emerald-50 text-emerald-700
//                          hover:bg-emerald-100 active:scale-95
//                          disabled:opacity-50 disabled:cursor-not-allowed
//                          transition-all duration-150"
//             >
//               <FiCheck className="h-2.5 w-2.5" />
//               Done
//             </button>
//             <button
//               title="Mark as No Show"
//               onClick={() => handleChange("no_show")}
//               disabled={updating}
//               className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium
//                          bg-amber-50 text-amber-700
//                          hover:bg-amber-100 active:scale-95
//                          disabled:opacity-50 disabled:cursor-not-allowed
//                          transition-all duration-150"
//             >
//               <FiUserX className="h-2.5 w-2.5" />
//               No-show
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── PatientLookup ────────────────────────────────────────────────────────────

// function PatientLookup() {
//   const { query, setQuery, results, loading, error } = usePatientSearch();

//   const placeholders = [
//     { name: "Jayanth Rao",      meta: "Last visit: 2 days ago" },
//     { name: "Saranya Krishnan", meta: "New Patient"             },
//   ];

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
//             placeholders.map((p) => (
//               <div
//                 key={p.name}
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

// // ─── LiveActivityPanel ────────────────────────────────────────────────────────

// function LiveActivityPanel({ activities, wsStatus }) {
//   return (
//     <Card className="border-slate-100 shadow-sm">
//       <CardHeader className="flex flex-row items-center justify-between">
//         <div className="flex items-center gap-2">
//           <CardTitle>Live Activity</CardTitle>
//           <Badge
//             variant={wsStatus === "open" ? "success" : "warning"}
//             className="text-[9px]"
//           >
//             {wsStatus === "open" ? "Live" : "Reconnecting…"}
//           </Badge>
//         </div>
//         <FiActivity
//           className={`h-4 w-4 ${wsStatus === "open" ? "text-emerald-500" : "text-slate-300"}`}
//         />
//       </CardHeader>

//       <CardContent className="space-y-4">
//         {activities.length === 0 ? (
//           <p className="text-xs text-slate-400 text-center py-6">
//             No recent activity yet.
//           </p>
//         ) : (
//           activities.map((item) => {
//             const sub = metaSubline(item.meta);
//             return (
//               <div key={item.id} className="flex gap-3 items-start">
//                 {/* Coloured dot */}
//                 <span
//                   className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${activityDot(item.event_type)}`}
//                 />

//                 <div className="min-w-0 flex-1">
//                   {/* Timestamp + type label */}
//                   <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
//                     <span>{activityAge(item.created_at)}</span>
//                     <span className="inline-block h-1 w-1 rounded-full bg-slate-200" />
//                     <span className="font-medium">{activityTypeLabel(item.event_type)}</span>
//                   </p>

//                   {/* Main title */}
//                   <p className="text-sm text-slate-700 leading-snug">{item.title}</p>

//                   {/* Secondary line — appointment time from meta JSONB */}
//                   {sub && (
//                     <p className="text-xs text-slate-400 truncate">{sub}</p>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}

//         <Button className="w-full bg-slate-800 text-white hover:bg-slate-700">
//           Return Call
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── SchedulePage ─────────────────────────────────────────────────────────────

// export default function SchedulePage() {
//   const [activeMonitoring, setActiveMonitoring] = useState(true);
//   const [doctorFilter, setDoctorFilter]         = useState("all");
//   const [selectedDate, setSelectedDate]         = useState(
//     () => new Date().toISOString().slice(0, 10)
//   );

//   const { doctors, appointmentMap, loading, error, refresh, updateStatus } =
//     useClinicSchedule(selectedDate);

//   const { activities, wsStatus } = useLiveActivity();

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

//   /**
//    * buildSlotMap: for a given doctor, returns a map of
//    *   TIME_SLOT_LABEL → appointment (or undefined)
//    *
//    * Priority:
//    *   1. Exact HH:MM:SS match
//    *   2. Hour-level fallback (handles appointments starting a few minutes
//    *      past the hour, e.g. 09:07:00 → shown in "09:00 AM" row)
//    *
//    * Already-claimed appointments are tracked so the same appointment
//    * doesn't appear in multiple rows.
//    */
//   function buildSlotMap(doctorId) {
//     const doctorAppts = appointmentMap[doctorId] || {};
//     const claimed     = new Set();
//     const slotMap     = {};

//     for (const slot of TIME_SLOTS) {
//       const dbTime   = labelToDbTime(slot);
//       const slotHour = parseInt(dbTime.split(":")[0], 10);

//       // 1. Exact match
//       if (doctorAppts[dbTime] && !claimed.has(doctorAppts[dbTime].id)) {
//         slotMap[slot] = doctorAppts[dbTime];
//         claimed.add(doctorAppts[dbTime].id);
//         continue;
//       }

//       // 2. Hour-level fallback
//       for (const [timeKey, appt] of Object.entries(doctorAppts)) {
//         if (
//           parseInt(timeKey.split(":")[0], 10) === slotHour &&
//           !claimed.has(appt.id)
//         ) {
//           slotMap[slot] = appt;
//           claimed.add(appt.id);
//           break;
//         }
//       }
//     }

//     return slotMap;
//   }

//   const doctorSlotMaps = useMemo(() => {
//     const maps = {};
//     for (const doctor of visibleDoctors) {
//       maps[doctor.id] = buildSlotMap(doctor.id);
//     }
//     return maps;
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [visibleDoctors, appointmentMap]);

//   return (
//     <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
//       <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
//         <Sidebar />
//         <main className="flex flex-col gap-6 px-8 py-6">
//           <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />

//           {/* ── Page header ── */}
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div>
//               <h1 className="text-xl font-semibold">Clinic Schedule</h1>
//               <p className="text-sm text-slate-500">{formattedDate}</p>
//             </div>

//             <div className="flex items-center gap-3 flex-wrap">
//               {/* Date picker */}
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

//               {/* Day navigation */}
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

//               {/* Manual refresh */}
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

//           {/* ── Error banner ── */}
//           {error && (
//             <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
//               <FiAlertCircle className="shrink-0" />
//               <span>Failed to load schedule: {error}</span>
//               <button onClick={refresh} className="ml-auto text-xs underline">
//                 Retry
//               </button>
//             </div>
//           )}

//           <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">

//             {/* ── Schedule grid ── */}
//             <Card className="border-slate-100 shadow-sm overflow-x-auto">
//               <CardHeader className="pb-2">
//                 {/* Doctor filter pills */}
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
//                       onClick={() =>
//                         setDoctorFilter(doctorFilter === d.name ? "all" : d.name)
//                       }
//                     >
//                       Dr. {d.name.split(" ").pop()}
//                     </Button>
//                   ))}
//                 </div>

//                 {/* Doctor header row */}
//                 {loading ? (
//                   <div className="flex gap-3">
//                     <div className="w-[90px] shrink-0" />
//                     {[1, 2, 3].map((i) => (
//                       <div
//                         key={i}
//                         className="flex-1 h-16 animate-pulse rounded-xl bg-slate-100"
//                       />
//                     ))}
//                   </div>
//                 ) : visibleDoctors.length > 0 ? (
//                   <div
//                     className="grid gap-3 text-xs text-slate-500"
//                     style={{
//                       gridTemplateColumns: `90px repeat(${visibleDoctors.length}, minmax(160px, 1fr))`,
//                     }}
//                   >
//                     <span />
//                     {visibleDoctors.map((doctor) => (
//                       <div
//                         key={doctor.id}
//                         className="rounded-xl border border-slate-100 bg-white p-3"
//                       >
//                         <div className="flex items-center gap-2">
//                           <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
//                             {initials(doctor.name)}
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-sm font-semibold text-slate-800 truncate">
//                               {doctor.name}
//                             </p>
//                             <p className="text-[10px] text-slate-400">{doctor.speciality}</p>
//                           </div>
//                         </div>
//                         <p className="mt-1.5 text-[10px] text-slate-400">
//                           {doctor.consultation_duration_minutes}min slots
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : null}
//               </CardHeader>

//               <CardContent>
//                 {loading ? (
//                   <div className="space-y-3 mt-2">
//                     {Array.from({ length: 6 }).map((_, i) => (
//                       <div key={i} className="flex gap-3">
//                         <div className="w-[90px] h-[70px] animate-pulse rounded-xl bg-slate-100 shrink-0" />
//                         {[1, 2, 3].map((j) => (
//                           <div
//                             key={j}
//                             className="flex-1 h-[70px] animate-pulse rounded-xl bg-slate-50"
//                           />
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
//                         <div className="text-xs font-semibold text-slate-400 pt-2">
//                           {slot}
//                         </div>
//                         {visibleDoctors.map((doctor) => {
//                           const appt = doctorSlotMaps[doctor.id]?.[slot] ?? null;
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

//             {/* ── Right column ── */}
//             <div className="flex flex-col gap-6">
//               <PatientLookup />
//               <LiveActivityPanel activities={activities} wsStatus={wsStatus} />
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// app/schedule/page.jsx
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
  FiCheck, FiUserX,
} from "react-icons/fi";
import { useClinicSchedule, usePatientSearch } from "../hooks/useSchedule";

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
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short", day: "numeric",
  });
}

function activityAge(createdAt) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function activityDot(type) {
  const map = {
    agent_booking:  "bg-emerald-400",
    manual_booking: "bg-sky-400",
    completion:     "bg-emerald-500",
    active_call:    "bg-amber-400 animate-pulse",
    cancellation:   "bg-red-400",
    reschedule:     "bg-violet-400",
  };
  return map[type] || "bg-slate-300";
}

function activityTypeLabel(type) {
  const map = {
    agent_booking:  "Agent booked",
    manual_booking: "Receptionist booked",
    completion:     "Completed",
    active_call:    "Active call",
    cancellation:   "Cancelled",
    reschedule:     "Rescheduled",
  };
  return map[type] || type;
}

function metaSubline(meta) {
  if (!meta) return null;
  const obj = typeof meta === "string" ? JSON.parse(meta) : meta;
  if (obj.appointment_start) {
    try {
      return new Date(obj.appointment_start).toLocaleTimeString("en-IN", {
        hour:     "2-digit",
        minute:   "2-digit",
        hour12:   true,
        timeZone: "Asia/Kolkata",
      });
    } catch (_) {}
  }
  if (obj.doctor_name) return `Dr. ${obj.doctor_name}`;
  return null;
}

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
];

// ─── useLiveActivity ──────────────────────────────────────────────────────────

function useLiveActivity() {
  const [activities, setActivities] = useState([]);
  const [wsStatus, setWsStatus]     = useState("connecting");
  const wsRef          = useRef(null);
  const reconnectTimer = useRef(null);
  const mountedRef     = useRef(false);
  const retryCount     = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    const clinicId = localStorage.getItem("auvia_clinic_id") || "";

    // Seed from REST on mount
    fetch(`/api/activity?limit=15&clinic_id=${clinicId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && mountedRef.current) setActivities(json.data);
      })
      .catch(() => {});

    function connectWs() {
      if (!mountedRef.current) return;

      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      const proto  = window.location.protocol === "https:" ? "wss" : "ws";
      const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
      const ws     = new WebSocket(`${proto}://${wsHost}/ws/activity`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        setWsStatus("open");
        retryCount.current = 0;
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

      const scheduleReconnect = () => {
        if (!mountedRef.current) return;
        setWsStatus("closed");
        const delay = Math.min(3_000 * Math.pow(2, retryCount.current), 30_000);
        retryCount.current += 1;
        reconnectTimer.current = setTimeout(connectWs, delay);
      };

      ws.onclose = scheduleReconnect;
      ws.onerror = () => {
        ws.onclose = null;
        ws.close();
        scheduleReconnect();
      };
    }

    const initTimer = setTimeout(connectWs, 150);

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimer);
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return { activities, wsStatus };
}

// ─── AppointmentCell ──────────────────────────────────────────────────────────

function AppointmentCell({ appt, onStatusChange }) {
  const [updating, setUpdating]       = useState(false);
  const [errorMsg, setErrorMsg]       = useState(null);
  const [toastMsg, setToastMsg]       = useState(null);
  const [localStatus, setLocalStatus] = useState(appt.status);

  useEffect(() => {
    setLocalStatus(appt.status);
  }, [appt.status]);

  async function handleChange(newStatus) {
    if (updating) return;
    setUpdating(true);
    setErrorMsg(null);

    const previous = localStatus;
    setLocalStatus(newStatus);

    try {
      await onStatusChange(appt.id, newStatus);
      const label = newStatus === "completed" ? "Marked complete ✓" : "Marked no-show";
      setToastMsg(label);
      setTimeout(() => setToastMsg(null), 2_000);
    } catch (err) {
      setLocalStatus(previous);
      setErrorMsg(err?.message || "Update failed — please retry");
    } finally {
      setUpdating(false);
    }
  }

  const isActionable = localStatus === "confirmed" || localStatus === "pending";

  return (
    <div className="relative h-full rounded-xl border border-slate-200 bg-white p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">

      {toastMsg && (
        <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-center rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
          {toastMsg}
        </div>
      )}

      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-semibold text-slate-800 leading-tight">
          {appt.patient_name}
        </p>
        <Badge variant={statusVariant(localStatus)} className="text-[9px] shrink-0">
          {statusLabel(localStatus)}
        </Badge>
      </div>

      <p className="text-xs text-slate-500 mt-0.5 truncate">{appt.reason || "—"}</p>

      {errorMsg && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-red-500">
          <FiAlertCircle className="shrink-0" />
          <span className="truncate">{errorMsg}</span>
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 text-[10px] text-slate-400 min-w-0">
          <FiCalendar className="shrink-0" />
          <span className="truncate">
            {formatTimeLabel(appt.start_time)} – {formatTimeLabel(appt.end_time)}
          </span>
        </div>

        {updating && (
          <FiLoader className="h-3 w-3 shrink-0 animate-spin text-slate-400" />
        )}

        {isActionable && !updating && (
          <div className="flex gap-1 shrink-0">
            <button
              title="Mark as Completed"
              onClick={() => handleChange("completed")}
              disabled={updating}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium
                         bg-emerald-50 text-emerald-700
                         hover:bg-emerald-100 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-150"
            >
              <FiCheck className="h-2.5 w-2.5" />
              Done
            </button>
            <button
              title="Mark as No Show"
              onClick={() => handleChange("no_show")}
              disabled={updating}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium
                         bg-amber-50 text-amber-700
                         hover:bg-amber-100 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-150"
            >
              <FiUserX className="h-2.5 w-2.5" />
              No-show
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PatientLookup ────────────────────────────────────────────────────────────

function PatientLookup() {
  const { query, setQuery, results, loading, error } = usePatientSearch();

  const placeholders = [
    { name: "Jayanth Rao",      meta: "Last visit: 2 days ago" },
    { name: "Saranya Krishnan", meta: "New Patient"             },
  ];

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
            placeholders.map((p) => (
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

// ─── LiveActivityPanel ────────────────────────────────────────────────────────

function LiveActivityPanel({ activities, wsStatus }) {
  return (
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
        <FiActivity
          className={`h-4 w-4 ${wsStatus === "open" ? "text-emerald-500" : "text-slate-300"}`}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No recent activity yet.
          </p>
        ) : (
          activities.map((item) => {
            const sub = metaSubline(item.meta);
            return (
              <div key={item.id} className="flex gap-3 items-start">
                <span
                  className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${activityDot(item.event_type)}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span>{activityAge(item.created_at)}</span>
                    <span className="inline-block h-1 w-1 rounded-full bg-slate-200" />
                    <span className="font-medium">{activityTypeLabel(item.event_type)}</span>
                  </p>
                  <p className="text-sm text-slate-700 leading-snug">{item.title}</p>
                  {sub && (
                    <p className="text-xs text-slate-400 truncate">{sub}</p>
                  )}
                </div>
              </div>
            );
          })
        )}

        <Button className="w-full bg-slate-800 text-white hover:bg-slate-700">
          Return Call
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

  function buildSlotMap(doctorId) {
    const doctorAppts = appointmentMap[doctorId] || {};
    const claimed     = new Set();
    const slotMap     = {};

    for (const slot of TIME_SLOTS) {
      const dbTime   = labelToDbTime(slot);
      const slotHour = parseInt(dbTime.split(":")[0], 10);

      if (doctorAppts[dbTime] && !claimed.has(doctorAppts[dbTime].id)) {
        slotMap[slot] = doctorAppts[dbTime];
        claimed.add(doctorAppts[dbTime].id);
        continue;
      }

      for (const [timeKey, appt] of Object.entries(doctorAppts)) {
        if (
          parseInt(timeKey.split(":")[0], 10) === slotHour &&
          !claimed.has(appt.id)
        ) {
          slotMap[slot] = appt;
          claimed.add(appt.id);
          break;
        }
      }
    }

    return slotMap;
  }

  const doctorSlotMaps = useMemo(() => {
    const maps = {};
    for (const doctor of visibleDoctors) {
      maps[doctor.id] = buildSlotMap(doctor.id);
    }
    return maps;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleDoctors, appointmentMap]);

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

          {/* ── Error banner ── */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <FiAlertCircle className="shrink-0" />
              <span>Failed to load schedule: {error}</span>
              <button onClick={refresh} className="ml-auto text-xs underline">
                Retry
              </button>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">

            {/* ── Schedule grid ── */}
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
                      onClick={() =>
                        setDoctorFilter(doctorFilter === d.name ? "all" : d.name)
                      }
                    >
                      Dr. {d.name.split(" ").pop()}
                    </Button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex gap-3">
                    <div className="w-[90px] shrink-0" />
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-16 animate-pulse rounded-xl bg-slate-100"
                      />
                    ))}
                  </div>
                ) : visibleDoctors.length > 0 ? (
                  <div
                    className="grid gap-3 text-xs text-slate-500"
                    style={{
                      gridTemplateColumns: `90px repeat(${visibleDoctors.length}, minmax(160px, 1fr))`,
                    }}
                  >
                    <span />
                    {visibleDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="rounded-xl border border-slate-100 bg-white p-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
                            {initials(doctor.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {doctor.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{doctor.speciality}</p>
                          </div>
                        </div>
                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {doctor.consultation_duration_minutes}min slots
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="space-y-3 mt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-[90px] h-[70px] animate-pulse rounded-xl bg-slate-100 shrink-0" />
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className="flex-1 h-[70px] animate-pulse rounded-xl bg-slate-50"
                          />
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
                        <div className="text-xs font-semibold text-slate-400 pt-2">
                          {slot}
                        </div>
                        {visibleDoctors.map((doctor) => {
                          const appt = doctorSlotMaps[doctor.id]?.[slot] ?? null;
                          return (
                            <div
                              key={`${slot}-${doctor.id}`}
                              className="min-h-[70px] rounded-xl border border-slate-100 bg-white/60"
                            >
                              {appt ? (
                                <AppointmentCell
                                  appt={appt}
                                  onStatusChange={updateStatus}
                                />
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

            {/* ── Right column ── */}
            <div className="flex flex-col gap-6">
              <PatientLookup />
              <LiveActivityPanel activities={activities} wsStatus={wsStatus} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}