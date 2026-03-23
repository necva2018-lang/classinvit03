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
  prerequisiteText: string | null;
  preparationText: string | null;
  imageUrl: string | null;
  price: number | null;
  discountedPrice: number | null;
  isPublished: boolean;
  categoryIds: string[];
};

export function formatCourseCategoryLabels(
  categories: { name: string }[],
): string {
  if (!categories.length) return "未分類";
  return categories.map((c) => c.name).join("、");
}

export function toCategoryFormOptions(
  categories: Category[],
): CourseFormCategoryOption[] {
  return categories.map((c) => ({ id: c.id, name: c.name }));
}

export function toCourseFormInitialValues(
  course: Course & { categories: { id: string }[] },
): CourseFormInitialValues {
  return {
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    prerequisiteText: course.prerequisiteText,
    preparationText: course.preparationText,
    imageUrl: course.imageUrl,
    price: course.price,
    discountedPrice: course.discountedPrice,
    isPublished: course.isPublished,
    categoryIds: course.categories.map((c) => c.id),
  };
}
