import { CourseCard } from "@/components/course/CourseCard";
import { fetchCourses } from "@/lib/courses-queries";
import { isDatabaseConfigured } from "@/lib/env";
import type { Course } from "@/lib/types/course";
import Link from "next/link";

export async function PopularCoursesSection() {
  let preview: Course[] = [];

  if (isDatabaseConfigured()) {
    try {
      const res = await fetchCourses();
      if (!res.error) {
        preview = res.data.slice(0, 8);
      }
    } catch {
      preview = [];
    }
  }

  return (
    <section
      id="courses"
      className="scroll-mt-20 bg-zinc-50 py-14 sm:scroll-mt-24 sm:py-16"
      aria-labelledby="popular-courses-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="popular-courses-heading"
              className="text-2xl font-bold text-necva-primary sm:text-3xl"
            >
              熱門課程
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              資料來源：Zeabur PostgreSQL + Prisma（請設定 .env 的 DATABASE_URL）
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/courses"
              className="text-sm font-semibold text-necva-primary hover:underline"
            >
              瀏覽全部課程
            </Link>
            <Link
              href="/search"
              className="text-sm font-semibold text-necva-accent hover:underline"
            >
              進階搜尋
            </Link>
          </div>
        </div>

        {preview.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500">
            尚未載入課程。請在{" "}
            <code className="rounded bg-zinc-100 px-1">.env</code>{" "}
            設定 <code className="rounded bg-zinc-100 px-1">DATABASE_URL</code>
            ，並在資料庫執行{" "}
            <code className="rounded bg-zinc-100 px-1">prisma migrate deploy</code>{" "}
            與 <code className="rounded bg-zinc-100 px-1">npm run db:seed</code>
            。
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {preview.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
