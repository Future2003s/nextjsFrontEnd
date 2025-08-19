import { http } from "@/lib/http";

export const metaApi = {
  categories: () => http.get("/api/categories"),
  categoryTree: () => http.get("/api/categories/tree"),
  brands: () => http.get("/api/brands"),
  popularBrands: () => http.get("/api/brands/popular"),
  createCategory: (data: any, token: string) =>
    http.post("/api/categories", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  createBrand: (data: any, token: string) =>
    http.post("/api/brands", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
