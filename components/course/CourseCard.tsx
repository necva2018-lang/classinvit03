import { StarRating } from "@/components/course/StarRating";
import { formatTwd } from "@/lib/format-currency";
import type { Course } from "@/lib/types/course";
import Image from "next/image";
import Link from "next/link";

type Props = {
  course: Course;
};

export function CourseCard({ course }: Props) {
  const href = `/courses/${course.id}`;
  const showOriginal =
    course.priceOriginal != null && course.priceOriginal > course.priceSale;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-necva-primary/25 hover:shadow-md">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-zinc-100">
        <Image
          src={course.coverImage}
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-necva-primary shadow-sm backdrop-blur-sm">
          {course.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-zinc-900 group-hover:text-necva-primary sm:min-h-[3rem] sm:text-base">
          <Link href={href}>{course.title}</Link>
        </h3>

        <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
          講師：{course.instructor}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StarRating rating={course.rating} />
          <span className="text-sm font-semibold text-zinc-800">
            {course.rating.toFixed(1)}
          </span>
          <span className="text-xs text-zinc-400">
            （{course.reviewCount.toLocaleString("zh-TW")} 則評價）
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-baseline justify-end gap-2 border-t border-zinc-100 pt-3">
          {showOriginal && (
            <span className="text-sm text-zinc-400 line-through">
              {formatTwd(course.priceOriginal!)}
            </span>
          )}
          <span className="text-lg font-bold text-necva-accent sm:text-xl">
            {formatTwd(course.priceSale)}
          </span>
        </div>
      </div>
    </article>
  );
}
