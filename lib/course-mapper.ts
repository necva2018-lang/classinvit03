import {
  COURSE_FILTER_OPTIONS,
  type CourseFilterTagId,
} from "@/lib/course-filters";
import { COURSE_COVER_PLACEHOLDER } from "@/lib/course-cover-placeholder";
import type { Course } from "@/lib/types/course";
import type { Category, Course as PrismaCourse } from "@prisma/client";

export type CourseWithCategory = PrismaCourse & { category: Category | null };

function filterTagsForCategory(categoryName: string | null | undefined): CourseFilterTagId[] {
  if (!categoryName) return [];
  const hit = COURSE_FILTER_OPTIONS.filter((o) => o.label === categoryName);
  return hit.map((o) => o.id);
}

export function mapPrismaCourse(row: CourseWithCategory): Course {
  const list = row.price ?? null;
  const sale = row.discountedPrice ?? row.price ?? 0;
  const hasDiscount =
    row.discountedPrice != null &&
    row.price != null &&
    row.discountedPrice < row.price;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? row.subtitle ?? null,
    priceSale: Math.round(sale),
    priceOriginal: hasDiscount ? Math.round(list!) : null,
    coverImage: row.imageUrl?.trim() || COURSE_COVER_PLACEHOLDER,
    category: row.category?.name ?? "未分類",
    rating: 0,
    reviewCount: 0,
    instructor: "",
    filterTags: filterTagsForCategory(row.category?.name),
    slug: null,
  };
}
