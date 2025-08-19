import { NextRequest } from "next/server";
import { envConfig } from "@/config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "20";

  console.log("Products public API called with params:", {
    q,
    categoryId,
    brandId,
    page,
    size,
  });

  // Map to new backend endpoints: /api/v1/products, /api/v1/products/search, /api/v1/products/category/:categoryId
  let backendUrl: string;
  const base = `${envConfig.NEXT_PUBLIC_BACKEND_URL}/api/${envConfig.NEXT_PUBLIC_API_VERSION}`;

  if (categoryId) {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("size", size);
    backendUrl = `${base}/products/category/${categoryId}?${params.toString()}`;
  } else if (brandId) {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("size", size);
    backendUrl = `${base}/products/brand/${brandId}?${params.toString()}`;
  } else if (q) {
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("page", page);
    params.set("size", size);
    backendUrl = `${base}/products/search?${params.toString()}`;
  } else {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("size", size);
    backendUrl = `${base}/products?${params.toString()}`;
  }

  console.log("Backend URL:", backendUrl.toString());

  try {
    const res = await fetch(backendUrl, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Products API response status:", res.status);

    if (!res.ok) {
      console.error("Products API error - status:", res.status);
      const errorText = await res.text();
      console.error("Error response:", errorText);

      return new Response(
        JSON.stringify({
          data: [],
          message: "Failed to fetch products",
          error: errorText,
        }),
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

    // Handle new backend response format: { success: true, data: { content: [], page, size, totalElements, totalPages } }
    let list = [];
    if (raw?.success && raw?.data?.content) {
      // New format with pagination
      list = raw.data.content;
    } else if (Array.isArray(raw?.data)) {
      // Direct array format
      list = raw.data;
    } else if (Array.isArray(raw)) {
      // Root level array
      list = raw;
    }

    console.log("Products API normalized length:", list.length);
    if (list.length > 0) {
      console.log("Sample product:", list[0]);
    }

    return new Response(
      JSON.stringify({
        data: list,
        pagination: raw?.data
          ? {
              page: raw.data.page || 0,
              size: raw.data.size || 20,
              totalElements: raw.data.totalElements || list.length,
              totalPages: raw.data.totalPages || 1,
            }
          : null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Products API error:", e);
    return new Response(
      JSON.stringify({
        data: [],
        message: "Internal Error",
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
