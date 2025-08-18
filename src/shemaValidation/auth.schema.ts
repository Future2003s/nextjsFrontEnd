import { RoleValues } from "@/constants/type";
import { z } from "zod";

export const authSchema = z
  .object({
    email: z
      .string()
      .email("Email không đúng định dạng")
      .min(4, "Mật Khẩu Yêu cầu 4 ký tự"),
    password: z.string().min(8, "Yêu cầu 8 ký tự"),
  })
  .strict();

export const LoginRes = z.object({
  status: z.number(),
  message: z.string(),
  metaData: z.object({
    data: z.object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
      password: z.string(),
      role: z.enum(RoleValues),
    }),
    token: z.object({
      access_token: z.string(),
      refresh_token: z.string(),
    }),
  }),
});

export const RegisterRequest = z.object({
  fullName: z.string().min(3, "Họ Và Tên Tối Thiểu Từ 3 Ký Tự Trở Lên"),
  email: z.string().email("Chưa Đúng Định Dạng Email"),
  password: z.string().min(6, "Mật Khẩu Yêu Cầu Tối Thiểu 6 Ký Tự"),
});

export type RegisterRequestType = z.infer<typeof RegisterRequest>;

export type LoginResType = z.infer<typeof LoginRes>;

export type LoginBodyType = z.infer<typeof authSchema>;
