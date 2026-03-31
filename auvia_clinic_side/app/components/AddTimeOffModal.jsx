"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { doctorsApi } from "../lib/api";

const REASONS = [
  "Annual Leave",
  "Sick Leave",
  "Personal Leave",
  "Training",
  "Conference",
  "Medical",
  "Emergency",
  "Other",
];

function localToIST(dateTimeString) {
  // Convert local datetime to ISO string, then add IST timezone offset
  const date = new Date(dateTimeString);
  // Add IST offset (+5:30)
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  // Format as ISO string with +05:30 suffix
  const iso = istDate.toISOString();
  return iso.replace("Z", "+05:30");
}

export default function AddTimeOffModal({ open, onOpenChange, doctorId, onAdded }) {
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [reason, setReason] = useState("Annual Leave");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!startDateTime || !endDateTime) {
      setError("Start and end dates are required");
      return;
    }

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    if (startDate >= endDate) {
      setError("End date-time must be after start date-time");
      return;
    }

    const finalReason = reason === "Other" && customReason ? customReason : reason;

    setLoading(true);
    try {
      const clinicId = localStorage.getItem("auvia_clinic_id");
      if (!clinicId) {
        setError("Clinic ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      await doctorsApi.createTimeOff(doctorId, {
        clinic_id: clinicId,
        start_time: localToIST(startDateTime),
        end_time: localToIST(endDateTime),
        reason: finalReason,
      });

      // Reset form
      setStartDateTime("");
      setEndDateTime("");
      setReason("Annual Leave");
      setCustomReason("");
      setError(null);

      onOpenChange(false);
      onAdded?.();
    } catch (err) {
      setError(err.message || "Failed to create time off");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Time Off</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={loading}
            />
            <p className="text-xs text-slate-400 mt-1">Will be converted to IST (+05:30)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={loading}
            />
            <p className="text-xs text-slate-400 mt-1">Will be converted to IST (+05:30)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={loading}
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === "Other" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom Reason
              </label>
              <input
                type="text"
                placeholder="Please specify reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                disabled={loading}
              />
            </div>
          )}

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
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {loading ? "Creating..." : "Add Time Off"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
