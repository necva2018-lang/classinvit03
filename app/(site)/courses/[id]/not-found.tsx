import Link from "next/link";

export default function CourseNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-xl font-bold text-zinc-900">找不到課程</h1>
      <p className="mt-2 text-sm text-zinc-600">
        可能原因：連結的課程 ID 有誤、資料庫尚未建立該筆資料，或課程仍為草稿／未勾選「已上架」（前台只顯示已上架課程）。
      </p>
      <p className="mt-3 text-xs text-zinc-500">
        後台編輯請改走「管理後台 → 課程」；若剛改過資料庫結構，請確認已執行{" "}
        <code className="rounded bg-zinc-100 px-1">prisma migrate</code> 並重啟開發伺服器。
      </p>
      <Link
        href="/courses"
        className="mt-6 rounded-full bg-necva-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-necva-primary/90"
      >
        返回課程列表
      </Link>
    </div>
  );
}
