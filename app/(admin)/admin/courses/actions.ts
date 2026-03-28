"use server";

import { prisma } from "@/lib/db";
import { persistLearnAudienceColumnsRaw } from "@/lib/admin/persist-learn-audience-raw";
import {
  prismaSupportsCourseCtaKind,
  prismaSupportsCourseLearnAudienceFields,
} from "@/lib/prisma-course-cta";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type CourseStatus = "DRAFT" | "PAUSED";

function parseFloatOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function parseCourseStatus(v: FormDataEntryValue | null): CourseStatus {
  return v === "PAUSED" ? "PAUSED" : "DRAFT";
}

function parseCourseCtaKind(
  v: FormDataEntryValue | null,
): "CART" | "SUBSIDY" {
  return v === "SUBSIDY" ? "SUBSIDY" : "CART";
}

function categoryIdsFromForm(formData: FormData): string[] {
  const raw = formData.getAll("categoryIds");
  const ids: string[] = [];
  for (const v of raw) {
    const s = String(v).trim();
    if (s) ids.push(s);
  }
  return ids;
}

/** Prisma Client 未 generate 新欄位時，仍用 Raw SQL 寫入（需已 migrate） */
async function syncLearnAudienceIfStaleClient(
  courseId: string,
  learnOutcomesText: string | null,
  targetAudienceText: string | null,
) {
  if (prismaSupportsCourseLearnAudienceFields()) return;
  try {
    await persistLearnAudienceColumnsRaw(
      courseId,
      learnOutcomesText,
      targetAudienceText,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin] sync learn/audience raw:", msg);
    throw new Error(
      "無法儲存「你可以學到／適合對象」。請確認已執行 npx prisma migrate deploy；並執行 npx prisma generate 後重啟開發伺服器。若錯誤為 column does not exist，代表資料庫尚未遷移。",
    );
  }
}

export async function createCourse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("請填寫課程標題");
  }

  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const status = parseCourseStatus(formData.get("status"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const prerequisiteText =
    String(formData.get("prerequisiteText") ?? "").trim() || null;
  const preparationText =
    String(formData.get("preparationText") ?? "").trim() || null;
  const learnOutcomesText =
    String(formData.get("learnOutcomesText") ?? "").trim() || null;
  const targetAudienceText =
    String(formData.get("targetAudienceText") ?? "").trim() || null;
  const infoDurationText =
    String(formData.get("infoDurationText") ?? "").trim() || null;
  const infoStructureText =
    String(formData.get("infoStructureText") ?? "").trim() || null;
  const infoResourcesText =
    String(formData.get("infoResourcesText") ?? "").trim() || null;
  const infoCertificateText =
    String(formData.get("infoCertificateText") ?? "").trim() || null;
  const ctaKind = parseCourseCtaKind(formData.get("ctaKind"));
  const ctaCartText = String(formData.get("ctaCartText") ?? "").trim() || null;
  const ctaCartUrl = String(formData.get("ctaCartUrl") ?? "").trim() || null;
  const ctaBuyText = String(formData.get("ctaBuyText") ?? "").trim() || null;
  const ctaBuyUrl = String(formData.get("ctaBuyUrl") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const categoryIds = categoryIdsFromForm(formData);
  const price = parseFloatOrNull(formData.get("price"));
  const discountedPrice = parseFloatOrNull(formData.get("discountedPrice"));
  const isPublished = status === "PAUSED" ? false : formData.get("isPublished") === "on";

  const commerceData =
    ctaKind === "SUBSIDY"
      ? {
          price: null as number | null,
          discountedPrice: null as number | null,
          imageUrl,
          isPublished,
        }
      : {
          imageUrl,
          price,
          discountedPrice,
          isPublished,
        };

  const created = await prisma.course.create({
    data: {
      title,
      subtitle,
      status,
      description,
      prerequisiteText,
      preparationText,
      infoDurationText,
      infoStructureText,
      infoResourcesText,
      infoCertificateText,
      ...(prismaSupportsCourseLearnAudienceFields()
        ? { learnOutcomesText, targetAudienceText }
        : {}),
      ...(prismaSupportsCourseCtaKind() ? { ctaKind } : {}),
      ctaCartText,
      ctaCartUrl,
      ctaBuyText,
      ctaBuyUrl,
      ...commerceData,
      introBlocksJson: [],
      categories:
        categoryIds.length > 0
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined,
    },
  });

  await syncLearnAudienceIfStaleClient(
    created.id,
    learnOutcomesText,
    targetAudienceText,
  );

  revalidatePath("/admin/courses");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath(`/courses/${created.id}`);
  redirect("/admin/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("請填寫課程標題");
  }

  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const status = parseCourseStatus(formData.get("status"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const prerequisiteText =
    String(formData.get("prerequisiteText") ?? "").trim() || null;
  const preparationText =
    String(formData.get("preparationText") ?? "").trim() || null;
  const learnOutcomesText =
    String(formData.get("learnOutcomesText") ?? "").trim() || null;
  const targetAudienceText =
    String(formData.get("targetAudienceText") ?? "").trim() || null;
  const infoDurationText =
    String(formData.get("infoDurationText") ?? "").trim() || null;
  const infoStructureText =
    String(formData.get("infoStructureText") ?? "").trim() || null;
  const infoResourcesText =
    String(formData.get("infoResourcesText") ?? "").trim() || null;
  const infoCertificateText =
    String(formData.get("infoCertificateText") ?? "").trim() || null;
  const ctaKind = parseCourseCtaKind(formData.get("ctaKind"));
  const ctaCartText = String(formData.get("ctaCartText") ?? "").trim() || null;
  const ctaCartUrl = String(formData.get("ctaCartUrl") ?? "").trim() || null;
  const ctaBuyText = String(formData.get("ctaBuyText") ?? "").trim() || null;
  const ctaBuyUrl = String(formData.get("ctaBuyUrl") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const categoryIds = categoryIdsFromForm(formData);
  const price = parseFloatOrNull(formData.get("price"));
  const discountedPrice = parseFloatOrNull(formData.get("discountedPrice"));
  const isPublished = status === "PAUSED" ? false : formData.get("isPublished") === "on";

  const baseUpdate = {
    title,
    subtitle,
    status,
    description,
    prerequisiteText,
    preparationText,
    infoDurationText,
    infoStructureText,
    infoResourcesText,
    infoCertificateText,
    ...(prismaSupportsCourseLearnAudienceFields()
      ? { learnOutcomesText, targetAudienceText }
      : {}),
    ...(prismaSupportsCourseCtaKind() ? { ctaKind } : {}),
    ctaCartText,
    ctaCartUrl,
    ctaBuyText,
    ctaBuyUrl,
    categories: { set: categoryIds.map((id) => ({ id })) },
  };

  const data =
    ctaKind === "SUBSIDY"
      ? {
          ...baseUpdate,
          imageUrl,
          isPublished,
        }
      : {
          ...baseUpdate,
          imageUrl,
          price,
          discountedPrice,
          isPublished,
        };

  await prisma.course.update({
    where: { id: courseId },
    data,
  });

  await syncLearnAudienceIfStaleClient(
    courseId,
    learnOutcomesText,
    targetAudienceText,
  );

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function duplicateCourse(courseId: string) {
  const source = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      categories: true,
      announcements: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!source) throw new Error("找不到要複製的課程");

  const duplicated = await prisma.course.create({
    data: {
      title: `${source.title}（複製）`,
      status: "DRAFT",
      subtitle: source.subtitle,
      description: source.description,
      prerequisiteText: source.prerequisiteText,
      preparationText: source.preparationText,
      infoDurationText: (source as { infoDurationText?: string | null })
        .infoDurationText,
      infoStructureText: (source as { infoStructureText?: string | null })
        .infoStructureText,
      infoResourcesText: (source as { infoResourcesText?: string | null })
        .infoResourcesText,
      infoCertificateText: (source as { infoCertificateText?: string | null })
        .infoCertificateText,
      ...(prismaSupportsCourseLearnAudienceFields()
        ? {
            learnOutcomesText: (
              source as { learnOutcomesText?: string | null }
            ).learnOutcomesText,
            targetAudienceText: (
              source as { targetAudienceText?: string | null }
            ).targetAudienceText,
          }
        : {}),
      ...(prismaSupportsCourseCtaKind()
        ? {
            ctaKind:
              (source as { ctaKind?: "CART" | "SUBSIDY" }).ctaKind ?? "CART",
          }
        : {}),
      ctaCartText: source.ctaCartText,
      ctaCartUrl: source.ctaCartUrl,
      ctaBuyText: source.ctaBuyText,
      ctaBuyUrl: source.ctaBuyUrl,
      listingNoInstructorLine: source.listingNoInstructorLine,
      listingNoReviewsLine: source.listingNoReviewsLine,
      imageUrl: source.imageUrl,
      introBlocksJson: (source as { introBlocksJson?: unknown }).introBlocksJson ?? [],
      price: source.price,
      discountedPrice: source.discountedPrice,
      isPublished: false,
      categories: {
        connect: source.categories.map((c) => ({ id: c.id })),
      },
      announcements: {
        create: source.announcements.map((a) => ({
          title: a.title,
          body: a.body,
          sortOrder: a.sortOrder,
        })),
      },
      sections: {
        create: source.sections.map((s) => ({
          title: s.title,
          order: s.order,
          lessons: {
            create: s.lessons.map((l) => ({
              title: l.title,
              videoUrl: l.videoUrl,
              duration: l.duration,
              order: l.order,
            })),
          },
        })),
      },
    },
  });

  if (!prismaSupportsCourseLearnAudienceFields()) {
    await syncLearnAudienceIfStaleClient(
      duplicated.id,
      (source as { learnOutcomesText?: string | null }).learnOutcomesText ??
        null,
      (source as { targetAudienceText?: string | null }).targetAudienceText ??
        null,
    );
  }

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/admin/courses/${duplicated.id}`);
  revalidatePath(`/courses/${duplicated.id}`);
  redirect(`/admin/courses/${duplicated.id}`);
}

export async function deleteCourse(courseId: string) {
  const row = await prisma.course.findUnique({
    where: { id: courseId },
    select: { isPublished: true },
  });
  if (!row) throw new Error("找不到課程");
  if (row.isPublished) {
    throw new Error("已上架課程不可刪除，請先取消上架。");
  }

  await prisma.course.delete({ where: { id: courseId } });

  revalidatePath("/admin/courses");
  revalidatePath("/");
  revalidatePath("/courses");
  redirect("/admin/courses");
}
