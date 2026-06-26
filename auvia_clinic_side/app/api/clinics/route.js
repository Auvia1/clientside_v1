const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4002";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    const res = await fetch(`${BACKEND_URL}/api/clinics?${params}`, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Clinics proxy error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
