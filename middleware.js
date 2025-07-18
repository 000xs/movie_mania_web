import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

export function middleware(req) {
  const token = req.cookies.get("access")?.value;
  const isDashboardRequest = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboardRequest && !token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isDashboardRequest) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
