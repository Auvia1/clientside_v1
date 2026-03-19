
// "use client";
// // hooks/useSchedule.js

// import { useState, useEffect, useCallback } from "react";
// import { appointmentsApi, doctorsApi, patientsApi } from "../lib/api";

// // ─── helpers ─────────────────────────────────────────────────────────────────

// /**
//  * The backend returns appointment_start / appointment_end as TIMESTAMPTZ.
//  * Extract "HH:MM:SS" in IST for the grid / row display.
//  */
// function extractTime(isoString) {
//   if (!isoString) return "";
//   const date = new Date(isoString);
//   return date.toLocaleTimeString("en-IN", {
//     hour:     "2-digit",
//     minute:   "2-digit",
//     second:   "2-digit",
//     hour12:   false,
//     timeZone: "Asia/Kolkata",
//   });
// }

// /**
//  * Normalise a raw appointment row so the rest of the frontend can use
//  * start_time / end_time as plain "HH:MM:SS" strings.
//  */
// function normaliseAppointment(appt) {
//   return {
//     ...appt,
//     start_time: extractTime(appt.appointment_start),
//     end_time:   extractTime(appt.appointment_end),
//   };
// }

// // ─── useSchedule ─────────────────────────────────────────────────────────────

// export function useSchedule(date) {
//   const today = date || new Date().toISOString().split("T")[0];

//   const [schedule, setSchedule]       = useState([]);
//   const [stats, setStats]             = useState(null);
//   const [loading, setLoading]         = useState(true);
//   const [error, setError]             = useState(null);
//   const [lastRefresh, setLastRefresh] = useState(null);

//   const fetchData = useCallback(async () => {
//     try {
//       setError(null);
//       const [scheduleData, statsData] = await Promise.all([
//         appointmentsApi.getSchedule(today),
//         appointmentsApi.getStats(today),
//       ]);
//       setSchedule(scheduleData.map(normaliseAppointment));
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

// export function useClinicSchedule(date) {
//   const [doctors, setDoctors]               = useState([]);
//   const [appointments, setAppointments]     = useState([]);
//   const [appointmentMap, setAppointmentMap] = useState({});
//   const [loading, setLoading]               = useState(true);
//   const [error, setError]                   = useState(null);

//   const fetchData = useCallback(async () => {
//     if (!date) return;
//     try {
//       setError(null);
//       const [doctorData, apptData] = await Promise.all([
//         doctorsApi.list(),
//         appointmentsApi.getSchedule(date),
//       ]);

//       const normalised = apptData.map(normaliseAppointment);
//       setDoctors(doctorData);
//       setAppointments(normalised);

//       // appointmentMap[doctorId][start_time] = appointment
//       const map = {};
//       for (const appt of normalised) {
//         const dId = appt.doctor_id;
//         if (!map[dId]) map[dId] = {};
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
//   const [error, setError]     = useState(null);

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
//   const [slots, setSlots]     = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError]     = useState(null);

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
//   const [query, setQuery]     = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError]     = useState(null);

//   useEffect(() => {
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
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [query]);

//   return { query, setQuery, results, loading, error };
// }

export function useClinicSchedule(date) {
  const [doctors, setDoctors]               = useState([]);
  const [appointments, setAppointments]     = useState([]);
  const [appointmentMap, setAppointmentMap] = useState({});
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

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

      // 🔥 Build map
      const map = {};
      for (const appt of normalised) {
        const dId = appt.doctor_id;
        if (!map[dId]) map[dId] = {};

        map[dId][appt.start_time] = {
          ...appt,
          status: appt.status?.toLowerCase(), // ✅ ensure consistency
        };
      }

      setAppointmentMap(map);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // 🔥🔥🔥 MAIN FIX HERE
  const updateStatus = useCallback(
    async (id, status) => {
      // 🧠 Save previous state (for rollback)
      const prevMap = JSON.parse(JSON.stringify(appointmentMap));

      // ✅ OPTIMISTIC UPDATE (instant UI change)
      setAppointmentMap((prev) => {
        const newMap = { ...prev };

        for (const doctorId in newMap) {
          for (const time in newMap[doctorId]) {
            if (newMap[doctorId][time].id === id) {
              newMap[doctorId][time] = {
                ...newMap[doctorId][time],
                status,
              };
            }
          }
        }

        return newMap;
      });

      try {
        await appointmentsApi.updateStatus(id, status);
      } catch (err) {
        console.error("❌ Status update failed:", err);

        // ❌ rollback UI if API fails
        setAppointmentMap(prevMap);

        throw err;
      }
    },
    [appointmentMap]
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