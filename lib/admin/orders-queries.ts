import { prisma } from "@/lib/db";

export type OrderRow = {
  id: string;
  createdAt: string;
  userName: string;
  userEmail: string | null;
  courseTitle: string;
  amount: number;
};

export async function getRecentOrders(limit = 50): Promise<OrderRow[]> {
  const rows = await prisma.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, price: true, discountedPrice: true } },
    },
  });

  return rows.map((e) => ({
    id: e.id,
    createdAt: e.createdAt.toISOString(),
    userName: e.user.name?.trim() || e.user.email || "—",
    userEmail: e.user.email,
    courseTitle: e.course.title,
    amount: e.course.discountedPrice ?? e.course.price ?? 0,
  }));
}
