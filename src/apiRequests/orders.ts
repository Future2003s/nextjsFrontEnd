import { http } from "@/lib/http";

export interface OrderItem {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variantId?: string;
  variantName?: string;
}

export interface OrderAddress {
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  paymentMethod: string;
  notes?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface OrdersListResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ordersApiRequest = {
  // Create new order
  createOrder: (
    token: string,
    body: CreateOrderRequest
  ): Promise<OrderResponse> => {
    return http.post("/orders", body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get user's orders
  getUserOrders: (
    token: string,
    page = 1,
    limit = 20
  ): Promise<OrdersListResponse> => {
    return http.get(`/orders?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get order by ID
  getOrderById: (token: string, orderId: string): Promise<OrderResponse> => {
    return http.get(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Cancel order
  cancelOrder: (token: string, orderId: string): Promise<OrderResponse> => {
    return http.put(
      `/orders/${orderId}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Get order tracking
  getOrderTracking: (token: string, orderId: string): Promise<any> => {
    return http.get(`/orders/${orderId}/tracking`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Admin: Get all orders
  getAllOrders: (
    token: string,
    filters?: {
      status?: string;
      paymentStatus?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<OrdersListResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/orders/admin?${queryString}` : "/orders/admin";

    return http.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Admin: Update order status
  updateOrderStatus: (
    token: string,
    orderId: string,
    status: string
  ): Promise<OrderResponse> => {
    return http.put(
      `/orders/${orderId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
};
