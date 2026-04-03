import crypto from "node:crypto";
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

export async function createImageAssetFromFile(file: File, by?: UploadBy) {
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_IMAGE_MIME.has(mime)) {
    throw new Error("圖片僅支援 JPEG、PNG、WebP、GIF");
  }
  if (file.size > MEDIA_LIMITS.imageMaxBytes) {
    throw new Error("圖片大小不可超過 5MB");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MEDIA_LIMITS.imageMaxBytes) {
    throw new Error("圖片大小不可超過 5MB");
  }
  const sha256 = hashBytes(bytes);
  const originalName = safeName(file.name, `image${extFromMime(mime)}`);
  return prisma.mediaAsset.create({
    data: {
      kind: "IMAGE",
      mimeType: mime,
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
    throw new Error("PDF 大小不可超過 20MB");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MEDIA_LIMITS.pdfMaxBytes) {
    throw new Error("PDF 大小不可超過 20MB");
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
  page?: number;
  pageSize?: number;
  status?: "ACTIVE" | "ARCHIVED" | "ALL";
}) {
  const page = Math.max(1, Math.floor(params?.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Math.floor(params?.pageSize ?? 20)));
  const q = params?.q?.trim() || "";
  const kind = params?.kind && params.kind !== "ALL" ? params.kind : undefined;
  const status =
    params?.status && params.status !== "ALL" ? params.status : undefined;

  const where = {
    ...(kind ? { kind } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { originalName: { contains: q, mode: "insensitive" as const } },
            { youtubeUrl: { contains: q, mode: "insensitive" as const } },
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
