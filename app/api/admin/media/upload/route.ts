import { getAdminUserIdForRoute } from "@/lib/admin/admin-auth-route";
import {
  createImageAssetFromFile,
  createPdfAssetFromFile,
  mediaPublicUrl,
} from "@/lib/media/core";
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
  const kindRaw = String(form.get("kind") ?? "").trim().toLowerCase();
  const file = form.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "請選擇檔案" }, { status: 400 });
  }

  try {
    const asset =
      kindRaw === "pdf"
        ? await createPdfAssetFromFile(file, { userId: adminUserId })
        : await createImageAssetFromFile(file, { userId: adminUserId });

    return NextResponse.json({
      ok: true,
      asset: {
        id: asset.id,
        kind: asset.kind,
        url: mediaPublicUrl(asset.id),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "上傳失敗";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
