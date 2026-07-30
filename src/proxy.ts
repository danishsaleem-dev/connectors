import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/portal/login" || request.nextUrl.pathname === "/portal/register") {
    return NextResponse.next();
  }

  const session = await verifySessionToken(request.cookies.get(COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  // Belt and braces — every admin data-access path re-checks this itself too.
  if (request.nextUrl.pathname.startsWith("/portal/admin") && !session.isAdmin) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};
