import { getAdminUserIdForRoute } from "@/lib/admin/admin-auth-route";
import { createImageAssetFromFile, mediaPublicUrl } from "@/lib/media/core";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const adminUserId = await getAdminUserIdForRoute();
  if (!adminUserId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "無效的表單資料" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "請選擇圖片檔案" }, { status: 400 });
  }

  try {
    const asset = await createImageAssetFromFile(file, { userId: adminUserId });
    return NextResponse.json({ url: mediaPublicUrl(asset.id), assetId: asset.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "上傳失敗";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
