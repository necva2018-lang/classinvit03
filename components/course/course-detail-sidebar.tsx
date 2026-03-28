import {
  courseUsesCommerceListingFields,
  resolveCourseCtaPair,
} from "@/lib/course-cta";
import { formatTwd } from "@/lib/format-currency";
import type { SiteCourseInfoSidebarTexts } from "@/lib/courses-queries";
import type { Course } from "@/lib/types/course";
import {
  Award,
  Clock,
  Download,
  ShoppingCart,
  Video,
} from "lucide-react";
import Link from "next/link";

type Props = {
  course: Course;
  infoSidebarTexts: SiteCourseInfoSidebarTexts;
};

export function CourseDetailSidebar({ course, infoSidebarTexts }: Props) {
  const showCommerce = courseUsesCommerceListingFields(course.ctaKind);
  const showOriginal =
    showCommerce &&
    course.priceOriginal != null &&
    course.priceOriginal > course.priceSale;
  const cta = resolveCourseCtaPair(course);

  const showInfoCard =
    showCommerce &&
    [
      infoSidebarTexts.durationText,
      infoSidebarTexts.structureText,
      infoSidebarTexts.resourcesText,
      infoSidebarTexts.certificateText,
    ].some((t) => t?.trim());

  const infoRows: {
    key: string;
    icon: typeof Clock;
    label: string;
    value: string;
  }[] = [];

  if (infoSidebarTexts.durationText?.trim()) {
    infoRows.push({
      key: "duration",
      icon: Clock,
      label: "課程時長",
      value: infoSidebarTexts.durationText.trim(),
    });
  }
  if (infoSidebarTexts.structureText?.trim()) {
    infoRows.push({
      key: "structure",
      icon: Video,
      label: "單元結構",
      value: infoSidebarTexts.structureText.trim(),
    });
  }
  if (infoSidebarTexts.resourcesText?.trim()) {
    infoRows.push({
      key: "resources",
      icon: Download,
      label: "學習資源",
      value: infoSidebarTexts.resourcesText.trim(),
    });
  }
  if (infoSidebarTexts.certificateText?.trim()) {
    infoRows.push({
      key: "certificate",
      icon: Award,
      label: "完訓證明",
      value: infoSidebarTexts.certificateText.trim(),
    });
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      {showInfoCard ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-zinc-900">課程資訊</h2>
          <ul className="mt-4 space-y-4">
            {infoRows.map(({ key, icon: Icon, label, value }) => (
              <li key={key} className="flex gap-3 text-sm">
                <Icon
                  className="mt-0.5 size-5 shrink-0 text-necva-primary"
                  aria-hidden
                />
                <div>
                  <p className="font-medium text-zinc-800">{label}</p>
                  <p className="mt-0.5 whitespace-pre-line text-zinc-600">
                    {value}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 p-5 shadow-sm">
        {showCommerce ? (
          <>
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
            <p className="mt-1 text-xs text-zinc-400">
              含數位教材與回放權益（示範文案）
            </p>
          </>
        ) : (
          <p className="text-sm font-medium text-zinc-600">
            補助／諮詢課程
          </p>
        )}
        <div
          className={
            showCommerce ? "mt-5 flex flex-col gap-2.5" : "mt-4 flex flex-col gap-2.5"
          }
        >
          <Link
            href={cta.outline.href}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-necva-primary bg-white text-sm font-semibold text-necva-primary transition hover:bg-necva-primary/5"
          >
            {course.ctaKind === "CART" ? (
              <ShoppingCart className="size-4" aria-hidden />
            ) : null}
            {cta.outline.text}
          </Link>
          <Link
            href={cta.solid.href}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-necva-primary text-sm font-semibold text-white shadow-sm transition hover:bg-necva-primary/90"
          >
            {cta.solid.text}
          </Link>
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
