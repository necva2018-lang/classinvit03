/** 後台多行文字欄位 → 前台條列（每行一則） */
export function linesFromMultilineField(
  text: string | null | undefined,
  fallback: string[],
): string[] {
  if (!text?.trim()) return fallback;
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  return lines.length > 0 ? lines : fallback;
}
