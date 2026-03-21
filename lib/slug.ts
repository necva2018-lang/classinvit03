/** 產生 URL 友善 slug；若無拉丁字元則退回時間戳後綴 */
export function slugifyTitle(title: string): string {
  const t = title.trim();
  const ascii = t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (ascii.length >= 3) return ascii.slice(0, 80);
  const fallback = `course-${Date.now().toString(36)}`;
  return ascii ? `${ascii}-${fallback}` : fallback;
}
