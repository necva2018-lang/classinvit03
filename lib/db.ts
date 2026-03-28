import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makeClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** 確認目前載入的 PrismaClient 已含 Banner model（避免舊 singleton 或錯誤 bundle） */
function clientHasBannerDelegate(client: PrismaClient): boolean {
  const d = client as unknown as { banner?: { findMany?: unknown } };
  return typeof d.banner?.findMany === "function";
}

function getCourseRuntimeFields(
  client: PrismaClient,
): { name: string }[] | undefined {
  return (
    client as unknown as {
      _runtimeDataModel?: {
        models?: Record<string, { fields?: { name: string }[] }>;
      };
    }
  )._runtimeDataModel?.models?.Course?.fields;
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

function clientMatchesCurrentSchema(client: PrismaClient): boolean {
  return (
    clientHasBannerDelegate(client) &&
    clientCourseHasCtaKindField(client) &&
    clientCourseHasLearnAudienceFields(client)
  );
}

function resolvePrisma(): PrismaClient {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const existing = globalForPrisma.prisma;
    if (existing && clientMatchesCurrentSchema(existing)) {
      return existing;
    }
    if (existing) {
      void existing.$disconnect().catch(() => {});
      globalForPrisma.prisma = undefined;
    }
    return makeClient();
  }

  // 開發模式：global 上的舊實例常缺少 prisma.generate 後新增的欄位／delegate
  const existing = globalForPrisma.prisma;
  if (existing && clientMatchesCurrentSchema(existing)) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => {});
  }

  const fresh = makeClient();
  globalForPrisma.prisma = fresh;

  if (!clientMatchesCurrentSchema(fresh)) {
    console.error(
      "[db] PrismaClient 與 schema 不同步（需含 Banner、Course.ctaKind、learnOutcomesText 等）。請執行：npx prisma generate，並完全重啟 next dev（必要時刪除 .next）。",
    );
  }

  return fresh;
}

export const prisma = resolvePrisma();
