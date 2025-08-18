import { http } from "@/lib/http";
import { API_CONFIG } from "@/lib/api-config";

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

// Order API requests to Node.js backend
export const ordersApiRequest = {
  // Create new order
  createOrder: (
    token: string,
    body: CreateOrderRequest
  ): Promise<OrderResponse> => {
    return http.post(API_CONFIG.ORDERS.CREATE, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get user's orders
  getUserOrders: (
    token: string,
    page = 1,
    limit = 20
  ): Promise<OrdersListResponse> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const url = `${API_CONFIG.ORDERS.USER_ORDERS}?${queryParams.toString()}`;
    return http.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get order by ID
  getOrderById: (token: string, orderId: string): Promise<OrderResponse> => {
    return http.get(API_CONFIG.ORDERS.BY_ID.replace(":id", orderId), {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Cancel order
  cancelOrder: (
    token: string,
    orderId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> => {
    const body = reason ? { reason } : {};
    return http.put(API_CONFIG.ORDERS.CANCEL.replace(":id", orderId), body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get order tracking
  getOrderTracking: (
    token: string,
    orderId: string
  ): Promise<{ success: boolean; data: any }> => {
    return http.get(API_CONFIG.ORDERS.TRACKING.replace(":id", orderId), {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get all orders (admin only)
  getAllOrders: (
    token: string,
    filters?: {
      status?: string;
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<OrdersListResponse> => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_CONFIG.ORDERS.ALL}?${queryString}`
      : API_CONFIG.ORDERS.ALL;
    return http.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Update order status (admin only)
  updateOrderStatus: (
    token: string,
    orderId: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    const body = notes ? { status, notes } : { status };
    return http.put(
      API_CONFIG.ORDERS.UPDATE_STATUS.replace(":id", orderId),
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
};
