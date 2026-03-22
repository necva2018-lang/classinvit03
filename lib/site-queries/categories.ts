import { prisma } from "@/lib/db";

/** 前台導覽／首頁分類列使用（依名稱排序） */
export async function getNavCategories(): Promise<{ id: string; name: string }[]> {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
