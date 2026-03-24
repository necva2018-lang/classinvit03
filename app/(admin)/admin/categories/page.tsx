import { CategoriesManager } from "@/components/admin/categories-manager";
import { getAllCategoriesForAdmin } from "@/lib/admin/category-queries";
import { isDatabaseConfigured } from "@/lib/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "課程類別",
};

export default async function AdminCategoriesPage() {
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
    const rows = await getAllCategoriesForAdmin();
    initialRows = rows.map((r) => ({
      id: r.id,
      name: r.name,
      sortOrder: r.sortOrder,
      courseCount: r._count.courses,
    }));
  } catch {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        無法讀取類別列表。請確認資料庫已執行{" "}
        <code className="rounded bg-background px-1">prisma migrate deploy</code>。
      </div>
    );
  }

  return <CategoriesManager initialRows={initialRows} />;
}
