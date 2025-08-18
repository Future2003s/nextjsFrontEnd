import { http } from "@/lib/http";

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

export const productsApiRequest = {
  // Get all products with filters
  getAll: (filters?: ProductFilters): Promise<BackendProductResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : "/products";
    return http.get(url);
  },

  // Get product by ID
  getById: (
    id: string
  ): Promise<{ success: boolean; data: BackendProduct }> => {
    return http.get(`/products/${id}`);
  },

  // Get products by category
  getByCategory: (
    category: string,
    page = 1,
    limit = 20
  ): Promise<BackendProductResponse> => {
    return http.get(
      `/products?category=${category}&page=${page}&limit=${limit}`
    );
  },

  // Search products
  search: (
    query: string,
    page = 1,
    limit = 20
  ): Promise<BackendProductResponse> => {
    return http.get(
      `/products?search=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );
  },

  // Get featured products
  getFeatured: (limit = 10): Promise<BackendProductResponse> => {
    return http.get(`/products?featured=true&limit=${limit}`);
  },

  // Get new arrivals
  getNewArrivals: (limit = 10): Promise<BackendProductResponse> => {
    return http.get(`/products?sortBy=createdAt&sortOrder=desc&limit=${limit}`);
  },

  // Get products on sale
  getOnSale: (limit = 10): Promise<BackendProductResponse> => {
    return http.get(`/products?onSale=true&limit=${limit}`);
  },
};
