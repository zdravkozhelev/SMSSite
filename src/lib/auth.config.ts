import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config (no Prisma/Node imports) — used by middleware.
 * The full config in auth.ts extends this with the Credentials provider,
 * which needs Node APIs (bcrypt, Prisma) and can only run in Node runtime.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CLIENT";
      }
      return session;
    },
  },
};
