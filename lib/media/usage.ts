import { prisma } from "@/lib/db";
import { mediaPublicUrl } from "@/lib/media/core";

const MEDIA_URL_RE = /\/api\/media\/([a-zA-Z0-9_-]+)/;

export function parseMediaAssetIdFromUrl(url: string | null | undefined): string | null {
  const t = (url || "").trim();
  if (!t) return null;
  try {
    const u = new URL(t, "http://local");
    const m = u.pathname.match(MEDIA_URL_RE);
    return m?.[1] ?? null;
  } catch {
    const m = t.match(MEDIA_URL_RE);
    return m?.[1] ?? null;
  }
}

type UsageField = {
  fieldPath: string;
  url: string | null | undefined;
};

/**
 * 讓 entity 的欄位 URL 與 MediaUsage 對齊：
 * - URL 指向 /api/media/:id 就建立/更新 usage
 * - URL 非素材庫連結則移除該 field usage
 */
export async function syncEntityMediaUsages(params: {
  entityType: string;
  entityId: string;
  fields: UsageField[];
  replaceFieldPathPrefixes?: string[];
}) {
  const { entityType, entityId, fields, replaceFieldPathPrefixes } = params;
  if (replaceFieldPathPrefixes?.length) {
    for (const prefix of replaceFieldPathPrefixes) {
      await prisma.mediaUsage.deleteMany({
        where: {
          entityType,
          entityId,
          fieldPath: { startsWith: prefix },
        },
      });
    }
  }
  for (const f of fields) {
    const assetId = parseMediaAssetIdFromUrl(f.url);
    if (!assetId) {
      await prisma.mediaUsage.deleteMany({
        where: { entityType, entityId, fieldPath: f.fieldPath },
      });
      continue;
    }
    await prisma.mediaUsage.upsert({
      where: {
        entityType_entityId_fieldPath: {
          entityType,
          entityId,
          fieldPath: f.fieldPath,
        },
      },
      create: {
        entityType,
        entityId,
        fieldPath: f.fieldPath,
        assetId,
      },
      update: { assetId },
    });
  }
}

export function mediaUrlFromAssetId(id: string | null | undefined): string {
  return mediaPublicUrl(String(id || "").trim());
}
