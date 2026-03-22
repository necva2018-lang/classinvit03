import { prisma } from "@/lib/db";
import { getAllSiteSettingKeys } from "@/lib/site-settings";

export async function getSiteSettingsMap(): Promise<Record<string, string>> {
  const keys = getAllSiteSettingKeys();
  const map = Object.fromEntries(keys.map((k) => [k, ""])) as Record<
    string,
    string
  >;

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
  });

  for (const r of rows) {
    if (keys.includes(r.key)) map[r.key] = r.value;
  }

  return map;
}
