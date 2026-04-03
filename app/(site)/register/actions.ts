"use server";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation/auth-forms";

export type RegisterState =
  | { ok: true }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<"name" | "email" | "password" | "confirm", string[]>>;
    };

export async function registerUserAction(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    confirm: formData.get("confirm") ?? "",
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "請修正表單欄位",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;
  const normalized = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    return { ok: false, message: "此 Email 已註冊" };
  }

  await prisma.user.create({
    data: {
      email: normalized,
      name: name?.trim() || null,
      passwordHash: await hashPassword(password),
      role: "STUDENT",
    },
  });

  return { ok: true };
}
