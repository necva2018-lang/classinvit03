import { prisma } from "@/lib/db";
import { withServerQueryTimeout } from "@/lib/server-query-timeout";

/** 前台「我的課程」列表 */
export async function getEnrollmentsForUser(userId: string) {
  return withServerQueryTimeout(
    prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          isPublished: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    }),
  );
}
