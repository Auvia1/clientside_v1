const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4002";

function getAuthHeader(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(req, { params }) {
  const { clinic_id } = params;
  const token = req.headers.get("authorization");

  try {
    const res = await fetch(`${BACKEND_URL}/api/credits/balance/${clinic_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Credit balance proxy error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
