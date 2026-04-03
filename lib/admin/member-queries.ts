import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export type MemberStatusFilter = "all" | "active" | "inactive";

export type MemberListQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: Role | "all";
  status?: MemberStatusFilter;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 20;

function clampPage(raw: number | undefined): number {
  if (!raw || !Number.isFinite(raw)) return 1;
  return Math.max(1, Math.floor(raw));
}

function normalizePageSize(raw: number | undefined): number {
  if (!raw || !Number.isFinite(raw)) return DEFAULT_PAGE_SIZE;
  return Math.min(100, Math.max(5, Math.floor(raw)));
}

function buildPagination(
  page: number,
  pageSize: number,
  total: number,
): Pagination {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAdminMemberList(query: MemberListQuery) {
  const page = clampPage(query.page);
  const pageSize = normalizePageSize(query.pageSize);
  const q = query.q?.trim() || "";
  const role = query.role && query.role !== "all" ? query.role : undefined;
  const status = query.status ?? "all";

  const where = {
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role ? { role } : {}),
    ...(status === "active"
      ? { isActive: true }
      : status === "inactive"
        ? { isActive: false }
        : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            loginLogs: true,
            courseViewLogs: true,
          },
        },
      },
    }),
  ]);

  return {
    rows,
    pagination: buildPagination(page, pageSize, total),
  };
}

export async function getAdminMemberDetail(params: {
  memberId: string;
  loginPage?: number;
  viewPage?: number;
  pageSize?: number;
}) {
  const pageSize = normalizePageSize(params.pageSize);
  const loginPage = clampPage(params.loginPage);
  const viewPage = clampPage(params.viewPage);

  const member = await prisma.user.findUnique({
    where: { id: params.memberId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          enrollments: true,
          loginLogs: true,
          courseViewLogs: true,
        },
      },
    },
  });
  if (!member) return null;

  const [loginTotal, viewTotal, loginRows, viewRows, enrollments] =
    await Promise.all([
      prisma.authLoginLog.count({ where: { userId: member.id } }),
      prisma.courseViewLog.count({ where: { userId: member.id } }),
      prisma.authLoginLog.findMany({
        where: { userId: member.id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (loginPage - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          createdAt: true,
          status: true,
          failureCode: true,
          emailInput: true,
          ipHash: true,
          userAgent: true,
        },
      }),
      prisma.courseViewLog.findMany({
        where: { userId: member.id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (viewPage - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          createdAt: true,
          visitorId: true,
          ipHash: true,
          userAgent: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.enrollment.findMany({
        where: { userId: member.id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 20,
        select: {
          id: true,
          createdAt: true,
          course: { select: { id: true, title: true } },
        },
      }),
    ]);

  return {
    member,
    enrollments,
    loginRows,
    viewRows,
    loginPagination: buildPagination(loginPage, pageSize, loginTotal),
    viewPagination: buildPagination(viewPage, pageSize, viewTotal),
  };
}
