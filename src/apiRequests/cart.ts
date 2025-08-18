import { http } from "@/lib/http";
import { API_CONFIG } from "@/lib/api-config";

export interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variantId?: string;
  variantName?: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    totalDiscount?: number;
  };
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  variantId?: string;
}

// Cart API requests to Node.js backend
export const cartApiRequest = {
  // Get user's cart
  getCart: (token: string): Promise<CartResponse> => {
    return http.get(API_CONFIG.CART.GET, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Add item to cart
  addToCart: (token: string, body: AddToCartRequest): Promise<CartResponse> => {
    return http.post(API_CONFIG.CART.ADD_ITEM, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Update cart item quantity
  updateQuantity: (
    token: string,
    itemId: string,
    quantity: number
  ): Promise<CartResponse> => {
    return http.put(
      API_CONFIG.CART.UPDATE_ITEM.replace(":productId", itemId),
      { quantity },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Remove item from cart
  removeItem: (token: string, itemId: string): Promise<CartResponse> => {
    return http.delete(
      API_CONFIG.CART.REMOVE_ITEM.replace(":productId", itemId),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Clear entire cart
  clearCart: (token: string): Promise<CartResponse> => {
    return http.delete(API_CONFIG.CART.CLEAR, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Apply discount code
  applyDiscount: (token: string, code: string): Promise<CartResponse> => {
    return http.post(
      API_CONFIG.CART.GET + "/discount",
      { code },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Remove discount code
  removeDiscount: (token: string): Promise<CartResponse> => {
    return http.delete(API_CONFIG.CART.GET + "/discount", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
