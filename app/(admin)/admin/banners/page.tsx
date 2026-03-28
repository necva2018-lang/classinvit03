import { BannersManager } from "@/components/admin/banners-manager";
import { getAllBannersForAdmin } from "@/lib/admin/banner-queries";
import { isDatabaseConfigured } from "@/lib/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "首頁輪播",
};

export default async function AdminBannersPage() {
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

  let initialRows;
  try {
    const rows = await getAllBannersForAdmin();
    initialRows = rows.map((r) => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      imageUrl: r.imageUrl,
      videoUrl: r.videoUrl,
      linkUrl: r.linkUrl,
      linkLabel: r.linkLabel,
      order: r.order,
      isActive: r.isActive,
    }));
  } catch (e) {
    console.error("[admin/banners] getAllBannersForAdmin failed:", e);
    const detail =
      process.env.NODE_ENV === "development" && e instanceof Error
        ? e.message
        : null;
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        <p className="font-semibold">無法讀取 Banner</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-destructive/90">
          <li>
            資料庫：執行{" "}
            <code className="rounded bg-background px-1">npx prisma migrate deploy</code>
            ，需含{" "}
            <code className="rounded bg-background px-1">20250326140000_banner</code>。
          </li>
          <li>
            若錯誤含 <code className="rounded bg-background px-1">findMany</code> 與{" "}
            <code className="rounded bg-background px-1">undefined</code>
            ：執行{" "}
            <code className="rounded bg-background px-1">npx prisma generate</code>
            ，刪除 <code className="rounded bg-background px-1">.next</code> 後重新啟動{" "}
            <code className="rounded bg-background px-1">next dev</code>
            （專案已將 Prisma 設為 server external，避免 Turbopack 用到舊 Client）。
          </li>
        </ul>
        {detail ? (
          <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-background p-3 text-xs text-foreground">
            {detail}
          </pre>
        ) : null}
      </div>
    );
  }

  return <BannersManager initialRows={initialRows} />;
}
