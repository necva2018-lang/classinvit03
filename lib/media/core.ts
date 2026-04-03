import crypto from "node:crypto";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { ALLOWED_IMAGE_MIME, MEDIA_LIMITS, PDF_MIME } from "@/lib/media/constants";
import { normalizeYoutubeUrl } from "@/lib/media/youtube";
import type { MediaAsset, MediaKind, MediaStatus } from "@prisma/client";

type UploadBy = {
  userId?: string | null;
};

function hashBytes(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === PDF_MIME) return ".pdf";
  return "";
}

function safeName(name: string | undefined, fallback: string): string {
  const cleaned = (name || "").trim().replace(/[^\w.\-()+ ]+/g, "_");
  if (cleaned.length === 0) return fallback;
  return cleaned.slice(0, 180);
}

export function mediaPublicUrl(id: string): string {
  return `/api/media/${id}`;
}

async function optimizeImageLosslessToLimit(
  input: Buffer,
  maxBytes: number,
): Promise<{ bytes: Buffer; mimeType: string } | null> {
  // 先嘗試 lossless WebP（常見可有效降體積）
  try {
    const webp = await sharp(input, { animated: true })
      .webp({ lossless: true, effort: 6 })
      .toBuffer();
    if (webp.length <= maxBytes) {
      return { bytes: webp, mimeType: "image/webp" };
    }
  } catch {
    // ignore and try next strategy
  }

  // 再嘗試高壓縮 PNG（仍為無損）
  try {
    const png = await sharp(input, { animated: true })
      .png({ compressionLevel: 9, palette: true, effort: 10 })
      .toBuffer();
    if (png.length <= maxBytes) {
      return { bytes: png, mimeType: "image/png" };
    }
  } catch {
    // ignore and fallback to null
  }
  return null;
}

export async function createImageAssetFromFile(
  file: File,
  by?: UploadBy,
  options?: { enableLosslessOptimizeWhenOversize?: boolean },
) {
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_IMAGE_MIME.has(mime)) {
    throw new Error("圖片僅支援 JPEG、PNG、WebP、GIF");
  }
  const rawBytes = Buffer.from(await file.arrayBuffer());
  let bytes = rawBytes;
  let storedMimeType = mime;
  if (bytes.length > MEDIA_LIMITS.imageMaxBytes) {
    const enableLossless = options?.enableLosslessOptimizeWhenOversize ?? false;
    if (!enableLossless) {
      throw new Error("圖片大小不可超過 5MB（可勾選無損壓縮後再上傳）");
    }
    const optimized = await optimizeImageLosslessToLimit(
      rawBytes,
      MEDIA_LIMITS.imageMaxBytes,
    );
    if (!optimized) {
      throw new Error("無損壓縮後仍超過 5MB，請改較小解析度或裁切後再上傳");
    }
    bytes = Buffer.from(optimized.bytes);
    storedMimeType = optimized.mimeType;
  }
  const sha256 = hashBytes(bytes);
  const originalName = safeName(file.name, `image${extFromMime(storedMimeType)}`);
  return prisma.mediaAsset.create({
    data: {
      kind: "IMAGE",
      mimeType: storedMimeType,
      sizeBytes: bytes.length,
      sha256,
      originalName,
      blobData: bytes,
      uploadedByUserId: by?.userId ?? null,
    },
  });
}

export async function createPdfAssetFromFile(file: File, by?: UploadBy) {
  const mime = file.type || "application/octet-stream";
  const isPdfMime = mime.toLowerCase() === PDF_MIME;
  const isPdfName = /\.pdf$/i.test(file.name);
  if (!isPdfMime && !isPdfName) {
    throw new Error("檔案僅支援 PDF");
  }
  if (file.size > MEDIA_LIMITS.pdfMaxBytes) {
    throw new Error("PDF 大小不可超過 40MB");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MEDIA_LIMITS.pdfMaxBytes) {
    throw new Error("PDF 大小不可超過 40MB");
  }
  const sha256 = hashBytes(bytes);
  const originalName = safeName(file.name, "document.pdf");
  return prisma.mediaAsset.create({
    data: {
      kind: "PDF",
      mimeType: PDF_MIME,
      sizeBytes: bytes.length,
      sha256,
      originalName,
      blobData: bytes,
      uploadedByUserId: by?.userId ?? null,
    },
  });
}

export async function createYoutubeAssetFromUrl(rawUrl: string, by?: UploadBy) {
  const youtubeUrl = normalizeYoutubeUrl(rawUrl);
  if (!youtubeUrl) {
    throw new Error("僅接受 YouTube 連結");
  }
  return prisma.mediaAsset.create({
    data: {
      kind: "YOUTUBE",
      youtubeUrl,
      originalName: youtubeUrl,
      uploadedByUserId: by?.userId ?? null,
    },
  });
}

export async function listMediaAssets(params?: {
  kind?: MediaKind | "ALL";
  q?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
  status?: "ACTIVE" | "ARCHIVED" | "ALL";
}) {
  const page = Math.max(1, Math.floor(params?.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Math.floor(params?.pageSize ?? 20)));
  const q = params?.q?.trim() || "";
  const tag = params?.tag?.trim() || "";
  const kind = params?.kind && params.kind !== "ALL" ? params.kind : undefined;
  const status =
    params?.status && params.status !== "ALL" ? params.status : undefined;

  const where = {
    ...(kind ? { kind } : {}),
    ...(status ? { status } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(q
      ? {
          OR: [
            { originalName: { contains: q, mode: "insensitive" as const } },
            { youtubeUrl: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { usages: true } },
      },
    }),
  ]);
  return {
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    rows,
  };
}

export type MediaWithUsageCount = MediaAsset & {
  _count?: { usages: number };
};

export async function listMediaTags(): Promise<string[]> {
  const rows = await prisma.mediaAsset.findMany({
    select: { tags: true },
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
  const set = new Set<string>();
  for (const r of rows) {
    for (const t of r.tags ?? []) {
      const v = t.trim();
      if (v) set.add(v);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "zh-Hant"));
}

export async function setMediaAssetStatus(
  assetId: string,
  status: MediaStatus,
): Promise<MediaAsset | null> {
  try {
    return await prisma.mediaAsset.update({
      where: { id: assetId },
      data: { status },
    });
  } catch {
    return null;
  }
}

export async function setMediaAssetTags(
  assetId: string,
  tags: string[],
): Promise<MediaAsset | null> {
  try {
    const normalized = [
      ...new Set(
        tags
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => t.slice(0, 40)),
      ),
    ].slice(0, 20);
    return await prisma.mediaAsset.update({
      where: { id: assetId },
      data: { tags: normalized },
    });
  } catch {
    return null;
  }
}

export async function getMediaAssetWithUsages(assetId: string) {
  return prisma.mediaAsset.findUnique({
    where: { id: assetId },
    include: {
      usages: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 200,
      },
      _count: {
        select: { usages: true },
      },
    },
  });
}
