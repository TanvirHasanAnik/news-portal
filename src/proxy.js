import { NextResponse } from "next/server";
import { verifyJwtToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";



export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/category")) {
    const url = request.nextUrl.clone();
    const searchParams = url.searchParams;
    const keysToDelete = [];
    searchParams.forEach((_, key) => {
      if (key !== "sub" && key !== "page") {
        keysToDelete.push(key);
      }
    });
    if (keysToDelete.length > 0) {
      for (const key of keysToDelete) {
        searchParams.delete(key);
      }
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";


  if (!isAdminPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let payload = null;

  if (token) {
    payload = await verifyJwtToken(token);
  }



  if (isLoginPage) {
    return NextResponse.next();
  }


  if (!payload || payload.status !== "active") {
    const loginUrl = new URL("/admin/login", request.url);
    const returnDestination = pathname + search;
    if (returnDestination && returnDestination !== "/admin") {
      loginUrl.searchParams.set("from", returnDestination);
    }

    const response = NextResponse.redirect(loginUrl);

    if (token) {
      response.cookies.delete(AUTH_COOKIE_NAME);
    }
    return response;
  }


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
  matcher: ["/admin", "/admin/:path*", "/category/:path*"],
};

export default proxy;
