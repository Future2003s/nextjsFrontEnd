import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BackendUserProfile } from "@/apiRequests/auth";
import { ExtendedLoginBodyType } from "@/shemaValidation/auth.schema";
import { toast } from "sonner";

import { setAuthCookies, clearAuthCookies, getCookie } from "@/lib/cookies";

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
  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const result = await res.json();
      if (res.ok && result?.success && result.user) {
        // Đảm bảo dữ liệu có đầy đủ các field cần thiết
        const userData: BackendUserProfile = {
          ...result.user,
          addresses: result.user.addresses || [],
          preferences: result.user.preferences || {
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
      // Token có thể đã hết hạn - xử lý nhẹ
      setAuthState((prev) => ({
        ...prev,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }));

      // Không xóa cookies ở đây; để login lại hoặc refresh xử lý
    }
  }, []);

  // Khởi tạo auth state từ cookies
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getCookie("sessionToken");
        const refreshToken = getCookie("refreshToken");
        if (token || refreshToken) {
          setAuthState((prev) => ({
            ...prev,
            token: token || null,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
          }));

          // Fetch user data
          fetchUserData();
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

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const result = await res.json();
        if (res.ok && result?.success && result?.data?.user) {
          const { user } = result.data;

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
            token: getCookie("sessionToken"),
            refreshToken: getCookie("refreshToken"),
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success("Đăng nhập thành công!");

          // Redirect to profile page with correct locale
          const locale = pathname.split("/")[1] || "vi";
          const redirectPath = `/${locale}/me`;
          router.replace(redirectPath);

          return { success: true };
        } else {
          throw new Error(result.message || "Đăng nhập thất bại");
        }
      } catch (error: any) {
        console.error("Login error:", error);
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

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        });
        const result = await res.json();
        if (res.ok && result?.success && result?.data?.user) {
          const { user, permissions } = result.data;

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
            token: getCookie("sessionToken"),
            refreshToken: getCookie("refreshToken"),
            isAuthenticated: true,
            isLoading: false,
            permissions: permissions || [],
          });

          toast.success("Đăng nhập thành công!");

          // Redirect logic
          const locale = pathname.split("/")[1] || "vi";
          const redirectPath = `/${locale}/me`;
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
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (error) {
        console.error("Logout API error:", error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Xóa localStorage và cookie
      clearAuthCookies();
      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
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

      const res = await fetch("/api/auth/refresh", { method: "POST" });
      const result = await res.json();

      if (res.ok && result?.success && result?.data) {
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
