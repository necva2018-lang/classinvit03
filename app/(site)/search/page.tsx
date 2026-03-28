import { fetchCourses, fetchPublicCategories } from "@/lib/courses-queries";
import { isDatabaseConfigured } from "@/lib/env";
import { searchContent } from "@/lib/search";
import type { Course } from "@/lib/types/course";
import type { Metadata } from "next";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const raw = (q ?? "").trim();
  return {
    title: raw ? `「${raw}」的搜尋結果` : "搜尋課程",
    description: raw
      ? `搜尋「${raw}」：NECVA 課程與學習分類。`
      : "搜尋 NECVA 課程、講師與學習主題。",
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  let courses: Course[] = [];
  let dbCategories: { id: string; name: string }[] = [];
  if (isDatabaseConfigured()) {
    try {
      const [res, catRes] = await Promise.all([
        fetchCourses(),
        fetchPublicCategories(),
      ]);
      if (!res.error) courses = res.data;
      if (!catRes.error) dbCategories = catRes.data;
    } catch {
      courses = [];
    }
  }

  const hits = searchContent(query, courses, dbCategories);

  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-necva-primary">搜尋課程與分類</h1>
      <p className="mt-2 text-sm text-zinc-600">
        {query
          ? `關鍵字「${query}」的結果（課程來自 PostgreSQL）。`
          : "輸入關鍵字搜尋課程名稱、講師或學習主題。"}
      </p>

      <form
        action="/search"
        method="get"
        className="mt-8 flex gap-2"
        role="search"
      >
        <label className="sr-only" htmlFor="search-page-q">
          搜尋關鍵字
        </label>
        <input
          id="search-page-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="例如：Python、行銷、UI…"
          className="min-h-11 flex-1 rounded-full border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-necva-primary/50 focus:ring-2 focus:ring-necva-primary/20"
          autoComplete="off"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-necva-primary px-5 text-sm font-semibold text-white transition hover:bg-necva-primary/90"
        >
          搜尋
        </button>
      </form>

      {query && (
        <section className="mt-10" aria-label="搜尋結果">
          {hits.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
              找不到符合的課程或分類。試試其他關鍵字，或
              <Link
                href="/courses"
                className="font-medium text-necva-primary hover:underline"
              >
                瀏覽全部課程
              </Link>
              。
            </p>
          ) : (
            <ul className="space-y-3">
              {hits.map((h) => (
                <li key={`${h.kind}-${h.title}-${h.href}`}>
                  <Link
                    href={h.href}
                    className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-necva-primary/30 hover:shadow-sm"
                  >
                    <span className="text-xs font-medium text-necva-accent">
                      {h.kind === "course" ? "課程" : "分類"}
                    </span>
                    <span className="mt-1 block font-semibold text-zinc-900">
                      {h.title}
                    </span>
                    {h.subtitle && (
                      <span className="mt-0.5 block text-sm text-zinc-500">
                        {h.subtitle}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
