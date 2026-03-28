import type { CourseCtaKind } from "@/lib/course-cta";
import type { CourseFilterTagId } from "@/lib/course-filters";

/** 前端元件使用的課程模型 */
export type Course = {
  id: string;
  title: string;
  description: string | null;
  priceSale: number;
  priceOriginal: number | null;
  coverImage: string;
  category: string;
  rating: number;
  reviewCount: number;
  instructor: string;
  filterTags: CourseFilterTagId[];
  /** 課程所屬分類 id（與 Category 表同步，供列表篩選） */
  categoryIds: string[];
  slug: string | null;
  ctaKind: CourseCtaKind;
  ctaCartText: string | null;
  ctaCartUrl: string | null;
  ctaBuyText: string | null;
  ctaBuyUrl: string | null;
};
