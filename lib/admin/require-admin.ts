import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdminPage() {
  let session:
    | { user?: { id?: string | null; role?: string | null } }
    | null = null;
  try {
    session = (await auth()) as { user?: { id?: string | null; role?: string | null } } | null;
  } catch {
    session = null;
  }
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

export async function assertAdminSession(): Promise<{ userId: string }> {
  const session = (await auth()) as
    | { user?: { id?: string | null; role?: string | null } }
    | null;
  const userId = session?.user?.id;
  if (!userId || session?.user?.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return { userId };
}
