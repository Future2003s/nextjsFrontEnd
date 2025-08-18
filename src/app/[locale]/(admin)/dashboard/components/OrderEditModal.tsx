"use client";
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { Order } from "../types";
import { useAppContextProvider } from "@/context/app-context";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const OrderEditModal = ({
  order,
  onSave,
  onClose,
}: {
  order: Order;
  onSave: (updatedOrder: Order) => void;
  onClose: () => void;
}) => {
  const [status, setStatus] = useState<string>(order.status);
  const [updating, setUpdating] = useState(false);
  const { sessionToken } = useAppContextProvider();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) {
      toast.error("Cần đăng nhập");
      return;
    }

    setUpdating(true);
    try {
      const statusMap: Record<string, string> = {
        "Đang xử lý": "PROCESSING",
        "Đã giao": "DELIVERED",
        "Đã huỷ": "CANCELLED",
        "Đang giao": "SHIPPED",
        "Chờ xử lý": "PENDING",
      };

      const backendStatus = statusMap[status] || "PENDING";

      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: order.id,
          status: backendStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Cập nhật thất bại");
      }

      // Không cần tạo updatedOrder ở đây, để fetchOrders() lấy data mới từ backend
      onSave(order as any);
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave}>
          <div className="p-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Cập nhật đơn hàng
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={updating}
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-500 mt-2">Mã ĐH: {order.id}</p>
            <div className="mt-6">
              <Label htmlFor="status" className="mb-2 block">
                Trạng thái đơn hàng
              </Label>
              <Select
                value={status}
                onValueChange={setStatus}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chờ xử lý">Chờ xử lý</SelectItem>
                  <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                  <SelectItem value="Đang giao">Đang giao</SelectItem>
                  <SelectItem value="Đã giao">Đã giao</SelectItem>
                  <SelectItem value="Đã huỷ">Đã huỷ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {updating && (
              <div className="mt-4">
                <LoadingSpinner size="md" text="Đang cập nhật..." />
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-8 py-4 text-right rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="mr-3"
              disabled={updating}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
