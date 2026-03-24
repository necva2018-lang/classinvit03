const FALLBACK_ORIGIN = "http://localhost:3000";

/**
 * 解析 NEXT_PUBLIC_SITE_URL。
 * 空字串、僅空白、或無效 URL 時回傳本機 fallback，避免 `new URL("")` 在正式環境炸掉整站。
 */
export function siteOriginFromEnv(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_ORIGIN;
  try {
    const u = new URL(raw);
    return u.origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

/** 供 Metadata.metadataBase 使用（須為合法 URL） */
export function metadataBaseFromEnv(): URL {
  const origin = siteOriginFromEnv();
  try {
    return new URL(origin.endsWith("/") ? origin : `${origin}/`);
  } catch {
    return new URL(`${FALLBACK_ORIGIN}/`);
  }
}
