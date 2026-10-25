import { NextResponse } from "next/server";
import { verifyJwtToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

/**
 * Next.js 16 Proxy (formerly Middleware) for Admin Route Interception & JWT Verification
 * 100% Web Crypto API compliant via `jose`. Runs natively at the Edge and in Cloudflare Workers.
 */
export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // If not an admin route, let request proceed directly
  if (!isAdminPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let payload = null;

  if (token) {
    payload = await verifyJwtToken(token);
  }

  // 1. Allow login page to always render directly without redirection.
  // Prevents false-positive redirect loops if database was formatted or user was invalidated.
  if (isLoginPage) {
    return NextResponse.next();
  }

  // 2. Unauthenticated or invalid token on protected admin routes -> redirect to login
  if (!payload || payload.status !== "active") {
    const loginUrl = new URL("/admin/login", request.url);
    const returnDestination = pathname + search;
    if (returnDestination && returnDestination !== "/admin") {
      loginUrl.searchParams.set("from", returnDestination);
    }

    const response = NextResponse.redirect(loginUrl);
    // Purge invalid/stale cookie if present
    if (token) {
      response.cookies.delete(AUTH_COOKIE_NAME);
    }
    return response;
  }

  // 3. User is valid and authenticated: Forward identity headers to Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.sub || "");
  requestHeaders.set("x-user-email", payload.email || "");
  requestHeaders.set("x-user-role", payload.role || "");
  if (payload.name) {
    requestHeaders.set("x-user-name", encodeURIComponent(payload.name));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

export default proxy;
