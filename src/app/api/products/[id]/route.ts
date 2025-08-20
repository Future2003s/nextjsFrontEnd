import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { envConfig } from "@/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Getting product ${id}`);

    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;
    const authHeader = request.headers.get("authorization");

    const backendUrl = `${envConfig.NEXT_PUBLIC_BACKEND_URL}/api/${envConfig.NEXT_PUBLIC_API_VERSION}/products/${id}`;

    console.log("Get product API called, backend URL:", backendUrl);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authentication headers
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (authHeader) {
      headers.Authorization = authHeader;
    }

    const res = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Get product API error - status:", res.status);
      const errorText = await res.text();
      console.error("Error response:", errorText);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to get product",
          error: errorText,
        }),
        {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await res.json();
    console.log("Get product API response:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Get product API error:", e);
    return new Response(
      JSON.stringify({
        success: false,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(`Updating product ${id} with data:`, body);

    // Try both ways to get cookies
    const cookieStore = await cookies();
    const tokenFromCookies = cookieStore.get("sessionToken")?.value;
    const tokenFromRequest = request.cookies.get("sessionToken")?.value;
    const authHeader = request.headers.get("authorization");

    console.log(
      "Auth debug - Token from cookies() function:",
      tokenFromCookies ? "Present" : "Missing"
    );
    console.log(
      "Auth debug - Token from request.cookies:",
      tokenFromRequest ? "Present" : "Missing"
    );
    console.log(
      "Auth debug - Auth header:",
      authHeader ? "Present" : "Missing"
    );

    // Use token from request.cookies first, then fallback to cookies() function
    const token = tokenFromRequest || tokenFromCookies;

    const backendUrl = `${envConfig.NEXT_PUBLIC_BACKEND_URL}/api/${envConfig.NEXT_PUBLIC_API_VERSION}/products/${id}`;

    console.log("Update product API called, backend URL:", backendUrl);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authentication headers
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Using token from cookies");
    } else if (authHeader) {
      headers.Authorization = authHeader;
      console.log("Using auth header");
    } else {
      console.log("No auth token found!");
    }

    console.log("Final headers being sent:", headers);

    const res = await fetch(backendUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("Update product API error - status:", res.status);
      const errorText = await res.text();
      console.error("Error response:", errorText);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to update product",
          error: errorText,
        }),
        {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await res.json();
    console.log("Update product API response:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Update product API error:", e);
    return new Response(
      JSON.stringify({
        success: false,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Deleting product ${id}`);

    // Try both ways to get cookies
    const cookieStore = await cookies();
    const tokenFromCookies = cookieStore.get("sessionToken")?.value;
    const tokenFromRequest = request.cookies.get("sessionToken")?.value;
    const authHeader = request.headers.get("authorization");

    console.log(
      "Auth debug - Token from cookies() function:",
      tokenFromCookies ? "Present" : "Missing"
    );
    console.log(
      "Auth debug - Token from request.cookies:",
      tokenFromRequest ? "Present" : "Missing"
    );
    console.log(
      "Auth debug - Auth header:",
      authHeader ? "Present" : "Missing"
    );

    // Use token from request.cookies first, then fallback to cookies() function
    const token = tokenFromRequest || tokenFromCookies;

    const backendUrl = `${envConfig.NEXT_PUBLIC_BACKEND_URL}/api/${envConfig.NEXT_PUBLIC_API_VERSION}/products/${id}`;

    console.log("Delete product API called, backend URL:", backendUrl);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authentication headers
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Using token from cookies");
    } else if (authHeader) {
      headers.Authorization = authHeader;
      console.log("Using auth header");
    } else {
      console.log("No auth token found!");
    }

    console.log("Final headers being sent:", headers);

    const res = await fetch(backendUrl, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      console.error("Delete product API error - status:", res.status);
      const errorText = await res.text();
      console.error("Error response:", errorText);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to delete product",
          error: errorText,
        }),
        {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await res.json();
    console.log("Delete product API response:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Delete product API error:", e);
    return new Response(
      JSON.stringify({
        success: false,
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
