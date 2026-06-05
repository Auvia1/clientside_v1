const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4002";

export async function GET(req) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/clinic/credits/packages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Credit packages proxy error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
