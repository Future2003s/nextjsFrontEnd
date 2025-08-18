"use client";
import React, { useMemo, useState } from "react";
import { useAppContextProvider } from "@/context/app-context";
import { ButtonLoader } from "@/components/ui/loader";

export interface BuyNowItem {
  name: string;
  price: number;
  quantity: number;
}

interface BuyNowModalProps {
  open: boolean;
  onClose: () => void;
  items: BuyNowItem[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

export default function BuyNowModal({
  open,
  onClose,
  items,
}: BuyNowModalProps) {
  const { sessionToken } = useAppContextProvider();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");

  const { totalQty, totalPrice } = useMemo(() => {
    const totalQty = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    const totalPrice = items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0),
      0
    );
    return { totalQty, totalPrice };
  }, [items]);

  const createPayment = async () => {
    if (totalPrice <= 0 || totalQty <= 0) {
      setError("Vui lòng chọn sản phẩm và số lượng hợp lệ.");
      return;
    }
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError("Vui lòng nhập họ tên, số điện thoại và địa chỉ nhận hàng.");
      return;
    }
    // Require login
    if (!sessionToken) {
      setError("Vui lòng đăng nhập trước khi đặt hàng.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    const orderItems = items
      .filter((it) => it.quantity > 0)
      .map((it) => ({ name: it.name, quantity: it.quantity, price: it.price }));

    const orderPayload = {
      amount: totalPrice,
      description: `${totalQty} sản phẩm - Người mua: ${fullName} - ĐT: ${phone}`,
      items: orderItems,
      customer: { fullName, phone, email, address, note },
      paymentMethod,
    };

    try {
      if (paymentMethod === "bank") {
        const response = await fetch(
          "https://api.lalalycheee.vn/create-payment-link",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload),
          }
        );
        if (!response.ok) {
          let errorData;
          try {
            const text = await response.text();
            errorData = text ? JSON.parse(text) : {};
          } catch (error) {
            console.error("JSON parse error:", error);
            errorData = {};
          }
          throw new Error(errorData.message || "Tạo link thanh toán thất bại!");
        }
        let result;
        try {
          const text = await response.text();
          result = text ? JSON.parse(text) : null;
        } catch (error) {
          console.error("JSON parse error:", error);
          throw new Error("Lỗi khi parse response");
        }
        if (result && result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          throw new Error(
            "Không nhận được checkoutUrl từ phản hồi của server."
          );
        }
      } else {
        const response = await fetch("/api/orders/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify(orderPayload),
        });
        if (!response.ok) {
          let errorData;
          try {
            const text = await response.text();
            errorData = text ? JSON.parse(text) : {};
          } catch (error) {
            console.error("JSON parse error:", error);
            errorData = {};
          }
          throw new Error(errorData.message || "Đặt hàng COD thất bại!");
        }
        setSuccess(
          "Đã nhận đơn hàng COD. Chúng tôi sẽ liên hệ để xác nhận và giao hàng."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã có lỗi không xác định."
      );
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Thông tin mua hàng</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[80vh] overflow-auto">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sản phẩm</h4>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="truncate pr-2">
                    {it.name} × {it.quantity}
                  </div>
                  <div className="font-medium">
                    {formatCurrency(it.price * it.quantity)}
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Tổng cộng ({totalQty} sản phẩm)
                </div>
                <div className="text-pink-600 font-semibold">
                  {formatCurrency(totalPrice)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Thông tin khách hàng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Email (tuỳ chọn)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">
                  Địa chỉ nhận hàng
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">
                  Ghi chú (tuỳ chọn)
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm cho đơn hàng..."
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Hình thức thanh toán
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`border rounded-md p-3 cursor-pointer flex items-start gap-3 ${
                  paymentMethod === "cod"
                    ? "border-pink-500 ring-1 ring-pink-200"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  className="mt-1"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <div>
                  <div className="font-medium">
                    Thanh toán khi nhận hàng (COD)
                  </div>
                  <div className="text-sm text-gray-500">
                    Thanh toán tiền mặt khi đơn hàng được giao.
                  </div>
                </div>
              </label>
              <label
                className={`border rounded-md p-3 cursor-pointer flex items-start gap-3 ${
                  paymentMethod === "bank"
                    ? "border-pink-500 ring-1 ring-pink-200"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  className="mt-1"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                />
                <div>
                  <div className="font-medium">
                    Chuyển khoản/Thanh toán online
                  </div>
                  <div className="text-sm text-gray-500">
                    Tạo link thanh toán và thanh toán qua ngân hàng.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
        </div>

        <div className="px-5 py-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Đóng
          </button>
          <button
            onClick={createPayment}
            disabled={loading}
            className="ml-auto px-4 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-700 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <ButtonLoader size="sm" />
                <span>Đang xử lý...</span>
              </div>
            ) : paymentMethod === "bank" ? (
              "Tiến hành Thanh toán"
            ) : (
              "Đặt hàng COD"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
