/** 與 Prisma `CourseCtaKind` 一致 */
export type CourseCtaKind = "CART" | "SUBSIDY";

/** 未遷移或缺欄時視為購物車 */
export function normalizeCourseCtaKind(v: unknown): CourseCtaKind {
  return v === "SUBSIDY" ? "SUBSIDY" : "CART";
}

/**
 * 補助課不使用「定價／特價」（後台價格區會停用）；
 * 「封面圖 URL」「已上架」不分 CTA 類型，一律可編輯並寫入資料庫。
 */
export function courseUsesCommerceListingFields(
  kind: CourseCtaKind | null | undefined,
): boolean {
  return normalizeCourseCtaKind(kind) !== "SUBSIDY";
}

/** 依類型之預設文案與連結（後台表單切換類型時帶入；前台 resolve 亦同此組） */
export const CTA_KIND_DEFAULT_FIELDS: Record<
  CourseCtaKind,
  {
    outlineText: string;
    outlineHref: string;
    solidText: string;
    solidHref: string;
  }
> = {
  CART: {
    outlineText: "加入購物車",
    outlineHref: "/cart",
    solidText: "立即購買",
    solidHref: "/checkout",
  },
  SUBSIDY: {
    outlineText: "預約諮詢",
    outlineHref: "/",
    solidText: "立即報名",
    solidHref: "/checkout",
  },
};

export type CourseCtaFields = {
  ctaKind?: CourseCtaKind | null;
  ctaCartText: string | null;
  ctaCartUrl: string | null;
  ctaBuyText: string | null;
  ctaBuyUrl: string | null;
};

/** 左／外框按鈕、右／實心按鈕（與前台版面一致） */
export function resolveCourseCtaPair(row: CourseCtaFields): {
  outline: { text: string; href: string };
  solid: { text: string; href: string };
} {
  const d = CTA_KIND_DEFAULT_FIELDS[normalizeCourseCtaKind(row.ctaKind)];
  const outlineText = row.ctaCartText?.trim() || d.outlineText;
  const outlineHref = row.ctaCartUrl?.trim() || d.outlineHref;
  const solidText = row.ctaBuyText?.trim() || d.solidText;
  const solidHref = row.ctaBuyUrl?.trim() || d.solidHref;

  return {
    outline: { text: outlineText, href: outlineHref },
    solid: { text: solidText, href: solidHref },
  };
}
