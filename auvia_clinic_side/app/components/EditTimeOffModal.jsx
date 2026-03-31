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

const REASONS = [
  "Annual Leave",
  "Sick Leave",
  "Training",
  "Conference",
  "Medical",
  "Other",
];

export default function EditTimeOffModal({ open, onOpenChange, timeOff, doctorId, onUpdate }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    start_datetime: "",
    end_datetime: "",
    reason: "",
  });

  // Initialize form when timeOff changes
  useEffect(() => {
    if (timeOff) {
      const startDate = new Date(timeOff.start_time);
      const endDate = new Date(timeOff.end_time);

      setForm({
        start_datetime: startDate.toISOString().slice(0, 16),
        end_datetime: endDate.toISOString().slice(0, 16),
        reason: timeOff.reason || "",
      });
      setError(null);
    }
  }, [timeOff, open]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Convert local datetime to ISO format with IST timezone
      const startDate = new Date(form.start_datetime);
      const endDate = new Date(form.end_datetime);

      const payload = {
        start_time: startDate.toISOString().replace("Z", "+05:30"),
        end_time: endDate.toISOString().replace("Z", "+05:30"),
        reason: form.reason || null,
      };

      await doctorsApi.updateTimeOff(doctorId, timeOff.id, payload);
      onUpdate?.();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Failed to update time-off");
    } finally {
      setSubmitting(false);
    }
  }

  const isValid = form.start_datetime && form.end_datetime && form.start_datetime < form.end_datetime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Time Off</DialogTitle>
          <DialogDescription>Update the doctor's time-off period</DialogDescription>
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
              Start Date & Time
            </label>
            <Input
              type="datetime-local"
              value={form.start_datetime}
              onChange={(e) => set("start_datetime", e.target.value)}
              disabled={submitting}
            />
            <p className="text-xs text-slate-400 mt-1">Will be saved as IST (+05:30)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Date & Time
            </label>
            <Input
              type="datetime-local"
              value={form.end_datetime}
              onChange={(e) => set("end_datetime", e.target.value)}
              disabled={submitting}
            />
            <p className="text-xs text-slate-400 mt-1">Will be saved as IST (+05:30)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason
            </label>
            <select
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="">-- Select Reason --</option>
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Optional - select a reason or leave blank</p>
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
