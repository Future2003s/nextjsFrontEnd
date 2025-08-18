import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/next-api-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating product with body:", body);
    const response = await proxyJson(
      `${process.env.NEXT_PUBLIC_API_END_POINT}/products/createProduct`,
      request,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        requireAuth: true,
      }
    );
    console.log("Create product response status:", response.status);
    return response;
  } catch (e) {
    console.error("Create product error:", e);
    return new Response(JSON.stringify({ message: "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
