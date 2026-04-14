// "use client";

// import { useState, useEffect, useMemo } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { AlertCircle, Loader2 } from "lucide-react";
// import { doctorsApi } from "../lib/api";

// const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// // Helper: Convert time string (HH:MM) to total minutes from midnight
// const timeToMinutes = (timeStr) => {
//   const [h, m] = timeStr.split(":").map(Number);
//   return h * 60 + m;
// };

// // Helper: Calculate number of slots
// const calculateNumSlots = (startTime, endTime, slotDuration) => {
//   if (!startTime || !endTime || !slotDuration || startTime >= endTime) return 0;
//   const startMin = timeToMinutes(startTime);
//   const endMin = timeToMinutes(endTime);
//   const totalMinutes = endMin - startMin;
//   return Math.floor(totalMinutes / parseInt(slotDuration));
// };

// export default function EditScheduleModal({ open, onOpenChange, schedule, doctorId, onUpdate }) {
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   const [form, setForm] = useState({
//     day_of_week: 0,
//     start_time: "09:00",
//     end_time: "17:00",
//     slot_duration_minutes: 30,
//     effective_from: "",
//     effective_to: "",
//   });

//   const [maxAppointmentsPerSlot, setMaxAppointmentsPerSlot] = useState([]);

//   // Initialize form when schedule changes
//   useEffect(() => {
//     if (schedule) {
//       setForm({
//         day_of_week: schedule.day_of_week ?? 0,
//         start_time: schedule.start_time?.substring(0, 5) || "09:00",
//         end_time: schedule.end_time?.substring(0, 5) || "17:00",
//         slot_duration_minutes: schedule.slot_duration_minutes ?? 30,
//         effective_from: schedule.effective_from ?? "",
//         effective_to: schedule.effective_to ?? "",
//       });

//       // Load existing max_appointments_per_slot
//       if (schedule.max_appointments_per_slot && Array.isArray(schedule.max_appointments_per_slot)) {
//         setMaxAppointmentsPerSlot(schedule.max_appointments_per_slot);
//       } else {
//         setMaxAppointmentsPerSlot([]);
//       }

//       setError(null);
//     }
//   }, [schedule, open]);

//   // Calculate number of slots whenever these values change
//   const numSlots = useMemo(() => {
//     return calculateNumSlots(form.start_time, form.end_time, form.slot_duration_minutes);
//   }, [form.start_time, form.end_time, form.slot_duration_minutes]);

//   // Resize maxAppointmentsPerSlot array when numSlots changes
//   useEffect(() => {
//     if (numSlots > 0) {
//       setMaxAppointmentsPerSlot((prev) => {
//         const newArray = new Array(numSlots).fill(1);
//         // Preserve existing values if array is resized
//         for (let i = 0; i < Math.min(prev.length, numSlots); i++) {
//           newArray[i] = prev[i];
//         }
//         return newArray;
//       });
//     } else {
//       setMaxAppointmentsPerSlot([]);
//     }
//   }, [numSlots]);

//   function set(field, value) {
//     setForm((f) => ({ ...f, [field]: value }));
//   }

//   const handleSlotChange = (index, value) => {
//     const newArray = [...maxAppointmentsPerSlot];
//     newArray[index] = Math.max(1, parseInt(value) || 1);
//     setMaxAppointmentsPerSlot(newArray);
//   };

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setSubmitting(true);
//     setError(null);

//     try {
//       // Convert time to HH:MM:SS format
//       const [startH, startM] = form.start_time.split(":").map(Number);
//       const [endH, endM] = form.end_time.split(":").map(Number);

//       // Ensure max_appointments_per_slot array is properly populated
//       const calculatedSlots = calculateNumSlots(form.start_time, form.end_time, form.slot_duration_minutes);
//       const slotsArray =
//         calculatedSlots > 0
//           ? maxAppointmentsPerSlot.length === calculatedSlots
//             ? maxAppointmentsPerSlot
//             : new Array(calculatedSlots).fill(1)
//           : [];

//       const payload = {
//         day_of_week: Number(form.day_of_week),
//         start_time: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`,
//         end_time: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`,
//         slot_duration_minutes: Number(form.slot_duration_minutes),
//         effective_from: form.effective_from || null,
//         effective_to: form.effective_to || null,
//       };

//       // Include max_appointments_per_slot if it has values
//       if (slotsArray.length > 0) {
//         payload.max_appointments_per_slot = slotsArray;
//       }

//       await doctorsApi.updateSchedule(doctorId, schedule.id, payload);
//       onUpdate?.();
//       onOpenChange(false);
//     } catch (err) {
//       setError(err.message || "Failed to update schedule");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   const isValid =
//     form.start_time &&
//     form.end_time &&
//     form.slot_duration_minutes > 0 &&
//     form.start_time < form.end_time;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Edit Schedule</DialogTitle>
//           <DialogDescription>Update the doctor's schedule details</DialogDescription>
//         </DialogHeader>

//         {error && (
//           <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
//             <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">
//               Day of Week
//             </label>
//             <select
//               value={form.day_of_week}
//               onChange={(e) => set("day_of_week", Number(e.target.value))}
//               disabled={submitting}
//               className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
//             >
//               {DAYS_OF_WEEK.map((day, idx) => (
//                 <option key={idx} value={idx}>
//                   {day}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Start Time
//               </label>
//               <Input
//                 type="time"
//                 value={form.start_time}
//                 onChange={(e) => set("start_time", e.target.value)}
//                 disabled={submitting}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 End Time
//               </label>
//               <Input
//                 type="time"
//                 value={form.end_time}
//                 onChange={(e) => set("end_time", e.target.value)}
//                 disabled={submitting}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">
//               Slot Duration (minutes)
//             </label>
//             <Input
//               type="number"
//               value={form.slot_duration_minutes}
//               onChange={(e) => set("slot_duration_minutes", parseInt(e.target.value) || 5)}
//               disabled={submitting}
//               min="5"
//               step="5"
//             />
//           </div>

//           {numSlots > 0 && (
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-3">
//                 Max Appointments per Slot ({numSlots} slots calculated)
//               </label>
//               <div className="grid grid-cols-3 gap-3">
//                 {maxAppointmentsPerSlot.map((value, idx) => (
//                   <div key={`slot-${numSlots}-${idx}`} className="flex items-center gap-2">
//                     <label className="text-xs font-medium text-slate-600 w-20">
//                       Slot {idx + 1}
//                     </label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={value}
//                       onChange={(e) => handleSlotChange(idx, e.target.value)}
//                       className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                       disabled={submitting}
//                     />
//                   </div>
//                 ))}
//               </div>
//               <p className="text-xs text-slate-500 mt-2">
//                 Set the maximum number of concurrent appointments for each slot
//               </p>
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Effective From
//               </label>
//               <Input
//                 type="date"
//                 value={form.effective_from}
//                 onChange={(e) => set("effective_from", e.target.value)}
//                 disabled={submitting}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Effective To (optional)
//               </label>
//               <Input
//                 type="date"
//                 value={form.effective_to}
//                 onChange={(e) => set("effective_to", e.target.value)}
//                 disabled={submitting}
//               />
//             </div>
//           </div>

//           <div className="flex gap-3 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={submitting}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={submitting || !isValid}
//               className="flex-1 gap-2"
//             >
//               {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
//               {submitting ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AlertCircle, Loader2 } from "lucide-react";
import { doctorsApi } from "../lib/api";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper: Convert time string (HH:MM) to total minutes from midnight
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// Helper: Calculate number of slots
const calculateNumSlots = (startTime, endTime, slotDuration) => {
  if (!startTime || !endTime || !slotDuration || startTime >= endTime) return 0;
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const totalMinutes = endMin - startMin;
  return Math.floor(totalMinutes / parseInt(slotDuration));
};

export default function EditScheduleModal({ open, onOpenChange, schedule, doctorId, onUpdate }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 30,
    effective_from: "",
    effective_to: "",
  });

  const [maxAppointmentsPerSlot, setMaxAppointmentsPerSlot] = useState([]);

  // Initialize form when schedule changes
  useEffect(() => {
    if (schedule) {
      setForm({
        day_of_week: schedule.day_of_week ?? 0,
        start_time: schedule.start_time?.substring(0, 5) || "09:00",
        end_time: schedule.end_time?.substring(0, 5) || "17:00",
        slot_duration_minutes: schedule.slot_duration_minutes ?? 30,
        effective_from: schedule.effective_from ?? "",
        effective_to: schedule.effective_to ?? "",
      });

      // FIX: coerce existing DB values to integers when loading
      if (schedule.max_appointments_per_slot && Array.isArray(schedule.max_appointments_per_slot)) {
        setMaxAppointmentsPerSlot(schedule.max_appointments_per_slot.map((v) => parseInt(v) || 1));
      } else {
        setMaxAppointmentsPerSlot([]);
      }

      setError(null);
    }
  }, [schedule, open]);

  // Calculate number of slots whenever these values change
  const numSlots = useMemo(() => {
    return calculateNumSlots(form.start_time, form.end_time, form.slot_duration_minutes);
  }, [form.start_time, form.end_time, form.slot_duration_minutes]);

  // Resize maxAppointmentsPerSlot array when numSlots changes
  useEffect(() => {
    if (numSlots > 0) {
      setMaxAppointmentsPerSlot((prev) => {
        const newArray = new Array(numSlots).fill(1);
        // Preserve existing values if array is resized
        for (let i = 0; i < Math.min(prev.length, numSlots); i++) {
          newArray[i] = prev[i];
        }
        return newArray;
      });
    } else {
      setMaxAppointmentsPerSlot([]);
    }
  }, [numSlots]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const handleSlotChange = (index, value) => {
    const newArray = [...maxAppointmentsPerSlot];
    // FIX: always store as integer, never as string
    newArray[index] = Math.max(1, parseInt(value) || 1);
    setMaxAppointmentsPerSlot(newArray);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const [startH, startM] = form.start_time.split(":").map(Number);
      const [endH, endM] = form.end_time.split(":").map(Number);

      const calculatedSlots = calculateNumSlots(form.start_time, form.end_time, form.slot_duration_minutes);

      // FIX: ensure every value is a proper integer before sending
      const slotsArray =
        calculatedSlots > 0
          ? (maxAppointmentsPerSlot.length === calculatedSlots
              ? maxAppointmentsPerSlot
              : new Array(calculatedSlots).fill(1)
            ).map((v) => parseInt(v) || 1)   // ← coerce strings → integers
          : [];

      const payload = {
        day_of_week: Number(form.day_of_week),
        start_time: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`,
        end_time: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`,
        slot_duration_minutes: Number(form.slot_duration_minutes),
        effective_from: form.effective_from || null,
        effective_to: form.effective_to || null,
        // FIX: only send the field when there is actually data
        ...(slotsArray.length > 0 && { max_appointments_per_slot: slotsArray }),
      };

      await doctorsApi.updateSchedule(doctorId, schedule.id, payload);
      onUpdate?.();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Failed to update schedule");
    } finally {
      setSubmitting(false);
    }
  }

  const isValid =
    form.start_time &&
    form.end_time &&
    form.slot_duration_minutes > 0 &&
    form.start_time < form.end_time;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>Update the doctor's schedule details</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Day of Week
            </label>
            <select
              value={form.day_of_week}
              onChange={(e) => set("day_of_week", Number(e.target.value))}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {DAYS_OF_WEEK.map((day, idx) => (
                <option key={idx} value={idx}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Time
              </label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Time
              </label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => set("end_time", e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slot Duration (minutes)
            </label>
            <Input
              type="number"
              value={form.slot_duration_minutes}
              onChange={(e) => set("slot_duration_minutes", e.target.value)}
              disabled={submitting}
              min="5"
              step="5"
            />
          </div>

          {numSlots > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Max Appointments per Slot ({numSlots} slots calculated)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {maxAppointmentsPerSlot.map((value, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-600 w-20">
                      Slot {idx + 1}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={value}
                      onChange={(e) => handleSlotChange(idx, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={submitting}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Set the maximum number of concurrent appointments for each slot
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Effective From
              </label>
              <Input
                type="date"
                value={form.effective_from}
                onChange={(e) => set("effective_from", e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Effective To (optional)
              </label>
              <Input
                type="date"
                value={form.effective_to}
                onChange={(e) => set("effective_to", e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !isValid}
              className="flex-1 gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}