import { http } from "@/lib/http";
import { API_CONFIG } from "@/lib/api-config";

export interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  brand?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendProductResponse {
  success: boolean;
  message: string;
  data: BackendProduct[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "price" | "rating" | "createdAt" | "name";
  sortOrder?: "asc" | "desc";
}

// Product API requests to Node.js backend
export const productsApiRequest = {
  // Get all products with optional filtering
  getAll: (filters?: ProductFilters): Promise<BackendProductResponse> => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_CONFIG.PRODUCTS.ALL}?${queryString}`
      : API_CONFIG.PRODUCTS.ALL;
    return http.get(url);
  },

  // Get product by ID
  getById: (
    id: string
  ): Promise<{ success: boolean; data: BackendProduct }> => {
    return http.get(API_CONFIG.PRODUCTS.BY_ID.replace(":id", id));
  },

  // Get products by category
  getByCategory: (
    categoryId: string,
    filters?: ProductFilters
  ): Promise<BackendProductResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("category", categoryId);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const url = `${API_CONFIG.PRODUCTS.BY_CATEGORY}?${queryString}`;
    return http.get(url);
  },

  // Search products
  search: (
    query: string,
    filters?: ProductFilters
  ): Promise<BackendProductResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("search", query);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const url = `${API_CONFIG.PRODUCTS.SEARCH}?${queryString}`;
    return http.get(url);
  },

  // Get featured products
  getFeatured: (): Promise<BackendProductResponse> => {
    return http.get(API_CONFIG.PRODUCTS.FEATURED);
  },

  // Get new arrivals
  getNewArrivals: (): Promise<BackendProductResponse> => {
    return http.get(API_CONFIG.PRODUCTS.NEW_ARRIVALS);
  },

  // Get products on sale
  getOnSale: (): Promise<BackendProductResponse> => {
    return http.get(API_CONFIG.PRODUCTS.ON_SALE);
  },
};
