import { getAdminUserIdForRoute } from "@/lib/admin/admin-auth-route";
import { createYoutubeAssetFromUrl, mediaPublicUrl } from "@/lib/media/core";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const adminUserId = await getAdminUserIdForRoute();
  if (!adminUserId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  let payload: { url?: unknown };
  try {
    payload = (await request.json()) as { url?: unknown };
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const rawUrl = typeof payload.url === "string" ? payload.url : "";
  try {
    const asset = await createYoutubeAssetFromUrl(rawUrl, { userId: adminUserId });
    return NextResponse.json({
      ok: true,
      asset: {
        id: asset.id,
        kind: asset.kind,
        url: mediaPublicUrl(asset.id),
        youtubeUrl: asset.youtubeUrl,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "建立 YouTube 素材失敗";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
