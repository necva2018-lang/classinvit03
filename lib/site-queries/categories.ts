import { prisma } from "@/lib/db";

/** 前台導覽／首頁分類列使用（依後台「排序」欄位，同序時依名稱） */
export async function getNavCategories(): Promise<{ id: string; name: string }[]> {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}
