import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export default withAuth(
  async (req) => {
    // Obtain the token to check if the user is authenticated
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If the user is at the root path and authenticated, redirect to /dashboard
    if (req.nextUrl.pathname === "/" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    // Matches the pages config in `[...nextauth]`
    pages: {
      signIn: "/auth/login"
    }
  }
);

export const config = {
  matcher: ["/", "/dashboard", "/dashboard/:path*"]
};
