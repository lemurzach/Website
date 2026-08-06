import { NextRequest, NextResponse } from "next/server";

// Optimistic check only — just whether a session cookie is present.
// Real authorization (and org scoping) happens per-route via auth().
const PUBLIC_PATHS = ["/sign-in"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes enforce their own auth and return a clean JSON 401 —
  // redirecting them to an HTML sign-in page would break fetch() callers.
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const hasSessionCookie =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (!hasSessionCookie) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
