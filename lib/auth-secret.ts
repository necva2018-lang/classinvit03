/**
 * 僅讀環境變數，供 Edge middleware 與 Node 端 Auth 共用；勿在此檔 import Prisma／Node-only 模組。
 */
export function resolveAuthSecret(): string | undefined {
  const fromEnv =
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") {
    return "classinvit03-dev-only-insecure-secret-do-not-use-in-production";
  }
  return undefined;
}
