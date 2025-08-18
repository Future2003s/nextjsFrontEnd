import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value || "";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_END_POINT}/categories`,
      {
        cache: "no-store",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { "Content-Type": contentType || "text/plain" },
      });
    }
  } catch (e) {
    console.error("/api/meta/categories GET error:", e);
    // Fallback safe payload to avoid client loops
    return new Response(
      JSON.stringify({ statusCode: 200, message: "OK", data: [] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization") || "";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_END_POINT}/create-category`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
      }
    );
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { "Content-Type": contentType || "text/plain" },
      });
    }
  } catch (e) {
    console.error("/api/meta/categories POST error:", e);
    const msg = e instanceof Error ? e.message : "Internal Error";
    return new Response(JSON.stringify({ message: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
