import { prisma } from "@/lib/db";

/** 前台 Footer 等使用；與後台設定頁查詢分檔，避免 Turbopack 誤併 admin 模組。 */
export async function getSiteSettingsByKeys(
  keys: string[],
): Promise<Partial<Record<string, string>>> {
  if (keys.length === 0) return {};
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
