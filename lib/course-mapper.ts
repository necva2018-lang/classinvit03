import {
  COURSE_FILTER_OPTIONS,
  type CourseFilterTagId,
} from "@/lib/course-filters";
import { COURSE_COVER_PLACEHOLDER } from "@/lib/course-cover-placeholder";
import type { Course } from "@/lib/types/course";
import type { Category, Course as PrismaCourse } from "@prisma/client";

export type CourseWithCategories = PrismaCourse & { categories: Category[] };

function filterTagsForCategoryNames(names: string[]): CourseFilterTagId[] {
  const tags = new Set<CourseFilterTagId>();
  for (const name of names) {
    const t = name.trim();
    for (const o of COURSE_FILTER_OPTIONS) {
      if (o.label === t) tags.add(o.id);
    }
  }
  return [...tags];
}

export function mapPrismaCourse(row: CourseWithCategories): Course {
  const list = row.price ?? null;
  const sale = row.discountedPrice ?? row.price ?? 0;
  const hasDiscount =
    row.discountedPrice != null &&
    row.price != null &&
    row.discountedPrice < row.price;

  const catNames = row.categories.map((c) => c.name);
  const categoryLabel = catNames.length ? catNames.join("、") : "未分類";

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? row.subtitle ?? null,
    priceSale: Math.round(sale),
    priceOriginal: hasDiscount ? Math.round(list!) : null,
    coverImage: row.imageUrl?.trim() || COURSE_COVER_PLACEHOLDER,
    category: categoryLabel,
    rating: 0,
    reviewCount: 0,
    instructor: "",
    filterTags: filterTagsForCategoryNames(catNames),
    slug: null,
  };
}
