import { z } from "zod";

const configSchema = z.object({
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_API_END_POINT: z.string(),
  NEXT_PUBLIC_URL_LOGO: z.string(),
  NEXT_PUBLIC_BACKEND_URL: z.string().default("http://localhost:8081"),
  NEXT_PUBLIC_API_VERSION: z.string().default("v1"),
});

const config = configSchema.safeParse({
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_API_END_POINT: process.env.NEXT_PUBLIC_API_END_POINT,
  NEXT_PUBLIC_URL_LOGO: process.env.NEXT_PUBLIC_URL_LOGO,
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
});

if (!config.success) {
  console.log(config.error.errors);
  throw new Error("Giá Trị Khai Báo Không Hợp Lệ");
}

export const envConfig = config.data;
