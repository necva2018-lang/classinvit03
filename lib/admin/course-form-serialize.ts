import type { Category, Course } from "@prisma/client";

/** 可從 Server Component 傳入 Client Component（無 Decimal / Date） */
export type CourseFormCategoryOption = {
  id: string;
  name: string;
};

export type CourseFormInitialValues = {
  title: string;
  description: string | null;
  price: number;
  priceOriginal: number | null;
  coverImageUrl: string;
  instructorName: string;
  rating: number;
  reviewCount: number;
  slug: string | null;
  categoryId: string;
};

export function toCategoryFormOptions(
  categories: Category[],
): CourseFormCategoryOption[] {
  return categories.map((c) => ({ id: c.id, name: c.name }));
}

export function toCourseFormInitialValues(
  course: Course,
): CourseFormInitialValues {
  return {
    title: course.title,
    description: course.description,
    price: course.price,
    priceOriginal: course.priceOriginal,
    coverImageUrl: course.coverImageUrl,
    instructorName: course.instructorName,
    rating: Number(course.rating),
    reviewCount: course.reviewCount,
    slug: course.slug,
    categoryId: course.categoryId,
  };
}
