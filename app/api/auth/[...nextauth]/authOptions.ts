import { DefaultSession, NextAuthOptions, Profile } from "next-auth";
import { env } from "process";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
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

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/login"
  },
  providers: [
    {
      id: "roblox",
      name: "Roblox",
      wellKnown:
        "https://apis.roblox.com/oauth/.well-known/openid-configuration",
      type: "oauth",
      clientId: env.ROBLOX_CLIENT_ID,
      clientSecret: env.ROBLOX_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid profile" }
      },
      client: {
        authorization_signed_response_alg: "ES256",
        id_token_signed_response_alg: "ES256"
      },
      httpOptions: {
        timeout: 30 * 1000
      },
      checks: ["pkce", "state", "nonce"],
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
    jwt({ token, account, profile }) {
      type DerivedProfile = Profile & RobloxProfile;
      const derivedProfile = profile as DerivedProfile;
      if (account) {
        token.accessToken = account.access_token;
        token.picture = derivedProfile?.picture;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  events: {
    signIn({ profile }) {
      console.log(profile);
    }
  }
};
