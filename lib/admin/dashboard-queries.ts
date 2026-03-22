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
  const [enrollments, newStudentsThisMonth, categoryGroups, categories, tenMinUsers, tenMinEnrolls] =
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
      prisma.course.groupBy({
        by: ["categoryId"],
        _count: { id: true },
      }),
      prisma.category.findMany({ select: { id: true, name: true } }),
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

  const idToName = new Map(categories.map((c) => [c.id, c.name] as const));
  const merged = new Map<string, number>();
  for (const g of categoryGroups) {
    const label = g.categoryId
      ? (idToName.get(g.categoryId) ?? "未知分類")
      : "未分類";
    merged.set(label, (merged.get(label) ?? 0) + g._count.id);
  }
  const categorySlices: CategorySlice[] = [...merged.entries()].map(
    ([name, value]) => ({ name, value }),
  );

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
      "Zeabur 控制台 → PostgreSQL 服務 → 確認狀態為運行中，並已開啟「公網／Public」連線；請複製「外網用」Connection String 到本機 .env 的 DATABASE_URL（勿混用僅限叢集內網的 URL）。",
    );
    hints.push(
      "連線字串若未帶 SSL，可嘗試在結尾加上 ?sslmode=require（或 Zeabur 文件建議的參數）；變更後需重啟 next dev。",
    );
    hints.push(
      "本機仍連不到：暫關 VPN／公司防火牆測試，或用 Zeabur 網頁終端機對同一 DB 執行 migrate，確認資料庫本身可連。",
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
