import type { Category, Course } from "@prisma/client";

/** 可從 Server Component 傳入 Client Component（純 JSON） */
export type CourseFormCategoryOption = {
  id: string;
  name: string;
};

export type CourseFormInitialValues = {
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  discountedPrice: number | null;
  isPublished: boolean;
  categoryId: string | null;
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
    subtitle: course.subtitle,
    description: course.description,
    imageUrl: course.imageUrl,
    price: course.price,
    discountedPrice: course.discountedPrice,
    isPublished: course.isPublished,
    categoryId: course.categoryId,
  };
}
