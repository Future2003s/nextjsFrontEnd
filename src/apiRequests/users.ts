import { http } from "@/lib/http";

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  addresses: UserAddress[];
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  _id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface AddAddressRequest {
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<AddAddressRequest> {}

export const usersApiRequest = {
  // Get user profile
  getProfile: (
    token: string
  ): Promise<{ success: boolean; data: UserProfile }> => {
    return http.get("/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Update user profile
  updateProfile: (
    token: string,
    body: UpdateProfileRequest
  ): Promise<{ success: boolean; message: string; data: UserProfile }> => {
    return http.put("/users/profile", body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get user addresses
  getAddresses: (
    token: string
  ): Promise<{ success: boolean; data: UserAddress[] }> => {
    return http.get("/users/addresses", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Add new address
  addAddress: (
    token: string,
    body: AddAddressRequest
  ): Promise<{ success: boolean; message: string; data: UserAddress }> => {
    return http.post("/users/addresses", body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Update address
  updateAddress: (
    token: string,
    addressId: string,
    body: UpdateAddressRequest
  ): Promise<{ success: boolean; message: string; data: UserAddress }> => {
    return http.put(`/users/addresses/${addressId}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Delete address
  deleteAddress: (
    token: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.delete(`/users/addresses/${addressId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Set default address
  setDefaultAddress: (
    token: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.put(
      `/users/addresses/${addressId}/default`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Update notification preferences
  updateNotificationPreferences: (
    token: string,
    preferences: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    }
  ): Promise<{ success: boolean; message: string }> => {
    return http.put("/users/preferences/notifications", preferences, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Update language preference
  updateLanguage: (
    token: string,
    language: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.put(
      "/users/preferences/language",
      { language },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Update currency preference
  updateCurrency: (
    token: string,
    currency: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.put(
      "/users/preferences/currency",
      { currency },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Upload avatar
  uploadAvatar: (
    token: string,
    formData: FormData
  ): Promise<{
    success: boolean;
    message: string;
    data: { avatar: string };
  }> => {
    return http.post("/users/avatar", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData
      },
    });
  },
};
