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


import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { doctorsApi, clinicsApi, slotsApi } from "../lib/api";

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
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSlotNeeded, setIsSlotNeeded] = useState(true);

  // Fetch clinic settings to check if slots are needed
  useEffect(() => {
    if (!open) return;

    const fetchClinicSettings = async () => {
      try {
        const clinicId = localStorage.getItem("auvia_clinic_id");
        if (!clinicId) return;

        const response = await clinicsApi.getIsSlotNeeded(clinicId);
        console.log("Clinic settings response:", response);
        console.log("is_slots_needed value:", response.is_slots_needed);
        setIsSlotNeeded(response.is_slots_needed ?? true);
      } catch (err) {
        console.error("Failed to fetch clinic settings:", err);
        setIsSlotNeeded(true);
      }
    };

    fetchClinicSettings();
  }, [open]);

  // Calculate number of slots whenever these values change
  const numSlots = useMemo(() => {
    return calculateNumSlots(startTime, endTime, slotDuration);
  }, [startTime, endTime, slotDuration]);

  // Initialize or resize maxAppointmentsPerSlot array when numSlots changes
  useEffect(() => {
    if (numSlots > 0 && !isSlotNeeded) {
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
  }, [numSlots, isSlotNeeded]);

  const handleSlotChange = (index, value) => {
    const newArray = [...maxAppointmentsPerSlot];
    // FIX: always store as integer, never as string
    newArray[index] = Math.max(1, parseInt(value) || 1);
    setMaxAppointmentsPerSlot(newArray);
  };

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        id: Date.now(),
        start_time: "09:00:00",
        end_time: "10:00:00",
        max_appointments_per_slot: 1,
      },
    ]);
  };

  const removeSlot = (id) => {
    setSlots(slots.filter((slot) => slot.id !== id));
  };

  const updateSlot = (id, field, value) => {
    setSlots(
      slots.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
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

    if (!isSlotNeeded && slots.length === 0) {
      setError("Please add at least one slot");
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

      // Handle slot creation if isSlotNeeded is false
      if (!isSlotNeeded && slots.length > 0) {
        for (const slot of slots) {
          try {
            await slotsApi.create({
              clinic_id: clinicId,
              doctor_id: doctorId,
              day_of_week: parseInt(dayOfWeek),
              start_time: slot.start_time,
              end_time: slot.end_time,
              effective_from: effectiveFrom,
              effective_to: effectiveTo || null,
              max_appointments_per_slot: slot.max_appointments_per_slot,
              status: "open",
            });
          } catch (err) {
            setError(`Failed to create slot: ${err.message}`);
            setLoading(false);
            return;
          }
        }
      }

      const calculatedSlots = calculateNumSlots(startTime, endTime, slotDuration);

      // FIX: ensure every value is a proper integer before sending
      const slotsArray =
        calculatedSlots > 0 && !isSlotNeeded
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
      setSlots([]);
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

          {!isSlotNeeded && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Time Slots
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addSlot}
                  disabled={loading}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Button>
              </div>

              {slots.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No slots added yet. Click "Add Slot" to create one.
                </p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="border border-slate-200 rounded-lg p-3 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={slot.start_time.substring(0, 5)}
                            onChange={(e) => {
                              const time = `${e.target.value}:00`;
                              updateSlot(slot.id, "start_time", time);
                            }}
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={slot.end_time.substring(0, 5)}
                            onChange={(e) => {
                              const time = `${e.target.value}:00`;
                              updateSlot(slot.id, "end_time", time);
                            }}
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Max Appointments
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={slot.max_appointments_per_slot}
                            onChange={(e) =>
                              updateSlot(
                                slot.id,
                                "max_appointments_per_slot",
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSlot(slot.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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