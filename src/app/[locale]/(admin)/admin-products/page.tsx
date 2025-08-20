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
        // Map backend response back to UI shape
        const mapped = {
          id: backend.id || backend._id || editing.id,
          name: backend.name || editing.name,
          category: backend.category?.name || editing.category,
          price: backend.price ?? editing.price,
          stock: backend.quantity ?? backend.stock ?? editing.stock,
          status:
            backend.status === "active"
              ? "ACTIVE"
              : backend.status === "archived"
              ? "INACTIVE"
              : backend.status === "draft"
              ? "DRAFT"
              : editing.status,
          sku: backend.sku ?? editing.sku,
          brand: backend.brand?.name || editing.brand,
          image:
            backend.thumbnail ||
            backend.imageUrl ||
            (backend.images && backend.images.length > 0
              ? typeof backend.images[0] === "string"
                ? backend.images[0]
                : backend.images[0]?.url
              : editing.image),
          description: backend.description ?? editing.description,
          categoryId:
            backend.category?._id || backend.category?.id || editing.categoryId,
          brandId: backend.brand?._id || backend.brand?.id || editing.brandId,
          images: Array.isArray(backend.images)
            ? backend.images.map((img: any) =>
                typeof img === "string" ? img : img.url
              )
            : editing.images || [],
          createdAt: backend.createdAt ?? editing.createdAt,
          updatedAt: backend.updatedAt ?? new Date().toISOString(),
        };

        console.log("Mapped product data:", mapped);
        console.log("=== END UPDATE DEBUG ===");

        toast.success("Đã cập nhật sản phẩm thành công");
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
        setProducts((prev) => [newProduct, ...prev]);
        setCreating(false);
        toast.success("Đã tạo sản phẩm thành công");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }
    } catch (error) {
      toast.error("Không thể tạo sản phẩm");
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

        const list = Array.isArray(data?.data) ? data.data : [];
        setProducts(
          list.map((p: any) => ({
            id: p.id || p._id,
            name: p.name || p.productName || "",
            category: p.categoryName || p.category?.name || "",
            price: p.price || p.basePrice || 0,
            stock: p.stock || p.quantity || p.inventoryQuantity || 0, // Handle both stock and quantity
            status:
              p.status === "active"
                ? "ACTIVE"
                : p.status === "archived"
                ? "INACTIVE"
                : p.status === "draft"
                ? "DRAFT"
                : p.status || "ACTIVE", // Map backend status to frontend
            sku: p.sku || p.code || "",
            brand: p.brandName || p.brand?.name || "",
            image:
              p.thumbnail ||
              p.imageUrl ||
              (p.images && p.images.length > 0 ? p.images[0] : ""),
            description: p.description || "",
            categoryId:
              p.categoryId ||
              p.category?._id ||
              p.category?.id ||
              p.category ||
              "", // Handle both categoryId and category
            brandId: p.brandId || p.brand?._id || p.brand?.id || p.brand || "", // Handle both brandId and brand
            images: p.images || [],
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
        } else if (res.status === 404) {
          errorMessage = "API endpoint không tồn tại";
        } else if (res.status === 500) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau";
        } else {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }

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
      // Temporarily use test API to get sample data
      const res = await fetch("/api/categories/test-crud", {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        // Mock categories data for testing
        const mockCategories = [
          { id: "cat_test_1", name: "Electronics" },
          { id: "cat_test_2", name: "Clothing" },
          { id: "cat_test_3", name: "Books" },
          { id: "cat_test_4", name: "Home & Garden" },
        ];
        setCategories(mockCategories);
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      // Temporarily use test API to get sample data
      const res = await fetch("/api/brands/test-crud", {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        // Mock brands data for testing
        const mockBrands = [
          { id: "brand_test_1", name: "Apple" },
          { id: "brand_test_2", name: "Samsung" },
          { id: "brand_test_3", name: "Nike" },
          { id: "brand_test_4", name: "Adidas" },
        ];
        setBrands(mockBrands);
      } else {
        console.error("Failed to fetch brands");
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
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
                        {product.brand}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
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
