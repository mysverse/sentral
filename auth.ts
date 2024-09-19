import NextAuth, { DefaultSession, Profile } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken: string;
    error?: "RefreshTokenError";
  }
}

interface RobloxProfile {
  name: string;
  nickname: string;
  preferred_username: string;
  created_at: number;
  profile: string;
  picture: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "roblox",
      name: "Roblox",
      issuer: "https://apis.roblox.com/oauth/",
      type: "oidc",
      clientId: process.env.ROBLOX_CLIENT_ID,
      clientSecret: process.env.ROBLOX_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid profile group:read" }
      },
      client: {
        authorization_signed_response_alg: "ES256",
        id_token_signed_response_alg: "ES256"
      },
      options: {
        timeout: 30 * 1000
      },
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username,
          nickname: profile.nickname,
          picture: profile.picture
        };
      }
    }
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      type DerivedProfile = Profile & RobloxProfile;
      const derivedProfile = profile as DerivedProfile;
      if (account) {
        token.sub = account.providerAccountId;
        token.picture = derivedProfile?.picture;
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token
        };
      } else if (token.exp && Date.now() < token.exp * 1000) {
        // Subsequent logins, but the `access_token` is still valid
        return token;
      } else {
        // Subsequent logins, but the `access_token` has expired, try to refresh it
        if (!token.refresh_token) throw new TypeError("Missing refresh_token");

        try {
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch(
            "https://apis.roblox.com/oauth/v1/token",
            {
              method: "POST",
              body: new URLSearchParams({
                client_id: process.env.ROBLOX_CLIENT_ID!,
                client_secret: process.env.ROBLOX_CLIENT_SECRET!,
                grant_type: "refresh_token",
                refresh_token: token.refresh_token!.toString()
              })
            }
          );

          const tokensOrError = await response.json();

          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          token.access_token = newTokens.access_token;
          token.expires_at = Math.floor(
            Date.now() / 1000 + newTokens.expires_in
          );
          // Some providers only issue refresh tokens once, so preserve if we did not get a new one
          if (newTokens.refresh_token)
            token.refresh_token = newTokens.refresh_token;

          return token;
        } catch (error) {
          console.error("Error refreshing access_token", error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          token.error = "RefreshTokenError";
          return token;
        }
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.access_token && typeof token.access_token === "string") {
          session.accessToken = token.access_token;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login"
  },
  events: {
    signIn({ profile }) {
      console.log(profile);
    }
  }
});
