"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export function AuthSessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  /** 由伺服端 `auth()` 傳入，避免 NavAuth 等處 `useSession` 初次為 loading 造成 hydration 不一致 */
  session?: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
