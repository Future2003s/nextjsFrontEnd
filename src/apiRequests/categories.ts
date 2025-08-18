import { http } from "@/lib/http";

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

export const categoriesApiRequest = {
  // Get all categories
  getAll: (): Promise<CategoriesResponse> => {
    return http.get("/categories");
  },

  // Get category by ID
  getById: (id: string): Promise<CategoryResponse> => {
    return http.get(`/categories/${id}`);
  },

  // Get category by slug
  getBySlug: (slug: string): Promise<CategoryResponse> => {
    return http.get(`/categories/slug/${slug}`);
  },

  // Get category tree (hierarchical)
  getTree: (): Promise<{ success: boolean; data: CategoryTree[] }> => {
    return http.get("/categories/tree");
  },

  // Get main categories (no parent)
  getMainCategories: (): Promise<CategoriesResponse> => {
    return http.get("/categories/main");
  },

  // Get subcategories by parent ID
  getSubcategories: (parentId: string): Promise<CategoriesResponse> => {
    return http.get(`/categories/${parentId}/children`);
  },

  // Get active categories
  getActive: (): Promise<CategoriesResponse> => {
    return http.get("/categories?isActive=true");
  },

  // Get categories with product count
  getWithProductCount: (): Promise<CategoriesResponse> => {
    return http.get("/categories?includeProductCount=true");
  },
};
