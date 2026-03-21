/** 伺服器端：Zeabur PostgreSQL 連線字串（勿使用 NEXT_PUBLIC_ 前綴） */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
