import { NextRequest } from "next/server";
import { envConfig } from "@/config";
import { proxyJson } from "@/lib/next-api-auth";

export async function GET(_request: NextRequest, ctx: any) {
  const id = ctx?.params?.id as string;
  try {
    const base = envConfig.NEXT_PUBLIC_API_END_POINT;
    const template = process.env.API_PRODUCTS_GET_URL_TEMPLATE; // e.g., /products/public/{id}
    const candidates: string[] = [];
    if (template) {
      candidates.push(template.replace("{id}", id));
    }
    candidates.push(`/products/public/${id}`);
    candidates.push(`/products/${id}`);

    let lastRes: Response | null = null;
    for (const path of candidates) {
      const res = await fetch(
        `${base}${path.startsWith("/") ? path : `/${path}`}`,
        {
          cache: "no-store",
        }
      );
      lastRes = res;
      if (res.status !== 404 && res.status !== 405) {
        const contentType = res.headers.get("content-type") || "";
        let data;
        try {
          if (contentType.includes("application/json")) {
            const text = await res.text();
            data = text ? JSON.parse(text) : null;
          } else {
            data = await res.text();
          }
        } catch (error) {
          console.error("JSON parse error:", error);
          data = null;
        }
        return new Response(
          typeof data === "string" ? data : JSON.stringify(data),
          {
            status: res.status,
            headers: { "Content-Type": contentType || "application/json" },
          }
        );
      }
    }
    return new Response(
      JSON.stringify({
        message: "Detail endpoint not found",
        tried: candidates,
      }),
      {
        status: lastRes?.status ?? 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ message: "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request: NextRequest, ctx: any) {
  const id = ctx?.params?.id as string;
  console.log("PUT request for product ID:", id);

  try {
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const base = envConfig.NEXT_PUBLIC_API_END_POINT;
    const template = process.env.API_PRODUCTS_UPDATE_URL_TEMPLATE; // e.g., /products/{id}
    const candidates: string[] = [];
    if (template) {
      candidates.push(template.replace("{id}", id));
    }
    candidates.push(`/products/${id}`);
    candidates.push(`/products/updateProduct/${id}`);

    console.log("Trying endpoints:", candidates);
    console.log("Base URL:", base);

    let lastRes: Response | null = null;
    for (const path of candidates) {
      const fullUrl = `${base}${path.startsWith("/") ? path : `/${path}`}`;
      console.log("Trying endpoint:", fullUrl);

      const res = await proxyJson(fullUrl, request, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        requireAuth: true,
      });

      console.log("Response status:", res.status);
      console.log(
        "Response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (res.status !== 404 && res.status !== 405) {
        console.log("Success with endpoint:", fullUrl);
        return res;
      }
      lastRes = res as any;
      console.log("Failed with endpoint:", fullUrl, "Status:", res.status);
    }

    console.log("All endpoints failed");
    return new Response(
      JSON.stringify({
        message: "Update endpoint not found",
        tried: candidates,
      }),
      {
        status: lastRes?.status ?? 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Error in PUT request:", e);
    return new Response(JSON.stringify({ message: "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request: NextRequest, ctx: any) {
  const id = ctx?.params?.id as string;
  try {
    const base = envConfig.NEXT_PUBLIC_API_END_POINT;
    const template = process.env.API_PRODUCTS_DELETE_URL_TEMPLATE; // e.g., /products/{id}
    const candidates: string[] = [];
    if (template) {
      candidates.push(template.replace("{id}", id));
    }
    candidates.push(`/products/${id}`);
    candidates.push(`/products/deleteProduct/${id}`);

    let lastRes: Response | null = null;
    for (const path of candidates) {
      const res = await proxyJson(
        `${base}${path.startsWith("/") ? path : `/${path}`}`,
        request,
        { method: "DELETE", requireAuth: true }
      );
      if (res.status !== 404 && res.status !== 405) return res;
      lastRes = res as any;
    }
    return new Response(
      JSON.stringify({
        message: "Delete endpoint not found",
        tried: candidates,
      }),
      {
        status: lastRes?.status ?? 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ message: "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
