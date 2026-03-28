import { z } from "zod";

const nonNegOrNull = z.union([z.number().nonnegative(), z.null()]);

/** 課程主檔（深度編輯右欄） */
export const courseCurriculumCourseSchema = z.object({
  title: z.string().trim().min(1, "請填寫課程標題"),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  prerequisiteText: z.string().nullable().optional(),
  preparationText: z.string().nullable().optional(),
  infoDurationText: z.string().nullable().optional(),
  infoStructureText: z.string().nullable().optional(),
  infoResourcesText: z.string().nullable().optional(),
  infoCertificateText: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  categoryIds: z.array(z.string().min(1)).default([]),
  price: nonNegOrNull.optional(),
  discountedPrice: nonNegOrNull.optional(),
  isPublished: z.boolean(),
});

export type CourseCurriculumCourseInput = z.infer<
  typeof courseCurriculumCourseSchema
>;

/** 章節 */
export const courseSectionDraftSchema = z.object({
  title: z.string().trim().min(1, "請填寫章節標題"),
  order: z.number().int(),
});

export type CourseSectionDraftInput = z.infer<typeof courseSectionDraftSchema>;

const optionalVideoUrl = z
  .string()
  .nullable()
  .optional()
  .transform((s) => {
    if (s == null) return null;
    const t = String(s).trim();
    return t === "" ? null : t;
  })
  .refine(
    (s) => s === null || /^https?:\/\/.+/i.test(s),
    "影片連結需為 http(s) 網址或留空",
  );

/** 課堂 */
export const courseLessonDraftSchema = z.object({
  title: z.string().trim().min(1, "請填寫課堂標題"),
  videoUrl: optionalVideoUrl,
  duration: z
    .union([z.number().int().nonnegative(), z.null()])
    .optional(),
  order: z.number().int(),
});

export type CourseLessonDraftInput = z.infer<typeof courseLessonDraftSchema>;

export type CourseTreeDrafts = {
  course: CourseCurriculumCourseInput;
  sections: Record<string, CourseSectionDraftInput>;
  lessons: Record<string, CourseLessonDraftInput>;
};

/** 回傳側邊欄需標紅的節點 id（course 用 courseId） */
export function collectInvalidCurriculumIds(
  courseId: string,
  drafts: CourseTreeDrafts,
): Set<string> {
  const bad = new Set<string>();

  if (!courseCurriculumCourseSchema.safeParse(drafts.course).success) {
    bad.add(courseId);
  }

  for (const [sid, s] of Object.entries(drafts.sections)) {
    if (!courseSectionDraftSchema.safeParse(s).success) {
      bad.add(sid);
    }
  }

  for (const [lid, l] of Object.entries(drafts.lessons)) {
    if (!courseLessonDraftSchema.safeParse(l).success) {
      bad.add(lid);
    }
  }

  return bad;
}

/** 快速新增課堂：僅標題必填 */
export const quickLessonTitleSchema = z
  .string()
  .trim()
  .min(1, "請填寫課堂標題");
