import { NextRequest } from "next/server";
import { envConfig } from "@/config";

export async function GET(_request: NextRequest) {
  const base = envConfig.NEXT_PUBLIC_API_END_POINT;
  const candidates = ["/categories/public", "/categories"];
  for (const path of candidates) {
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (res.status !== 404 && res.status !== 405) {
      const contentType = res.headers.get("content-type") || "application/json";
      let data: any;
      try {
        if (contentType.includes("application/json")) {
          const text = await res.text();
          data = text ? JSON.parse(text) : null;
        } else {
          data = await res.text();
        }
      } catch {
        data = null;
      }
      return new Response(
        typeof data === "string" ? data : JSON.stringify(data),
        {
          status: res.status,
          headers: { "Content-Type": contentType },
        }
      );
    }
  }
  return new Response(JSON.stringify({ data: [] }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
