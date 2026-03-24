import { prisma } from "@/lib/db";

export type CategorySlice = { name: string; value: number };

export type ActivityFeedItem = {
  at: string;
  title: string;
  detail: string;
};

export type DashboardSnapshot = {
  totalRevenue: number;
  newStudentsThisMonth: number;
  categorySlices: CategorySlice[];
  recentActivity: ActivityFeedItem[];
};

function startOfCurrentMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 以「當前課程牌價／特價」估算總營收（每筆 Enrollment 計一次） */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [enrollments, newStudentsThisMonth, coursesForCategories, categories, tenMinUsers, tenMinEnrolls] =
    await Promise.all([
      prisma.enrollment.findMany({
        include: {
          course: { select: { title: true, price: true, discountedPrice: true } },
        },
      }),
      prisma.user.count({
        where: {
          role: "STUDENT",
          createdAt: { gte: startOfCurrentMonth() },
        },
      }),
      prisma.course.findMany({
        select: {
          categories: {
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            select: { name: true },
          },
        },
      }),
      prisma.category.findMany({
        select: { id: true, name: true, sortOrder: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 10 * 60 * 1000),
          },
        },
        select: {
          name: true,
          email: true,
          createdAt: true,
          role: true,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.enrollment.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 10 * 60 * 1000),
          },
        },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

  let totalRevenue = 0;
  for (const e of enrollments) {
    const sale = e.course.discountedPrice ?? e.course.price ?? 0;
    totalRevenue += sale;
  }

  const merged = new Map<string, number>();
  for (const row of coursesForCategories) {
    if (row.categories.length === 0) {
      merged.set("未分類", (merged.get("未分類") ?? 0) + 1);
    } else {
      for (const c of row.categories) {
        merged.set(c.name, (merged.get(c.name) ?? 0) + 1);
      }
    }
  }
  const orderedNames = categories.map((c) => c.name);
  const rankSlice = (name: string) => {
    if (name === "未分類") return 100_000;
    const i = orderedNames.indexOf(name);
    return i === -1 ? 50_000 : i;
  };
  const categorySlices: CategorySlice[] = [...merged.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => rankSlice(a.name) - rankSlice(b.name));

  const activityRaw: { at: Date; title: string; detail: string }[] = [];

  for (const u of tenMinUsers) {
    const roleLabel =
      u.role === "STUDENT" ? "學員" : u.role === "ADMIN" ? "管理員" : "講師";
    activityRaw.push({
      at: u.createdAt,
      title: u.name?.trim() || u.email || "使用者",
      detail: `新註冊（${roleLabel}）`,
    });
  }

  for (const e of tenMinEnrolls) {
    activityRaw.push({
      at: e.createdAt,
      title: e.user.name?.trim() || e.user.email || "學員",
      detail: `購買課程「${e.course.title}」`,
    });
  }

  activityRaw.sort((a, b) => b.at.getTime() - a.at.getTime());
  const recentActivity: ActivityFeedItem[] = activityRaw.slice(0, 12).map((r) => ({
    at: r.at.toISOString(),
    title: r.title,
    detail: r.detail,
  }));

  return {
    totalRevenue,
    newStudentsThisMonth,
    categorySlices,
    recentActivity,
  };
}

/**
 * 從 Prisma 錯誤字串取出可讀核心訊息（略過 Turbopack／chunk 路徑等雜訊）。
 */
export function simplifyDashboardErrorMessage(raw: string): string {
  const markers = [
    "Can't reach database server",
    "P1001",
    "P1017",
    "Authentication failed",
    "password authentication failed",
    "Server has closed the connection",
    "Can't connect",
    "ECONNREFUSED",
    "ETIMEDOUT",
    'relation "',
    "does not exist in the current database",
    "Unknown database",
  ];
  let cut = -1;
  for (const m of markers) {
    const i = raw.indexOf(m);
    if (i >= 0 && (cut < 0 || i < cut)) cut = i;
  }
  const out = cut >= 0 ? raw.slice(cut).trim() : raw.trim();
  return out.length > 1500 ? `${out.slice(0, 1500)}…` : out;
}

/** 不拋錯；將 Prisma／連線錯誤回傳給儀表板顯示，便於排查 Zeabur／migration */
export async function getDashboardSnapshotSafe(): Promise<
  | { ok: true; data: DashboardSnapshot }
  | { ok: false; error: string; errorRaw?: string }
> {
  try {
    const data = await getDashboardSnapshot();
    return { ok: true, data };
  } catch (e) {
    const errorRaw = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: simplifyDashboardErrorMessage(errorRaw),
      errorRaw,
    };
  }
}

export function dashboardLoadHints(error: string): string[] {
  const hints: string[] = [];
  const e = error.toLowerCase();

  if (
    e.includes("can't reach database server") ||
    e.includes("p1001") ||
    e.includes("connect econnrefused") ||
    e.includes("timeout") ||
    e.includes("etimedout")
  ) {
    hints.push(
      "若 Web 與 PostgreSQL 同在 Zeabur 專案：到 Web 服務確認已「綁定」PostgreSQL，Variables 的 DATABASE_URL 應為內網／Internal 字串；不必為 App 開資料庫公網。",
    );
    hints.push(
      "若從本機連 Zeabur 資料庫：PostgreSQL 需開 Public Networking，且 .env 使用外網 Connection String；可嘗試連線字串加上 ?sslmode=require（依 Zeabur 文件）。",
    );
    hints.push(
      "仍連不到：暫關 VPN／防火牆測試；並在 Zeabur Logs 對照錯誤與 digest。",
    );
  }

  if (
    e.includes("does not exist") ||
    e.includes("unknown model") ||
    e.includes("p2021")
  ) {
    hints.push(
      "資料表可能尚未建立：請對「同一個」DATABASE_URL 指向的資料庫執行 npx prisma migrate deploy。",
    );
    hints.push("初次部署後可再執行 npm run db:seed 寫入種子資料。");
  }

  if (e.includes("server has closed the connection") || e.includes("db_")) {
    hints.push(
      "連線被中斷：可能是連線池上限或 SSL 設定不符，請比對 Zeabur 控制台提供的最新 Connection String。",
    );
  }

  if (hints.length === 0) {
    hints.push(
      "請確認專案環境變數 DATABASE_URL 正確、資料庫服務運行中，並已執行 prisma migrate deploy。",
    );
  }

  return hints;
}
