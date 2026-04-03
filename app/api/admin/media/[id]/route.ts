import { NextResponse } from "next/server";
import { getAdminUserIdForRoute } from "@/lib/admin/admin-auth-route";
import {
  getMediaAssetWithUsages,
  mediaPublicUrl,
  setMediaAssetStatus,
} from "@/lib/media/core";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const adminUserId = await getAdminUserIdForRoute();
  if (!adminUserId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await context.params;
  const row = await getMediaAssetWithUsages(id);
  if (!row) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    item: {
      id: row.id,
      kind: row.kind,
      status: row.status,
      originalName: row.originalName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      youtubeUrl: row.youtubeUrl,
      publicUrl: mediaPublicUrl(row.id),
      usageCount: row._count?.usages ?? 0,
      createdAt: row.createdAt,
    },
    usages: row.usages.map((u) => ({
      id: u.id,
      entityType: u.entityType,
      entityId: u.entityId,
      fieldPath: u.fieldPath,
      createdAt: u.createdAt,
    })),
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const adminUserId = await getAdminUserIdForRoute();
  if (!adminUserId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await context.params;
  let payload: { status?: unknown };
  try {
    payload = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const nextStatus =
    payload.status === "ACTIVE" || payload.status === "ARCHIVED"
      ? payload.status
      : null;
  if (!nextStatus) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }
  const updated = await setMediaAssetStatus(id, nextStatus);
  if (!updated) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    item: {
      id: updated.id,
      status: updated.status,
    },
  });
}
