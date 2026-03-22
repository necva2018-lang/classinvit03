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

function resolvePrisma(): PrismaClient {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const existing = globalForPrisma.prisma;
    if (existing && clientHasBannerDelegate(existing)) {
      return existing;
    }
    if (existing) {
      void existing.$disconnect().catch(() => {});
      globalForPrisma.prisma = undefined;
    }
    return makeClient();
  }

  // 開發模式：global 上的舊實例常缺少 prisma.generate 後新增的 delegate
  const existing = globalForPrisma.prisma;
  if (existing && clientHasBannerDelegate(existing)) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => {});
  }

  const fresh = makeClient();
  globalForPrisma.prisma = fresh;

  if (!clientHasBannerDelegate(fresh)) {
    console.error(
      "[db] PrismaClient 缺少 banner（findMany）。請執行：npx prisma generate，並完全重啟 next dev（必要時刪除 .next）。",
    );
  }

  return fresh;
}

export const prisma = resolvePrisma();
