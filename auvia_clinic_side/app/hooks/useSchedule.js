// "use client";
// // hooks/useSchedule.js

// import { useState, useEffect, useCallback } from "react";
// import { appointmentsApi, doctorsApi, patientsApi } from "../lib/api";

// // ─── useSchedule ─────────────────────────────────────────────────────────────
// // Fetches today's (or any date's) full schedule + stats. Auto-refreshes every 30s.

// export function useSchedule(date) {
//   const today = date || new Date().toISOString().split("T")[0];

//   const [schedule, setSchedule] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastRefresh, setLastRefresh] = useState(null);

//   const fetchData = useCallback(async () => {
//     try {
//       setError(null);
//       const [scheduleData, statsData] = await Promise.all([
//         appointmentsApi.getSchedule(today),
//         appointmentsApi.getStats(today),
//       ]);
//       setSchedule(scheduleData);
//       setStats(statsData);
//       setLastRefresh(new Date());
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [today]);

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 30_000);
//     return () => clearInterval(interval);
//   }, [fetchData]);

//   const updateAppointmentStatus = useCallback(
//     async (id, status) => {
//       await appointmentsApi.updateStatus(id, status);
//       await fetchData();
//     },
//     [fetchData]
//   );

//   const cancelAppointment = useCallback(
//     async (id) => {
//       await appointmentsApi.cancel(id);
//       await fetchData();
//     },
//     [fetchData]
//   );

//   return {
//     schedule,
//     stats,
//     loading,
//     error,
//     lastRefresh,
//     refresh: fetchData,
//     updateAppointmentStatus,
//     cancelAppointment,
//   };
// }

// // ─── useClinicSchedule ────────────────────────────────────────────────────────
// // For the Schedule page — fetches doctors + appointments for a given date,
// // organises appointments into a { doctorId -> { timeSlot -> appointment } } map.

// export function useClinicSchedule(date) {
//   const [doctors, setDoctors] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [appointmentMap, setAppointmentMap] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchData = useCallback(async () => {
//     if (!date) return;
//     try {
//       setError(null);
//       const [doctorData, apptData] = await Promise.all([
//         doctorsApi.list(),
//         appointmentsApi.getSchedule(date),
//       ]);

//       setDoctors(doctorData);
//       setAppointments(apptData);

//       // Build lookup: appointmentMap[doctorId][timeSlot] = appointment
//       // timeSlot = "HH:00" normalized to nearest hour for grid matching
//       const map = {};
//       for (const appt of apptData) {
//         const dId = appt.doctor_id;
//         if (!map[dId]) map[dId] = {};
//         // Use exact start_time as key so we can match against time slots
//         map[dId][appt.start_time] = appt;
//       }
//       setAppointmentMap(map);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [date]);

//   useEffect(() => {
//     setLoading(true);
//     fetchData();
//   }, [fetchData]);

//   const updateStatus = useCallback(
//     async (id, status) => {
//       await appointmentsApi.updateStatus(id, status);
//       await fetchData();
//     },
//     [fetchData]
//   );

//   return {
//     doctors,
//     appointments,
//     appointmentMap,
//     loading,
//     error,
//     refresh: fetchData,
//     updateStatus,
//   };
// }

// // ─── useDoctors ───────────────────────────────────────────────────────────────

// export function useDoctors() {
//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     doctorsApi
//       .list()
//       .then(setDoctors)
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   }, []);

//   return { doctors, loading, error };
// }

// // ─── useSlots ─────────────────────────────────────────────────────────────────

// export function useSlots(doctorId, date) {
//   const [slots, setSlots] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!doctorId || !date) return;
//     setLoading(true);
//     doctorsApi
//       .getSlots(doctorId, date)
//       .then(setSlots)
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   }, [doctorId, date]);

//   return { slots, loading, error };
// }

// // ─── usePatientSearch ─────────────────────────────────────────────────────────

// export function usePatientSearch() {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Show empty results if query is blank
//     if (!query.trim()) {
//       setResults([]);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const data = await patientsApi.search(query, 8);
//         setResults(data);
//       } catch (err) {
//         setError(err.message);
//         setResults([]);
//       } finally {
//         setLoading(false);
//       }
//     }, 300); // 300ms debounce

//     return () => clearTimeout(timer);
//   }, [query]);

//   return { query, setQuery, results, loading, error };
// }

"use client";
// hooks/useSchedule.js

import { useState, useEffect, useCallback } from "react";
import { appointmentsApi, doctorsApi, patientsApi } from "../lib/api";

// ─── useSchedule ─────────────────────────────────────────────────────────────
// Fetches today's (or any date's) full schedule + stats. Auto-refreshes every 30s.

export function useSchedule(date) {
  const today = date || new Date().toISOString().split("T")[0];

  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [scheduleData, statsData] = await Promise.all([
        appointmentsApi.getSchedule(today),
        appointmentsApi.getStats(today),
      ]);
      setSchedule(scheduleData);
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
// For the Schedule page — fetches doctors + appointments for a given date,
// organises appointments into a { doctorId -> { timeSlot -> appointment } } map.

export function useClinicSchedule(date) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentMap, setAppointmentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!date) return;
    try {
      setError(null);
      const [doctorData, apptData] = await Promise.all([
        doctorsApi.list(),
        appointmentsApi.getSchedule(date),
      ]);

      setDoctors(doctorData);
      setAppointments(apptData);

      // Build lookup: appointmentMap[doctorId][timeSlot] = appointment
      const map = {};
      for (const appt of apptData) {
        const dId = appt.doctor_id;
        if (!map[dId]) map[dId] = {};
        map[dId][appt.start_time] = appt;
      }
      setAppointmentMap(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const updateStatus = useCallback(
    async (id, status) => {
      await appointmentsApi.updateStatus(id, status);
      await fetchData();
    },
    [fetchData]
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
  const [error, setError] = useState(null);

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
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

// ─── usePatientSearch ─────────────────────────────────────────────────────────

export function usePatientSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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