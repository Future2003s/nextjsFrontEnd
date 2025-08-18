"use client";
import {
  RegisterRequest,
  RegisterRequestType,
} from "@/shemaValidation/auth.schema";
import { envConfig } from "@/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";

type TypeDataRegister = {
  fullName: string;
  email: string;
  password: string;
};

const SignUpPage = (): React.JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequestType>({
    resolver: zodResolver(RegisterRequest),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: TypeDataRegister) => {
      const res = await fetch("http://localhost:8081/api/auth/createUser", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      });

      let result;
      try {
        const text = await res.text();
        result = text ? JSON.parse(text) : null;
      } catch (error) {
        console.error("JSON parse error:", error);
        result = null;
      }

      if (!res.ok) {
        console.log("LỖI GỌI API");
      }

      return result;
    },
  });

  const handleDataRegister = async (data: TypeDataRegister) => {
    console.log(data);
    const result = await registerMutation.mutate(data);
    console.log(result);
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gray-900">
      {/* Nền động */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-pink-500 to-purple-700">
        <div className="glow-blob w-96 h-96 bg-red-400 -top-20 -left-20"></div>
        <div className="glow-blob w-80 h-80 bg-pink-400 -bottom-20 -right-10"></div>
        <div className="glow-blob w-72 h-72 bg-purple-400 top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Thẻ đăng ký hiệu ứng Glassmorphism */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-8 md:p-12 w-full max-w-md border border-white/20">
        {/* Phần Header với Logo và Tiêu đề */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-white/20 rounded-full mb-3">
            <img
              src={envConfig.NEXT_PUBLIC_URL_LOGO}
              height={"100rem"}
              width={"100rem"}
              className="rounded-[999px]"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wider">
            Tạo Tài Khoản
          </h1>
          <p className="text-white/80 mt-2">
            Bắt đầu hành trình ngọt ngào của bạn.
          </p>
        </div>

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit(handleDataRegister)}>
          {/* Ô nhập Họ và Tên */}
          <div className="mb-5">
            <label
              htmlFor="fullname"
              className="block mb-2 text-sm font-medium text-white/90"
            >
              Họ và Tên
            </label>
            <input
              type="text"
              id="fullname"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:ring-pink-500 focus:border-pink-500 transition duration-300"
              {...register("fullName")}
              placeholder="Nguyễn Văn A"
            />

            <span className="text-red-600 font-bold mt-2">
              {errors.fullName?.message}
            </span>
          </div>
          {/* Ô nhập Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-white/90"
            >
              Địa chỉ Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:ring-pink-500 focus:border-pink-500 transition duration-300"
              placeholder="bạn@email.com"
            />

            <span className="text-red-600 font-bold mt-2">
              {errors.email?.message}
            </span>
          </div>

          {/* Ô nhập Mật khẩu */}
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-white/90"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:ring-pink-500 focus:border-pink-500 transition duration-300"
              placeholder="Enter Password"
            />
            <span className="text-red-600 font-bold mt-2">
              {errors.password?.message}
            </span>
          </div>

          {/* Nút Đăng ký */}
          <button
            type="submit"
            className="w-full text-white bg-pink-500/80 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-pink-300/50 font-bold rounded-lg text-base px-5 py-3.5 text-center transition-all transform hover:scale-105 duration-300 border border-white/20"
          >
            Tạo Tài Khoản
          </button>

          {/* Liên kết Đăng nhập */}
          <p className="text-sm font-light text-white/80 text-center mt-8">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-bold text-white hover:underline"
            >
              Đăng nhập tại đây
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default SignUpPage;
