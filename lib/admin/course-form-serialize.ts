import type { Category, Course } from "@prisma/client";
import { normalizeCourseCtaKind } from "@/lib/course-cta";

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
  learnOutcomesText: string | null;
  targetAudienceText: string | null;
  infoDurationText: string | null;
  infoStructureText: string | null;
  infoResourcesText: string | null;
  infoCertificateText: string | null;
  ctaKind: "CART" | "SUBSIDY";
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
    learnOutcomesText: course.learnOutcomesText,
    targetAudienceText: course.targetAudienceText,
    infoDurationText:
      (course as { infoDurationText?: string | null }).infoDurationText ??
      null,
    infoStructureText:
      (course as { infoStructureText?: string | null }).infoStructureText ??
      null,
    infoResourcesText:
      (course as { infoResourcesText?: string | null }).infoResourcesText ??
      null,
    infoCertificateText:
      (course as { infoCertificateText?: string | null }).infoCertificateText ??
      null,
    ctaKind: normalizeCourseCtaKind(
      (course as { ctaKind?: "CART" | "SUBSIDY" }).ctaKind,
    ),
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
