"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/ui/loader";
import { X, Save, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  mode: "create" | "edit";
  onSave: (productData: any) => Promise<void>;
  categories: any[];
  brands: any[];
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  mode,
  onSave,
  categories,
  brands,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    sku: "",
    categoryId: "",
    brandId: "",
    status: "draft",
    images: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const editing = mode === "edit";

  useEffect(() => {
    if (product && mode === "edit") {
      console.log("=== EDIT MODE DEBUG ===");
      console.log("Incoming product data:", product);

      // Map incoming status to backend values: draft | active | archived
      const incomingStatus = (product.status || "draft")
        .toString()
        .toLowerCase();

      let mappedStatus = "draft";
      if (incomingStatus === "active" || incomingStatus === "hoạt động") {
        mappedStatus = "active";
      } else if (
        incomingStatus === "archived" ||
        incomingStatus === "lưu trữ" ||
        incomingStatus === "inactive"
      ) {
        mappedStatus = "archived";
      } else if (incomingStatus === "draft" || incomingStatus === "nháp") {
        mappedStatus = "draft";
      }

      // Extract category ID - handle both object and string formats
      let categoryId = "";
      if (product.categoryId) {
        categoryId = product.categoryId;
      } else if (product.category) {
        if (typeof product.category === "string") {
          categoryId = product.category;
        } else if (product.category.id) {
          categoryId = product.category.id;
        } else if (product.category._id) {
          categoryId = product.category._id;
        }
      }

      // Extract brand ID - handle both object and string formats
      let brandId = "";
      if (product.brandId) {
        brandId = product.brandId;
      } else if (product.brand) {
        if (typeof product.brand === "string") {
          brandId = product.brand;
        } else if (product.brand.id) {
          brandId = product.brand.id;
        } else if (product.brand._id) {
          brandId = product.brand._id;
        }
      }

      // Extract stock/quantity
      const stockValue = product.stock ?? product.quantity ?? 0;

      // Extract images
      let images: string[] = [];
      if (Array.isArray(product.images)) {
        images = product.images
          .map((img: any) => {
            if (typeof img === "string") {
              return img;
            } else if (img && typeof img === "object") {
              return img.url || img.src || "";
            }
            return "";
          })
          .filter(Boolean);
      } else if (product.image) {
        images = [product.image];
      } else if (product.thumbnail) {
        images = [product.thumbnail];
      }

      const mappedFormData = {
        name: product.name || "",
        description: product.description || "",
        price: (product.price || 0).toString(),
        stock: stockValue.toString(),
        sku: product.sku || "",
        categoryId: categoryId || "none",
        brandId: brandId || "none",
        status: mappedStatus,
        images: images,
      };

      console.log("Mapped form data:", mappedFormData);
      console.log("=== END EDIT DEBUG ===");

      setFormData(mappedFormData);
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        sku: "",
        categoryId: "",
        brandId: "",
        status: "draft",
        images: [],
      });
    }
  }, [product, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Tên sản phẩm là bắt buộc");
      return;
    }
    if (!formData.sku.trim()) {
      setError("SKU là bắt buộc");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError("Số lượng tồn kho không được âm");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Prepare data for backend
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.stock), // Backend expects 'quantity'
        sku: formData.sku.trim(),
        status: formData.status, // Send backend-expected status directly
      };

      // Only include valid ObjectIds for category/brand
      const isValidObjectId = (val: string) => /^[0-9a-fA-F]{24}$/.test(val);

      // Handle category
      if (
        formData.categoryId &&
        formData.categoryId !== "none" &&
        isValidObjectId(formData.categoryId)
      ) {
        productData.category = formData.categoryId;
        console.log("Including category:", formData.categoryId);
      } else if (formData.categoryId === "") {
        console.log("No category selected - product will have no category");
        // Don't include category field - backend will handle as null/undefined
      } else if (formData.categoryId && formData.categoryId !== "none") {
        console.warn("Invalid category ID format:", formData.categoryId);
        // Don't include invalid category ID
      }

      // Handle brand
      if (
        formData.brandId &&
        formData.brandId !== "none" &&
        isValidObjectId(formData.brandId)
      ) {
        productData.brand = formData.brandId;
        console.log("Including brand:", formData.brandId);
      } else if (formData.brandId === "") {
        console.log("No brand selected - product will have no brand");
        // Don't include brand field - backend will handle as null/undefined
      } else if (formData.brandId && formData.brandId !== "none") {
        console.warn("Invalid brand ID format:", formData.brandId);
        // Don't include invalid brand ID
      }

      // Handle images - convert to backend format
      if (formData.images && formData.images.length > 0) {
        productData.images = formData.images.map((url, index) => ({
          url: url,
          alt: `Product image ${index + 1}`,
          isMain: index === 0, // First image is main
          order: index,
        }));
      }

      console.log("=== PRODUCT MODAL SUBMIT DEBUG ===");
      console.log("Form data state:", formData);
      console.log("Final payload for backend:", productData);
      console.log("=== END SUBMIT DEBUG ===");

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error("Error submitting product:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi lưu sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
      }));
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-xl font-bold text-gray-800">
            {mode === "create" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Tên sản phẩm *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nhập tên sản phẩm"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="sku"
                  className="text-sm font-medium text-gray-700"
                >
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  placeholder="Nhập SKU"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Nhập mô tả sản phẩm"
                rows={3}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-sm font-medium text-gray-700"
                >
                  Giá *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="0"
                  min="0"
                  step="1000"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="stock"
                  className="text-sm font-medium text-gray-700"
                >
                  Số lượng tồn kho *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  placeholder="0"
                  min="0"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="categoryId"
                  className="text-sm font-medium text-gray-700"
                >
                  Danh mục
                </Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) => {
                    console.log("Category selected:", value);
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: value === "none" ? "" : value,
                    }));
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-gray-500 italic">
                      ✗ Không có danh mục
                    </SelectItem>
                    {categories.length > 0 ? (
                      categories
                        .map((category) => {
                          const categoryId = category.id || category._id;
                          if (!categoryId) return null;
                          return (
                            <SelectItem key={categoryId} value={categoryId}>
                              📁 {category.name || "Unnamed Category"}
                            </SelectItem>
                          );
                        })
                        .filter(Boolean)
                    ) : (
                      <SelectItem
                        value="no-categories"
                        disabled
                        className="text-gray-400"
                      >
                        Không có danh mục nào
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {formData.categoryId === "" && (
                  <p className="text-blue-600 text-xs">
                    ✓ Sản phẩm này sẽ không thuộc danh mục nào
                  </p>
                )}
                {categories.length > 0 && (
                  <p className="text-green-600 text-xs">
                    📚 Có {categories.length} danh mục để chọn
                  </p>
                )}
                {categories.length === 0 && (
                  <p className="text-yellow-600 text-xs">
                    ⚠️ Không thể tải danh mục. Vui lòng thử lại sau.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="brandId"
                  className="text-sm font-medium text-gray-700"
                >
                  Thương hiệu
                </Label>
                <Select
                  value={formData.brandId || "none"}
                  onValueChange={(value) => {
                    console.log("Brand selected:", value);
                    setFormData((prev) => ({
                      ...prev,
                      brandId: value === "none" ? "" : value,
                    }));
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-gray-500 italic">
                      ✗ Không có thương hiệu
                    </SelectItem>
                    {brands.length > 0 ? (
                      brands
                        .map((brand) => {
                          const brandId = brand.id || brand._id;
                          if (!brandId) return null;
                          return (
                            <SelectItem key={brandId} value={brandId}>
                              🏷️ {brand.name || "Unnamed Brand"}
                            </SelectItem>
                          );
                        })
                        .filter(Boolean)
                    ) : (
                      <SelectItem
                        value="no-brands"
                        disabled
                        className="text-gray-400"
                      >
                        Không có thương hiệu nào
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {formData.brandId === "" && (
                  <p className="text-blue-600 text-xs">
                    ✓ Sản phẩm này sẽ không thuộc thương hiệu nào
                  </p>
                )}
                {brands.length > 0 && (
                  <p className="text-green-600 text-xs">
                    🏷️ Có {brands.length} thương hiệu để chọn
                  </p>
                )}
                {brands.length === 0 && (
                  <p className="text-yellow-600 text-xs">
                    ⚠️ Không thể tải thương hiệu. Vui lòng thử lại sau.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-gray-700"
              >
                Trạng thái
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="archived">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Hình ảnh
              </Label>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Nhập URL hình ảnh"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  onClick={addImage}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-20 object-cover rounded border border-gray-300"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-red-600"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-300 hover:bg-gray-50"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader isLoading={true} size="sm" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {mode === "create" ? "Tạo sản phẩm" : "Cập nhật"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
