import { COURSE_FILTER_OPTIONS } from "@/lib/course-filters";
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

/** 依關鍵字搜尋課程（PostgreSQL 列表）與篩選用分類標籤（與 Category.name 對齊） */
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

  for (const opt of COURSE_FILTER_OPTIONS) {
    if (opt.label.toLowerCase().includes(q)) {
      hits.push({
        kind: "category",
        title: opt.label,
        subtitle: "課程分類",
        href: `/courses?tag=${encodeURIComponent(opt.id)}`,
      });
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
