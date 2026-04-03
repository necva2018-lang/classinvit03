import { auth } from "@/auth";

export async function getAdminUserIdForRoute(): Promise<string | null> {
  try {
    const session = (await auth()) as
      | { user?: { id?: string | null; role?: string | null } }
      | null;
    if (!session?.user?.id) return null;
    if (session.user.role !== "ADMIN") return null;
    return session.user.id;
  } catch {
    return null;
  }
}
