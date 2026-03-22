import { mapPrismaCourse } from "@/lib/course-mapper";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import type { Course } from "@/lib/types/course";

const courseInclude = { category: true } as const;

function isLikelyCourseId(id: string): boolean {
  const t = id.trim();
  return t.length >= 8 && t.length <= 64 && /^[a-z0-9]+$/i.test(t);
}

export async function fetchCourses(): Promise<{
  data: Course[];
  error: Error | null;
}> {
  if (!isDatabaseConfigured()) {
    return {
      data: [],
      error: new Error("未設定 DATABASE_URL（請在 .env 貼上 Zeabur PostgreSQL 連線字串）"),
    };
  }

  try {
    const rows = await prisma.course.findMany({
      where: { isPublished: true },
      include: courseInclude,
      orderBy: { createdAt: "asc" },
    });
    return { data: rows.map(mapPrismaCourse), error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { data: [], error: new Error(message) };
  }
}

export async function fetchCourseById(
  id: string,
): Promise<{ data: Course | null; error: Error | null }> {
  if (!isDatabaseConfigured()) {
    return {
      data: null,
      error: new Error("未設定 DATABASE_URL"),
    };
  }

  if (!isLikelyCourseId(id)) {
    return { data: null, error: null };
  }

  try {
    const row = await prisma.course.findFirst({
      where: { id, isPublished: true },
      include: courseInclude,
    });
    if (!row) return { data: null, error: null };
    return { data: mapPrismaCourse(row), error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { data: null, error: new Error(message) };
  }
}
