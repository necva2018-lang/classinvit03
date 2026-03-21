import { StarRating } from "@/components/course/StarRating";
import { fetchCourseById } from "@/lib/courses-queries";
import { isDatabaseConfigured } from "@/lib/env";
import { formatTwd } from "@/lib/format-currency";
import type { Course } from "@/lib/types/course";
import { Check, ChevronRight, Clock, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return { title: "課程詳情" };
  }

  const res = await fetchCourseById(id);
  if (res.error || !res.data) return { title: "找不到課程" };
  const course = res.data;

  const desc =
    course.description?.slice(0, 120) ??
    `${course.category}｜講師 ${course.instructor}`;

  return {
    title: course.title,
    description: `${desc}｜評分 ${course.rating}（${course.reviewCount} 則）｜特價 ${formatTwd(course.priceSale)}`,
    openGraph: {
      title: course.title,
      description: `與 ${course.instructor} 一起實戰學習：${course.category}`,
      images: [
        {
          url: course.coverImage,
          width: 800,
          height: 500,
          alt: course.title,
        },
      ],
    },
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

  if (course.category === "資訊科技" || course.category === "人工智慧") {
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
  if (course.category === "設計創意") {
    return {
      learn: [
        "從使用者研究到視覺交付的設計流程",
        "元件庫與設計規格，方便與工程協作",
        ...baseLearn.slice(0, 2),
      ],
      audience: ["對 UI/UX 有興趣的設計新手與產品工作者", ...baseAudience],
    };
  }
  return { learn: baseLearn, audience: baseAudience };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    notFound();
  }

  const res = await fetchCourseById(id);
  if (res.error || !res.data) {
    notFound();
  }
  const course = res.data;

  const { learn, audience } = outlineFor(course);
  const showOriginal =
    course.priceOriginal != null && course.priceOriginal > course.priceSale;

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

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-12">
          <article>
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-zinc-100 sm:aspect-[2/1]">
              <Image
                src={course.coverImage}
                alt={course.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-necva-primary shadow-sm backdrop-blur-sm">
                {course.category}
              </span>
            </div>

            <header className="mt-8">
              <h1 className="text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl">
                {course.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-600">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-4 text-necva-primary" aria-hidden />
                  講師 {course.instructor}
                </span>
                <span className="inline-flex items-center gap-2">
                  <StarRating rating={course.rating} size="md" />
                  <span className="font-semibold text-zinc-800">
                    {course.rating.toFixed(1)}
                  </span>
                  <span className="text-zinc-400">
                    （{course.reviewCount.toLocaleString("zh-TW")} 則評價）
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-zinc-500">
                  <Clock className="size-4" aria-hidden />
                  隨時開課 · 無限回放
                </span>
              </div>
            </header>

            {course.description ? (
              <p className="mt-8 text-base leading-relaxed text-zinc-600 whitespace-pre-line">
                {course.description}
              </p>
            ) : (
              <p className="mt-8 text-base leading-relaxed text-zinc-600">
                本課程以<strong className="text-zinc-800">實戰專案</strong>
                為核心，由 {course.instructor}{" "}
                帶你逐步完成可展示的成果。內容涵蓋觀念說明、操作示範與常見陷阱解析，讓你能對齊職場真實情境，學完即可上手應用。
              </p>
            )}

            <section className="mt-10" aria-labelledby="learn-heading">
              <h2
                id="learn-heading"
                className="text-lg font-bold text-necva-primary"
              >
                你將學到
              </h2>
              <ul className="mt-4 space-y-3">
                {learn.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-zinc-700">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-necva-accent"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10" aria-labelledby="audience-heading">
              <h2
                id="audience-heading"
                className="text-lg font-bold text-necva-primary"
              >
                適合對象
              </h2>
              <ul className="mt-4 space-y-3">
                {audience.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-zinc-700">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-necva-primary"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                限時優惠
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                {showOriginal && (
                  <span className="text-sm text-zinc-400 line-through">
                    {formatTwd(course.priceOriginal!)}
                  </span>
                )}
                <span className="text-2xl font-bold text-necva-accent">
                  {formatTwd(course.priceSale)}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">課程 ID：{course.id}</p>
              <button
                type="button"
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-necva-primary text-sm font-semibold text-white shadow-sm transition hover:bg-necva-primary/90"
              >
                立即購課
              </button>
              <Link
                href="/courses"
                className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-zinc-300 text-sm font-medium text-zinc-700 transition hover:bg-white"
              >
                返回課程列表
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
