import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettingsMap } from "@/lib/admin/site-settings-queries";
import { isDatabaseConfigured } from "@/lib/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "全站設定",
};

export default async function AdminSettingsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">未設定資料庫</p>
        <p className="mt-2 text-amber-800/90">
          請在專案根目錄 <code className="rounded bg-white/80 px-1">.env</code> 設定{" "}
          <code className="rounded bg-white/80 px-1">DATABASE_URL</code> 後重新整理。
        </p>
      </div>
    );
  }

  let initialValues: Record<string, string>;
  try {
    initialValues = await getSiteSettingsMap();
  } catch {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        無法讀取設定。請確認已執行{" "}
        <code className="rounded bg-background px-1">prisma migrate deploy</code>
        （需含 <code className="rounded bg-background px-1">SiteSetting</code> 資料表）。
      </div>
    );
  }

  return <SiteSettingsForm initialValues={initialValues} />;
}
