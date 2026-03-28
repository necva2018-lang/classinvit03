import { prisma } from "@/lib/db";

/**
 * 當執行中的 Prisma Client 尚未 generate 新欄位時，仍嘗試把「你可以學到／適合對象」寫入 DB
 *（需已執行 migrate，資料表已有對應欄位）。
 */
export async function persistLearnAudienceColumnsRaw(
  courseId: string,
  learnOutcomesText: string | null,
  targetAudienceText: string | null,
): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "Course"
    SET
      "course_learn_outcomes_text" = ${learnOutcomesText},
      "course_target_audience_text" = ${targetAudienceText}
    WHERE "id" = ${courseId}
  `;
}
