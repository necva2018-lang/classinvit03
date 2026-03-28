"use server";

import { prisma } from "@/lib/db";
import { getAllSiteSettingKeys } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";

export type SaveSiteSettingsState = { ok: boolean; message: string } | null;

export async function saveSiteSettings(
  _prev: SaveSiteSettingsState,
  formData: FormData,
): Promise<SaveSiteSettingsState> {
  try {
    const keys = getAllSiteSettingKeys();
    for (const key of keys) {
      const raw = formData.get(key);
      const value = raw == null ? "" : String(raw);
      await prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/settings");

    return { ok: true, message: "設定已儲存，首頁等頁面已更新快取。" };
  } catch {
    return { ok: false, message: "儲存失敗，請確認資料庫已 migrate 後再試。" };
  }
}
