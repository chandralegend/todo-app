import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!sessionCookie;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isPublicPage = pathname.startsWith("/design");
  const isStatic = pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.endsWith(".ico");
  // Internal API routes that handle their own auth (cron uses x-cron-secret header, health is public)
  const isSelfAuthedApi = pathname.startsWith("/api/cron") || pathname.startsWith("/api/health");

  if (isStatic || isApiAuth || isPublicPage || isSelfAuthedApi) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
