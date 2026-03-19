
// const BASE_URL = "/api";
// export const CLINIC_ID = "433e6186-e408-4b01-bcad-1fa449b41d63";

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
//     const params = new URLSearchParams({ date, clinic_id: CLINIC_ID });
//     if (doctorId) params.set("doctor_id", doctorId);
//     if (status) params.set("status", status);
//     return request(`/appointments/schedule?${params}`);
//   },

//   /** Stats for a given date */
//   getStats: (date) =>
//     request(`/appointments/stats?date=${date}&clinic_id=${CLINIC_ID}`),

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
//   list: () => request(`/doctors?clinic_id=${CLINIC_ID}`),

//   /** Available time slots for a doctor on a date */
//   getSlots: (doctorId, date) =>
//     request(`/doctors/${doctorId}/slots?date=${date}&clinic_id=${CLINIC_ID}`),
// };

// // ─── Patients ─────────────────────────────────────────────────────
// export const patientsApi = {
//   /** Search patients by name or phone */
//   search: (query, limit = 10) => {
//     const params = new URLSearchParams({ clinic_id: CLINIC_ID });
//     if (query) params.set("search", query);
//     params.set("limit", limit);
//     return request(`/patients?${params}`);
//   },

//   /** Get single patient with history */
//   get: (id) => request(`/patients/${id}?clinic_id=${CLINIC_ID}`),
// };

// lib/api.js — centralized API client

// const BASE_URL = "/api";
// export const CLINIC_ID = "433e6186-e408-4b01-bcad-1fa449b41d63";

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
//   getSchedule: (date, doctorId, status) => {
//     const params = new URLSearchParams({ date, clinic_id: CLINIC_ID });
//     if (doctorId) params.set("doctor_id", doctorId);
//     if (status)   params.set("status", status);
//     return request(`/appointments/schedule?${params}`);
//   },

//   getStats: (date) =>
//     request(`/appointments/stats?date=${date}&clinic_id=${CLINIC_ID}`),

//   get: (id) => request(`/appointments/${id}`),

//   book: (payload) =>
//     request("/appointments", { method: "POST", body: JSON.stringify(payload) }),

//   updateStatus: (id, status) =>
//     request(`/appointments/${id}/status`, {
//       method: "PATCH",
//       body: JSON.stringify({ status }),
//     }),

//   cancel: (id) => request(`/appointments/${id}`, { method: "DELETE" }),
// };

// // ─── Doctors ─────────────────────────────────────────────────────
// export const doctorsApi = {
//   list: () => request(`/doctors?clinic_id=${CLINIC_ID}`),

//   getSlots: (doctorId, date) =>
//     request(`/doctors/${doctorId}/slots?date=${date}&clinic_id=${CLINIC_ID}`),
// };

// // ─── Patients ─────────────────────────────────────────────────────
// export const patientsApi = {
//   search: (query, limit = 10) => {
//     const params = new URLSearchParams({ clinic_id: CLINIC_ID });
//     if (query) params.set("search", query);
//     params.set("limit", limit);
//     return request(`/patients?${params}`);
//   },

//   get: (id) => request(`/patients/${id}?clinic_id=${CLINIC_ID}`),
// };


// app/lib/api.js

// 🔥 IMPORTANT: set your clinic ID here (or from env later)
export const CLINIC_ID = process.env.NEXT_PUBLIC_CLINIC_ID || "433e6186-e408-4b01-bcad-1fa449b41d63";

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 Generic API helper
// ─────────────────────────────────────────────────────────────────────────────

async function apiRequest(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Something went wrong");
    }

    return data.data;
  } catch (err) {
    console.error("API Error:", err.message);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 📅 Appointments API
// ─────────────────────────────────────────────────────────────────────────────

export const appointmentsApi = {
  // 🔹 Get schedule
  getSchedule: async (date) => {
    return apiRequest(
      `/api/appointments/schedule?clinic_id=${CLINIC_ID}&date=${date}`
    );
  },

  // 🔹 Get stats
  getStats: async (date) => {
    return apiRequest(
      `/api/appointments/stats?clinic_id=${CLINIC_ID}&date=${date}`
    );
  },

  // 🔹 Book appointment
  create: async (payload) => {
    return apiRequest(`/api/appointments`, {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        clinic_id: CLINIC_ID, // 🔥 MUST include
      }),
    });
  },

  // 🔥 FIXED: Update status (✓ / ✕)
  updateStatus: async (id, status) => {
    return apiRequest(`/api/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    });
  },

  // 🔹 Cancel appointment
  cancel: async (id) => {
    return apiRequest(`/api/appointments/${id}`, {
      method: "DELETE",
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 👩‍⚕️ Doctors API
// ─────────────────────────────────────────────────────────────────────────────

export const doctorsApi = {
  // 🔹 List doctors
  list: async () => {
    return apiRequest(`/api/doctors?clinic_id=${CLINIC_ID}`);
  },

  // 🔹 Get slots
  getSlots: async (doctorId, date) => {
    return apiRequest(
      `/api/doctors/${doctorId}/slots?clinic_id=${CLINIC_ID}&date=${date}`
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 👤 Patients API
// ─────────────────────────────────────────────────────────────────────────────

export const patientsApi = {
  // 🔹 Search patients
  search: async (query, limit = 10) => {
    return apiRequest(
      `/api/patients?clinic_id=${CLINIC_ID}&search=${encodeURIComponent(
        query
      )}&limit=${limit}`
    );
  },

  // 🔹 Get single patient
  getById: async (id) => {
    return apiRequest(`/api/patients/${id}?clinic_id=${CLINIC_ID}`);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ⚡ Activity API (optional, since you already use WS)
// ─────────────────────────────────────────────────────────────────────────────

export const activityApi = {
  list: async (limit = 10) => {
    return apiRequest(
      `/api/activity?clinic_id=${CLINIC_ID}&limit=${limit}`
    );
  },

  create: async (payload) => {
    return apiRequest(`/api/activity`, {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        clinic_id: CLINIC_ID,
      }),
    });
  },
};