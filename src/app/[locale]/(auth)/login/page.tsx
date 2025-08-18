"use client";
import LoginForm from "./login-form";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const LoginPage = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "login_required") {
      toast.error("Vui lòng đăng nhập để tiếp tục");
    }
  }, [searchParams]);

  return (
    <section className="container mx-auto">
      <LoginForm />
    </section>
  );
};

export default LoginPage;
