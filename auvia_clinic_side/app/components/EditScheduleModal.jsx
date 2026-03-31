"use client";

import { useState, useEffect } from "react";
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
      setError(null);
    }
  }, [schedule, open]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Convert time to HH:MM:SS format
      const [startH, startM] = form.start_time.split(":").map(Number);
      const [endH, endM] = form.end_time.split(":").map(Number);

      const payload = {
        day_of_week: Number(form.day_of_week),
        start_time: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`,
        end_time: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`,
        slot_duration_minutes: Number(form.slot_duration_minutes),
        effective_from: form.effective_from || null,
        effective_to: form.effective_to || null,
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
      <DialogContent className="max-w-md">
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
