import { NextResponse } from "next/server";
import { getAdminUserIdForRoute } from "@/lib/admin/admin-auth-route";
import {
  getMediaAssetWithUsages,
  mediaPublicUrl,
  setMediaAssetStatus,
  setMediaAssetTags,
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
      tags: row.tags,
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
  let payload: { status?: unknown; tags?: unknown };
  try {
    payload = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const nextStatus =
    payload.status === "ACTIVE" || payload.status === "ARCHIVED"
      ? payload.status
      : null;
  const nextTags = Array.isArray(payload.tags)
    ? payload.tags.filter((x): x is string => typeof x === "string")
    : null;
  if (!nextStatus && nextTags == null) {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }
  const updated =
    nextStatus && nextTags != null
      ? await setMediaAssetTags(id, nextTags).then((r) =>
          r ? setMediaAssetStatus(id, nextStatus) : null,
        )
      : nextStatus
        ? await setMediaAssetStatus(id, nextStatus)
        : await setMediaAssetTags(id, nextTags ?? []);
  if (!updated) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    item: {
      id: updated.id,
      status: updated.status,
      tags: updated.tags,
    },
  });
}
