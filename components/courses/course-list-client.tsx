"use client";

import { CourseCard } from "@/components/course/CourseCard";
import {
  type CourseFilterTagId,
  PRICE_FILTER_OPTIONS,
  type PriceFilterId,
  type SortMode,
} from "@/lib/course-filters";
import { isCourseFilterTagId } from "@/lib/course-filters";
import { courseUsesCommerceListingFields } from "@/lib/course-cta";
import { isLikelyDbId } from "@/lib/id-guard";
import type { Course } from "@/lib/types/course";
import { Filter, Loader2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function matchesPrice(
  course: Course,
  tier: PriceFilterId,
): boolean {
  if (tier === "all") return true;
  if (!courseUsesCommerceListingFields(course.ctaKind)) return false;
  const sale = course.priceSale;
  if (tier === "under2000") return sale <= 2000;
  if (tier === "2000to3000") return sale > 2000 && sale <= 3000;
  return sale > 3000;
}

/** API 回傳的 Prisma 訊息常含編譯器路徑，僅顯示連線重點 */
function simplifyCoursesApiError(raw: string): string {
  const i = raw.indexOf("Can't reach database server");
  if (i >= 0) {
    const tail = raw.slice(i).replace(/\s+/g, " ").trim();
    return tail.slice(0, 420);
  }
  return raw.length > 600 ? `${raw.slice(0, 500)}…` : raw;
}

function zeaburMissingDatabaseUrlHints(): string[] {
  return [
    "此訊息代表：Zeabur 上「正在跑網站的那個 Web 容器」沒有環境變數 DATABASE_URL。與你電腦專案根目錄的 .env 無關（.env 不會被上傳到 GitHub）。",
    "請到 Zeabur → 你的專案 → 選 Next.js「Web」服務 → Variables（或 Connection / Bind）：把同一專案內的 PostgreSQL 綁定到 Web，讓平台自動寫入 DATABASE_URL；或手動新增變數 DATABASE_URL，值用 PostgreSQL 提供的連線字串（同專案建議用 Internal／內網）。",
    "儲存後務必對 Web 服務按「重新部署 Redeploy」或重啟，再重新整理課程頁。",
    "若變數已填仍 503：檢查該變數是否只在 Build 階段生效、Runtime 沒有（依 Zeabur 介面勾選「執行階段可用」或同等選項）。",
    "補充：migrate deploy / db:seed 是「資料庫裡要有表與資料」；必須在 DATABASE_URL 已生效、且能連線之後才會成功。",
  ];
}

function coursesLoadErrorHints(raw: string, httpStatus: number | null): string[] {
  const lower = raw.toLowerCase();
  if (
    httpStatus === 503 ||
    lower.includes("database_url_missing") ||
    lower.includes("未讀到 database_url") ||
    lower.includes("未設定 database_url")
  ) {
    return zeaburMissingDatabaseUrlHints();
  }
  if (
    lower.includes("can't reach database server") ||
    lower.includes("p1001") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout")
  ) {
    return [
      "你現在若是本機 `npm run dev`：電腦必須能連到該 IP:port。Zeabur「內網」DATABASE_URL 只給同專案容器用，貼在本機 .env 常會變成 Can't reach。請改用最後台 PostgreSQL 提供的「外網／Public」Connection String。",
      "Zeabur → PostgreSQL 服務 → 開啟 Public Networking（若尚未）→ 複製外網連線字串到專案根目錄 `.env` 的 `DATABASE_URL`，存檔後重啟 `npm run dev`。",
      "若仍失敗：在連線字串結尾試加 `?sslmode=require`；暫關 VPN、換網路或檢查防火牆。",
      "若只有「已部署的 https 網站」要顯示課程：請確認 Zeabur Web 已綁定 PostgreSQL（內網即可）；與你筆電上的 .env 無關。",
    ];
  }
  return [
    "請確認已對同一資料庫執行 `npx prisma migrate deploy`（建立資料表），需要示範課程可執行 `npm run db:seed`。",
  ];
}

type PublicCategoryOption = { id: string; name: string };

export function CourseListClient() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<PublicCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorStatus, setLoadErrorStatus] = useState<number | null>(null);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedTags, setSelectedTags] = useState<Set<CourseFilterTagId>>(
    () => new Set(),
  );
  const [priceTier, setPriceTier] = useState<PriceFilterId>("all");
  const [sort, setSort] = useState<SortMode>("default");

  const catParam = searchParams.get("cat");
  const tagParam = searchParams.get("tag");
  useEffect(() => {
    const cat = catParam?.trim();
    if (cat && isLikelyDbId(cat)) {
      setSelectedCategoryIds(new Set([cat]));
      setSelectedTags(new Set());
      return;
    }
    if (tagParam && isCourseFilterTagId(tagParam)) {
      setSelectedTags(new Set([tagParam]));
      setSelectedCategoryIds(new Set());
      return;
    }
    if (catParam !== null || tagParam !== null) {
      setSelectedCategoryIds(new Set());
      setSelectedTags(new Set());
    }
  }, [catParam, tagParam]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setLoadErrorStatus(null);

      try {
        const res = await fetch("/api/courses");
        const json = (await res.json()) as {
          data?: Course[];
          categories?: PublicCategoryOption[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setLoadErrorStatus(res.status);
          setLoadError(json.error ?? `載入失敗（HTTP ${res.status}）`);
          setCourses([]);
          setCategories([]);
        } else {
          setCourses(json.data ?? []);
          setCategories(Array.isArray(json.categories) ? json.categories : []);
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

  const toggleCategoryId = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearCategories = () => {
    setSelectedTags(new Set());
    setSelectedCategoryIds(new Set());
  };

  const filteredSorted = useMemo(() => {
    let list = courses.filter((c) => {
      const ids = c.categoryIds ?? [];
      if (selectedCategoryIds.size > 0) {
        const hit = ids.some((cid) => selectedCategoryIds.has(cid));
        if (!hit) return false;
      }
      if (selectedTags.size > 0) {
        const hit = c.filterTags.some((t) => selectedTags.has(t));
        if (!hit) return false;
      }
      return matchesPrice(c, priceTier);
    });

    list = [...list];
    if (sort === "popular") {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sort === "priceAsc") {
      list.sort((a, b) => {
        const aSale = courseUsesCommerceListingFields(a.ctaKind)
          ? a.priceSale
          : Number.POSITIVE_INFINITY;
        const bSale = courseUsesCommerceListingFields(b.ctaKind)
          ? b.priceSale
          : Number.POSITIVE_INFINITY;
        return aSale - bSale;
      });
    }

    return list;
  }, [courses, selectedCategoryIds, selectedTags, priceTier, sort]);

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
    const hints = coursesLoadErrorHints(loadError, loadErrorStatus);
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-sm text-amber-900">
        <p className="font-semibold">無法載入課程</p>
        <p className="mt-2 font-mono text-xs leading-relaxed text-amber-900/95">
          {simplifyCoursesApiError(loadError)}
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-xs text-amber-800/90">
          {hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
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
              {selectedCategoryIds.size + selectedTags.size > 0 && (
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
            {categories.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                尚無分類資料。請至後台「課程類別」建立，或確認 API 已回傳
                categories。
              </p>
            ) : (
              <ul className="mt-3 space-y-1">
                {categories.map((opt) => {
                  const active = selectedCategoryIds.has(opt.id);
                  return (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={() => toggleCategoryId(opt.id)}
                        aria-pressed={active}
                        className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          active
                            ? "bg-necva-primary/10 font-medium text-necva-primary ring-1 ring-necva-primary/25"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        {opt.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-2 text-xs text-zinc-400">
              與後台「課程類別」同步；可複選。未選時顯示全部課程。
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
                : "請調整左側分類（或價格）篩選。"}
            </p>
            {courses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearCategories();
                  setPriceTier("all");
                }}
                aria-label="重設分類與價格篩選"
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
