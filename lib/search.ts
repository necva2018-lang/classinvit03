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

/** 依關鍵字搜尋課程與資料庫分類（`dbCategories` 與後台「課程類別」同步） */
export function searchContent(
  query: string,
  courses: Course[],
  dbCategories: { id: string; name: string }[] = [],
): SearchHit[] {
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

  for (const cat of dbCategories) {
    if (cat.name.toLowerCase().includes(q)) {
      hits.push({
        kind: "category",
        title: cat.name,
        subtitle: "課程分類",
        href: `/courses?cat=${encodeURIComponent(cat.id)}`,
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
