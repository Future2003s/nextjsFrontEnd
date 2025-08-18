import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApiRequest, BackendUserProfile } from "@/apiRequests/auth";
import { toast } from "sonner";

// Sử dụng type từ backend API
type User = BackendUserProfile;

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
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

      // Xóa token khỏi localStorage
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("refreshToken");
    }
  }, []);

  // Khởi tạo auth state từ localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("sessionToken");
        const refreshToken = localStorage.getItem("refreshToken");

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

          // Lưu vào localStorage
          localStorage.setItem("sessionToken", token);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }

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
          router.push(redirectPath);

          return { success: true };
        } else {
          throw new Error(result.message || "Đăng nhập thất bại");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        toast.error(error.message || "Đăng nhập thất bại");
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
      // Xóa token khỏi localStorage
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("refreshToken");

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
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const result = await authApiRequest.refreshToken(refreshToken);

      if (result.success && result.data) {
        const { token: newToken, refreshToken: newRefreshToken } = result.data;

        // Cập nhật localStorage
        localStorage.setItem("sessionToken", newToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

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
    logout,
    refreshAuth,
    hasRole,
    isAdmin,
    fetchUserData,
  };
}
