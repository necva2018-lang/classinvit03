/** Open Graph／canonical 用：將相對路徑轉成絕對 URL */
export function toAbsoluteUrl(href: string, siteOrigin: string): string {
  const t = href.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const origin = siteOrigin.replace(/\/$/, "");
  if (t.startsWith("/")) return `${origin}${t}`;
  return `${origin}/${t}`;
}

export function siteOriginFromEnv(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
