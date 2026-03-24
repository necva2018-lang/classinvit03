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
  slug: string | null;
  ctaCartText: string | null;
  ctaCartUrl: string | null;
  ctaBuyText: string | null;
  ctaBuyUrl: string | null;
};
