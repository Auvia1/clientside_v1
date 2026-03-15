// // lib/api.js — centralized API client

// const BASE_URL = "/api";

// async function request(path, options = {}) {
//   const res = await fetch(`${BASE_URL}${path}`, {
//     headers: { "Content-Type": "application/json" },
//     ...options,
//   });
//   const data = await res.json();
//   if (!res.ok || !data.success) {
//     throw new Error(data.error || "Request failed");
//   }
//   return data.data;
// }

// // ─── Appointments ────────────────────────────────────────────────
// export const appointmentsApi = {
//   /** Fetch schedule for a date, optionally filter by doctor_id or status */
//   getSchedule: (date, doctorId, status) => {
//     const params = new URLSearchParams({ date });
//     if (doctorId) params.set("doctor_id", doctorId);
//     if (status) params.set("status", status);
//     return request(`/appointments/schedule?${params}`);
//   },

//   /** Stats for a given date */
//   getStats: (date) => request(`/appointments/stats?date=${date}`),

//   /** Single appointment detail */
//   get: (id) => request(`/appointments/${id}`),

//   /** Book a new appointment */
//   book: (payload) =>
//     request("/appointments", { method: "POST", body: JSON.stringify(payload) }),

//   /** Update status */
//   updateStatus: (id, status) =>
//     request(`/appointments/${id}/status`, {
//       method: "PATCH",
//       body: JSON.stringify({ status }),
//     }),

//   /** Cancel appointment */
//   cancel: (id) => request(`/appointments/${id}`, { method: "DELETE" }),
// };

// // ─── Doctors ─────────────────────────────────────────────────────
// export const doctorsApi = {
//   /** List all active doctors */
//   list: () => request("/doctors"),

//   /** Available time slots for a doctor on a date */
//   getSlots: (doctorId, date) =>
//     request(`/doctors/${doctorId}/slots?date=${date}`),
// };

// // ─── Patients ─────────────────────────────────────────────────────
// export const patientsApi = {
//   /** Search patients by name or phone */
//   search: (query, limit = 10) => {
//     const params = new URLSearchParams();
//     if (query) params.set("search", query);
//     params.set("limit", limit);
//     return request(`/patients?${params}`);
//   },

//   /** Get single patient with history */
//   get: (id) => request(`/patients/${id}`),
// };

// lib/api.js — centralized API client

const BASE_URL = "/api";
export const CLINIC_ID = "433e6186-e408-4b01-bcad-1fa449b41d63";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Request failed");
  }
  return data.data;
}

// ─── Appointments ────────────────────────────────────────────────
export const appointmentsApi = {
  /** Fetch schedule for a date, optionally filter by doctor_id or status */
  getSchedule: (date, doctorId, status) => {
    const params = new URLSearchParams({ date, clinic_id: CLINIC_ID });
    if (doctorId) params.set("doctor_id", doctorId);
    if (status) params.set("status", status);
    return request(`/appointments/schedule?${params}`);
  },

  /** Stats for a given date */
  getStats: (date) =>
    request(`/appointments/stats?date=${date}&clinic_id=${CLINIC_ID}`),

  /** Single appointment detail */
  get: (id) => request(`/appointments/${id}`),

  /** Book a new appointment */
  book: (payload) =>
    request("/appointments", { method: "POST", body: JSON.stringify(payload) }),

  /** Update status */
  updateStatus: (id, status) =>
    request(`/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  /** Cancel appointment */
  cancel: (id) => request(`/appointments/${id}`, { method: "DELETE" }),
};

// ─── Doctors ─────────────────────────────────────────────────────
export const doctorsApi = {
  /** List all active doctors */
  list: () => request(`/doctors?clinic_id=${CLINIC_ID}`),

  /** Available time slots for a doctor on a date */
  getSlots: (doctorId, date) =>
    request(`/doctors/${doctorId}/slots?date=${date}&clinic_id=${CLINIC_ID}`),
};

// ─── Patients ─────────────────────────────────────────────────────
export const patientsApi = {
  /** Search patients by name or phone */
  search: (query, limit = 10) => {
    const params = new URLSearchParams({ clinic_id: CLINIC_ID });
    if (query) params.set("search", query);
    params.set("limit", limit);
    return request(`/patients?${params}`);
  },

  /** Get single patient with history */
  get: (id) => request(`/patients/${id}?clinic_id=${CLINIC_ID}`),
};