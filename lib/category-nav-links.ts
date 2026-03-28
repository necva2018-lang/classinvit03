export type NavCategoryLink = {
  id: string;
  name: string;
  href: string;
};

/** 課程列表依 Category.id 篩選（與側欄、API 同步） */
export function hrefForCategoryId(id: string): string {
  return `/courses?cat=${encodeURIComponent(id)}`;
}

export function toNavCategoryLinks(
  rows: { id: string; name: string }[],
): NavCategoryLink[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    href: hrefForCategoryId(r.id),
  }));
}
