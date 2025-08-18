import { QueryClient } from "@tanstack/react-query";
import { authApiRequest } from "@/apiRequests/auth";

export const meQueryKey = ["me"] as const;

export async function fetchMe() {
  try {
    // Lấy token từ localStorage hoặc context
    const token =
      localStorage.getItem("sessionToken") ||
      sessionStorage.getItem("sessionToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    // Gọi backend API
    const result = await authApiRequest.me(token);

    if (result.success) {
      return result;
    } else {
      throw new Error("Failed to fetch user data");
    }
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
