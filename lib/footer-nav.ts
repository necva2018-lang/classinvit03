/** 解析頁尾「顯示文字|網址」多行設定（網址可為 /path 或 https://…） */
export function parseFooterLinkLines(raw: string | undefined | null): {
  label: string;
  href: string;
}[] {
  if (!raw?.trim()) return [];
  const out: { label: string; href: string }[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const pipe = t.indexOf("|");
    if (pipe === -1) {
      out.push({ label: t, href: "#" });
      continue;
    }
    const label = t.slice(0, pipe).trim();
    const href = t.slice(pipe + 1).trim() || "#";
    if (!label) continue;
    out.push({ label, href });
  }
  return out;
}

export function footerLanguageSwitcherOn(raw: string | undefined | null): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "on" || v === "yes";
}
