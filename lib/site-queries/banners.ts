import type { Banner } from "@prisma/client";

import { prisma } from "@/lib/db";

/** 僅供前台路由使用，勿與 lib/admin 混在同一入口，以免打包器誤關聯後台 Client 元件。 */
const bannerOrderBy = [
  { order: "asc" as const },
  { createdAt: "asc" as const },
];

export async function getActiveBannersForHome(): Promise<Banner[]> {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: bannerOrderBy,
  });
}
