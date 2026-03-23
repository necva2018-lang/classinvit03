"use server";

import { prisma } from "@/lib/db";
import {
  courseCurriculumCourseSchema,
  courseLessonDraftSchema,
  courseSectionDraftSchema,
  quickLessonTitleSchema,
} from "@/lib/validation/course-curriculum";
import { revalidatePath } from "next/cache";

function revalidateCourse(courseId: string) {
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
}

/** 子表變更時 bump 課程 updatedAt，讓深度編輯頁的 version 能觸發同步 */
async function touchCourseRow(courseId: string) {
  await prisma.course.update({
    where: { id: courseId },
    data: { updatedAt: new Date() },
  });
}

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function saveCourseMeta(
  courseId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = courseCurriculumCourseSchema.safeParse(input);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ?? "課程資料驗證失敗";
    return { ok: false, message: msg };
  }

  const d = parsed.data;
  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: d.title,
      subtitle: d.subtitle ?? null,
      description: d.description ?? null,
      prerequisiteText: d.prerequisiteText ?? null,
      preparationText: d.preparationText ?? null,
      imageUrl: d.imageUrl ?? null,
      categories: {
        set: (d.categoryIds ?? []).map((id) => ({ id })),
      },
      price: d.price ?? null,
      discountedPrice: d.discountedPrice ?? null,
      isPublished: d.isPublished,
    },
  });

  revalidateCourse(courseId);
  return { ok: true };
}

export async function saveSection(
  sectionId: string,
  courseId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = courseSectionDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "章節驗證失敗",
    };
  }

  await prisma.section.update({
    where: { id: sectionId },
    data: {
      title: parsed.data.title,
      order: parsed.data.order,
    },
  });

  await touchCourseRow(courseId);
  revalidateCourse(courseId);
  return { ok: true };
}

export async function saveLesson(
  lessonId: string,
  courseId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = courseLessonDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "課堂驗證失敗",
    };
  }

  const d = parsed.data;
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title: d.title,
      videoUrl: d.videoUrl ?? null,
      duration: d.duration ?? null,
      order: d.order,
    },
  });

  await touchCourseRow(courseId);
  revalidateCourse(courseId);
  return { ok: true };
}

export async function createLessonQuick(
  sectionId: string,
  courseId: string,
  titleRaw: string,
): Promise<ActionResult & { lessonId?: string }> {
  const title = quickLessonTitleSchema.safeParse(titleRaw);
  if (!title.success) {
    return {
      ok: false,
      message: title.error.issues[0]?.message ?? "標題無效",
    };
  }

  const agg = await prisma.lesson.aggregate({
    where: { sectionId },
    _max: { order: true },
  });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const lesson = await prisma.lesson.create({
    data: {
      sectionId,
      title: title.data,
      order: nextOrder,
    },
  });

  await touchCourseRow(courseId);
  revalidateCourse(courseId);
  return { ok: true, lessonId: lesson.id };
}

export async function createSectionQuick(
  courseId: string,
  titleRaw: string,
): Promise<ActionResult & { sectionId?: string }> {
  const title = zStringTitle(titleRaw);
  if (!title.ok) return title;

  const agg = await prisma.section.aggregate({
    where: { courseId },
    _max: { order: true },
  });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const section = await prisma.section.create({
    data: {
      courseId,
      title: title.value,
      order: nextOrder,
    },
  });

  await touchCourseRow(courseId);
  revalidateCourse(courseId);
  return { ok: true, sectionId: section.id };
}

function zStringTitle(
  raw: string,
): { ok: true; value: string } | { ok: false; message: string } {
  const t = String(raw ?? "").trim();
  if (!t) return { ok: false, message: "請填寫章節標題" };
  return { ok: true, value: t };
}
