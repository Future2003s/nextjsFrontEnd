import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/next-api-auth";

export async function GET(request: NextRequest) {
  return proxyJson(
    `${process.env.NEXT_PUBLIC_API_END_POINT}/auth/me`,
    request,
    {
      method: "GET",
      requireAuth: true,
    }
  );
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  return proxyJson(
    `${process.env.NEXT_PUBLIC_API_END_POINT}/auth/me`,
    request,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      requireAuth: true,
    }
  );
}
