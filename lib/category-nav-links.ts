import { filterTagIdForCategoryLabel } from "@/lib/course-filters";

export type NavCategoryLink = {
  id: string;
  name: string;
  href: string;
};

export function hrefForCategoryName(name: string): string {
  const tag = filterTagIdForCategoryLabel(name);
  return tag ? `/courses?tag=${encodeURIComponent(tag)}` : "/courses";
}

export function toNavCategoryLinks(
  rows: { id: string; name: string }[],
): NavCategoryLink[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    href: hrefForCategoryName(r.name),
  }));
}
