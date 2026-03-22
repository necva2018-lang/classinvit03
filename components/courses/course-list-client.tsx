"use client";

import { CourseCard } from "@/components/course/CourseCard";
import {
  COURSE_FILTER_OPTIONS,
  type CourseFilterTagId,
  PRICE_FILTER_OPTIONS,
  type PriceFilterId,
  type SortMode,
} from "@/lib/course-filters";
import { isCourseFilterTagId } from "@/lib/course-filters";
import type { Course } from "@/lib/types/course";
import { Filter, Loader2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function matchesPrice(sale: number, tier: PriceFilterId): boolean {
  if (tier === "all") return true;
  if (tier === "under2000") return sale <= 2000;
  if (tier === "2000to3000") return sale > 2000 && sale <= 3000;
  return sale > 3000;
}

export function CourseListClient() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<Set<CourseFilterTagId>>(
    () => new Set(),
  );
  const [priceTier, setPriceTier] = useState<PriceFilterId>("all");
  const [sort, setSort] = useState<SortMode>("default");

  const tagParam = searchParams.get("tag");
  useEffect(() => {
    if (tagParam && isCourseFilterTagId(tagParam)) {
      setSelectedTags(new Set([tagParam]));
      return;
    }
    if (tagParam !== null) {
      setSelectedTags(new Set());
    }
  }, [tagParam]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const res = await fetch("/api/courses");
        const json = (await res.json()) as {
          data?: Course[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(json.error ?? `載入失敗（HTTP ${res.status}）`);
          setCourses([]);
        } else {
          setCourses(json.data ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "載入失敗");
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTag = (id: CourseFilterTagId) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearCategories = () => setSelectedTags(new Set());

  const filteredSorted = useMemo(() => {
    let list = courses.filter((c) => {
      if (selectedTags.size > 0) {
        const hit = c.filterTags.some((t) => selectedTags.has(t));
        if (!hit) return false;
      }
      return matchesPrice(c.priceSale, priceTier);
    });

    list = [...list];
    if (sort === "popular") {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sort === "priceAsc") {
      list.sort((a, b) => a.priceSale - b.priceSale);
    }

    return list;
  }, [courses, selectedTags, priceTier, sort]);

  const sortButtons: { id: SortMode; label: string }[] = [
    { id: "default", label: "綜合排序" },
    { id: "popular", label: "熱門程度" },
    { id: "priceAsc", label: "價格由低到高" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-zinc-500">
        <Loader2 className="size-8 animate-spin text-necva-primary" aria-hidden />
        <p className="text-sm">載入課程資料…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-sm text-amber-900">
        <p className="font-semibold">無法載入課程</p>
        <p className="mt-2 text-amber-800/90">{loadError}</p>
        <p className="mt-4 text-xs text-amber-800/80">
          請確認根目錄 <code className="rounded bg-white/80 px-1">.env</code> 已設定{" "}
          <code className="rounded bg-white/80 px-1">DATABASE_URL</code>，並已執行{" "}
          <code className="rounded bg-white/80 px-1">npx prisma migrate deploy</code>{" "}
          與 <code className="rounded bg-white/80 px-1">npm run db:seed</code>
          建立資料表與種子。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:w-64 xl:w-72">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Filter className="size-4 text-necva-primary" aria-hidden />
            <h2 className="text-sm font-bold text-zinc-900">篩選條件</h2>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                課程分類
              </h3>
              {selectedTags.size > 0 && (
                <button
                  type="button"
                  onClick={clearCategories}
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-necva-primary hover:underline"
                >
                  <X className="size-3" aria-hidden />
                  清除
                </button>
              )}
            </div>
            <ul className="mt-3 space-y-1">
              {COURSE_FILTER_OPTIONS.map((opt) => {
                const active = selectedTags.has(opt.id);
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => toggleTag(opt.id)}
                      aria-pressed={active}
                      className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "bg-necva-primary/10 font-medium text-necva-primary ring-1 ring-necva-primary/25"
                          : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-zinc-400">
              可複選；未選任何分類時顯示全部課程。
            </p>
          </div>

          <div className="mt-6 border-t border-zinc-100 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              價格區間（特價）
            </h3>
            <ul className="mt-3 space-y-1" role="radiogroup" aria-label="價格區間">
              {PRICE_FILTER_OPTIONS.map((opt) => {
                const active = priceTier === opt.id;
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setPriceTier(opt.id)}
                      className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "bg-necva-accent/10 font-medium text-necva-accent ring-1 ring-necva-accent/30"
                          : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            共{" "}
            <span className="font-semibold text-zinc-900">
              {filteredSorted.length}
            </span>{" "}
            門課程
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="排序方式"
          >
            {sortButtons.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSort(b.id)}
                aria-pressed={sort === b.id}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  sort === b.id
                    ? "bg-necva-primary text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {filteredSorted.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center">
            <p className="text-sm font-medium text-zinc-700">
              {courses.length === 0
                ? "資料庫中尚無課程"
                : "沒有符合條件的課程"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {courses.length === 0
                ? "請在 PostgreSQL 執行種子 SQL 或新增資料列。"
                : "請調整左側分類或價格篩選。"}
            </p>
            {courses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearCategories();
                  setPriceTier("all");
                }}
                className="mt-4 text-sm font-semibold text-necva-primary hover:underline"
              >
                重設所有篩選
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSorted.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
