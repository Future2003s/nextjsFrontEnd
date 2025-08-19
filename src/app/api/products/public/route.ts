import { NextRequest } from "next/server";
import { envConfig } from "@/config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "20";

  console.log("Products public API called with params:", {
    q,
    categoryId,
    brandId,
    page,
    size,
  });

  // Map to backend endpoints: /products, /products/search, /products/category/:categoryId, /products/brand/:brandId
  let backendUrl: string;
  const base = envConfig.NEXT_PUBLIC_API_END_POINT;
  if (categoryId) {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", size);
    backendUrl = `${base}/products/category/${categoryId}?${params.toString()}`;
  } else if (brandId) {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", size);
    backendUrl = `${base}/products/brand/${brandId}?${params.toString()}`;
  } else if (q) {
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("page", page);
    params.set("limit", size);
    backendUrl = `${base}/products/search?${params.toString()}`;
  } else {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", size);
    backendUrl = `${base}/products?${params.toString()}`;
  }

  console.log("Backend URL:", backendUrl.toString());

  try {
    const res = await fetch(backendUrl, { cache: "no-store" });
    console.log("Products API response status:", res.status);

    if (!res.ok) {
      console.error("Products API error - status:", res.status);
      return new Response(
        JSON.stringify({ data: [], message: "Failed to fetch products" }),
        {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let raw;
    try {
      const text = await res.text();
      raw = text ? JSON.parse(text) : null;
    } catch (error) {
      console.error("JSON parse error:", error);
      raw = null;
    }
    console.log("Products API raw response:", raw);

    // Normalize backend response: either { success, data: { products, pagination } } or { success, data: [] }
    const list = Array.isArray(raw?.data?.products)
      ? raw.data.products
      : Array.isArray(raw?.data)
      ? raw.data
      : [];

    console.log("Products API normalized length:", list.length);
    console.log("Sample product:", list[0]);

    return new Response(JSON.stringify({ data: list }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Products API error:", e);
    return new Response(
      JSON.stringify({ data: [], message: "Internal Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
