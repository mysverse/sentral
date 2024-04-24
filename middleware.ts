import { NextResponse } from "next/server";
import { auth } from "auth";

import { NextAuthRequest } from "next-auth/lib";

export default auth(async (request: NextAuthRequest) => {
  // If the user is at the root path and authenticated, redirect to /dashboard
  if (!request.auth) {
    const url = request.nextUrl.clone();
    const originalPathname = url.pathname;
    url.pathname = `/auth/login`;
    url.searchParams.set("callbackUrl", originalPathname);
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname === "/" && request.auth) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/dashboard", "/dashboard/:path*"]
};
