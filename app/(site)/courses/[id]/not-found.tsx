import Link from "next/link";

export default function CourseNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-xl font-bold text-zinc-900">找不到課程</h1>
      <p className="mt-2 text-sm text-zinc-600">
        此 ID 不存在，或資料庫中尚無該課程。
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
