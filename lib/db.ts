import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makeClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** 目前載入的 @prisma/client 是否已含 Banner.videoUrl（與 prisma generate 同步） */
function generatedClientExposesBannerVideoUrl(): boolean {
  return "videoUrl" in Prisma.BannerScalarFieldEnum;
}

/** 確認目前載入的 PrismaClient 已含 Banner model（避免舊 singleton 或錯誤 bundle） */
function clientHasBannerDelegate(client: PrismaClient): boolean {
  const d = client as unknown as { banner?: { findMany?: unknown } };
  return typeof d.banner?.findMany === "function";
}

type PrismaRuntimeField = { name: string; isRequired?: boolean };

function getModelRuntimeFields(
  client: PrismaClient,
  model: "Banner" | "Course",
): PrismaRuntimeField[] | undefined {
  return (
    client as unknown as {
      _runtimeDataModel?: {
        models?: Record<string, { fields?: PrismaRuntimeField[] }>;
      };
    }
  )._runtimeDataModel?.models?.[model]?.fields;
}

function getCourseRuntimeFields(
  client: PrismaClient,
): { name: string }[] | undefined {
  return getModelRuntimeFields(client, "Course");
}

/** 與目前 schema 同步：Course 需含 ctaKind */
function clientCourseHasCtaKindField(client: PrismaClient): boolean {
  const fields = getCourseRuntimeFields(client);
  if (!Array.isArray(fields)) {
    return true;
  }
  return fields.some((f) => f.name === "ctaKind");
}

/** Course 需含 learnOutcomesText／targetAudienceText */
function clientCourseHasLearnAudienceFields(client: PrismaClient): boolean {
  const fields = getCourseRuntimeFields(client);
  if (!Array.isArray(fields)) {
    return true;
  }
  return (
    fields.some((f) => f.name === "learnOutcomesText") &&
    fields.some((f) => f.name === "targetAudienceText")
  );
}

/** Course 需含 introBlocksJson（說明區段） */
function clientCourseHasIntroBlocksJsonField(client: PrismaClient): boolean {
  const fields = getCourseRuntimeFields(client);
  if (!Array.isArray(fields)) {
    return true;
  }
  return fields.some((f) => f.name === "introBlocksJson");
}

/**
 * Banner 需含 videoUrl。若執行時無法讀取 _runtimeDataModel（部分打包情境），改以
 * Prisma.BannerScalarFieldEnum 判斷，避免誤把「無法讀取」當成 schema 正確而沿用舊 Client。
 */
function clientBannerHasVideoUrlField(client: PrismaClient): boolean {
  if (!generatedClientExposesBannerVideoUrl()) {
    return false;
  }
  const fields = getModelRuntimeFields(client, "Banner");
  if (Array.isArray(fields)) {
    return fields.some((f) => f.name === "videoUrl");
  }
  return true;
}

/** Banner.imageUrl 須為可空（僅影片、無封面圖時寫入 null／空字串） */
function clientBannerImageUrlIsOptional(client: PrismaClient): boolean {
  if (!generatedClientExposesBannerVideoUrl()) {
    return false;
  }
  const fields = getModelRuntimeFields(client, "Banner");
  if (Array.isArray(fields)) {
    const f = fields.find((x) => x.name === "imageUrl");
    if (!f) return false;
    return f.isRequired !== true;
  }
  return true;
}

function clientMatchesCurrentSchema(client: PrismaClient): boolean {
  return (
    clientHasBannerDelegate(client) &&
    clientBannerHasVideoUrlField(client) &&
    clientBannerImageUrlIsOptional(client) &&
    clientCourseHasCtaKindField(client) &&
    clientCourseHasLearnAudienceFields(client) &&
    clientCourseHasIntroBlocksJsonField(client)
  );
}

function getPooledPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing && clientMatchesCurrentSchema(existing)) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }

  const fresh = makeClient();
  globalForPrisma.prisma = fresh;

  if (!generatedClientExposesBannerVideoUrl()) {
    console.error(
      "[db] 目前載入的 @prisma/client 不含 Banner.videoUrl。請執行 npx prisma generate，停止 next dev，刪除 .next 後再啟動。",
    );
  } else if (!clientMatchesCurrentSchema(fresh)) {
    console.error(
      "[db] PrismaClient 與 schema 不同步（需含 Banner.videoUrl、可空的 imageUrl、Course.ctaKind 等）。請執行：npx prisma generate，並完全重啟 next dev（必要時刪除 .next）。",
    );
  }

  return fresh;
}

/**
 * 每次存取都經由 getPooledPrismaClient()，避免 next dev／Turbopack 熱重載後仍握有「第一次載入」的過期
 * PrismaClient（會出現 Unknown argument `videoUrl`）。
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPooledPrismaClient();
    const value = Reflect.get(client, prop, receiver) as unknown;
    if (typeof value === "function") {
      return (value as (...a: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
