import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  // Support multiple payload shapes
  const sessionToken =
    payload?.data?.access_token ||
    payload?.metaData?.token?.access_token ||
    payload?.token?.access_token ||
    payload?.access_token;
  const refreshToken =
    payload?.data?.refresh_token ||
    payload?.metaData?.token?.refresh_token ||
    payload?.token?.refresh_token ||
    payload?.refresh_token;

  const isProd = process.env.NODE_ENV === "production";
  const accessCookie = [
    `sessionToken=${sessionToken ?? ""}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isProd) accessCookie.push("Secure");

  const cookies: string[] = [accessCookie.join("; ")];

  if (refreshToken) {
    const refreshCookie = [
      `refreshToken=${refreshToken}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Strict",
    ];
    if (isProd) refreshCookie.push("Secure");
    cookies.push(refreshCookie.join("; "));
  }

  return Response.json(
    { payload },
    { headers: { "Set-Cookie": cookies.join(", ") } }
  );
}
