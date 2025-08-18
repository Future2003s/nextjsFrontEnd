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

  const backendUrl = new URL(
    `${envConfig.NEXT_PUBLIC_API_END_POINT}/products/public`
  );
  if (q) backendUrl.searchParams.set("q", q);
  if (categoryId) backendUrl.searchParams.set("categoryId", categoryId);
  if (brandId) backendUrl.searchParams.set("brandId", brandId);
  backendUrl.searchParams.set("page", page);
  backendUrl.searchParams.set("size", size);

  console.log("Backend URL:", backendUrl.toString());

  try {
    const res = await fetch(backendUrl.toString(), { cache: "no-store" });
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

    // Backend returns ResponseData<List<ProductListItemResponse>>
    // So raw.data should be the array
    const list = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.data?.content)
      ? raw.data.content
      : Array.isArray(raw?.content)
      ? raw.content
      : Array.isArray(raw)
      ? raw
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
