import { handlers } from "@/auth";

/** Prisma / bcrypt 需在 Node 執行，避免誤用 Edge 導致 authorize 失敗 */
export const runtime = "nodejs";

export const { GET, POST } = handlers;
