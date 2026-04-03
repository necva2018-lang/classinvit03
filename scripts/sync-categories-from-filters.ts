/**
 * 依 lib/course-filters 的 COURSE_FILTER_OPTIONS，同步六筆種子分類（cm0seedcat01…06）的
 * name／sortOrder。需與 prisma/seed 的 id 規則一致。
 *
 * 使用時機：曾跑過舊版 seed 覆寫、或 DB 與前台篩選標籤不一致時，手動對齊一次。
 */
import { PrismaClient } from "@prisma/client";
import { COURSE_FILTER_OPTIONS } from "../lib/course-filters";

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < COURSE_FILTER_OPTIONS.length; i++) {
    const opt = COURSE_FILTER_OPTIONS[i];
    const id = `cm0seedcat${String(i + 1).padStart(2, "0")}`;
    await prisma.category.upsert({
      where: { id },
      create: { id, name: opt.label, sortOrder: i },
      update: { name: opt.label, sortOrder: i },
    });
    console.log(`synced ${id} → "${opt.label}" sortOrder=${i}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
