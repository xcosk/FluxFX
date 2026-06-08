import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fluxfx-dev-secret"
);

const publicPaths = ["/login", "/register"];
const publicApiPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/health/db",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("fluxfx-session")?.value;
  let payload: Record<string, unknown> | null = null;

  if (token) {
    try {
      const result = await jwtVerify(token, SECRET);
      payload = result.payload as Record<string, unknown>;
    } catch {
      payload = null;
    }
  }

  const isAuthenticated = !!payload;
  const isBlocked = payload?.blocked === true;
  const isAdmin = payload?.role === "ADMIN";

  const isPublic =
    publicPaths.includes(pathname) || publicApiPaths.includes(pathname);

  if (isBlocked && !isPublic) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("fluxfx-session");
    return response;
  }

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
