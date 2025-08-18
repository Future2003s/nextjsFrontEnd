import {
  LoginBodyType,
  ExtendedLoginBodyType,
  RegisterRequestType,
} from "@/shemaValidation/auth.schema";
import { http } from "@/lib/http";
import { API_CONFIG } from "@/lib/api-config";

// Backend response types
export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      avatar?: string;
      isActive: boolean;
      isEmailVerified: boolean;
      lastLogin?: string;
      preferences?: {
        language: string;
        currency: string;
        notifications: {
          email: boolean;
          sms: boolean;
          push: boolean;
        };
      };
    };
    token: string;
    refreshToken: string;
    expiresIn?: number;
    permissions?: string[];
  };
}

export interface BackendUserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  addresses: any[];
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

// Direct API calls to Node.js backend
export const authApiRequest = {
  register: (body: RegisterRequestType): Promise<BackendAuthResponse> => {
    return http.post(API_CONFIG.AUTH.REGISTER, body);
  },

  login: (
    body: LoginBodyType | ExtendedLoginBodyType
  ): Promise<BackendAuthResponse> => {
    return http.post(API_CONFIG.AUTH.LOGIN, body);
  },

  // Enhanced login với extended data
  loginExtended: (
    body: ExtendedLoginBodyType
  ): Promise<BackendAuthResponse> => {
    return http.post(API_CONFIG.AUTH.LOGIN, body);
  },

  me: (
    token: string
  ): Promise<{ success: boolean; data: BackendUserProfile }> => {
    return http.get(API_CONFIG.AUTH.ME, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  changePassword: (
    token: string,
    body: { currentPassword: string; newPassword: string }
  ): Promise<{ success: boolean; message: string }> => {
    return http.put(API_CONFIG.AUTH.CHANGE_PASSWORD, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  forgotPassword: (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.post(API_CONFIG.AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword: (
    token: string,
    password: string
  ): Promise<BackendAuthResponse> => {
    return http.put(`/auth/reset-password/${token}`, { password });
  },

  refreshToken: (
    refreshToken: string
  ): Promise<{
    success: boolean;
    data: { token: string; refreshToken: string };
  }> => {
    return http.post("/auth/refresh-token", { refreshToken });
  },

  verifyEmail: (
    token: string
  ): Promise<{ success: boolean; message: string }> => {
    return http.get(`/auth/verify-email/${token}`);
  },

  logout: (): Promise<{ success: boolean; message: string }> => {
    return http.post("/auth/logout", {});
  },
};
