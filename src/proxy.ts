import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(COOKIE_NAME)?.value);
  if (!session) {
    // There's no dedicated /portal/login page anymore — the sign-in UI is
    // the modal on the marketing site, opened via ?auth=login. The modal
    // only exists on the (marketing) layout, so this has to bounce to the
    // homepage rather than back to the protected path that was requested.
    return NextResponse.redirect(new URL("/?auth=login", request.url));
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
