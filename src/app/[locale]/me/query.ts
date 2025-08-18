import { QueryClient } from "@tanstack/react-query";

export const meQueryKey = ["me"] as const;

export async function fetchMe() {
  try {
    // Gọi Next API để tận dụng cookie sessionToken thay vì localStorage
    const res = await fetch(`/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (res.status === 401) {
      throw new Error("No authentication token found");
    }

    const contentType = res.headers.get("content-type") || "application/json";
    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    // Chuẩn hoá format: ưu tiên data.success === true
    if (res.ok && (data?.success === true || data?.data)) {
      return data;
    }

    throw new Error(data?.message || "Failed to fetch user data");
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function prefetchMe(qc: QueryClient) {
  try {
    await qc.prefetchQuery({ queryKey: meQueryKey, queryFn: fetchMe });
  } catch (error) {
    console.error("Error prefetching user data:", error);
  }
}
