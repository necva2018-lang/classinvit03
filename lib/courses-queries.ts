import { mapPrismaCourse } from "@/lib/course-mapper";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import type { Course } from "@/lib/types/course";

const courseInclude = { category: true } as const;

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
      include: courseInclude,
      orderBy: { createdAt: "asc" },
    });
    return { data: rows.map(mapPrismaCourse), error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { data: [], error: new Error(message) };
  }
}

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function fetchCourseById(
  id: string,
): Promise<{ data: Course | null; error: Error | null }> {
  if (!isDatabaseConfigured()) {
    return {
      data: null,
      error: new Error("未設定 DATABASE_URL"),
    };
  }

  if (!uuidRe.test(id)) {
    return { data: null, error: null };
  }

  try {
    const row = await prisma.course.findUnique({
      where: { id },
      include: courseInclude,
    });
    if (!row) return { data: null, error: null };
    return { data: mapPrismaCourse(row), error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { data: null, error: new Error(message) };
  }
}
