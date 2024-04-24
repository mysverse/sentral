import NextAuth, { DefaultSession } from "next-auth";
import { env } from "process";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// interface RobloxProfile {
//   name: string;
//   nickname: string;
//   preferred_username: string;
//   created_at: number;
//   profile: string;
//   picture: string;
// }

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "roblox",
      name: "Roblox",
      issuer: "https://apis.roblox.com/oauth/",
      type: "oidc",
      clientId: env.ROBLOX_CLIENT_ID,
      clientSecret: env.ROBLOX_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid profile" }
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
    async jwt({ token, account }) {
      // type DerivedProfile = Profile & RobloxProfile;
      // const derivedProfile = profile as DerivedProfile;
      if (account) {
        token.accessToken = account.access_token;
        token.sub = account.providerAccountId;
        // token.picture = derivedProfile?.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
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
