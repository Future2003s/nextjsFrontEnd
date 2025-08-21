"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import ProductModal from "./components/ProductModal";
import ProductViewModal from "./components/ProductViewModal";
import { DebugInfo } from "./components/DebugInfo";
import { BackendTest } from "./components/BackendTest";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const productsPerPage = 12;
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Modal states
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handler functions
  const handleView = async (productId: string) => {
    try {
      // Tìm sản phẩm trong danh sách hiện tại thay vì gọi API
      const product = products.find((p) => p.id === productId);
      if (product) {
        setViewing(product);
        toast.success("Đã tải chi tiết sản phẩm");
      } else {
        // Nếu không tìm thấy trong danh sách, gọi API
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setViewing(data.data || data);
          toast.success("Đã tải chi tiết sản phẩm");
        } else {
          throw new Error("Failed to fetch product");
        }
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết sản phẩm");
      console.error("Error viewing product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (productId: string) => {
    try {
      // Tìm sản phẩm trong danh sách hiện tại thay vì gọi API
      const product = products.find((p) => p.id === productId);
      if (product) {
        setEditing(product);
        toast.success("Đã tải thông tin sản phẩm để chỉnh sửa");
      } else {
        // Nếu không tìm thấy trong danh sách, gọi API
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setEditing(data.data || data);
          toast.success("Đã tải thông tin sản phẩm để chỉnh sửa");
        } else {
          throw new Error("Failed to fetch product");
        }
      }
    } catch (error) {
      toast.error("Không thể tải thông tin sản phẩm");
      console.error("Error loading product for edit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      setDeletingId(productId);
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Đã xóa sản phẩm thành công");
        // Cập nhật state local thay vì gọi lại API
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        // Đóng modal nếu đang xem sản phẩm bị xóa
        if (viewing?.id === productId) {
          setViewing(null);
        }
        if (editing?.id === productId) {
          setEditing(null);
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error(
            "Bạn không có quyền xóa sản phẩm. Cần tài khoản Admin hoặc Seller."
          );
        } else if (response.status === 400) {
          const t = await response.text().catch(() => "");
          toast.error("Xóa thất bại: Dữ liệu không hợp lệ");
          console.error("Validation error:", t);
        } else {
          const errorText = await response.text().catch(() => "");
          console.error(
            "Failed to delete product, status:",
            response.status,
            errorText
          );
          toast.error("Không thể xóa sản phẩm");
        }
        return;
      }
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
      console.error("Error deleting product:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEdit = async (updatedProduct: any) => {
    try {
      setSaving(true);
      console.log("=== UPDATE PRODUCT DEBUG ===");
      console.log("Product ID being updated:", editing.id);
      console.log("Current product state:", editing);
      console.log("Update payload being sent:", updatedProduct);

      const response = await fetch(`/api/products/${editing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("Success response data:", responseData);

        const backend = responseData?.data || responseData;

        // Map backend response back to UI shape with better error handling
        const mapped = {
          id: backend.id || backend._id || editing.id,
          name: backend.name || editing.name,
          description: backend.description || editing.description,
          price: backend.price ?? editing.price,
          stock: backend.quantity ?? backend.stock ?? editing.stock,
          sku: backend.sku ?? editing.sku,
          status: (() => {
            const backendStatus = backend.status?.toLowerCase();
            if (backendStatus === "active") return "ACTIVE";
            if (backendStatus === "archived") return "INACTIVE";
            if (backendStatus === "draft") return "DRAFT";
            return editing.status || "DRAFT";
          })(),
          brand: (() => {
            if (backend.brand) {
              if (typeof backend.brand === "string") return backend.brand;
              return backend.brand.name || editing.brand;
            }
            return editing.brand;
          })(),
          category: (() => {
            if (backend.category) {
              if (typeof backend.category === "string") return backend.category;
              return backend.category.name || editing.category;
            }
            return editing.category;
          })(),
          image: (() => {
            if (backend.thumbnail) return backend.thumbnail;
            if (backend.imageUrl) return backend.imageUrl;
            if (backend.images && backend.images.length > 0) {
              const firstImg = backend.images[0];
              return typeof firstImg === "string" ? firstImg : firstImg.url;
            }
            return editing.image;
          })(),
          categoryId: (() => {
            if (backend.category) {
              if (typeof backend.category === "string") return backend.category;
              return backend.category._id || backend.category.id;
            }
            return editing.categoryId;
          })(),
          brandId: (() => {
            if (backend.brand) {
              if (typeof backend.brand === "string") return backend.brand;
              return backend.brand._id || backend.brand.id;
            }
            return editing.brandId;
          })(),
          images: (() => {
            if (Array.isArray(backend.images)) {
              return backend.images.map((img: any) =>
                typeof img === "string" ? img : img.url
              );
            }
            return editing.images || [];
          })(),
          createdAt: backend.createdAt ?? editing.createdAt,
          updatedAt: backend.updatedAt ?? new Date().toISOString(),
        };

        console.log("Mapped product data:", mapped);
        console.log("=== END UPDATE DEBUG ===");

        toast.success("Đã cập nhật sản phẩm thành công");

        // Update products state with the mapped data
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...mapped } : p))
        );

        setEditing(null);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error(
            "Bạn không có quyền cập nhật sản phẩm. Cần tài khoản Admin hoặc Seller."
          );
          return;
        }
        if (response.status === 400) {
          const t = await response.text().catch(() => "");
          toast.error("Cập nhật thất bại: Dữ liệu không hợp lệ");
          console.error("Validation error:", t);
          return;
        }
        // Try to parse JSON; fall back to text
        let errorPayload: any = null;
        try {
          errorPayload = await response.json();
        } catch (e) {
          const text = await response.text().catch(() => "");
          errorPayload = { message: text };
        }
        console.error("Error response:", errorPayload);
        throw new Error(
          `Failed to update product: ${
            errorPayload?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      toast.error("Không thể cập nhật sản phẩm");
      console.error("Error updating product:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (productData: any) => {
    try {
      setSaving(true);
      console.log("=== CREATE PRODUCT DEBUG ===");
      console.log("Create payload:", productData);

      const response = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Create product response:", result);

        const newProduct = result.data || result;

        // Map backend response to UI format
        const mappedNewProduct = {
          id: newProduct.id || newProduct._id,
          name: newProduct.name || "",
          category: (() => {
            if (newProduct.categoryName) return newProduct.categoryName;
            if (newProduct.category) {
              if (typeof newProduct.category === "string")
                return newProduct.category;
              return newProduct.category.name || "";
            }
            return "";
          })(),
          price: newProduct.price || 0,
          stock: newProduct.stock || newProduct.quantity || 0,
          status: (() => {
            const backendStatus = newProduct.status?.toLowerCase();
            if (backendStatus === "active") return "ACTIVE";
            if (backendStatus === "archived") return "INACTIVE";
            if (backendStatus === "draft") return "DRAFT";
            return newProduct.status || "DRAFT";
          })(),
          sku: newProduct.sku || "",
          brand: (() => {
            if (newProduct.brandName) return newProduct.brandName;
            if (newProduct.brand) {
              if (typeof newProduct.brand === "string") return newProduct.brand;
              return newProduct.brand.name || "";
            }
            return "";
          })(),
          image: (() => {
            if (newProduct.thumbnail) return newProduct.thumbnail;
            if (newProduct.imageUrl) return newProduct.imageUrl;
            if (newProduct.images && newProduct.images.length > 0) {
              const firstImg = newProduct.images[0];
              return typeof firstImg === "string"
                ? firstImg
                : firstImg.url || "";
            }
            return "";
          })(),
          description: newProduct.description || "",
          categoryId: (() => {
            if (newProduct.categoryId) return newProduct.categoryId;
            if (newProduct.category) {
              if (typeof newProduct.category === "string")
                return newProduct.category;
              return newProduct.category._id || newProduct.category.id || "";
            }
            return "";
          })(),
          brandId: (() => {
            if (newProduct.brandId) return newProduct.brandId;
            if (newProduct.brand) {
              if (typeof newProduct.brand === "string") return newProduct.brand;
              return newProduct.brand._id || newProduct.brand.id || "";
            }
            return "";
          })(),
          images: (() => {
            if (Array.isArray(newProduct.images)) {
              return newProduct.images
                .map((img: any) =>
                  typeof img === "string" ? img : img.url || ""
                )
                .filter(Boolean);
            }
            return [];
          })(),
          createdAt: newProduct.createdAt || new Date().toISOString(),
          updatedAt: newProduct.updatedAt || new Date().toISOString(),
        };

        console.log("Mapped new product:", mappedNewProduct);
        console.log("=== END CREATE DEBUG ===");

        setProducts((prev) => [mappedNewProduct, ...prev]);
        setCreating(false);
        toast.success("Đã tạo sản phẩm thành công");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Create product error:", errorData);

        let errorMessage = "Không thể tạo sản phẩm";
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể tạo sản phẩm";
      toast.error(errorMessage);
      console.error("Error creating product:", error);
    } finally {
      setSaving(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (categoryFilter !== "all") params.set("categoryId", categoryFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(currentPage - 1));
      params.set("size", String(productsPerPage));

      console.log("Fetching products with params:", params.toString());

      const res = await fetch(`/api/products/admin?${params.toString()}`, {
        cache: "no-store",
      });

      console.log("Products response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("Products response data:", data);

        // Ensure we have a valid array to work with
        let list: any[] = [];
        if (data?.data && Array.isArray(data.data)) {
          list = data.data;
        } else if (Array.isArray(data)) {
          list = data;
        } else if (data?.data && !Array.isArray(data.data)) {
          console.warn("Products data is not an array:", data.data);
          list = [];
        } else {
          console.warn("No valid products data found:", data);
          list = [];
        }

        console.log("Products list to process:", list);

        setProducts(
          list.map((p: any) => ({
            id: p.id || p._id,
            name: p.name || p.productName || "",
            category: (() => {
              if (p.categoryName) return p.categoryName;
              if (p.category) {
                if (typeof p.category === "string") return p.category;
                return p.category.name || "";
              }
              return "";
            })(),
            price: p.price || p.basePrice || 0,
            stock: p.stock || p.quantity || p.inventoryQuantity || 0,
            status: (() => {
              const backendStatus = p.status?.toLowerCase();
              if (backendStatus === "active") return "ACTIVE";
              if (backendStatus === "archived") return "INACTIVE";
              if (backendStatus === "draft") return "DRAFT";
              return p.status || "ACTIVE";
            })(),
            sku: p.sku || p.code || "",
            brand: (() => {
              if (p.brandName) return p.brandName;
              if (p.brand) {
                if (typeof p.brand === "string") return p.brand;
                return p.brand.name || "";
              }
              return "";
            })(),
            image: (() => {
              if (p.thumbnail) return p.thumbnail;
              if (p.imageUrl) return p.imageUrl;
              if (p.images && p.images.length > 0) {
                const firstImg = p.images[0];
                return typeof firstImg === "string"
                  ? firstImg
                  : firstImg.url || "";
              }
              return "";
            })(),
            description: p.description || "",
            categoryId: (() => {
              if (p.categoryId) return p.categoryId;
              if (p.category) {
                if (typeof p.category === "string") return p.category;
                return p.category._id || p.category.id || "";
              }
              return "";
            })(),
            brandId: (() => {
              if (p.brandId) return p.brandId;
              if (p.brand) {
                if (typeof p.brand === "string") return p.brand;
                return p.brand._id || p.brand.id || "";
              }
              return "";
            })(),
            images: (() => {
              if (Array.isArray(p.images)) {
                return p.images
                  .map((img: any) =>
                    typeof img === "string" ? img : img.url || ""
                  )
                  .filter(Boolean);
              }
              return [];
            })(),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }))
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to fetch products:", errorData);

        // Handle different types of errors
        let errorMessage = "Không thể tải danh sách sản phẩm";

        if (errorData.error) {
          if (errorData.error.includes("Validation failed")) {
            errorMessage = "Lỗi validation dữ liệu từ backend";
          } else if (errorData.error.includes("Unauthorized")) {
            errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại";
          } else if (errorData.error.includes("Not Found")) {
            errorMessage = "API endpoint không tồn tại";
          } else {
            errorMessage = errorData.error;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (res.status === 401) {
          errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại";
        } else if (res.status === 403) {
          errorMessage = "Bạn không có quyền truy cập trang này";
        } else if (res.status === 404) {
          errorMessage = "API endpoint không tồn tại";
        } else if (res.status === 500) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau";
        } else {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }

        console.error("Error message:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching products:", error);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  // Fetch categories and brands when component mounts
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/api/categories", {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Categories API response:", data);

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        } else if (data.success && Array.isArray(data.data)) {
          // Empty array is valid
          setCategories([]);
        } else if (Array.isArray(data)) {
          // Direct array response
          setCategories(data);
        } else {
          console.error("Invalid categories data format:", data);
          // Fallback to sample data
          setCategories([
            { id: "cat_sample_1", name: "Điện tử", _id: "cat_sample_1" },
            { id: "cat_sample_2", name: "Quần áo", _id: "cat_sample_2" },
            { id: "cat_sample_3", name: "Sách", _id: "cat_sample_3" },
            { id: "cat_sample_4", name: "Nhà cửa", _id: "cat_sample_4" },
          ]);
        }
      } else {
        console.error("Failed to fetch categories, status:", res.status);
        // Fallback to sample data
        setCategories([
          { id: "cat_sample_1", name: "Điện tử", _id: "cat_sample_1" },
          { id: "cat_sample_2", name: "Quần áo", _id: "cat_sample_2" },
          { id: "cat_sample_3", name: "Sách", _id: "cat_sample_3" },
          { id: "cat_sample_4", name: "Nhà cửa", _id: "cat_sample_4" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to sample data
      setCategories([
        { id: "cat_sample_1", name: "Điện tử", _id: "cat_sample_1" },
        { id: "cat_sample_2", name: "Quần áo", _id: "cat_sample_2" },
        { id: "cat_sample_3", name: "Sách", _id: "cat_sample_3" },
        { id: "cat_sample_4", name: "Nhà cửa", _id: "cat_sample_4" },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const res = await fetch("/api/brands", {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Brands API response:", data);

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setBrands(data.data);
        } else if (data.success && Array.isArray(data.data)) {
          // Empty array is valid
          setBrands([]);
        } else if (Array.isArray(data)) {
          // Direct array response
          setBrands(data);
        } else {
          console.error("Invalid brands data format:", data);
          // Fallback to sample data
          setBrands([
            { id: "brand_sample_1", name: "Apple", _id: "brand_sample_1" },
            { id: "brand_sample_2", name: "Samsung", _id: "brand_sample_2" },
            { id: "brand_sample_3", name: "Nike", _id: "brand_sample_3" },
            { id: "brand_sample_4", name: "Adidas", _id: "brand_sample_4" },
          ]);
        }
      } else {
        console.error("Failed to fetch brands, status:", res.status);
        // Fallback to sample data
        setBrands([
          { id: "brand_sample_1", name: "Apple", _id: "brand_sample_1" },
          { id: "brand_sample_2", name: "Samsung", _id: "brand_sample_2" },
          { id: "brand_sample_3", name: "Nike", _id: "brand_sample_3" },
          { id: "brand_sample_4", name: "Adidas", _id: "brand_sample_4" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      // Fallback to sample data
      setBrands([
        { id: "brand_sample_1", name: "Apple", _id: "brand_sample_1" },
        { id: "brand_sample_2", name: "Samsung", _id: "brand_sample_2" },
        { id: "brand_sample_3", name: "Nike", _id: "brand_sample_3" },
        { id: "brand_sample_4", name: "Adidas", _id: "brand_sample_4" },
      ]);
    } finally {
      setLoadingBrands(false);
    }
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catsRes, brandsRes, stsRes] = await Promise.all([
          fetch(`/api/categories`, { cache: "no-store" }),
          fetch(`/api/meta/brands`, { cache: "no-store" }),
          fetch(`/api/products/statuses`, { cache: "no-store" }),
        ]);

        let cats: any = [];
        if (catsRes.ok) {
          const t = await catsRes.text();
          const d = t ? JSON.parse(t) : null;
          const list = d?.data || d || [];
          cats = list.map((c: any) => ({ id: c.id, name: c.name }));
        }

        let brandsList: any = [];
        if (brandsRes.ok) {
          const t = await brandsRes.text();
          const d = t ? JSON.parse(t) : null;
          const list = d?.data || d || [];
          brandsList = list.map((b: any) => ({ id: b.id, name: b.name }));
        }

        let sts: any = [];
        if (stsRes.ok) {
          const t = await stsRes.text();
          const d = t ? JSON.parse(t) : null;
          sts = d?.data || d || [];
        }

        setCategories(cats);
        setBrands(brandsList);
        setStatuses(sts);
      } catch (error) {
        console.error("Error loading filters:", error);
        setCategories([]);
        setBrands([]);
        setStatuses(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]);
      }
    };
    loadFilters();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader
          isLoading={true}
          message="Đang tải danh sách sản phẩm..."
          size="lg"
          overlay={false}
        />
      </div>
    );
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      case "OUT_OF_STOCK":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "OUT_OF_STOCK":
        return "bg-yellow-100 text-yellow-800";
      case "DISCONTINUED":
        return "bg-gray-100 text-gray-800";
      case "DRAFT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return "destructive";
    if (stock < 10) return "secondary";
    return "default";
  };

  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock < 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh mục sản phẩm và kho hàng
          </p>
        </div>
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
          onClick={() => setCreating(true)}
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Backend Test Component */}
      <BackendTest />

      {/* Error Display */}
      {error && (
        <DebugInfo
          error={error}
          onRetry={() => {
            setError(null);
            fetchProducts();
          }}
          onReset={() => {
            setError(null);
            setCurrentPage(1);
            setSearchTerm("");
            setCategoryFilter("all");
            setStatusFilter("all");
            fetchProducts();
          }}
        />
      )}

      {/* Filters and Search */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên sản phẩm, SKU, thương hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "ACTIVE"
                        ? "Hoạt động"
                        : status === "INACTIVE"
                        ? "Ngừng kinh doanh"
                        : status === "OUT_OF_STOCK"
                        ? "Hết hàng"
                        : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Package className="h-5 w-5 text-blue-600" />
            Danh sách sản phẩm ({filteredProducts.length})
            {loading && (
              <div className="ml-2">
                <Loader isLoading={true} size="sm" />
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            // Loading skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: productsPerPage }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 bg-white">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded animate-pulse flex-1"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {product.brand || (
                          <span className="text-gray-400 italic">
                            Không có thương hiệu
                          </span>
                        )}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {product.category || (
                          <span className="text-gray-400 italic">
                            Không có danh mục
                          </span>
                        )}
                      </Badge>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </div>

                    {/* Stock and Status */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={getStockBadgeVariant(product.stock) as any}
                        className={`text-xs ${getStockBadgeColor(
                          product.stock
                        )}`}
                      >
                        {product.stock === 0
                          ? "Hết hàng"
                          : `${product.stock} cái`}
                      </Badge>
                      <Badge
                        variant={getStatusBadgeVariant(product.status) as any}
                        className={`text-xs ${getStatusBadgeColor(
                          product.status
                        )}`}
                      >
                        {product.status === "ACTIVE"
                          ? "Hoạt động"
                          : product.status === "INACTIVE"
                          ? "Ngừng kinh doanh"
                          : product.status === "OUT_OF_STOCK"
                          ? "Hết hàng"
                          : product.status}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
                        onClick={() => handleView(product.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all"
                        onClick={() => handleEdit(product.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? (
                          <Loader isLoading={true} size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {error
                ? "Không thể tải danh sách sản phẩm"
                : "Không tìm thấy sản phẩm nào"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * productsPerPage + 1} đến{" "}
            {Math.min(currentPage * productsPerPage, filteredProducts.length)}{" "}
            trong tổng số {filteredProducts.length} sản phẩm
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                currentPage * productsPerPage >= filteredProducts.length
              }
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {creating && (
        <ProductModal
          isOpen={creating}
          onClose={() => setCreating(false)}
          mode="create"
          onSave={handleCreate}
          categories={categories}
          brands={brands}
        />
      )}

      {editing && (
        <ProductModal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          product={editing}
          mode="edit"
          onSave={handleSaveEdit}
          categories={categories}
          brands={brands}
        />
      )}

      {viewing && (
        <ProductViewModal
          isOpen={!!viewing}
          onClose={() => setViewing(null)}
          product={viewing}
          onEdit={() => {
            setViewing(null);
            handleEdit(viewing.id);
          }}
          onDelete={() => {
            setViewing(null);
            handleDelete(viewing.id);
          }}
        />
      )}
    </div>
  );
}
