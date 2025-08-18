import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET current user by forwarding cookie token to backend
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;
    if (!token) {
      return NextResponse.json({ success: true, user: null }, { status: 200 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_END_POINT || "http://localhost:8081/api/v1";
    const res = await fetch(`${baseUrl}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const text = await res.text();
    const data =
      contentType.includes("application/json") && text ? JSON.parse(text) : {};

    if (!res.ok || !data?.success) {
      return NextResponse.json({ success: true, user: null }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, user: data.data },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: true, user: null }, { status: 200 });
  }
}
