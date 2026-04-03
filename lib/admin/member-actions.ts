"use server";

import { assertAdminSession } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function safeReturnTo(raw: FormDataEntryValue | null, fallback: string): string {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v || !v.startsWith("/")) return fallback;
  return v;
}

function revalidateMemberPaths(memberId: string) {
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/dashboard");
}

export async function updateMemberRoleAction(formData: FormData) {
  await assertAdminSession();

  const memberId = String(formData.get("memberId") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/admin/members");
  if (!memberId) throw new Error("缺少會員 ID");
  if (!(roleRaw in Role)) throw new Error("角色不合法");
  const role = roleRaw as Role;

  await prisma.user.update({
    where: { id: memberId },
    data: { role },
  });
  revalidateMemberPaths(memberId);
  redirect(returnTo);
}

export async function toggleMemberActiveAction(formData: FormData) {
  await assertAdminSession();

  const memberId = String(formData.get("memberId") ?? "").trim();
  const nextActiveRaw = String(formData.get("nextActive") ?? "").trim();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/admin/members");
  if (!memberId) throw new Error("缺少會員 ID");
  const nextActive = nextActiveRaw === "true";

  await prisma.user.update({
    where: { id: memberId },
    data: { isActive: nextActive },
  });
  revalidateMemberPaths(memberId);
  redirect(returnTo);
}

export async function adminResetMemberPasswordAction(formData: FormData) {
  await assertAdminSession();

  const memberId = String(formData.get("memberId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeReturnTo(formData.get("returnTo"), "/admin/members");
  if (!memberId) throw new Error("缺少會員 ID");
  if (password.trim().length < 8) {
    throw new Error("密碼至少 8 個字元");
  }
  if (password.length > 128) {
    throw new Error("密碼過長");
  }

  await prisma.user.update({
    where: { id: memberId },
    data: { passwordHash: await hashPassword(password.trim()) },
  });
  revalidateMemberPaths(memberId);
  redirect(returnTo);
}
