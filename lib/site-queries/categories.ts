import { prisma } from "@/lib/db";
import { withServerQueryTimeout } from "@/lib/server-query-timeout";

/** 前台導覽／首頁分類列使用（依後台「排序」欄位，同序時依名稱） */
export async function getNavCategories(): Promise<{ id: string; name: string }[]> {
  return withServerQueryTimeout(
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  );
}
