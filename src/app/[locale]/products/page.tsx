"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { productsApiRequest, BackendProduct } from "@/apiRequests/products";
import { metaApi } from "@/apiRequests/meta";
import Link from "next/link";
import { Search, Filter, Grid3X3, List, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

type ViewMode = "grid" | "list";
type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

export default function ShopPage() {
  const [items, setItems] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load meta data
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          metaApi.categories(),
          metaApi.brands(),
        ]);

        const normalizeArray = (res: any) => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.data?.items)) return res.data.items;
          return [];
        };

        setCategories(normalizeArray(categoriesRes));
        setBrands(normalizeArray(brandsRes));
      } catch (error) {
        console.error("Failed to load meta data:", error);
        setCategories([]);
        setBrands([]);
      }
    };
    loadMeta();
  }, []);

  // Load products
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (q) params.search = q;
        if (selectedCategory && selectedCategory !== "all")
          params.category = selectedCategory;
        if (selectedBrand && selectedBrand !== "all")
          params.brand = selectedBrand;

        const res = await productsApiRequest.getAll(params);
        setItems(res?.data ?? []);
      } catch (error) {
        console.error("Failed to load products:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, selectedCategory, selectedBrand]);

  // Sort products
  const sortedItems = useMemo(() => {
    const sorted = [...items];
    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "price-asc":
        return sorted.sort((a, b) => Number(a.price) - Number(b.price));
      case "price-desc":
        return sorted.sort((a, b) => Number(b.price) - Number(a.price));
      case "newest":
      default:
        return sorted;
    }
  }, [items, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery ||
    (selectedCategory && selectedCategory !== "all") ||
    (selectedBrand && selectedBrand !== "all") ||
    sortBy !== "newest";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 mt-25">
      {/* Hero Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Khám Phá Sản Phẩm
            </h1>
            <p className="text-muted-foreground text-lg">
              Tìm kiếm và khám phá những sản phẩm tuyệt vời nhất
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10 h-12 text-base shadow-lg border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            <Card className="shadow-md border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Bộ lọc
                  </h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Danh mục
                    </label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Thương hiệu
                    </label>
                    <Select
                      value={selectedBrand}
                      onValueChange={setSelectedBrand}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sắp xếp
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value: SortOption) => setSortBy(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mới nhất</SelectItem>
                        <SelectItem value="name-asc">Tên A-Z</SelectItem>
                        <SelectItem value="name-desc">Tên Z-A</SelectItem>
                        <SelectItem value="price-asc">
                          Giá thấp đến cao
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Giá cao đến thấp
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Hiển thị {sortedItems.length} sản phẩm</span>
                {hasActiveFilters && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <Badge variant="secondary" className="text-xs">
                      Đã lọc
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid/List */}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-4 w-4"></div>
                  <span>Đang tải sản phẩm...</span>
                </div>
              </div>
            ) : sortedItems.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {sortedItems.map((product) => (
                  <Link key={product._id} href={`/products/${product._id}`}>
                    <Card className="group overflow-hidden transition-all duration-300 border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
                      <div
                        className={`${
                          viewMode === "grid" ? "aspect-square" : "h-48"
                        } bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            product.images?.[0] ||
                            "https://placehold.co/600x600"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                        {/* Stock Status Badge */}
                        {product.stock !== undefined && (
                          <Badge
                            variant={
                              product.stock > 0 ? "default" : "destructive"
                            }
                            className="absolute top-3 right-3"
                          >
                            {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        {(product.brandName || product.categoryName) && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {product.brandName || product.categoryName}
                          </Badge>
                        )}

                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(Number(product.price))}
                          </span>

                          {product.stock !== undefined && (
                            <span className="text-sm text-muted-foreground">
                              SL: {product.stock}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="text-center p-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Xóa bộ lọc
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
