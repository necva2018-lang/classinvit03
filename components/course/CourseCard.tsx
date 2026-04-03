import { CourseCardCover } from "@/components/course/CourseCardCover";
import { StarRating } from "@/components/course/StarRating";
import {
  DEFAULT_LISTING_NO_INSTRUCTOR_LINE,
  DEFAULT_LISTING_NO_REVIEWS_LINE,
} from "@/lib/course-card-listing-defaults";
import { courseUsesCommerceListingFields } from "@/lib/course-cta";
import { formatTwd } from "@/lib/format-currency";
import type { Course } from "@/lib/types/course";
import Link from "next/link";

type Props = {
  course: Course;
};

export function CourseCard({ course }: Props) {
  const href = `/courses/${course.id}`;
  const noInstructorLine =
    course.listingNoInstructorLine?.trim() ||
    DEFAULT_LISTING_NO_INSTRUCTOR_LINE;
  const noReviewsLine =
    course.listingNoReviewsLine?.trim() || DEFAULT_LISTING_NO_REVIEWS_LINE;
  const showCommerce = courseUsesCommerceListingFields(course.ctaKind);
  const showOriginal =
    showCommerce &&
    course.priceOriginal != null &&
    course.priceOriginal > course.priceSale;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-necva-primary/25 hover:shadow-md">
      <CourseCardCover
        href={href}
        src={course.coverImage}
        alt={course.title}
        category={course.category}
        ctaKind={course.ctaKind}
      />

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-zinc-900 group-hover:text-necva-primary sm:min-h-[3rem] sm:text-base">
          <Link href={href}>{course.title}</Link>
        </h3>

        {course.instructor ? (
          <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
            講師：{course.instructor}
          </p>
        ) : (
          <p className="mt-2 text-xs text-zinc-400 sm:text-sm">
            {noInstructorLine}
          </p>
        )}

        {course.reviewCount > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StarRating rating={course.rating} />
            <span className="text-sm font-semibold text-zinc-800">
              {course.rating.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-400">
              （{course.reviewCount.toLocaleString("zh-TW")} 則評價）
            </span>
          </div>
        ) : (
          <p className="mt-2 text-xs text-zinc-400">{noReviewsLine}</p>
        )}

        {showCommerce ? (
          <div className="mt-auto flex flex-wrap items-baseline justify-end gap-2 border-t border-zinc-100 pt-3">
            {showOriginal ? (
              <span className="text-sm text-zinc-400 line-through">
                {formatTwd(course.priceOriginal!)}
              </span>
            ) : null}
            <span className="text-lg font-bold text-necva-accent sm:text-xl">
              {formatTwd(course.priceSale)}
            </span>
          </div>
        ) : (
          <div className="mt-auto border-t border-zinc-100 pt-3 text-right text-xs font-medium text-zinc-500">
            補助／諮詢課程
          </div>
        )}
      </div>
    </article>
  );
}
