"use client";
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { Order } from "../types";

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
  // Map backend status to Vietnamese for display
  const backendToVietnamese: Record<string, string> = {
    PROCESSING: "Đang xử lý",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã huỷ",
    SHIPPED: "Đang giao",
    PENDING: "Chờ xử lý",
  };

  // Map Vietnamese to backend status
  const vietnameseToBackend: Record<string, string> = {
    "Đang xử lý": "PROCESSING",
    "Đã giao": "DELIVERED",
    "Đã huỷ": "CANCELLED",
    "Đang giao": "SHIPPED",
    "Chờ xử lý": "PENDING",
  };

  const [status, setStatus] = useState<string>(
    backendToVietnamese[order.status] || order.status
  );
  const [note, setNote] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setUpdating(true);
    try {
      const backendStatus = vietnameseToBackend[status] || "PENDING";

      console.log("Sending order status update:", {
        orderId: order.id,
        status: backendStatus,
        note: note.trim() || "No note",
        url: `/api/orders/${order.id}/status`,
      });

      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: backendStatus,
          ...(note.trim() && { note: note.trim() }),
        }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: Cập nhật thất bại`
        );
      }

      const result = await response.json();

      if (result.success) {
        // Không cần tạo updatedOrder ở đây, để fetchOrders() lấy data mới từ backend
        onSave(order as any);
        toast.success("Cập nhật trạng thái thành công");
      } else {
        throw new Error(result.message || "Cập nhật thất bại");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Cập nhật trạng thái thất bại";
      toast.error(errorMessage);
      console.error("Order status update error:", error);
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

            <div className="mt-4">
              <Label htmlFor="note" className="mb-2 block">
                Ghi chú (tùy chọn)
              </Label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú về thay đổi trạng thái..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={updating}
              />
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
