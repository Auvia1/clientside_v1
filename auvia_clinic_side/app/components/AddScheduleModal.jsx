// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { Loader2 } from "lucide-react";
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

// export default function AddScheduleModal({ open, onOpenChange, doctorId, onAdded }) {
//   const [dayOfWeek, setDayOfWeek] = useState("1");
//   const [startTime, setStartTime] = useState("09:00");
//   const [endTime, setEndTime] = useState("17:00");
//   const [slotDuration, setSlotDuration] = useState("30");
//   const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);
//   const [effectiveTo, setEffectiveTo] = useState("");
//   const [maxAppointmentsPerSlot, setMaxAppointmentsPerSlot] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Calculate number of slots whenever these values change
//   const numSlots = useMemo(() => {
//     return calculateNumSlots(startTime, endTime, slotDuration);
//   }, [startTime, endTime, slotDuration]);

//   // Initialize or resize maxAppointmentsPerSlot array when numSlots changes
//   useEffect(() => {
//     if (numSlots > 0) {
//       setMaxAppointmentsPerSlot((prev) => {
//         const newArray = new Array(numSlots).fill(1);
//         // Preserve existing values if array is resized (kept shorter)
//         for (let i = 0; i < Math.min(prev.length, numSlots); i++) {
//           newArray[i] = prev[i];
//         }
//         return newArray;
//       });
//     } else {
//       setMaxAppointmentsPerSlot([]);
//     }
//   }, [numSlots]);

//   const handleSlotChange = (index, value) => {
//     const newArray = [...maxAppointmentsPerSlot];
//     newArray[index] = Math.max(1, parseInt(value) || 1);
//     setMaxAppointmentsPerSlot(newArray);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     if (!startTime || !endTime) {
//       setError("Start and end times are required");
//       return;
//     }

//     if (startTime >= endTime) {
//       setError("End time must be after start time");
//       return;
//     }

//     setLoading(true);
//     try {
//       const clinicId = localStorage.getItem("auvia_clinic_id");
//       if (!clinicId) {
//         setError("Clinic ID not found. Please log in again.");
//         setLoading(false);
//         return;
//       }

//       // Ensure max_appointments_per_slot array is properly populated
//       const calculatedSlots = calculateNumSlots(startTime, endTime, slotDuration);
//       const slotsArray =
//         calculatedSlots > 0
//           ? maxAppointmentsPerSlot.length === calculatedSlots
//             ? maxAppointmentsPerSlot
//             : new Array(calculatedSlots).fill(1)
//           : [];

//       await doctorsApi.createSchedule(doctorId, {
//         clinic_id: clinicId,
//         day_of_week: parseInt(dayOfWeek),
//         start_time: `${startTime}:00`,
//         end_time: `${endTime}:00`,
//         slot_duration_minutes: parseInt(slotDuration),
//         effective_from: effectiveFrom,
//         effective_to: effectiveTo || null,
//         max_appointments_per_slot: slotsArray.length > 0 ? slotsArray : undefined,
//       });

//       // Reset form
//       setDayOfWeek("1");
//       setStartTime("09:00");
//       setEndTime("17:00");
//       setSlotDuration("30");
//       setEffectiveFrom(new Date().toISOString().split("T")[0]);
//       setEffectiveTo("");
//       setMaxAppointmentsPerSlot([]);
//       setError(null);

//       onOpenChange(false);
//       onAdded?.();
//     } catch (err) {
//       setError(err.message || "Failed to create schedule");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Add New Schedule</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
//               {error}
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-2">
//               Day of Week
//             </label>
//             <select
//               value={dayOfWeek}
//               onChange={(e) => setDayOfWeek(e.target.value)}
//               className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               disabled={loading}
//             >
//               {DAYS_OF_WEEK.map((day, idx) => (
//                 <option key={idx} value={idx}>
//                   {day}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Start Time
//               </label>
//               <input
//                 type="time"
//                 value={startTime}
//                 onChange={(e) => setStartTime(e.target.value)}
//                 className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 disabled={loading}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 End Time
//               </label>
//               <input
//                 type="time"
//                 value={endTime}
//                 onChange={(e) => setEndTime(e.target.value)}
//                 className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-2">
//               Slot Duration (minutes)
//             </label>
//             <input
//               type="number"
//               min="5"
//               step="5"
//               value={slotDuration}
//               onChange={(e) => setSlotDuration(String(parseInt(e.target.value) || 30))}
//               className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               disabled={loading}
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
//                       disabled={loading}
//                     />
//                   </div>
//                 ))}
//               </div>
//               <p className="text-xs text-slate-500 mt-2">
//                 Set the maximum number of concurrent appointments for each slot
//               </p>
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-2">
//               Effective From
//             </label>
//             <input
//               type="date"
//               value={effectiveFrom}
//               onChange={(e) => setEffectiveFrom(e.target.value)}
//               className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               disabled={loading}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-2">
//               Effective To (optional)
//             </label>
//             <input
//               type="date"
//               value={effectiveTo}
//               onChange={(e) => setEffectiveTo(e.target.value)}
//               className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               disabled={loading}
//             />
//           </div>

//           <div className="flex gap-3 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={loading}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               className="flex-1 bg-emerald-600 hover:bg-emerald-700"
//               disabled={loading}
//             >
//               {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
//               {loading ? "Creating..." : "Create Schedule"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
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

export default function AddScheduleModal({ open, onOpenChange, doctorId, onAdded }) {
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState("30");
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);
  const [effectiveTo, setEffectiveTo] = useState("");
  const [maxAppointmentsPerSlot, setMaxAppointmentsPerSlot] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate number of slots whenever these values change
  const numSlots = useMemo(() => {
    return calculateNumSlots(startTime, endTime, slotDuration);
  }, [startTime, endTime, slotDuration]);

  // Initialize or resize maxAppointmentsPerSlot array when numSlots changes
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

  const handleSlotChange = (index, value) => {
    const newArray = [...maxAppointmentsPerSlot];
    // FIX: always store as integer, never as string
    newArray[index] = Math.max(1, parseInt(value) || 1);
    setMaxAppointmentsPerSlot(newArray);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!startTime || !endTime) {
      setError("Start and end times are required");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      const clinicId = localStorage.getItem("auvia_clinic_id");
      if (!clinicId) {
        setError("Clinic ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const calculatedSlots = calculateNumSlots(startTime, endTime, slotDuration);

      // FIX: ensure every value is a proper integer before sending
      const slotsArray =
        calculatedSlots > 0
          ? (maxAppointmentsPerSlot.length === calculatedSlots
              ? maxAppointmentsPerSlot
              : new Array(calculatedSlots).fill(1)
            ).map((v) => parseInt(v) || 1)   // ← coerce strings → integers
          : [];

      await doctorsApi.createSchedule(doctorId, {
        clinic_id: clinicId,
        day_of_week: parseInt(dayOfWeek),
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        slot_duration_minutes: parseInt(slotDuration),
        effective_from: effectiveFrom,
        effective_to: effectiveTo || null,
        // FIX: only send the field when there is actually data
        ...(slotsArray.length > 0 && { max_appointments_per_slot: slotsArray }),
      });

      // Reset form
      setDayOfWeek("1");
      setStartTime("09:00");
      setEndTime("17:00");
      setSlotDuration("30");
      setEffectiveFrom(new Date().toISOString().split("T")[0]);
      setEffectiveTo("");
      setMaxAppointmentsPerSlot([]);
      setError(null);

      onOpenChange(false);
      onAdded?.();
    } catch (err) {
      setError(err.message || "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Schedule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Day of Week
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={loading}
            >
              {DAYS_OF_WEEK.map((day, idx) => (
                <option key={idx} value={idx}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Slot Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Set the maximum number of concurrent appointments for each slot
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Effective From
            </label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Effective To (optional)
            </label>
            <input
              type="date"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {loading ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}