import { prisma } from "@/lib/db";

const categoryListOrderBy = [
  { sortOrder: "asc" as const },
  { name: "asc" as const },
];

export async function getAllCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: categoryListOrderBy,
    include: { _count: { select: { courses: true } } },
  });
}
