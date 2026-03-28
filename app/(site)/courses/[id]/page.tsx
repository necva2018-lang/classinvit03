import { CourseDetailSidebar } from "@/components/course/course-detail-sidebar";
import { CourseDetailTabs } from "@/components/course/course-detail-tabs";
import { StarRating } from "@/components/course/StarRating";
import {
  linesFromMultilineFieldStrict,
} from "@/lib/course-detail-bullets";
import {
  fetchCourseById,
  fetchPublishedCourseDetail,
} from "@/lib/courses-queries";
import { isDatabaseConfigured } from "@/lib/env";
import {
  courseUsesCommerceListingFields,
  resolveCourseCtaPair,
} from "@/lib/course-cta";
import { formatTwd } from "@/lib/format-currency";
import { siteOriginFromEnv, toAbsoluteUrl } from "@/lib/seo/absolute-url";
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
  const priceLine = courseUsesCommerceListingFields(course.ctaKind)
    ? ` 線上特惠 ${formatTwd(course.priceSale)}。`
    : "";
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
    learnOutcomesText,
    targetAudienceText,
    prerequisiteText,
    preparationText,
    announcements,
    infoSidebarTexts,
  } = res.data;
  const learn = linesFromMultilineFieldStrict(learnOutcomesText);
  const audience = linesFromMultilineFieldStrict(targetAudienceText);
  const prerequisiteBullets =
    linesFromMultilineFieldStrict(prerequisiteText);
  const prepareBullets = linesFromMultilineFieldStrict(preparationText);

  const showCommerce = courseUsesCommerceListingFields(course.ctaKind);
  const showOriginal =
    showCommerce &&
    course.priceOriginal != null &&
    course.priceOriginal > course.priceSale;

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
  const cta = resolveCourseCtaPair(course);

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

              {showCommerce ? (
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
              ) : (
                <p className="mt-4 text-sm font-medium text-zinc-600">
                  補助／諮詢課程 · 請透過下方按鈕預約或報名
                </p>
              )}

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
                <Link
                  href={cta.outline.href}
                  className="flex h-12 min-w-[160px] flex-1 items-center justify-center rounded-lg border-2 border-necva-primary bg-white text-sm font-semibold text-necva-primary shadow-sm transition hover:bg-necva-primary/5 sm:flex-none"
                >
                  {cta.outline.text}
                </Link>
                <Link
                  href={cta.solid.href}
                  className="flex h-12 min-w-[160px] flex-1 items-center justify-center rounded-lg bg-necva-primary text-sm font-semibold text-white shadow-md transition hover:bg-necva-primary/90 sm:flex-none"
                >
                  {cta.solid.text}
                </Link>
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
          <CourseDetailSidebar course={course} infoSidebarTexts={infoSidebarTexts} />
        </div>
      </section>
    </div>
  );
}
