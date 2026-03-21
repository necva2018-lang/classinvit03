import { COURSE_FILTER_OPTIONS, type CourseFilterTagId } from "@/lib/course-filters";
import type { Course } from "@/lib/types/course";
import type { Category, Course as PrismaCourse } from "@prisma/client";

const allowed = new Set<string>(
  COURSE_FILTER_OPTIONS.map((o) => o.id),
);

export type CourseWithCategory = PrismaCourse & { category: Category };

function parseFilterTags(raw: string[] | null): CourseFilterTagId[] {
  if (!raw?.length) return [];
  return raw.filter((t): t is CourseFilterTagId => allowed.has(t));
}

export function mapPrismaCourse(row: CourseWithCategory): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priceSale: row.price,
    priceOriginal: row.priceOriginal,
    coverImage: row.coverImageUrl,
    category: row.category.name,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    instructor: row.instructorName,
    filterTags: parseFilterTags(row.filterTags),
    slug: row.slug,
  };
}
