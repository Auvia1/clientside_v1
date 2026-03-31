// Debug utility to test APIs in browser console
// Usage: In browser console, run: import('/_next/static/chunks/lib_debug.js').then(m => m.testPaymentsAPI())

export async function testPaymentsAPI() {
  const token = localStorage.getItem("auvia_token");
  const clinicId = localStorage.getItem("auvia_clinic_id");

  console.log("=== API TEST ===");
  console.log("Token:", token ? "✓ Present" : "✗ MISSING");
  console.log("Clinic ID:", clinicId ? `✓ ${clinicId}` : "✗ MISSING");

  if (!token || !clinicId) {
    console.error("❌ Missing auth credentials");
    return;
  }

  try {
    const url = `/api/payments?clinic_id=${clinicId}&status=paid&limit=100`;
    console.log("Fetching:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Status:", response.status);
    const data = await response.json();

    if (data.success) {
      console.log("✓ API Response Success");
      console.log("Payments count:", data.data?.length || 0);
      console.log("Pagination:", data.pagination);
      console.log("Sample payment:", data.data?.[0]);
    } else {
      console.error("✗ API Error:", data.error);
    }

    return data;
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
  }
}

export async function testAuthMe() {
  const token = localStorage.getItem("auvia_token");

  console.log("=== AUTH TEST ===");
  console.log("Token:", token ? "✓ Present" : "✗ MISSING");

  if (!token) {
    console.error("❌ No auth token");
    return;
  }

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Status:", response.status);
    const data = await response.json();

    if (data.success) {
      console.log("✓ Auth Success");
      console.log("User:", data.data);
    } else {
      console.error("✗ Auth Error:", data.error);
    }

    return data;
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
  }
}

// Export for global access
if (typeof window !== "undefined") {
  window.debugAPI = { testPaymentsAPI, testAuthMe };
}
