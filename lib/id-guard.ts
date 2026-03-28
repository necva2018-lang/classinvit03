/** 與課程／分類 cuid 相容的寬鬆檢查（不含 Prisma，可供 Client 使用） */
export function isLikelyDbId(id: string): boolean {
  const t = id.trim();
  return t.length >= 8 && t.length <= 64 && /^[a-z][a-z0-9]*$/i.test(t);
}
