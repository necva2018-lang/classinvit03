/** 後台多行文字欄位 → 前台條列（每行一則） */
export function linesFromMultilineField(
  text: string | null | undefined,
  fallback: string[],
): string[] {
  if (!text?.trim()) return fallback;
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  return lines.length > 0 ? lines : fallback;
}

/** 僅使用後台填寫；未填或僅空白行則回傳空陣列（不套用站方預設） */
export function linesFromMultilineFieldStrict(
  text: string | null | undefined,
): string[] {
  if (!text?.trim()) return [];
  return text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}
