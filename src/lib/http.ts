import { envConfig } from "@/config";
import { get } from "http";

// handle error when Throw Data API
class HttpError extends Error {
  private readonly statusCode: number;
  private readonly payload: any;

  constructor({ statusCode, payload }: { statusCode: number; payload: any }) {
    super("Http Error !");
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

/**
 * fetch(URL,{
 *   headers: {
 *     "Content-Type":"application/json"
 *   },
 *   method:"POST",
 *   body:JSON.stringify(data)
 *  })
 */

interface CustomRequestsInit extends RequestInit {
  baseUrl?: string;
}

const request = async (
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options?: CustomRequestsInit | undefined
) => {
  const body: string | undefined = options?.body
    ? JSON.stringify(options.body)
    : undefined;

  const baseHeaders = {
    "Content-Type": "application/json",
  };

  // base url gọi api từ server
  // và base url là chuỗi rỗng từ next server
  // nếu base url = ''
  /**
   * options:CustomRequests {
   *     baseUrl:''
   *   }
   *
   */
  const baseUrl =
    options?.baseUrl === undefined
      ? envConfig.NEXT_PUBLIC_API_END_POINT ||
        `${envConfig.NEXT_PUBLIC_BACKEND_URL}/api/${envConfig.NEXT_PUBLIC_API_VERSION}`
      : options.baseUrl;

  const fullUrl = url.startsWith("/")
    ? `${baseUrl}${url}`
    : `${baseUrl}/${url}`;

  console.log("FULL URL: >>>>", fullUrl);

  const res = await fetch(fullUrl, {
    headers: {
      ...baseHeaders,
      ...options?.headers,
    },
    body,
    method,
  });

  let data;
  try {
    // Kiểm tra response có content không
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } else {
      data = null;
    }
  } catch (error) {
    console.error("JSON parse error:", error);
    data = null;
  }

  if (!res.ok) {
    return new HttpError({
      statusCode: res.status,
      payload: data,
    });
  }

  return data;
};

export const http = {
  get(url: string, options?: Omit<CustomRequestsInit, "body">) {
    return request("GET", url, options);
  },
  post<TypeRequestBody>(
    url: string,
    body: any,
    options?: Omit<CustomRequestsInit, "body">
  ) {
    return request("POST", url, { ...options, body });
  },
  put(url: string, body: any, options?: Omit<CustomRequestsInit, "body">) {
    return request("PUT", url, { ...options, body });
  },
  delete(url: string, options?: Omit<CustomRequestsInit, "body">) {
    return request("DELETE", url, options);
  },
};
