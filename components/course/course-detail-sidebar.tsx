import { formatTwd } from "@/lib/format-currency";
import type { Course } from "@/lib/types/course";
import type { SiteCourseDetailStats } from "@/lib/courses-queries";
import {
  Award,
  Clock,
  Download,
  ShoppingCart,
  Video,
} from "lucide-react";
import Link from "next/link";

function formatCourseDurationZh(stats: SiteCourseDetailStats): string {
  if (!stats.hasLessonDurations || stats.totalDurationMin <= 0) {
    return "依單元內容而定";
  }
  const t = stats.totalDurationMin;
  const h = Math.floor(t / 60);
  const m = t % 60;
  if (h === 0) return `${m} 分鐘`;
  if (m === 0) return `${h} 小時`;
  return `${h} 小時 ${m} 分`;
}

type Props = {
  course: Course;
  stats: SiteCourseDetailStats;
};

export function CourseDetailSidebar({ course, stats }: Props) {
  const showOriginal =
    course.priceOriginal != null && course.priceOriginal > course.priceSale;
  const durationText = formatCourseDurationZh(stats);

  const infoRows: { icon: typeof Clock; label: string; value: string }[] = [
    { icon: Clock, label: "課程時長", value: durationText },
    {
      icon: Video,
      label: "單元結構",
      value:
        stats.lessonCount > 0
          ? `共 ${stats.sectionCount} 單元 ${stats.lessonCount} 小節`
          : stats.sectionCount > 0
            ? `共 ${stats.sectionCount} 單元`
            : "大綱籌備中",
    },
    {
      icon: Download,
      label: "學習資源",
      value: "教材將於開課後提供下載",
    },
    {
      icon: Award,
      label: "完訓證明",
      value: "提供完課學習證明（實際依平台規範為準）",
    },
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900">課程資訊</h2>
        <ul className="mt-4 space-y-4">
          {infoRows.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex gap-3 text-sm">
              <Icon
                className="mt-0.5 size-5 shrink-0 text-necva-primary"
                aria-hidden
              />
              <div>
                <p className="font-medium text-zinc-800">{label}</p>
                <p className="mt-0.5 text-zinc-600">{value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          線上優惠
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {showOriginal ? (
            <span className="text-sm text-zinc-400 line-through">
              {formatTwd(course.priceOriginal!)}
            </span>
          ) : null}
          <span className="text-2xl font-bold text-necva-accent">
            {formatTwd(course.priceSale)}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">含數位教材與回放權益（示範文案）</p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-necva-primary bg-white text-sm font-semibold text-necva-primary transition hover:bg-necva-primary/5"
          >
            <ShoppingCart className="size-4" aria-hidden />
            加入購物車
          </button>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-lg bg-necva-primary text-sm font-semibold text-white shadow-sm transition hover:bg-necva-primary/90"
          >
            立即購買
          </button>
        </div>
        <Link
          href="/courses"
          className="mt-4 block text-center text-sm font-medium text-zinc-600 underline-offset-4 hover:text-necva-primary hover:underline"
        >
          返回全部課程
        </Link>
      </div>
    </aside>
  );
}
