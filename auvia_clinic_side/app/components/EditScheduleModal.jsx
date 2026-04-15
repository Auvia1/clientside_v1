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
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
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

export default function EditScheduleModal({ open, onOpenChange, schedule, doctorId, onUpdate }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSlotNeeded, setIsSlotNeeded] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 30,
    effective_from: "",
    effective_to: "",
  });

  const [maxAppointmentsPerSlot, setMaxAppointmentsPerSlot] = useState([]);
  const [slots, setSlots] = useState([]);

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

      // Fetch all slots for this day
      if (!isSlotNeeded) {
        fetchSlotsForDay(schedule.day_of_week);
      } else {
        // Load slots if they exist
        if (schedule.slots && Array.isArray(schedule.slots)) {
          setSlots(
            schedule.slots.map((slot) => ({
              ...slot,
              id: slot.id || Date.now(),
            }))
          );
        } else {
          setSlots([]);
        }
      }

      setError(null);
    }
  }, [schedule, open, isSlotNeeded]);

  // Fetch all slots for the day
  const fetchSlotsForDay = async (dayOfWeek) => {
    try {
      setLoadingSlots(true);
      const clinicId = localStorage.getItem("auvia_clinic_id");
      const response = await slotsApi.list({
        clinic_id: clinicId,
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
      });

      const fetchedSlots = Array.isArray(response) ? response : response.data || [];
      setSlots(
        fetchedSlots.map((slot) => ({
          ...slot,
          id: slot.id || Date.now(),
        }))
      );
      setLoadingSlots(false);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setLoadingSlots(false);
      // Fall back to schedule slots if fetch fails
      if (schedule.slots && Array.isArray(schedule.slots)) {
        setSlots(
          schedule.slots.map((slot) => ({
            ...slot,
            id: slot.id || Date.now(),
          }))
        );
      }
    }
  };

  // Calculate number of slots whenever these values change
  const numSlots = useMemo(() => {
    return calculateNumSlots(form.start_time, form.end_time, form.slot_duration_minutes);
  }, [form.start_time, form.end_time, form.slot_duration_minutes]);

  // Resize maxAppointmentsPerSlot array when numSlots changes
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

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

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

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!isSlotNeeded && slots.length === 0) {
      setError("Please add at least one slot");
      setSubmitting(false);
      return;
    }

    try {
      const clinicId = localStorage.getItem("auvia_clinic_id");
      if (!clinicId) {
        setError("Clinic ID not found. Please log in again.");
        setSubmitting(false);
        return;
      }

      // Handle slot operations if isSlotNeeded is false
      if (!isSlotNeeded && schedule) {
        const originalSlotIds = schedule.slots ? schedule.slots.map((s) => s.id) : [];
        const currentSlotIds = slots
          .filter((s) => typeof s.id === "string" && s.id.match(/^[0-9a-f-]{36}$/i))
          .map((s) => s.id);

        // Delete slots that were removed
        for (const slotId of originalSlotIds) {
          if (!currentSlotIds.includes(slotId)) {
            try {
              await slotsApi.delete(slotId);
            } catch (err) {
              console.error(`Failed to delete slot ${slotId}:`, err);
            }
          }
        }

        // Create or update slots
        for (const slot of slots) {
          try {
            // If slot.id is a number (Date.now()), it's a new slot
            if (typeof slot.id === "number") {
              await slotsApi.create({
                clinic_id: clinicId,
                doctor_id: doctorId,
                day_of_week: Number(form.day_of_week),
                start_time: slot.start_time,
                end_time: slot.end_time,
                effective_from: form.effective_from,
                effective_to: form.effective_to || null,
                max_appointments_per_slot: slot.max_appointments_per_slot,
                status: "open",
              });
            } else if (typeof slot.id === "string" && slot.id.match(/^[0-9a-f-]{36}$/i)) {
              // UUID format - update existing slot
              await slotsApi.update(slot.id, {
                day_of_week: Number(form.day_of_week),
                start_time: slot.start_time,
                end_time: slot.end_time,
                effective_from: form.effective_from,
                effective_to: form.effective_to || null,
                max_appointments_per_slot: slot.max_appointments_per_slot,
              });
            }
          } catch (err) {
            console.error("Failed to save slot:", err);
          }
        }
      }

      // Convert time to HH:MM:SS format
      const [startH, startM] = form.start_time.split(":").map(Number);
      const [endH, endM] = form.end_time.split(":").map(Number);

      const calculatedSlots = calculateNumSlots(form.start_time, form.end_time, form.slot_duration_minutes);

      // FIX: ensure every value is a proper integer before sending
      const slotsArray =
        calculatedSlots > 0 && !isSlotNeeded
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

          {isSlotNeeded && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slot Duration (minutes)
              </label>
              <Input
                type="number"
                value={form.slot_duration_minutes}
                onChange={(e) => set("slot_duration_minutes", parseInt(e.target.value) || 5)}
                disabled={submitting}
                min="5"
                step="5"
              />
            </div>
          )}

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
                  disabled={submitting || loadingSlots}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Button>
              </div>

              {loadingSlots ? (
                <div className="text-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-600" />
                  <p className="text-sm text-slate-500">Loading slots for this day...</p>
                </div>
              ) : slots.length === 0 ? (
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
                            disabled={submitting}
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
                            disabled={submitting}
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
                            disabled={submitting}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSlot(slot.id)}
                          disabled={submitting}
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
