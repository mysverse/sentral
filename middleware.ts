import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Matches the pages config in `[...nextauth]`
  pages: {
    signIn: "/auth/login"
  }
});

export const config = {
  matcher: ["/", "/dashboard", "/dashboard/:path*"]
};
