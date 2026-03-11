import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

// Added unprotected routes
const protectedRoutes = ["/dashboard", "/tickets/new"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  const sessionStr = req.cookies.get("session")?.value;
  const session = sessionStr ? await decrypt(sessionStr).catch(() => null) : null;

  // If session is invalid and it's a protected route, redirect to login
  if (isProtectedRoute && !session && path !== "/login" && path !== "/signup") {
    const redirectUrl = new URL("/login", req.nextUrl.origin);
    // Optional: add a ?from query param to redirect back
    // redirectUrl.searchParams.set("from", path);
    return NextResponse.redirect(redirectUrl);
  }

  // If session is valid and it's a login or signup page, redirect to dashboard or home
  if (session && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
}

// Routes to match
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
