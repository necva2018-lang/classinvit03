"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

export type ProfileActionState =
  | { ok: true; name?: string }
  | { ok: false; message: string };

export async function updateDisplayNameAction(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "未登入" };
  }
  const name = String(formData.get("name") ?? "").trim();
  if (name.length > 80) {
    return { ok: false, message: "暱稱請勿超過 80 字元" };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || null },
  });
  revalidatePath("/me/account");
  return { ok: true, name: name || "" };
}

export async function changePasswordAction(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "未登入" };
  }
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (!current) {
    return { ok: false, message: "請填寫目前密碼" };
  }
  if (next.length < 8) {
    return { ok: false, message: "新密碼至少 8 個字元" };
  }
  if (next !== confirm) {
    return { ok: false, message: "兩次新密碼不一致" };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return { ok: false, message: "此帳號未設定密碼，無法在此變更" };
  }
  const match = await verifyPassword(current, user.passwordHash);
  if (!match) {
    return { ok: false, message: "目前密碼不正確" };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(next) },
  });
  revalidatePath("/me/account");
  return { ok: true };
}
