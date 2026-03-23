import { DashboardCategoryChart } from "@/components/admin/dashboard-category-chart";
import { DashboardQuickActions } from "@/components/admin/dashboard-quick-actions";
import { DashboardRecentActivity } from "@/components/admin/dashboard-recent-activity";
import {
  dashboardLoadHints,
  getDashboardSnapshotSafe,
} from "@/lib/admin/dashboard-queries";
import { isDatabaseConfigured } from "@/lib/env";
import { DollarSign, PieChartIcon, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "儀表板",
};

function formatTwd(n: number) {
  return `NT$${Math.round(n).toLocaleString("zh-TW")}`;
}

export default async function AdminDashboardPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">未設定資料庫</p>
        <p className="mt-2 text-amber-800/90">
          請設定 <code className="rounded bg-white/80 px-1">DATABASE_URL</code> 後重新整理。
        </p>
      </div>
    );
  }

  const result = await getDashboardSnapshotSafe();
  if (!result.ok) {
    const hints = dashboardLoadHints(result.errorRaw ?? result.error);
    const showTech =
      process.env.NODE_ENV === "development" &&
      result.errorRaw &&
      result.errorRaw !== result.error;
    return (
      <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        <p className="font-semibold">無法載入統計資料</p>
        <p className="text-destructive/90">
          下列為資料庫連線／Prisma 回報重點（已略過編譯器路徑雜訊）。Zeabur 同專案部署請確認 Web
          已綁定 DB 且 DATABASE_URL 為內網字串；本機連雲端才需公網連線與 SSL。
        </p>
        <div className="rounded-md border border-destructive/20 bg-background/80 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
          {result.error}
        </div>
        {showTech ? (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer select-none text-foreground">
              完整技術訊息（開發用）
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded border border-border bg-muted/40 p-2 text-[11px] leading-snug whitespace-pre-wrap break-all">
              {result.errorRaw}
            </pre>
          </details>
        ) : null}
        <ul className="list-inside list-disc space-y-1.5 text-xs text-destructive/95">
          {hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    );
  }
  const snap = result.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          營運儀表板
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          關鍵指標、課程結構與即時動態一次掌握。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="size-4 text-emerald-600" aria-hidden />
            總營收（估）
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {formatTwd(snap.totalRevenue)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            依每筆購買對應課程目前牌價／特價加總估算
          </p>
        </article>
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="size-4 text-primary" aria-hidden />
            本月新增學員
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {snap.newStudentsThisMonth.toLocaleString("zh-TW")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            角色為 STUDENT、於本月建立之帳號
          </p>
        </article>
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <PieChartIcon className="size-4 text-violet-600" aria-hidden />
            課程分類
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {snap.categorySlices.reduce((a, s) => a + s.value, 0).toLocaleString("zh-TW")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">全站課程總數（右側圓餅圖）</p>
        </article>
      </div>

      <DashboardQuickActions />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <DashboardCategoryChart data={snap.categorySlices} />
        <DashboardRecentActivity items={snap.recentActivity} />
      </div>
    </div>
  );
}
