import { http } from "@/lib/http";
import { API_CONFIG } from "@/lib/api-config";

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

// User API requests to Node.js backend
export const usersApiRequest = {
  // Get user profile
  getProfile: (
    token: string
  ): Promise<{ success: boolean; data: UserProfile }> => {
    return http.get(API_CONFIG.USERS.PROFILE, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Update user profile
  updateProfile: (
    token: string,
    body: UpdateProfileRequest
  ): Promise<{ success: boolean; data: UserProfile }> => {
    return http.put(API_CONFIG.USERS.PROFILE, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get user addresses
  getAddresses: (
    token: string
  ): Promise<{ success: boolean; data: UserAddress[] }> => {
    return http.get(API_CONFIG.USERS.ADDRESSES, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Add new address
  addAddress: (
    token: string,
    body: AddAddressRequest
  ): Promise<{ success: boolean; data: UserAddress }> => {
    return http.post(API_CONFIG.USERS.ADDRESSES, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Update address
  updateAddress: (
    token: string,
    addressId: string,
    body: UpdateAddressRequest
  ): Promise<{ success: boolean; data: UserAddress }> => {
    return http.put(`${API_CONFIG.USERS.ADDRESSES}/${addressId}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Delete address
  deleteAddress: (
    token: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.delete(`${API_CONFIG.USERS.ADDRESSES}/${addressId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Set default address
  setDefaultAddress: (
    token: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.put(
      `${API_CONFIG.USERS.ADDRESSES}/${addressId}/default`,
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
      email: boolean;
      sms: boolean;
      push: boolean;
    }
  ): Promise<{ success: boolean; message: string }> => {
    return http.put(
      API_CONFIG.USERS.PREFERENCES,
      { notifications: preferences },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Update language preference
  updateLanguage: (
    token: string,
    language: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.put(
      API_CONFIG.USERS.PREFERENCES,
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
      API_CONFIG.USERS.PREFERENCES,
      { currency },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Upload avatar
  uploadAvatar: (
    token: string,
    file: File
  ): Promise<{ success: boolean; data: { avatarUrl: string } }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    return http.put(API_CONFIG.USERS.AVATAR, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
