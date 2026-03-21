
// const BASE_URL = "/api";
// export const CLINIC_ID = "433e6186-e408-4b01-bcad-1fa449b41d63";

// async function request(path, options = {}) {
//   const res = await fetch(`${BASE_URL}${path}`, {
//     headers: { "Content-Type": "application/json" },
//     ...options,
//   });

//   let data;
//   try {
//     data = await res.json();
//   } catch {
//     throw new Error(`Server error: ${res.status} ${res.statusText}`);
//   }

//   if (!res.ok || !data.success) {
//     throw new Error(data.error || data.message || `Request failed (${res.status})`);
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
//     request("/appointments", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     }),

//   // Sends PATCH /api/appointments/:id/status  { status: "completed" | "no_show" | ... }
//   updateStatus: (id, status) =>
//     request(`/appointments/${id}/status`, {
//       method: "PATCH",
//       body: JSON.stringify({ status }),
//     }),

//   cancel: (id) =>
//     request(`/appointments/${id}`, { method: "DELETE" }),
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

const BASE_URL = "/api";

// ─── Auth helpers ─────────────────────────────────────────────────────────────
// Read dynamically so the value is always fresh after login/logout.
function getClinicId() {
  return localStorage.getItem("auvia_clinic_id") || "";
}

function getToken() {
  return localStorage.getItem("auvia_token") || "";
}

// ─── Core request helper ──────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  }

  // Token expired → clear storage and redirect to login
  if (res.status === 401) {
    localStorage.removeItem("auvia_token");
    localStorage.removeItem("auvia_clinic_id");
    localStorage.removeItem("auvia_user");
    window.location.href = "/";
    throw new Error(data.error || "Session expired. Please log in again.");
  }

  if (!res.ok || !data.success) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }

  return data.data;
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentsApi = {
  getSchedule: (date, doctorId, status) => {
    const params = new URLSearchParams({ date, clinic_id: getClinicId() });
    if (doctorId) params.set("doctor_id", doctorId);
    if (status)   params.set("status", status);
    return request(`/appointments/schedule?${params}`);
  },

  getStats: (date) =>
    request(`/appointments/stats?date=${date}&clinic_id=${getClinicId()}`),

  get: (id) => request(`/appointments/${id}`),

  book: (payload) =>
    request("/appointments", {
      method: "POST",
      body: JSON.stringify({ ...payload, clinic_id: getClinicId() }),
    }),

  // PATCH /api/appointments/:id/status  { status: "completed" | "no_show" | ... }
  updateStatus: (id, status) =>
    request(`/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  cancel: (id) =>
    request(`/appointments/${id}`, { method: "DELETE" }),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const doctorsApi = {
  list: () => request(`/doctors?clinic_id=${getClinicId()}`),

  getSlots: (doctorId, date) =>
    request(`/doctors/${doctorId}/slots?date=${date}&clinic_id=${getClinicId()}`),
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patientsApi = {
  search: (query, limit = 10) => {
    const params = new URLSearchParams({ clinic_id: getClinicId() });
    if (query) params.set("search", query);
    params.set("limit", limit);
    return request(`/patients?${params}`);
  },

  get: (id) => request(`/patients/${id}?clinic_id=${getClinicId()}`),
};

// ─── Activity ─────────────────────────────────────────────────────────────────
export const activityApi = {
  list: (limit = 20) =>
    request(`/activity?clinic_id=${getClinicId()}&limit=${limit}`),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  logout: () => {
    localStorage.removeItem("auvia_token");
    localStorage.removeItem("auvia_clinic_id");
    localStorage.removeItem("auvia_user");
    window.location.href = "/";
  },

  me: () => request("/auth/me"),
};