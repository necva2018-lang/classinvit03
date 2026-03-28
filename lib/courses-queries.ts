import { mapPrismaCourse } from "@/lib/course-mapper";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { isLikelyDbId } from "@/lib/id-guard";
import type { IntroBlock } from "@/lib/validation/intro-blocks";
import { parseIntroBlocksFromJson } from "@/lib/validation/intro-blocks";
import type { Course } from "@/lib/types/course";

const courseInclude = {
  categories: {
    orderBy: [
      { sortOrder: "asc" as const },
      { name: "asc" as const },
    ],
  },
};

const curriculumInclude = {
  sections: {
    orderBy: { order: "asc" as const },
    include: {
      lessons: { orderBy: { order: "asc" as const } },
    },
  },
  announcements: {
    orderBy: [
      { sortOrder: "asc" as const },
      { createdAt: "asc" as const },
    ],
  },
};

export type SiteCourseCurriculumLesson = {
  id: string;
  title: string;
  order: number;
  durationSec: number | null;
};

export type SiteCourseCurriculumSection = {
  id: string;
  title: string;
  order: number;
  lessons: SiteCourseCurriculumLesson[];
};

export type SiteCourseDetailStats = {
  sectionCount: number;
  lessonCount: number;
  /** 加總 lesson.duration（秒）換算，無資料時為 0 */
  totalDurationMin: number;
  hasLessonDurations: boolean;
};

export type SiteCoursePublicAnnouncement = {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
};

/** 課程頁右欄「課程資訊」四則（皆選填；有填才顯示該列） */
export type SiteCourseInfoSidebarTexts = {
  durationText: string | null;
  structureText: string | null;
  resourcesText: string | null;
  certificateText: string | null;
};

export type SiteCourseDetailPayload = {
  course: Course;
  /** 副標／一句話（Prisma subtitle） */
  subtitle: string | null;
  /** 完整課程介紹（Prisma description） */
  bodyDescription: string | null;
  /** 課程頁第一分頁「說明區段」（圖片／影片／文字） */
  introBlocks: IntroBlock[];
  learnOutcomesText: string | null;
  targetAudienceText: string | null;
  prerequisiteText: string | null;
  preparationText: string | null;
  announcements: SiteCoursePublicAnnouncement[];
  curriculum: SiteCourseCurriculumSection[];
  stats: SiteCourseDetailStats;
  infoSidebarTexts: SiteCourseInfoSidebarTexts;
};

function buildDetailPayload(row: {
  subtitle: string | null;
  description: string | null;
  learnOutcomesText: string | null;
  targetAudienceText: string | null;
  prerequisiteText: string | null;
  preparationText: string | null;
  infoDurationText?: string | null;
  infoStructureText?: string | null;
  infoResourcesText?: string | null;
  infoCertificateText?: string | null;
  introBlocksJson?: unknown;
  announcements: {
    id: string;
    title: string;
    body: string | null;
    createdAt: Date;
    sortOrder: number;
  }[];
  sections: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      order: number;
      duration: number | null;
    }[];
  }[];
}): Pick<
  SiteCourseDetailPayload,
  | "subtitle"
  | "bodyDescription"
  | "introBlocks"
  | "learnOutcomesText"
  | "targetAudienceText"
  | "prerequisiteText"
  | "preparationText"
  | "announcements"
  | "curriculum"
  | "stats"
  | "infoSidebarTexts"
> {
  let lessonCount = 0;
  let totalSec = 0;
  let hasLessonDurations = false;

  const curriculum: SiteCourseCurriculumSection[] = row.sections.map((s) => ({
    id: s.id,
    title: s.title,
    order: s.order,
    lessons: s.lessons.map((l) => {
      lessonCount += 1;
      if (l.duration != null && l.duration > 0) {
        hasLessonDurations = true;
        totalSec += l.duration;
      }
      return {
        id: l.id,
        title: l.title,
        order: l.order,
        durationSec: l.duration,
      };
    }),
  }));

  const totalDurationMin =
    hasLessonDurations && totalSec > 0
      ? Math.max(1, Math.round(totalSec / 60))
      : 0;

  return {
    subtitle: row.subtitle,
    bodyDescription: row.description,
    introBlocks: parseIntroBlocksFromJson(
      (row as { introBlocksJson?: unknown }).introBlocksJson,
    ),
    learnOutcomesText: row.learnOutcomesText,
    targetAudienceText: row.targetAudienceText,
    prerequisiteText: row.prerequisiteText,
    preparationText: row.preparationText,
    announcements: row.announcements.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      createdAt: a.createdAt.toISOString(),
    })),
    curriculum,
    stats: {
      sectionCount: row.sections.length,
      lessonCount,
      totalDurationMin,
      hasLessonDurations,
    },
    infoSidebarTexts: {
      durationText: row.infoDurationText ?? null,
      structureText: row.infoStructureText ?? null,
      resourcesText: row.infoResourcesText ?? null,
      certificateText: row.infoCertificateText ?? null,
    },
  };
}

function isLikelyCourseId(id: string): boolean {
  return isLikelyDbId(id);
}

/** 前台篩選／導覽用：依後台「課程類別」排序 */
export async function fetchPublicCategories(): Promise<{
  data: { id: string; name: string }[];
  error: Error | null;
}> {
  if (!isDatabaseConfigured()) {
    return { data: [], error: null };
  }
  try {
    const rows = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    });
    return { data: rows, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { data: [], error: new Error(message) };
  }
}

export async function fetchCourses(): Promise<{
  data: Course[];
  error: Error | null;
}> {
  if (!isDatabaseConfigured()) {
    return {
      data: [],
      error: new Error(
        "未設定 DATABASE_URL（Zeabur 請在 Web 服務綁定 PostgreSQL 或設定 Variables）",
      ),
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

/** 課程詳情頁：含大綱與統計（參考 TibaMe 式版面） */
export async function fetchPublishedCourseDetail(
  id: string,
): Promise<{ data: SiteCourseDetailPayload | null; error: Error | null }> {
  if (!isDatabaseConfigured()) {
    return { data: null, error: new Error("未設定 DATABASE_URL") };
  }

  if (!isLikelyCourseId(id)) {
    return { data: null, error: null };
  }

  try {
    const row = await prisma.course.findFirst({
      where: { id, isPublished: true },
      include: {
        ...courseInclude,
        ...curriculumInclude,
      },
    });
    if (!row) return { data: null, error: null };

    const course = mapPrismaCourse(row);
    const extra = buildDetailPayload(row);

    return {
      data: {
        course,
        ...extra,
      },
      error: null,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { data: null, error: new Error(message) };
  }
}
