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

export async function getCategoriesForSelect() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}
