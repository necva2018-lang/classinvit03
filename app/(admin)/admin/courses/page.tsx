import {
  CoursesDataTable,
  NewCourseButton,
} from "@/components/admin/courses-data-table";
import { getAdminCourseList } from "@/lib/admin/courses-server";
import { isDatabaseConfigured } from "@/lib/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "課程管理",
};

export default async function AdminCoursesPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">未設定資料庫</p>
        <p className="mt-2 text-amber-800/90">
          請在專案根目錄 <code className="rounded bg-white/80 px-1">.env</code>{" "}
          設定 <code className="rounded bg-white/80 px-1">DATABASE_URL</code>
          後重新整理。
        </p>
      </div>
    );
  }

  let rows;
  try {
    rows = await getAdminCourseList();
  } catch {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        無法讀取課程列表。請確認資料庫已執行{" "}
        <code className="rounded bg-background px-1">prisma migrate deploy</code>。
      </div>
    );
  }

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title,
    categoryName: r.category.name,
    price: r.price,
    priceOriginal: r.priceOriginal,
    rating: r.rating.toString(),
    instructorName: r.instructorName,
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            課程管理
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            點選列可進入編輯頁。共 {data.length} 門課程。
          </p>
        </div>
        <NewCourseButton />
      </div>
      <CoursesDataTable data={data} />
    </div>
  );
}
