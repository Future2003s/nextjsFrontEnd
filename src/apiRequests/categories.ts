import { http } from "@/lib/http";
import { API_CONFIG } from "@/lib/api-config";

export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

// Category API requests to Node.js backend
export const categoriesApiRequest = {
  // Get all categories
  getAll: (): Promise<CategoriesResponse> => {
    return http.get(API_CONFIG.CATEGORIES.ALL);
  },

  // Get category by ID
  getById: (id: string): Promise<CategoryResponse> => {
    return http.get(API_CONFIG.CATEGORIES.BY_ID.replace(":id", id));
  },

  // Get category by slug
  getBySlug: (slug: string): Promise<CategoryResponse> => {
    return http.get(API_CONFIG.CATEGORIES.BY_SLUG.replace(":slug", slug));
  },

  // Get category tree structure
  getTree: (): Promise<{ success: boolean; data: CategoryTree[] }> => {
    return http.get(API_CONFIG.CATEGORIES.TREE);
  },

  // Get main categories only
  getMainCategories: (): Promise<CategoriesResponse> => {
    return http.get(API_CONFIG.CATEGORIES.MAIN);
  },

  // Get subcategories of a parent category
  getSubcategories: (parentId: string): Promise<CategoriesResponse> => {
    return http.get(`${API_CONFIG.CATEGORIES.SUB}?parentId=${parentId}`);
  },

  // Get only active categories
  getActive: (): Promise<CategoriesResponse> => {
    return http.get(API_CONFIG.CATEGORIES.ACTIVE);
  },

  // Get categories with product count
  getWithProductCount: (): Promise<CategoriesResponse> => {
    return http.get(API_CONFIG.CATEGORIES.WITH_PRODUCT_COUNT);
  },
};
