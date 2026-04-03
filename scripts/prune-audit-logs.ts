import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function retentionDays(): number {
  const raw = process.env.AUDIT_LOG_RETENTION_DAYS?.trim();
  const n = Number.parseInt(raw || "", 10);
  if (!Number.isFinite(n) || n < 1) return 90;
  return n;
}

async function main() {
  const days = retentionDays();
  const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [loginResult, viewResult] = await Promise.all([
    prisma.authLoginLog.deleteMany({ where: { createdAt: { lt: threshold } } }),
    prisma.courseViewLog.deleteMany({ where: { createdAt: { lt: threshold } } }),
  ]);

  console.log(
    `[prune-audit-logs] retention=${days}d, deleted login=${loginResult.count}, views=${viewResult.count}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
