import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/next-api-auth";

export async function GET(request: NextRequest, ctx: any) {
  try {
    const orderId: string = ctx?.params?.orderId;
    return proxyJson(
      `${process.env.NEXT_PUBLIC_API_END_POINT}/orders/${orderId}/history`,
      request,
      { method: "GET", requireAuth: true }
    );
  } catch (e) {
    return new Response(JSON.stringify({ message: "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
