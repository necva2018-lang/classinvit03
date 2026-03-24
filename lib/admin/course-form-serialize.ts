import type { Category, Course } from "@prisma/client";

/** 可從 Server Component 傳入 Client Component（純 JSON） */
export type CourseFormCategoryOption = {
  id: string;
  name: string;
};

export type CourseFormInitialValues = {
  title: string;
  status: "DRAFT" | "PAUSED";
  subtitle: string | null;
  description: string | null;
  prerequisiteText: string | null;
  preparationText: string | null;
  ctaCartText: string | null;
  ctaCartUrl: string | null;
  ctaBuyText: string | null;
  ctaBuyUrl: string | null;
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
    status: course.status,
    subtitle: course.subtitle,
    description: course.description,
    prerequisiteText: course.prerequisiteText,
    preparationText: course.preparationText,
    ctaCartText: course.ctaCartText,
    ctaCartUrl: course.ctaCartUrl,
    ctaBuyText: course.ctaBuyText,
    ctaBuyUrl: course.ctaBuyUrl,
    imageUrl: course.imageUrl,
    price: course.price,
    discountedPrice: course.discountedPrice,
    isPublished: course.isPublished,
    categoryIds: course.categories.map((c) => c.id),
  };
}
