import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:8000";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && user?.email) {
        try {
          const res = await fetch(`${apiUrl}/auth/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name ?? (profile as { name?: string } | undefined)?.name,
              image: user.image,
              provider: account.provider,
            }),
          });
          if (res.ok) {
            const data = (await res.json()) as { access_token: string };
            token.backendToken = data.access_token;
          }
        } catch {
          // backend exchange optional during dev
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as { backendToken?: string }).backendToken = token.backendToken as
        | string
        | undefined;
      return session;
    },
  },
};
