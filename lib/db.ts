import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type { PrismaClient as PrismaClientType } from "@prisma/client";

/**
 * Turbopack 對 `@prisma/client` 的 ESM 打包有時會與 `node_modules` 內實際 Client 脫節
 *（驗證層仍為舊 schema，出現 Unknown argument `passwordHash`）。
 * 改以 Node 的 require 解析鏈載入，與 `npx prisma generate` 產物一致。
 */
const nodeRequire = createRequire(fileURLToPath(import.meta.url));
const {
  PrismaClient: PrismaClientCtor,
  Prisma,
} = nodeRequire("@prisma/client") as typeof import("@prisma/client");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
  prismaDatamodelSig: string | undefined;
};

function makeClient(): PrismaClientType {
  return new PrismaClientCtor({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * 模組載入時依 `Prisma.dmmf` 算一次簽章；Turbopack HMR 重新執行本檔後簽章若變，即換新 Client。
 */
const PRISMA_DATAMODEL_SIG = (() => {
  const models = Prisma.dmmf.datamodel.models;
  const payload = models
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => [m.name, m.fields.map((f) => f.name).sort()] as const);
  return JSON.stringify(payload);
})();

function getPooledPrismaClient(): PrismaClientType {
  const existing = globalForPrisma.prisma;
  if (existing && globalForPrisma.prismaDatamodelSig === PRISMA_DATAMODEL_SIG) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
    globalForPrisma.prismaDatamodelSig = undefined;
  }

  const fresh = makeClient();
  globalForPrisma.prisma = fresh;
  globalForPrisma.prismaDatamodelSig = PRISMA_DATAMODEL_SIG;

  return fresh;
}

/**
 * 每次存取都經由 getPooledPrismaClient()，避免 next dev／Turbopack 熱重載後仍握有舊版 Client。
 */
export const prisma = new Proxy({} as PrismaClientType, {
  get(_target, prop, receiver) {
    const client = getPooledPrismaClient();
    const value = Reflect.get(client, prop, receiver) as unknown;
    if (typeof value === "function") {
      return (value as (...a: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
