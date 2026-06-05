const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4002";

export async function POST(req) {
  const token = req.headers.get("authorization");
  const body = await req.json();

  try {
    const res = await fetch(`${BACKEND_URL}/api/credits/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Create order proxy error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
