/**
 * 伺服端 Prisma／外部依賴查詢逾時（避免 DATABASE_URL 不可達時整頁無限等待）。
 * 預設 12s；可環境變數覆寫（毫秒，僅數字）。
 */
export const DEFAULT_SERVER_QUERY_TIMEOUT_MS = 12_000;

export function getServerQueryTimeoutMs(): number {
  const raw = process.env.SERVER_QUERY_TIMEOUT_MS?.trim();
  if (!raw) return DEFAULT_SERVER_QUERY_TIMEOUT_MS;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 1000 && n <= 120_000 ? n : DEFAULT_SERVER_QUERY_TIMEOUT_MS;
}

/** Promise.race 逾時；逾時後原 Promise 仍可能在背景執行，僅讓 await 盡快結束。 */
export function withServerQueryTimeout<T>(
  promise: Promise<T>,
  ms = getServerQueryTimeoutMs(),
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timed = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `資料庫查詢逾時（${ms}ms）。請檢查 DATABASE_URL、網路與防火牆；可在連線字串加上 ?connect_timeout=10（秒）。`,
        ),
      );
    }, ms);
  });
  return Promise.race([promise, timed]).finally(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }) as Promise<T>;
}
