"use client";
import { useEffect, useState } from "react";
import { useAppContextProvider } from "@/context/app-context";
import type { Order } from "../types";

interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: false,
  });
  const { sessionToken } = useAppContextProvider();

  const fetchOrders = async (page = 0, size = 10) => {
    if (!sessionToken) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders?page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      let payload;
      try {
        const text = await res.text();
        payload = text ? JSON.parse(text) : null;
      } catch (error) {
        console.error("JSON parse error:", error);
        payload = null;
      }
      const data = payload?.data || payload;

      // Extract pagination info
      const paginationInfo: PaginationInfo = {
        page: data.page || 0,
        size: data.size || 10,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        first: data.first || true,
        last: data.last || false,
      };

      const list: any[] = data.content || data || [];
      const mapped: Order[] = list.map((o: any) => ({
        id: o.id,
        customerName: o.customerFullName || o.customerName || "",
        date: o.createdAt || "",
        total: new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(o.amount || 0)),
        status:
          o.status === "PENDING"
            ? "Chờ xử lý"
            : o.status === "PROCESSING"
            ? "Đang xử lý"
            : o.status === "SHIPPED"
            ? "Đang giao"
            : o.status === "DELIVERED"
            ? "Đã giao"
            : o.status === "CANCELLED"
            ? "Đã huỷ"
            : "Chờ xử lý",
        items: Array.isArray(o.items)
          ? o.items.map((it: any) => ({
              id: it.id,
              name: it.productName,
              quantity: it.quantity,
              price: new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(Number(it.price || 0)),
            }))
          : [],
      }));

      setOrders(mapped);
      setPagination(paginationInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sessionToken]);

  const updateOrder = (updatedOrder: Order) => {
    // Optimistically update the order in the list
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );

    // Then fetch fresh data
    fetchOrders(pagination.page, pagination.size);
  };

  const goToPage = (page: number) => {
    fetchOrders(page, pagination.size);
  };

  const changePageSize = (size: number) => {
    fetchOrders(0, size);
  };

  const refreshOrders = () => {
    fetchOrders(pagination.page, pagination.size);
  };

  return {
    orders,
    loading,
    error,
    pagination,
    updateOrder,
    refreshOrders,
    goToPage,
    changePageSize,
  };
};
