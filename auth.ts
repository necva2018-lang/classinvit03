import { resolveAuthSecret } from "@/lib/auth-secret";
import { verifyPassword } from "@/lib/password";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Auth.js 必須有 secret 才能簽 JWT／讀 session；未設時 `/api/auth/session` 會回
 * 「server configuration」錯誤。正式站請務必設定 AUTH_SECRET（或 NEXTAUTH_SECRET）。
 */

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: resolveAuthSecret(),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const emailRaw = credentials?.email;
        const passwordRaw = credentials?.password;
        if (typeof emailRaw !== "string" || typeof passwordRaw !== "string") {
          return null;
        }
        const email = emailRaw.trim().toLowerCase();
        const password = passwordRaw.trim();
        if (!email || !password) return null;

        const { prisma } = await import("@/lib/db");
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.passwordHash) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role: string }).role;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
      }
      if (trigger === "update" && session?.user?.name !== undefined) {
        token.name = session.user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "STUDENT";
        session.user.email =
          (token.email as string | undefined) ?? session.user.email ?? null;
        session.user.name =
          (token.name as string | null | undefined) ?? null;
      }
      return session;
    },
  },
});
