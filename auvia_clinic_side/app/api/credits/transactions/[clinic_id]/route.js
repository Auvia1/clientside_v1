const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4002";

export async function GET(req, { params }) {
  const { clinic_id } = params;
  const token = req.headers.get("authorization");
  const searchParams = new URL(req.url).searchParams;

  try {
    const queryString = new URLSearchParams();
    if (searchParams.has("type")) queryString.set("type", searchParams.get("type"));
    if (searchParams.has("start_date")) queryString.set("start_date", searchParams.get("start_date"));
    if (searchParams.has("end_date")) queryString.set("end_date", searchParams.get("end_date"));
    if (searchParams.has("page")) queryString.set("page", searchParams.get("page"));
    if (searchParams.has("limit")) queryString.set("limit", searchParams.get("limit"));

    const url = `${BACKEND_URL}/api/credits/transactions/${clinic_id}?${queryString}`;

    const res = await fetch(url, {
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
    console.error("Credit transactions proxy error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
