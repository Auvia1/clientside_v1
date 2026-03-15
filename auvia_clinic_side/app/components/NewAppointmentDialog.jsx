// "use client";
// // components/NewAppointmentDialog.jsx

// import { useState } from "react";
// import { Loader2, Plus } from "lucide-react";
// import { Button } from "./ui/button";
// import { appointmentsApi } from "../lib/api";
// import { useDoctors, useSlots } from "../hooks/useSchedule";

// export default function NewAppointmentDialog({ onBooked, className }) {
//   const [open, setOpen] = useState(false);
//   const [step, setStep] = useState(1); // 1=details, 2=slot picker, 3=confirm
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   const { doctors, loading: doctorsLoading } = useDoctors();

//   const [form, setForm] = useState({
//     patient_name: "",
//     patient_phone: "",
//     doctor_id: "",
//     appointment_date: new Date().toISOString().split("T")[0],
//     start_time: "",
//     end_time: "",
//     reason: "",
//   });

//   const selectedDoctor = doctors.find((d) => String(d.id) === String(form.doctor_id));
//   const slotDuration = selectedDoctor?.consultation_duration_minutes || 30;

//   const { slots, loading: slotsLoading } = useSlots(form.doctor_id, form.appointment_date);
//   const availableSlots = slots.filter((s) => s.available);

//   function set(field, value) {
//     setForm((f) => ({ ...f, [field]: value }));
//   }

//   function selectSlot(time) {
//     const [h, m] = time.split(":").map(Number);
//     const endTotal = h * 60 + m + slotDuration;
//     const eh = Math.floor(endTotal / 60);
//     const em = endTotal % 60;
//     set("start_time", time);
//     set("end_time", `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00`);
//     setStep(3);
//   }

//   async function handleSubmit() {
//     setSubmitting(true);
//     setError(null);
//     try {
//       await appointmentsApi.book(form);
//       setSuccess(true);
//       onBooked?.();
//       setTimeout(() => {
//         setOpen(false);
//         setSuccess(false);
//         setStep(1);
//         setForm({
//           patient_name: "",
//           patient_phone: "",
//           doctor_id: "",
//           appointment_date: new Date().toISOString().split("T")[0],
//           start_time: "",
//           end_time: "",
//           reason: "",
//         });
//       }, 1800);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   function formatSlotTime(t) {
//     const [h, m] = t.split(":").map(Number);
//     const period = h < 12 ? "AM" : "PM";
//     const hour = h % 12 || 12;
//     return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
//   }

//   if (!open) {
//     return (
//       <Button
//         onClick={() => setOpen(true)}
//         className={`rounded-full px-4 bg-emerald-600 text-white hover:bg-emerald-700 gap-2 ${className}`}
//       >
//         <Plus className="h-4 w-4" />
//         New Appointment
//       </Button>
//     );
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
//         {/* Header */}
//         <div className="px-6 pt-6 pb-4 border-b border-slate-100">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-slate-900">
//               {step === 1 && "Patient Details"}
//               {step === 2 && "Choose a Time Slot"}
//               {step === 3 && "Confirm Appointment"}
//             </h2>
//             <button
//               onClick={() => { setOpen(false); setStep(1); setError(null); }}
//               className="text-slate-400 hover:text-slate-600 text-xl leading-none"
//             >
//               ×
//             </button>
//           </div>
//           {/* Stepper */}
//           <div className="flex gap-1 mt-3">
//             {[1, 2, 3].map((s) => (
//               <div
//                 key={s}
//                 className={`h-1 flex-1 rounded-full transition-colors ${
//                   s <= step ? "bg-emerald-500" : "bg-slate-100"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>

//         <div className="px-6 py-5">
//           {/* ── Step 1: Patient + Doctor + Date ── */}
//           {step === 1 && (
//             <div className="space-y-4">
//               <div>
//                 <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</label>
//                 <input
//                   type="text"
//                   value={form.patient_name}
//                   onChange={(e) => set("patient_name", e.target.value)}
//                   placeholder="Full name"
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</label>
//                 <input
//                   type="tel"
//                   value={form.patient_phone}
//                   onChange={(e) => set("patient_phone", e.target.value)}
//                   placeholder="+91 99999 00000"
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</label>
//                 {doctorsLoading ? (
//                   <div className="mt-1 h-10 animate-pulse rounded-xl bg-slate-100" />
//                 ) : (
//                   <select
//                     value={form.doctor_id}
//                     onChange={(e) => set("doctor_id", e.target.value)}
//                     className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
//                   >
//                     <option value="">Select doctor</option>
//                     {doctors.map((d) => (
//                       <option key={d.id} value={d.id}>
//                         {d.name} — {d.speciality}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </div>
//               <div>
//                 <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</label>
//                 <input
//                   type="date"
//                   value={form.appointment_date}
//                   min={new Date().toISOString().split("T")[0]}
//                   onChange={(e) => set("appointment_date", e.target.value)}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Reason (optional)</label>
//                 <textarea
//                   value={form.reason}
//                   onChange={(e) => set("reason", e.target.value)}
//                   placeholder="Chief complaint or reason for visit"
//                   rows={2}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
//                 />
//               </div>
//               <Button
//                 className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
//                 disabled={!form.patient_name || !form.patient_phone || !form.doctor_id || !form.appointment_date}
//                 onClick={() => setStep(2)}
//               >
//                 Next: Choose Slot
//               </Button>
//             </div>
//           )}

//           {/* ── Step 2: Slot picker ── */}
//           {step === 2 && (
//             <div>
//               <p className="text-sm text-slate-500 mb-4">
//                 Available slots for <strong>{selectedDoctor?.name}</strong> on{" "}
//                 <strong>{new Date(form.appointment_date).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</strong>
//               </p>
//               {slotsLoading ? (
//                 <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   <span className="text-sm">Loading slots…</span>
//                 </div>
//               ) : availableSlots.length === 0 ? (
//                 <div className="text-center py-8 text-slate-400 text-sm">
//                   No available slots on this date.
//                   <br />
//                   <button className="mt-2 text-emerald-600 underline text-xs" onClick={() => setStep(1)}>
//                     Change date
//                   </button>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
//                   {availableSlots.map((slot) => (
//                     <button
//                       key={slot.time}
//                       onClick={() => selectSlot(slot.time)}
//                       className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
//                     >
//                       {formatSlotTime(slot.time)}
//                     </button>
//                   ))}
//                 </div>
//               )}
//               <Button
//                 variant="ghost"
//                 className="mt-4 w-full text-slate-500"
//                 onClick={() => setStep(1)}
//               >
//                 ← Back
//               </Button>
//             </div>
//           )}

//           {/* ── Step 3: Confirm ── */}
//           {step === 3 && (
//             <div className="space-y-4">
//               {success ? (
//                 <div className="text-center py-8">
//                   <div className="text-4xl mb-3">✅</div>
//                   <p className="font-semibold text-emerald-700">Appointment Booked!</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="rounded-2xl bg-slate-50 p-4 text-sm space-y-2">
//                     <Row label="Patient" value={form.patient_name} />
//                     <Row label="Phone" value={form.patient_phone} />
//                     <Row label="Doctor" value={selectedDoctor?.name} />
//                     <Row label="Date" value={new Date(form.appointment_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
//                     <Row label="Time" value={`${formatSlotTime(form.start_time)} → ${formatSlotTime(form.end_time)}`} />
//                     {form.reason && <Row label="Reason" value={form.reason} />}
//                   </div>
//                   {error && (
//                     <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
//                   )}
//                   <Button
//                     className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
//                     onClick={handleSubmit}
//                     disabled={submitting}
//                   >
//                     {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
//                     {submitting ? "Booking…" : "Confirm Booking"}
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     className="w-full text-slate-500"
//                     onClick={() => setStep(2)}
//                     disabled={submitting}
//                   >
//                     ← Change Slot
//                   </Button>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function Row({ label, value }) {
//   return (
//     <div className="flex justify-between">
//       <span className="text-slate-500">{label}</span>
//       <span className="font-medium text-slate-800 text-right max-w-[60%]">{value}</span>
//     </div>
//   );
// }

"use client";
// components/NewAppointmentDialog.jsx

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { appointmentsApi, CLINIC_ID } from "../lib/api";
import { useDoctors, useSlots } from "../hooks/useSchedule";

export default function NewAppointmentDialog({ onBooked, className }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1=details, 2=slot picker, 3=confirm
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { doctors, loading: doctorsLoading } = useDoctors();

  const [form, setForm] = useState({
    patient_name: "",
    patient_phone: "",
    doctor_id: "",
    appointment_date: new Date().toISOString().split("T")[0],
    start_time: "",
    end_time: "",
    reason: "",
  });

  const selectedDoctor = doctors.find((d) => String(d.id) === String(form.doctor_id));
  const slotDuration = selectedDoctor?.consultation_duration_minutes || 30;

  const { slots, loading: slotsLoading } = useSlots(form.doctor_id, form.appointment_date);
  const availableSlots = slots.filter((s) => s.available);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function selectSlot(time) {
    const [h, m] = time.split(":").map(Number);
    const endTotal = h * 60 + m + slotDuration;
    const eh = Math.floor(endTotal / 60);
    const em = endTotal % 60;
    set("start_time", time);
    set("end_time", `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00`);
    setStep(3);
  }

  /** "YYYY-MM-DD" + "HH:MM:SS" → "YYYY-MM-DDTHH:MM:SS+05:30" */
  function toIST(date, time) {
    return `${date}T${time}+05:30`;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await appointmentsApi.book({
        clinic_id:         CLINIC_ID,
        patient_name:      form.patient_name,
        patient_phone:     form.patient_phone,
        doctor_id:         form.doctor_id,
        appointment_start: toIST(form.appointment_date, form.start_time),
        appointment_end:   toIST(form.appointment_date, form.end_time),
        reason:            form.reason,
        source:            "manual",
      });
      setSuccess(true);
      onBooked?.();
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setStep(1);
        setForm({
          patient_name: "",
          patient_phone: "",
          doctor_id: "",
          appointment_date: new Date().toISOString().split("T")[0],
          start_time: "",
          end_time: "",
          reason: "",
        });
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function formatSlotTime(t) {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const period = h < 12 ? "AM" : "PM";
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className={`rounded-full px-4 bg-emerald-600 text-white hover:bg-emerald-700 gap-2 ${className}`}
      >
        <Plus className="h-4 w-4" />
        New Appointment
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {step === 1 && "Patient Details"}
              {step === 2 && "Choose a Time Slot"}
              {step === 3 && "Confirm Appointment"}
            </h2>
            <button
              onClick={() => { setOpen(false); setStep(1); setError(null); }}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
          {/* Stepper */}
          <div className="flex gap-1 mt-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-emerald-500" : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          {/* ── Step 1: Patient + Doctor + Date ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</label>
                <input
                  type="text"
                  value={form.patient_name}
                  onChange={(e) => set("patient_name", e.target.value)}
                  placeholder="Full name"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</label>
                <input
                  type="tel"
                  value={form.patient_phone}
                  onChange={(e) => set("patient_phone", e.target.value)}
                  placeholder="+91 99999 00000"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</label>
                {doctorsLoading ? (
                  <div className="mt-1 h-10 animate-pulse rounded-xl bg-slate-100" />
                ) : (
                  <select
                    value={form.doctor_id}
                    onChange={(e) => set("doctor_id", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.speciality}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={form.appointment_date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => set("appointment_date", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Reason (optional)</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => set("reason", e.target.value)}
                  placeholder="Chief complaint or reason for visit"
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                />
              </div>
              <Button
                className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={!form.patient_name || !form.patient_phone || !form.doctor_id || !form.appointment_date}
                onClick={() => setStep(2)}
              >
                Next: Choose Slot
              </Button>
            </div>
          )}

          {/* ── Step 2: Slot picker ── */}
          {step === 2 && (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Available slots for <strong>{selectedDoctor?.name}</strong> on{" "}
                <strong>{new Date(form.appointment_date).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</strong>
              </p>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading slots…</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No available slots on this date.
                  <br />
                  <button className="mt-2 text-emerald-600 underline text-xs" onClick={() => setStep(1)}>
                    Change date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => selectSlot(slot.time)}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
                    >
                      {formatSlotTime(slot.time)}
                    </button>
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                className="mt-4 w-full text-slate-500"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <div className="space-y-4">
              {success ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-semibold text-emerald-700">Appointment Booked!</p>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm space-y-2">
                    <Row label="Patient" value={form.patient_name} />
                    <Row label="Phone" value={form.patient_phone} />
                    <Row label="Doctor" value={selectedDoctor?.name} />
                    <Row label="Date" value={new Date(form.appointment_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
                    <Row label="Time" value={`${formatSlotTime(form.start_time)} → ${formatSlotTime(form.end_time)}`} />
                    {form.reason && <Row label="Reason" value={form.reason} />}
                  </div>
                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
                  )}
                  <Button
                    className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "Booking…" : "Confirm Booking"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-slate-500"
                    onClick={() => setStep(2)}
                    disabled={submitting}
                  >
                    ← Change Slot
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}