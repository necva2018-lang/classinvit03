/** 與 JSON `filterTags` 對應的 id */
export const COURSE_FILTER_OPTIONS = [
  { id: "ai", label: "人工智慧" },
  { id: "frontend", label: "網頁前端" },
  { id: "marketing", label: "數位行銷" },
  { id: "design", label: "設計與多媒體" },
  { id: "data", label: "數據分析" },
  { id: "career", label: "職涯與管理" },
] as const;

export type CourseFilterTagId = (typeof COURSE_FILTER_OPTIONS)[number]["id"];

const TAG_IDS = new Set<string>(COURSE_FILTER_OPTIONS.map((o) => o.id));

/** 與 Category.name 一致時，回傳對應篩選 id（供 /courses?tag= 使用） */
export function filterTagIdForCategoryLabel(
  label: string,
): CourseFilterTagId | null {
  const t = label.trim();
  const hit = COURSE_FILTER_OPTIONS.find((o) => o.label === t);
  return hit ? hit.id : null;
}

export function isCourseFilterTagId(s: string): s is CourseFilterTagId {
  return TAG_IDS.has(s);
}

export const PRICE_FILTER_OPTIONS = [
  { id: "all", label: "全部價格" },
  { id: "under2000", label: "NT$2,000 以下" },
  { id: "2000to3000", label: "NT$2,001 – NT$3,000" },
  { id: "over3000", label: "NT$3,001 以上" },
] as const;

export type PriceFilterId = (typeof PRICE_FILTER_OPTIONS)[number]["id"];

export type SortMode = "default" | "popular" | "priceAsc";
