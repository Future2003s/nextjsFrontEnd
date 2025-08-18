// API Configuration for Backend Integration
export const API_CONFIG = {
  // Base URLs
  BACKEND_BASE_URL:
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081",
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v1",

  // Full API base URL
  get API_BASE_URL() {
    return `${this.BACKEND_BASE_URL}/api/${this.API_VERSION}`;
  },

  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // User endpoints
  USERS: {
    PROFILE: "/users/profile",
    ADDRESSES: "/users/addresses",
    PREFERENCES: "/users/preferences",
    AVATAR: "/users/avatar",
  },

  // Product endpoints
  PRODUCTS: {
    ALL: "/products",
    BY_ID: "/products/:id",
    BY_CATEGORY: "/products",
    SEARCH: "/products",
    FEATURED: "/products/featured",
    NEW_ARRIVALS: "/products/new-arrivals",
    ON_SALE: "/products/on-sale",
  },

  // Cart endpoints
  CART: {
    GET: "/cart",
    ADD_ITEM: "/cart/items",
    UPDATE_ITEM: "/cart/items/:productId",
    REMOVE_ITEM: "/cart/items/:productId",
    CLEAR: "/cart/clear",
    COUNT: "/cart/count",
    SUMMARY: "/cart/summary",
    VALIDATE: "/cart/validate",
  },

  // Order endpoints
  ORDERS: {
    CREATE: "/orders",
    USER_ORDERS: "/orders",
    BY_ID: "/orders/:id",
    CANCEL: "/orders/:id/cancel",
    TRACKING: "/orders/:id/tracking",
    ALL: "/orders", // Admin only
    UPDATE_STATUS: "/orders/:id/status", // Admin only
  },

  // Category endpoints
  CATEGORIES: {
    ALL: "/categories",
    BY_ID: "/categories/:id",
    BY_SLUG: "/categories/slug/:slug",
    TREE: "/categories/tree",
    MAIN: "/categories/main",
    SUB: "/categories/sub",
    ACTIVE: "/categories/active",
    WITH_PRODUCT_COUNT: "/categories/with-product-count",
  },

  // Review endpoints
  REVIEWS: {
    PRODUCT_REVIEWS: "/reviews/product/:productId",
    USER_REVIEWS: "/reviews/user",
    CREATE: "/reviews",
    UPDATE: "/reviews/:id",
    DELETE: "/reviews/:id",
    MARK_HELPFUL: "/reviews/:id/helpful",
    STATS: "/reviews/product/:productId/stats",
    ALL: "/reviews", // Admin only
    VERIFY: "/reviews/:id/verify", // Admin only
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
    CATEGORIES: "/admin/categories",
    ANALYTICS: "/admin/analytics",
    SETTINGS: "/admin/settings",
  },
};

// Helper function to build full API URLs
export function buildApiUrl(
  endpoint: string,
  params?: Record<string, string>
): string {
  let url = `${API_CONFIG.API_BASE_URL}${endpoint}`;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }

  return url;
}

// Helper function to get auth headers
export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
