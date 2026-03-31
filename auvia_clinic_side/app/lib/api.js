
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

  get: (doctorId) => request(`/doctors/${doctorId}`),

  getSchedule: (doctorId) => request(`/doctors/${doctorId}/schedule?clinic_id=${getClinicId()}`),

  getTimeOff: (doctorId) => request(`/doctors/${doctorId}/time-off?clinic_id=${getClinicId()}`),

  getSlots: (doctorId, date) =>
    request(`/doctors/${doctorId}/slots?date=${date}&clinic_id=${getClinicId()}`),

  getAppointments: (doctorId, filters = {}) => {
    const params = new URLSearchParams({ clinic_id: getClinicId() });
    if (filters.status) params.set("status", filters.status);
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);
    if (filters.patient_id) params.set("patient_id", filters.patient_id);
    if (filters.page) params.set("page", filters.page);
    if (filters.limit) params.set("limit", filters.limit);
    return request(`/doctors/${doctorId}/appointments?${params}`);
  },

  createSchedule: (doctorId, payload) =>
    request(`/doctors/${doctorId}/schedule`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createTimeOff: (doctorId, payload) =>
    request(`/doctors/${doctorId}/time-off`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateSchedule: (doctorId, scheduleId, payload) =>
    request(`/doctors/${doctorId}/schedule/${scheduleId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteSchedule: (doctorId, scheduleId) =>
    request(`/doctors/${doctorId}/schedule/${scheduleId}`, {
      method: "DELETE",
    }),

  updateTimeOff: (doctorId, timeOffId, payload) =>
    request(`/doctors/${doctorId}/time-off/${timeOffId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTimeOff: (doctorId, timeOffId) =>
    request(`/doctors/${doctorId}/time-off/${timeOffId}`, {
      method: "DELETE",
    }),
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

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams({ clinic_id: getClinicId() });
    if (filters.status) params.set("status", filters.status);
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);
    if (filters.page) params.set("page", filters.page);
    if (filters.limit) params.set("limit", filters.limit);
    return request(`/payments?${params}`);
  },

  get: (id) => request(`/payments/${id}`),

  create: (payload) =>
    request("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
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

// ─── Calls ────────────────────────────────────────────────────────────────────
export const callsApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams({ clinic_id: getClinicId() });
    if (filters.type) params.set("type", filters.type);
    if (filters.agent_type) params.set("agent_type", filters.agent_type);
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);
    if (filters.page) params.set("page", filters.page);
    if (filters.limit) params.set("limit", filters.limit);
    return request(`/calls?${params}`);
  },

  get: (id) => request(`/calls/${id}`),

  create: (payload) =>
    request("/calls", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id, payload) =>
    request(`/calls/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getStats: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);
    return request(`/calls/stats/summary?${params}`);
  },
};