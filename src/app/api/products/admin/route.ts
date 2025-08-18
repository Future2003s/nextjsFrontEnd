import { NextRequest } from "next/server";
import { envConfig } from "@/config";
import { proxyJson } from "@/lib/next-api-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "20";
    const q = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const brandId = searchParams.get("brandId") || "";
    const status = searchParams.get("status") || "";

    const queryParams = new URLSearchParams();
    queryParams.set("page", page);
    queryParams.set("size", size);
    if (q) queryParams.set("q", q);
    if (categoryId) queryParams.set("categoryId", categoryId);
    if (brandId) queryParams.set("brandId", brandId);
    if (status) queryParams.set("status", status);

    const backendUrl = `${
      envConfig.NEXT_PUBLIC_API_END_POINT
    }/products/admin?${queryParams.toString()}`;

    // Forward to backend with auth and return as-is
    return await proxyJson(backendUrl, request, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      requireAuth: true,
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
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
