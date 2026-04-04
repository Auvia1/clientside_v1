
"use client";
// hooks/useSchedule.js

import { useState, useEffect, useCallback } from "react";
import { appointmentsApi, doctorsApi, patientsApi, clinicsApi } from "../lib/api";

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * The backend returns appointment_start / appointment_end as TIMESTAMPTZ.
 * Extract "HH:MM:SS" in IST for the grid / row display.
 */
function extractTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-IN", {
    hour:     "2-digit",
    minute:   "2-digit",
    second:   "2-digit",
    hour12:   false,
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Normalise a raw appointment row so the rest of the frontend can use
 * start_time / end_time as plain "HH:MM:SS" strings.
 */
function normaliseAppointment(appt) {
  return {
    ...appt,
    start_time: extractTime(appt.appointment_start),
    end_time:   extractTime(appt.appointment_end),
  };
}

// ─── useSchedule ─────────────────────────────────────────────────────────────

export function useSchedule(date) {
  const today = date || new Date().toISOString().split("T")[0];

  const [schedule, setSchedule]       = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [scheduleData, statsData] = await Promise.all([
        appointmentsApi.getSchedule(today),
        appointmentsApi.getStats(today),
      ]);
      setSchedule(scheduleData.map(normaliseAppointment));
      setStats(statsData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateAppointmentStatus = useCallback(
    async (id, status) => {
      await appointmentsApi.updateStatus(id, status);
      await fetchData();
    },
    [fetchData]
  );

  const cancelAppointment = useCallback(
    async (id) => {
      await appointmentsApi.cancel(id);
      await fetchData();
    },
    [fetchData]
  );

  return {
    schedule,
    stats,
    loading,
    error,
    lastRefresh,
    refresh: fetchData,
    updateAppointmentStatus,
    cancelAppointment,
  };
}

// ─── useClinicSchedule ────────────────────────────────────────────────────────

export function useClinicSchedule(date) {
  const [doctors, setDoctors]               = useState([]);
  const [appointments, setAppointments]     = useState([]);
  const [appointmentMap, setAppointmentMap] = useState({});
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  const buildMap = useCallback((normalisedAppts) => {
    // appointmentMap[doctorId][start_time] = appointment
    const map = {};
    for (const appt of normalisedAppts) {
      const dId = appt.doctor_id;
      if (!map[dId]) map[dId] = {};
      map[dId][appt.start_time] = appt;
    }
    return map;
  }, []);

  const fetchData = useCallback(async () => {
    if (!date) return;
    try {
      setError(null);
      const [doctorData, apptData] = await Promise.all([
        doctorsApi.list(),
        appointmentsApi.getSchedule(date),
      ]);

      const normalised = apptData.map(normaliseAppointment);
      setDoctors(doctorData);
      setAppointments(normalised);
      setAppointmentMap(buildMap(normalised));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date, buildMap]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  /**
   * updateStatus: called by AppointmentCell when ✓ or ✕ is clicked.
   *
   * Flow:
   *   1. Optimistically update the local appointmentMap so the UI responds instantly.
   *   2. PATCH the backend.
   *   3. On success → re-fetch to get the canonical server state.
   *   4. On failure → roll back the optimistic update and re-throw so
   *      AppointmentCell can show the error to the user.
   */
  const updateStatus = useCallback(
    async (id, newStatus) => {
      // ── 1. find the appointment in current state ──────────────────────────
      let targetAppt   = null;
      let targetDoctorId = null;
      let targetTimeKey  = null;

      for (const [doctorId, timeMap] of Object.entries(appointmentMap)) {
        for (const [timeKey, appt] of Object.entries(timeMap)) {
          if (appt.id === id) {
            targetAppt     = appt;
            targetDoctorId = doctorId;
            targetTimeKey  = timeKey;
            break;
          }
        }
        if (targetAppt) break;
      }

      if (!targetAppt) {
        // Appointment not found in local map – just hit the API and refresh
        await appointmentsApi.updateStatus(id, newStatus);
        await fetchData();
        return;
      }

      const previousStatus = targetAppt.status;

      // ── 2. optimistic update ──────────────────────────────────────────────
      setAppointmentMap((prev) => ({
        ...prev,
        [targetDoctorId]: {
          ...prev[targetDoctorId],
          [targetTimeKey]: { ...targetAppt, status: newStatus },
        },
      }));

      // Also keep the flat appointments list consistent
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );

      // ── 3. call the backend ───────────────────────────────────────────────
      try {
        await appointmentsApi.updateStatus(id, newStatus);
        // Success – re-fetch to sync any other fields the server may have changed
        await fetchData();
      } catch (err) {
        // ── 4. rollback ───────────────────────────────────────────────────
        setAppointmentMap((prev) => ({
          ...prev,
          [targetDoctorId]: {
            ...prev[targetDoctorId],
            [targetTimeKey]: { ...targetAppt, status: previousStatus },
          },
        }));
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: previousStatus } : a))
        );
        // Re-throw so AppointmentCell can display the error
        throw err;
      }
    },
    [appointmentMap, fetchData]
  );

  return {
    doctors,
    appointments,
    appointmentMap,
    loading,
    error,
    refresh: fetchData,
    updateStatus,
  };
}

// ─── useDoctors ───────────────────────────────────────────────────────────────

export function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    doctorsApi
      .list()
      .then(setDoctors)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { doctors, loading, error };
}

// ─── useSlots ─────────────────────────────────────────────────────────────────

export function useSlots(doctorId, date) {
  const [slots, setSlots]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!doctorId || !date) return;
    setLoading(true);
    doctorsApi
      .getSlots(doctorId, date)
      .then(setSlots)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [doctorId, date]);

  return { slots, loading, error };
}

// ─── useDoctorScheduleSlots ───────────────────────────────────────────────────
/**
 * Fetches a doctor's schedule and generates dynamic time slots based on slot_duration_minutes.
 * Card height remains fixed at h-[120px] for all doctors.
 */
export function useDoctorScheduleSlots(doctorId) {
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60); // Default
  const [timeSlots, setTimeSlots]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const schedules = await doctorsApi.getSchedule(doctorId);

        if (!schedules || schedules.length === 0) {
          // Fallback to 60-min slots if no schedule found
          setSlotDurationMinutes(60);
          setTimeSlots(generateTimeSlots("08:00:00", "17:00:00", 60));
          setError(null);
          return;
        }

        // Get first valid schedule
        const schedule = schedules[0];
        const slotDuration = schedule.slot_duration_minutes || 60;

        setSlotDurationMinutes(slotDuration);
        setTimeSlots(generateTimeSlots(schedule.start_time, schedule.end_time, slotDuration));
        setError(null);
      } catch (err) {
        console.error("Error fetching doctor schedule:", err);
        // Fallback to default
        setSlotDurationMinutes(60);
        setTimeSlots(generateTimeSlots("08:00:00", "17:00:00", 60));
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  // Always return fixed height h-[120px] for all doctors
  return { slotDurationMinutes, timeSlots, slotCardHeightClass: "h-[120px]", loading, error };
}

/**
 * Convert HH:MM:SS time to total minutes (from midnight).
 */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes from midnight to "HH:MM AM/PM" format.
 */
function minutesToTimeLabel(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const minStr = mins === 0 ? "00" : mins.toString().padStart(2, "0");
  return `${displayHours.toString().padStart(2, " ")}:${minStr} ${period}`.replace(/^ /, "");
}

/**
 * Generate array of time slot labels from start_time to end_time at given interval.
 */
function generateTimeSlots(startTimeStr, endTimeStr, slotDurationMinutes) {
  const slots = [];
  const startMinutes = timeToMinutes(startTimeStr);
  const endMinutes = timeToMinutes(endTimeStr);

  for (let current = startMinutes; current < endMinutes; current += slotDurationMinutes) {
    slots.push(minutesToTimeLabel(current));
  }

  return slots;
}

// ─── usePatientSearch ─────────────────────────────────────────────────────────

export function usePatientSearch() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await patientsApi.search(query, 8);
        setResults(data);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, loading, error };
}

// ─── useClinicSettings ────────────────────────────────────────────────────────
/**
 * Fetches clinic settings including `is_slots_needed` flag
 * which determines booking model (slot-based vs token-based)
 */
export function useClinicSettings() {
  const [clinicSettings, setClinicSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const settings = await clinicsApi.getSettingsByAuthClinic();
        setClinicSettings(settings);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch clinic settings:", err);
        setError(err.message);
        // Default to slot-based if error
        setClinicSettings({ is_slots_needed: true });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    clinicSettings,
    isSlotsBased: clinicSettings?.is_slots_needed ?? true,
    loading,
    error,
  };
}