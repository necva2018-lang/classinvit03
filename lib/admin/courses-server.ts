import { prisma } from "@/lib/db";

export async function getAdminCourseList() {
  return prisma.course.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAdminCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: { category: true },
  });
}

/** 後台深度編輯：含章節與課堂樹 */
export async function getAdminCourseWithCurriculum(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

export async function getCategoriesForSelect() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}
