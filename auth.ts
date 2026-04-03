import { resolveAuthSecret } from "@/lib/auth-secret";
import { getAuditRequestMeta } from "@/lib/audit/request-meta";
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
      async authorize(credentials, request) {
        const { prisma } = await import("@/lib/db");
        const meta = getAuditRequestMeta(request);

        async function logAttempt(params: {
          emailInput?: string | null;
          userId?: string | null;
          status: "SUCCESS" | "FAIL";
          failureCode?:
            | "INVALID_INPUT"
            | "USER_NOT_FOUND"
            | "PASSWORD_NOT_SET"
            | "INVALID_PASSWORD"
            | "USER_DISABLED";
        }) {
          try {
            await prisma.authLoginLog.create({
              data: {
                userId: params.userId ?? null,
                emailInput: params.emailInput ?? null,
                status: params.status,
                failureCode:
                  params.status === "FAIL" ? params.failureCode : null,
                ipHash: meta.ipHash,
                userAgent: meta.userAgent,
              },
            });
          } catch (e) {
            console.error("[auth] 寫入 AuthLoginLog 失敗", e);
          }
        }

        const emailRaw = credentials?.email;
        const passwordRaw = credentials?.password;
        const normalizedEmailForLog =
          typeof emailRaw === "string"
            ? emailRaw.trim().toLowerCase().slice(0, 320)
            : null;
        if (typeof emailRaw !== "string" || typeof passwordRaw !== "string") {
          await logAttempt({
            emailInput: normalizedEmailForLog,
            status: "FAIL",
            failureCode: "INVALID_INPUT",
          });
          return null;
        }
        const email = emailRaw.trim().toLowerCase();
        const password = passwordRaw.trim();
        if (!email || !password) {
          await logAttempt({
            emailInput: normalizedEmailForLog,
            status: "FAIL",
            failureCode: "INVALID_INPUT",
          });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          await logAttempt({
            emailInput: email,
            status: "FAIL",
            failureCode: "USER_NOT_FOUND",
          });
          return null;
        }

        if (!user.isActive) {
          await logAttempt({
            emailInput: email,
            userId: user.id,
            status: "FAIL",
            failureCode: "USER_DISABLED",
          });
          return null;
        }

        if (!user.passwordHash) {
          await logAttempt({
            emailInput: email,
            userId: user.id,
            status: "FAIL",
            failureCode: "PASSWORD_NOT_SET",
          });
          return null;
        }

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) {
          await logAttempt({
            emailInput: email,
            userId: user.id,
            status: "FAIL",
            failureCode: "INVALID_PASSWORD",
          });
          return null;
        }

        await logAttempt({
          emailInput: email,
          userId: user.id,
          status: "SUCCESS",
        });

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
