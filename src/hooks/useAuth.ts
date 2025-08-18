import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BackendAuthResponse,
  BackendUserProfile,
  authApiRequest,
} from "@/apiRequests/auth";
import { ExtendedLoginBodyType } from "@/shemaValidation/auth.schema";
import { toast } from "sonner";

import {
  setCookie,
  getCookie,
  deleteCookie,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/cookies";

// Sử dụng type từ backend API
type User = BackendUserProfile;

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions?: string[];
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    permissions: [],
  });

  const router = useRouter();
  const pathname = usePathname();

  // Fetch user data function - định nghĩa trước để tránh lỗi dependency
  const fetchUserData = useCallback(async (token: string) => {
    try {
      const result = await authApiRequest.me(token);
      if (result.success && result.data) {
        // Đảm bảo dữ liệu có đầy đủ các field cần thiết
        const userData: BackendUserProfile = {
          ...result.data,
          addresses: result.data.addresses || [],
          preferences: result.data.preferences || {
            language: "en",
            currency: "USD",
            notifications: { email: true, sms: false, push: true },
          },
        };

        setAuthState((prev) => ({
          ...prev,
          user: userData,
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Token có thể đã hết hạn - xử lý riêng thay vì gọi logout
      setAuthState((prev) => ({
        ...prev,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }));

      // Xóa token khỏi cookies
      clearAuthCookies();
    }
  }, []);

  // Khởi tạo auth state từ cookies
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getCookie("sessionToken");
        const refreshToken = getCookie("refreshToken");

        if (token) {
          setAuthState((prev) => ({
            ...prev,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          }));

          // Fetch user data
          fetchUserData(token);
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, [fetchUserData]);

  // Function này đã được định nghĩa ở trên, xóa duplicate

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        const result = await authApiRequest.login({ email, password });
        console.log("Login result:", result); // Debug log

        if (result.success && result.data) {
          const { user, token, refreshToken } = result.data;

          console.log("User data:", user); // Debug log
          console.log("Token:", token); // Debug log

          // Lưu vào cookies
          setAuthCookies(token, refreshToken);

          // Cập nhật state với user data đã được xử lý
          const userData: BackendUserProfile = {
            ...user,
            addresses: (user as any).addresses || [],
            preferences: (user as any).preferences || {
              language: "en",
              currency: "USD",
              notifications: { email: true, sms: false, push: true },
            },
          };

          setAuthState({
            user: userData,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success("Đăng nhập thành công!");

          // Redirect to profile page with correct locale
          const locale = pathname.split("/")[1] || "vi"; // Extract locale from current path
          const redirectPath = `/${locale}/me`;
          console.log("Redirecting to:", redirectPath); // Debug log

          // Sử dụng replace để tránh quay lại trang login khi bấm back
          router.replace(redirectPath);

          return { success: true };
        } else {
          throw new Error(result.message || "Đăng nhập thất bại");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        // Chỉ hiển thị toast lỗi nếu chắc chắn thất bại (không trong quá trình redirect sau khi success)
        if (!error?.silent) {
          toast.error(error.message || "Đăng nhập thất bại");
        }
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: error.message };
      }
    },
    [router, pathname]
  );

  // Enhanced login function with additional fields
  const loginExtended = useCallback(
    async (loginData: ExtendedLoginBodyType) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        const result = await authApiRequest.loginExtended(loginData);
        console.log("Extended Login result:", result); // Debug log

        if (result.success && result.data) {
          const { user, token, refreshToken, expiresIn, permissions } =
            result.data;

          console.log("User data:", user); // Debug log
          console.log("Token:", token); // Debug log
          console.log("Permissions:", permissions); // Debug log

          // Lưu vào cookies - setAuthCookies chỉ nhận token và refreshToken
          setAuthCookies(token, refreshToken);

          // Cập nhật state với user data và permissions
          const userData: BackendUserProfile = {
            ...user,
            addresses: (user as any).addresses || [],
            preferences: user.preferences
              ? {
                  ...user.preferences,
                  notifications: {
                    email: user.preferences.notifications?.email ?? true,
                    sms: user.preferences.notifications?.sms ?? false,
                    push: user.preferences.notifications?.push ?? true,
                  },
                }
              : {
                  language: "vi",
                  currency: "VND",
                  notifications: { email: true, sms: false, push: true },
                },
          };

          setAuthState({
            user: userData,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            permissions: permissions || [],
          });

          toast.success("Đăng nhập thành công!");

          // Redirect logic
          const locale = pathname.split("/")[1] || "vi";
          const redirectPath = `/${locale}/me`;
          console.log("Redirecting to:", redirectPath);

          router.replace(redirectPath);
          return { success: true };
        } else {
          throw new Error(result.message || "Đăng nhập thất bại");
        }
      } catch (error: any) {
        console.error("Enhanced Login error:", error);
        if (!error?.silent) {
          toast.error(error.message || "Đăng nhập thất bại");
        }
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: error.message };
      }
    },
    [router, pathname]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Gọi API logout nếu có token
      if (authState.token) {
        try {
          await authApiRequest.logout();
        } catch (error) {
          console.error("Logout API error:", error);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Xóa token khỏi cookies
      clearAuthCookies();

      // Reset state
      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Redirect to login with correct locale
      const locale = pathname.split("/")[1] || "vi";
      const loginPath = `/${locale}/login`;
      router.push(loginPath);
      toast.success("Đã đăng xuất");
    }
  }, [authState.token, router, pathname]);

  // Refresh token function
  const refreshAuth = useCallback(async () => {
    try {
      const refreshToken = getCookie("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const result = await authApiRequest.refreshToken(refreshToken);

      if (result.success && result.data) {
        const { token: newToken, refreshToken: newRefreshToken } = result.data;

        // Cập nhật cookies
        setAuthCookies(newToken, newRefreshToken);

        // Cập nhật state
        setAuthState((prev) => ({
          ...prev,
          token: newToken,
          refreshToken: newRefreshToken,
        }));

        return { success: true };
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
      return { success: false };
    }
  }, [logout]);

  // Check if user has specific role
  const hasRole = useCallback(
    (role: string | string[]) => {
      if (!authState.user) return false;

      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(authState.user.role);
    },
    [authState.user]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole(["admin", "staff"]);
  }, [hasRole]);

  return {
    ...authState,
    login,
    loginExtended,
    logout,
    refreshAuth,
    hasRole,
    isAdmin,
    fetchUserData,
  };
}
