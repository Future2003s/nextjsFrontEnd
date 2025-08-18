import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_END_POINT}/meta/brands`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_END_POINT;
    if (!apiBase) {
      return new Response(
        JSON.stringify({ message: "Missing NEXT_PUBLIC_API_END_POINT" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const body = await request.json();
    const authHeader = request.headers.get("authorization") || "";
    const res = await fetch(`${apiBase}/brands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });
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
    console.error("/api/meta/brands POST error:", e);
    const msg = e instanceof Error ? e.message : "Internal Error";
    return new Response(JSON.stringify({ message: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
