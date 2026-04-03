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
  const losslessOptimizeRaw = String(form.get("losslessOptimize") ?? "")
    .trim()
    .toLowerCase();
  const enableLosslessOptimize =
    losslessOptimizeRaw === "1" ||
    losslessOptimizeRaw === "true" ||
    losslessOptimizeRaw === "on";
  const normalizeRatioRaw = String(form.get("normalize1280x850") ?? "")
    .trim()
    .toLowerCase();
  const enableNormalizeRatio =
    normalizeRatioRaw === "1" ||
    normalizeRatioRaw === "true" ||
    normalizeRatioRaw === "on";
  const file = form.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "請選擇檔案" }, { status: 400 });
  }

  try {
    const asset =
      kindRaw === "pdf"
        ? await createPdfAssetFromFile(file, { userId: adminUserId })
        : await createImageAssetFromFile(
            file,
            { userId: adminUserId },
            {
              enableLosslessOptimizeWhenOversize: enableLosslessOptimize,
              normalizeToCardRatio1280x850: enableNormalizeRatio,
            },
          );

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
