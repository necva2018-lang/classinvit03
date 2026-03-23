import { CourseDetailSidebar } from "@/components/course/course-detail-sidebar";
import { CourseDetailTabs } from "@/components/course/course-detail-tabs";
import { StarRating } from "@/components/course/StarRating";
import { linesFromMultilineField } from "@/lib/course-detail-bullets";
import {
  fetchCourseById,
  fetchPublishedCourseDetail,
} from "@/lib/courses-queries";
import { isDatabaseConfigured } from "@/lib/env";
import { formatTwd } from "@/lib/format-currency";
import { siteOriginFromEnv, toAbsoluteUrl } from "@/lib/seo/absolute-url";
import type { CourseFilterTagId } from "@/lib/course-filters";
import type { Course } from "@/lib/types/course";
import { ChevronRight, Clock, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ id: string }>;
};

function courseMetaDescription(course: Course): string {
  const base =
    course.description?.replace(/\s+/g, " ").trim().slice(0, 140) ||
    (course.instructor
      ? `${course.category}實戰線上課，${course.instructor} 主講。`
      : `${course.category}實戰線上課程，隨時開課、無限回放。`);
  const ratingLine =
    course.reviewCount > 0
      ? ` 評分 ${course.rating.toFixed(1)}（${course.reviewCount.toLocaleString("zh-TW")} 則評價）。`
      : "";
  const priceLine = ` 線上特惠 ${formatTwd(course.priceSale)}。`;
  return `${base}${ratingLine}${priceLine}`.slice(0, 160);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const origin = siteOriginFromEnv();

  if (!isDatabaseConfigured()) {
    return { title: "課程詳情" };
  }

  const res = await fetchCourseById(id);
  if (res.error || !res.data) {
    return { title: "找不到課程", robots: { index: false, follow: false } };
  }
  const course = res.data;

  const canonical = `${origin}/courses/${id}`;
  const description = courseMetaDescription(course);
  const titleAbsolute = `${course.title}｜${course.category}線上課｜NECVA`;
  const ogImage = toAbsoluteUrl(course.coverImage, origin);

  return {
    title: { absolute: titleAbsolute },
    description,
    keywords: [
      ...course.category.split("、").map((s) => s.trim()).filter(Boolean),
      "線上課程",
      "NECVA",
      course.title,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url: canonical,
      siteName: "NECVA",
      title: course.title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

function outlineFor(course: Course): { learn: string[]; audience: string[] } {
  const baseLearn = [
    "業界實例與逐步操作，上完能直接應用於工作",
    "章節測驗與練習檔，鞏固觀念不卡關",
    "完課可申請證明，方便放入履歷與作品集",
  ];
  const baseAudience = [
    "希望系統化補強該領域的上班族與轉職者",
    "想透過專題累積作品、面試時能具體說明的學員",
  ];

  const tags = new Set<CourseFilterTagId>(course.filterTags);

  if (tags.has("ai") || tags.has("frontend") || tags.has("data")) {
    return {
      learn: [
        "環境建置到部署的完整流程與除錯技巧",
        "可重用的程式架構與最佳實務習慣",
        ...baseLearn.slice(0, 2),
      ],
      audience: [
        "具基礎邏輯思維，想進入工程／資料相關職涯者",
        ...baseAudience,
      ],
    };
  }
  if (tags.has("design")) {
    return {
      learn: [
        "從使用者研究到視覺交付的設計流程",
        "元件庫與設計規格，方便與工程協作",
        ...baseLearn.slice(0, 2),
      ],
      audience: ["對 UI/UX 有興趣的設計新手與產品工作者", ...baseAudience],
    };
  }
  if (tags.has("marketing") || tags.has("career")) {
    return {
      learn: [
        "可落地的策略框架與成效檢視方式",
        "案例拆解與實作節奏，對齊職場真實情境",
        ...baseLearn.slice(0, 2),
      ],
      audience: [
        "想提升行銷／營運或管理思維的上班族與轉職者",
        ...baseAudience,
      ],
    };
  }
  return { learn: baseLearn, audience: baseAudience };
}

const DEFAULT_PREREQUISITE = [
  "能清楚描述你想解決的工作或學習情境。",
  "無需特定證照；依課程主題可能需要基礎工具操作能力。",
  "無需專業程式背景（除非課程標題另有標示）。",
];

const DEFAULT_PREPARE = [
  "建議使用筆電或桌機，方便跟著操作與練習。",
  "準備可穩定上網的環境；部分主題會使用雲端工具。",
  "可事先整理與課程相關的範例資料，實作更有感。",
];

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    notFound();
  }

  const res = await fetchPublishedCourseDetail(id);
  if (res.error || !res.data) {
    notFound();
  }

  const {
    course,
    subtitle,
    bodyDescription,
    curriculum,
    stats,
    prerequisiteText,
    preparationText,
    announcements,
  } = res.data;
  const { learn, audience } = outlineFor(course);
  const prerequisiteBullets = linesFromMultilineField(
    prerequisiteText,
    DEFAULT_PREREQUISITE,
  );
  const prepareBullets = linesFromMultilineField(
    preparationText,
    DEFAULT_PREPARE,
  );

  const showOriginal =
    course.priceOriginal != null && course.priceOriginal > course.priceSale;

  const tagLabels =
    course.category === "未分類"
      ? []
      : course.category
          .split("、")
          .map((s) => s.trim())
          .filter(Boolean);

  const heroTeaser =
    subtitle?.trim() ||
    (bodyDescription?.trim()
      ? bodyDescription.trim().slice(0, 220) +
        (bodyDescription.trim().length > 220 ? "…" : "")
      : null);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="border-b border-zinc-100 bg-zinc-50/80">
        <nav
          className="mx-auto max-w-6xl px-4 py-3 text-sm text-zinc-600 sm:px-6 lg:px-8"
          aria-label="麵包屑"
        >
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-necva-primary">
                首頁
              </Link>
            </li>
            <ChevronRight className="size-3.5 shrink-0 text-zinc-400" aria-hidden />
            <li>
              <Link href="/courses" className="hover:text-necva-primary">
                全部課程
              </Link>
            </li>
            <ChevronRight className="size-3.5 shrink-0 text-zinc-400" aria-hidden />
            <li className="line-clamp-1 font-medium text-zinc-900">{course.title}</li>
          </ol>
        </nav>
      </div>

      {/* TibaMe 式：標題／價格／標籤／CTA + 封面並列 */}
      <section className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] lg:gap-12">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-3xl lg:text-[1.75rem] lg:leading-snug">
                {course.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                {showOriginal ? (
                  <span className="text-lg text-zinc-400 line-through sm:text-xl">
                    {formatTwd(course.priceOriginal!)}
                  </span>
                ) : null}
                <span className="text-3xl font-bold text-necva-accent sm:text-4xl">
                  {formatTwd(course.priceSale)}
                </span>
              </div>

              {tagLabels.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tagLabels.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                    >
                      ＃{t}
                    </span>
                  ))}
                </div>
              ) : null}

              {heroTeaser ? (
                <p className="mt-5 text-sm leading-relaxed text-zinc-600 sm:text-base">
                  {heroTeaser}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-600">
                {course.instructor ? (
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-4 text-necva-primary" aria-hidden />
                    {course.instructor}
                  </span>
                ) : null}
                {course.reviewCount > 0 ? (
                  <span className="inline-flex items-center gap-2">
                    <StarRating rating={course.rating} size="md" />
                    <span className="font-semibold text-zinc-800">
                      {course.rating.toFixed(1)}
                    </span>
                    <span className="text-zinc-400">
                      （{course.reviewCount.toLocaleString("zh-TW")} 則）
                    </span>
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 text-zinc-500">
                  <Clock className="size-4" aria-hidden />
                  隨時開課 · 無限回放
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  className="flex h-12 min-w-[160px] flex-1 items-center justify-center rounded-lg border-2 border-necva-primary bg-white text-sm font-semibold text-necva-primary shadow-sm transition hover:bg-necva-primary/5 sm:flex-none"
                >
                  加入購物車
                </button>
                <button
                  type="button"
                  className="flex h-12 min-w-[160px] flex-1 items-center justify-center rounded-lg bg-necva-primary text-sm font-semibold text-white shadow-md transition hover:bg-necva-primary/90 sm:flex-none"
                >
                  立即購買
                </button>
              </div>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-md">
              <Image
                src={course.coverImage}
                alt={course.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 440px"
              />
              {course.category !== "未分類" ? (
                <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {course.category}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 分頁主內容 + 側欄（參考 TibaMe 課程頁資訊欄） */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <CourseDetailTabs
              bodyDescription={bodyDescription}
              heroTeaser={heroTeaser}
              learn={learn}
              audience={audience}
              prerequisiteBullets={prerequisiteBullets}
              prepareBullets={prepareBullets}
              curriculum={curriculum}
              announcements={announcements}
            />
          </div>
          <CourseDetailSidebar course={course} stats={stats} />
        </div>
      </section>
    </div>
  );
}
