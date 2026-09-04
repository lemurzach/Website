import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/session";

const SESSION_COOKIE = "aegis_bay_session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isLoginRoute = path === "/admin/login";
  const isAdminRoute = path.startsWith("/admin") && !isLoginRoute;

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await decryptSession(cookie);

  if (isAdminRoute && !session?.admin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLoginRoute && session?.admin) {
    return NextResponse.redirect(new URL("/admin/heroes", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
