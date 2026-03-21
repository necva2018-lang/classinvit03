import { navCourseCategories } from "@/lib/nav-course-categories";
import type { Course } from "@/lib/types/course";

export type SearchHit = {
  kind: "course" | "category";
  title: string;
  subtitle?: string;
  href: string;
};

function norm(s: string) {
  return s.trim().toLowerCase();
}

/** 依關鍵字搜尋課程（來自 PostgreSQL 的列表）與靜態分類導覽 */
export function searchContent(query: string, courses: Course[]): SearchHit[] {
  const q = norm(query);
  if (!q) return [];

  const hits: SearchHit[] = [];

  for (const c of courses) {
    const hay =
      `${c.title} ${c.instructor} ${c.category} ${c.description ?? ""}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        kind: "course",
        title: c.title,
        subtitle: `${c.instructor} · ${c.category}`,
        href: `/courses/${c.id}`,
      });
    }
  }

  for (const g of navCourseCategories) {
    if (g.label.toLowerCase().includes(q)) {
      hits.push({
        kind: "category",
        title: g.label,
        subtitle: "主分類",
        href: g.href,
      });
    }
    for (const ch of g.children) {
      const blob = `${g.label} ${ch.label}`.toLowerCase();
      if (blob.includes(q) || ch.label.toLowerCase().includes(q)) {
        hits.push({
          kind: "category",
          title: ch.label,
          subtitle: g.label,
          href: ch.href,
        });
      }
    }
  }

  const key = (h: SearchHit) => `${h.kind}|${h.title}|${h.href}`;
  const seen = new Set<string>();
  return hits.filter((h) => {
    const k = key(h);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
