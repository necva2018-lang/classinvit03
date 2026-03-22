import type { Banner } from "@prisma/client";

import { prisma } from "@/lib/db";

const bannerOrderBy = [
  { order: "asc" as const },
  { createdAt: "asc" as const },
];

export async function getAllBannersForAdmin(): Promise<Banner[]> {
  return prisma.banner.findMany({
    orderBy: bannerOrderBy,
  });
}
