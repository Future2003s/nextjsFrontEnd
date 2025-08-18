"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppContextProvider } from "@/context/app-context";
import { Badge } from "@/components/ui/badge";

export const OrderHistoryModal = ({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) => {
  const [items, setItems] = useState<
    {
      id: string;
      oldStatus:
        | "Chờ xử lý"
        | "Đang xử lý"
        | "Đang giao"
        | "Đã giao"
        | "Đã huỷ";
      newStatus:
        | "Chờ xử lý"
        | "Đang xử lý"
        | "Đang giao"
        | "Đã giao"
        | "Đã huỷ";
      changedBy?: string;
      note?: string;
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { sessionToken } = useAppContextProvider();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}/history`, {
          headers: sessionToken
            ? { Authorization: `Bearer ${sessionToken}` }
            : undefined,
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setItems([]);
          return;
        }

        let payload;
        try {
          const text = await res.text();
          payload = text ? JSON.parse(text) : null;
        } catch (error) {
          console.error("JSON parse error:", error);
          payload = null;
        }
        const list = payload?.data ?? payload ?? [];
        const mapStatus = (s: string) =>
          s === "PENDING"
            ? "Chờ xử lý"
            : s === "PROCESSING"
            ? "Đang xử lý"
            : s === "SHIPPED"
            ? "Đang giao"
            : s === "DELIVERED"
            ? "Đã giao"
            : s === "CANCELLED"
            ? "Đã huỷ"
            : "Chờ xử lý";
        setItems(
          list.map((h: any) => ({
            id: h.id,
            oldStatus: mapStatus(h.oldStatus) as any,
            newStatus: mapStatus(h.newStatus) as any,
            changedBy: h.changedBy,
            note: h.note,
            createdAt: h.createdAt,
          }))
        );
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId, sessionToken]);

  const getVariant = (s: string) =>
    s === "Đã giao"
      ? "default"
      : s === "Đã huỷ"
      ? "destructive"
      : s === "Chờ xử lý"
      ? "secondary"
      : s === "Đang giao"
      ? "outline"
      : "secondary";

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Lịch sử chỉnh sửa
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={22} />
            </button>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="text-gray-500">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="text-gray-500">Chưa có lịch sử</div>
            ) : (
              <ul className="space-y-3">
                {items.map((h) => (
                  <li key={h.id} className="border rounded-md p-3">
                    <div className="text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString("vi-VN")}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm">Trạng thái:</span>
                      <Badge variant={getVariant(h.oldStatus)}>
                        {h.oldStatus}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant={getVariant(h.newStatus)}>
                        {h.newStatus}
                      </Badge>
                    </div>
                    {h.changedBy && (
                      <div className="text-sm text-gray-600 mt-1">
                        Bởi: {h.changedBy}
                      </div>
                    )}
                    {h.note && (
                      <div className="text-sm text-gray-600 mt-1">
                        Ghi chú: {h.note}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
