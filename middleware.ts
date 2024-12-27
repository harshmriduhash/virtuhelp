import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    // Allow access to admin-login page
    if (pathname === "/admin-login") {
      // If already authenticated, redirect to admin dashboard
      const token = request.cookies.get("admin-token")?.value;
      if (token) {
        try {
          const payload = await verifyToken(token);
          if (payload?.isAdmin) {
            return NextResponse.redirect(new URL("/admin", request.url));
          }
        } catch (error) {
          // Invalid token, continue to login page
        }
      }
      return NextResponse.next();
    }

    // For all other admin routes, check authentication
    const token = request.cookies.get("admin-token")?.value;
    if (!token) {
      return redirectToLogin(request);
    }

    try {
      const payload = await verifyToken(token);
      if (!payload?.isAdmin) {
        return redirectToLogin(request);
      }
      return NextResponse.next();
    } catch (error) {
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/admin-login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/admin-login"],
};
