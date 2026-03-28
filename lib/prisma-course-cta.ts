import { Prisma } from "@prisma/client";

function courseModelHasField(fieldName: string): boolean {
  try {
    const course = Prisma.dmmf.datamodel.models.find((m) => m.name === "Course");
    return course?.fields.some((f) => f.name === fieldName) ?? false;
  } catch {
    return false;
  }
}

/**
 * 目前載入的 Prisma Client 是否含 Course.ctaKind（與 `prisma generate` 同步）。
 * 開發時若 Node 仍快取舊版 `@prisma/client`，略過此欄可避免 PrismaClientValidationError；
 * 重啟 dev 並成功 generate 後會自動改為寫入 ctaKind。
 */
export function prismaSupportsCourseCtaKind(): boolean {
  return courseModelHasField("ctaKind");
}

/** 是否含「你可以學到／適合對象」兩欄（需 migrate + generate） */
export function prismaSupportsCourseLearnAudienceFields(): boolean {
  return (
    courseModelHasField("learnOutcomesText") &&
    courseModelHasField("targetAudienceText")
  );
}
