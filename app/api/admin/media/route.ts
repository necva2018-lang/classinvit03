import { getAdminUserIdForRoute } from "@/lib/admin/admin-auth-route";
import { listMediaAssets, mediaPublicUrl } from "@/lib/media/core";
import type { MediaKind } from "@prisma/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function asPositiveInt(raw: string | null, fallback: number) {
  const n = Number.parseInt(raw || "", 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

export async function GET(request: Request) {
  const adminUserId = await getAdminUserIdForRoute();
  if (!adminUserId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const u = new URL(request.url);
  const kindRaw = (u.searchParams.get("kind") || "ALL").toUpperCase();
  const statusRaw = (u.searchParams.get("status") || "ACTIVE").toUpperCase();
  const kind: MediaKind | "ALL" =
    kindRaw === "IMAGE" || kindRaw === "PDF" || kindRaw === "YOUTUBE"
      ? (kindRaw as MediaKind)
      : "ALL";
  const status: "ACTIVE" | "ARCHIVED" | "ALL" =
    statusRaw === "ARCHIVED" || statusRaw === "ALL" ? statusRaw : "ACTIVE";

  const result = await listMediaAssets({
    kind,
    status,
    q: u.searchParams.get("q") || "",
    page: asPositiveInt(u.searchParams.get("page"), 1),
    pageSize: asPositiveInt(u.searchParams.get("pageSize"), 20),
  });

  return NextResponse.json({
    ok: true,
    pagination: {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    },
    items: result.rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      status: r.status,
      originalName: r.originalName,
      mimeType: r.mimeType,
      sizeBytes: r.sizeBytes,
      youtubeUrl: r.youtubeUrl,
      publicUrl: mediaPublicUrl(r.id),
      usageCount: r._count?.usages ?? 0,
      createdAt: r.createdAt,
    })),
  });
}
