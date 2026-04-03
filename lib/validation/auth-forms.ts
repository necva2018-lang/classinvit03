import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "請填寫 Email")
  .email("Email 格式不正確")
  .max(254);

const passwordSchema = z
  .string()
  .min(8, "密碼至少 8 個字元")
  .max(128, "密碼過長");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "請填寫密碼"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().max(80).optional(),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string().min(1, "請再次輸入密碼"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "兩次密碼不一致",
    path: ["confirm"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
