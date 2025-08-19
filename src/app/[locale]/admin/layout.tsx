import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell, { AdminNavItem } from "@/layouts/admin-shell";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

async function fetchMeServer() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  const url = `${proto}://${host}/api/auth/me`;
  const cookieHeader = h.get("cookie") || "";

  console.log("Admin layout auth check:", {
    url,
    hasCookie: !!cookieHeader,
    cookieValue: cookieHeader,
  });

  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  console.log("Auth response status:", res.status, "ok:", res.ok);
  return res;
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  try {
    const res = await fetchMeServer();
    const currentPath = `/${params.locale}/admin`;

    console.log("Admin layout - response status:", res.status, "ok:", res.ok);

    if (res.status === 401) {
      console.log("Redirecting to login - unauthorized");
      redirect(
        `/${
          params.locale
        }/login?reason=login_required&redirect=${encodeURIComponent(
          currentPath
        )}`
      );
    }

    if (res.status === 403) {
      console.log("Redirecting to login - forbidden");
      redirect(
        `/${params.locale}/login?reason=forbidden&redirect=${encodeURIComponent(
          currentPath
        )}`
      );
    }

    if (!res.ok) {
      console.log("API error, redirecting to login", { status: res.status });
      redirect(
        `/${params.locale}/login?reason=api_error&status=${
          res.status
        }&redirect=${encodeURIComponent(currentPath)}`
      );
    }

    let me: any = null;
    try {
      const text = await res.text();
      me = text ? JSON.parse(text) : null;
      console.log("Raw parsed data:", me);
      me = me?.user || me?.data || me;
      console.log("User data:", { email: me?.email, role: me?.role });
    } catch (parseError) {
      console.error("Failed to parse user data:", parseError);
      redirect(
        `/${
          params.locale
        }/login?reason=parse_error&redirect=${encodeURIComponent(currentPath)}`
      );
    }

    if (!me) {
      console.log("No user data, redirecting to login");
      redirect(
        `/${params.locale}/login?reason=no_user&redirect=${encodeURIComponent(
          currentPath
        )}`
      );
    }

    if (!me.role) {
      console.log("No role in user data, redirecting to login");
      redirect(
        `/${params.locale}/login?reason=no_role&redirect=${encodeURIComponent(
          currentPath
        )}`
      );
    }

    if (!me.email) {
      console.log("No email in user data, redirecting to login");
      redirect(
        `/${params.locale}/login?reason=no_email&redirect=${encodeURIComponent(
          currentPath
        )}`
      );
    }

    const role = (me?.role || "").toUpperCase();
    const allowed = role === "ADMIN" || role === "STAFF";
    console.log("Role check:", { role, allowed, originalRole: me?.role });

    if (!allowed) {
      console.log("User not authorized, redirecting to /me", { role, allowed });
      redirect(
        `/${params.locale}/me?unauthorized=1&role=${encodeURIComponent(role)}`
      );
    }

    const navItems: AdminNavItem[] = [
      {
        id: "dashboard",
        label: "Tổng Quan",
        href: `/${params.locale}/admin/dashboard`,
        icon: <LayoutDashboard size={18} />,
      },
      {
        id: "orders",
        label: "Đơn Hàng",
        href: `/${params.locale}/admin/orders`,
        icon: <ShoppingCart size={18} />,
      },
      {
        id: "products",
        label: "Sản Phẩm",
        href: `/${params.locale}/admin/products`,
        icon: <Package size={18} />,
      },
      {
        id: "accounts",
        label: "Tài Khoản",
        href: `/${params.locale}/admin/accounts`,
        icon: <Users size={18} />,
      },
      {
        id: "analytics",
        label: "Thống Kê",
        href: `/${params.locale}/admin/analytics`,
        icon: <BarChart3 size={18} />,
      },
      {
        id: "settings",
        label: "Cài Đặt",
        href: `/${params.locale}/admin/settings`,
        icon: <Settings size={18} />,
      },
    ];

    return (
      <AdminShell
        navItems={navItems}
        brand={{ name: "LALA-LYCHEE", short: "L" }}
        notifCount={0}
        userName={me?.fullName || me?.firstName || me?.name || "Admin"}
      >
        {children}
      </AdminShell>
    );
  } catch (error) {
    console.error("Admin layout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    redirect(
      `/${params.locale}/login?reason=error&error=${encodeURIComponent(
        errorMessage
      )}`
    );
  }
}
