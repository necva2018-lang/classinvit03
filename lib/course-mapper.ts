import {
  COURSE_FILTER_OPTIONS,
  type CourseFilterTagId,
} from "@/lib/course-filters";
import { resolveCourseCoverImageUrl } from "@/lib/course-cover-image";
import { courseUsesCommerceListingFields, type CourseCtaKind } from "@/lib/course-cta";
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
  const categoryIds = row.categories.map((c) => c.id);
  const ctaKind = (row as { ctaKind?: CourseCtaKind }).ctaKind ?? "CART";
  const useCommerce = courseUsesCommerceListingFields(ctaKind);

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? row.subtitle ?? null,
    priceSale: useCommerce ? Math.round(sale) : 0,
    priceOriginal:
      useCommerce && hasDiscount ? Math.round(list!) : null,
    coverImage: resolveCourseCoverImageUrl(row.imageUrl),
    category: categoryLabel,
    rating: 0,
    reviewCount: 0,
    instructor: "",
    filterTags: filterTagsForCategoryNames(catNames),
    categoryIds,
    slug: null,
    ctaKind,
    ctaCartText: row.ctaCartText ?? null,
    ctaCartUrl: row.ctaCartUrl ?? null,
    ctaBuyText: row.ctaBuyText ?? null,
    ctaBuyUrl: row.ctaBuyUrl ?? null,
    listingNoInstructorLine: row.listingNoInstructorLine ?? null,
    listingNoReviewsLine: row.listingNoReviewsLine ?? null,
  };
}
