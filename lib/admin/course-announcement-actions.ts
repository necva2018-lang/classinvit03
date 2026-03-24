"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function revalidateCoursePublic(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/courses");
}

export type AnnouncementActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function createCourseAnnouncement(
  courseId: string,
  titleRaw: string,
  bodyRaw: string,
): Promise<AnnouncementActionResult> {
  const title = String(titleRaw ?? "").trim();
  if (!title) return { ok: false, message: "請填寫公告標題" };
  const body = String(bodyRaw ?? "").trim() || null;

  const agg = await prisma.courseAnnouncement.aggregate({
    where: { courseId },
    _max: { sortOrder: true },
  });
  const nextOrder = (agg._max.sortOrder ?? -1) + 1;

  await prisma.courseAnnouncement.create({
    data: {
      courseId,
      title,
      body,
      sortOrder: nextOrder,
    },
  });

  revalidateCoursePublic(courseId);
  return { ok: true };
}

export async function deleteCourseAnnouncement(
  announcementId: string,
  courseId: string,
): Promise<AnnouncementActionResult> {
  const r = await prisma.courseAnnouncement.deleteMany({
    where: { id: announcementId, courseId },
  });
  if (r.count === 0) return { ok: false, message: "找不到公告" };
  revalidateCoursePublic(courseId);
  return { ok: true };
}
