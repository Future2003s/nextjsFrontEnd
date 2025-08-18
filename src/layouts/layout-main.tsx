"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

function LayoutMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // check page admin
  const isAdminPage = pathname.startsWith("/dashboard");
  return (
    <div>
      {!isAdminPage && <Header />}
      <main>{children}</main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default LayoutMain;
