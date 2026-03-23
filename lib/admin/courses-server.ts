import { prisma } from "@/lib/db";

const categoriesOrdered = {
  categories: {
    orderBy: [
      { sortOrder: "asc" as const },
      { name: "asc" as const },
    ],
  },
};

export async function getAdminCourseList() {
  return prisma.course.findMany({
    include: categoriesOrdered,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAdminCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: categoriesOrdered,
  });
}

/** 後台深度編輯：含章節與課堂樹 */
export async function getAdminCourseWithCurriculum(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      ...categoriesOrdered,
      announcements: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
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
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
