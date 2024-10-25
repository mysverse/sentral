import { NextResponse } from "next/server";
import { auth } from "auth";
import { NextAuthRequest } from "next-auth/lib";

export default auth(async (request: NextAuthRequest) => {
  const url = request.nextUrl.clone();

  // Remove unwanted characters like ")", "*", etc., from the path
  const sanitizedPath = url.pathname.replace(/[^\w/-]/g, "");
  if (sanitizedPath !== url.pathname) {
    url.pathname = sanitizedPath;
    return NextResponse.redirect(url); // Redirect only if the path was actually modified
  }

  // Redirect unauthenticated users to login, except if they are already on login page
  if (!request.auth && url.pathname !== "/auth/login") {
    const originalPathname = url.pathname;
    url.pathname = `/auth/login`;
    url.searchParams.set("callbackUrl", originalPathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from root to /dashboard, only if not already there
  if (request.auth && url.pathname === "/") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/dashboard", "/dashboard/:path*"]
};
