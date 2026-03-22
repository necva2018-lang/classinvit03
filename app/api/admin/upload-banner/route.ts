import { saveBannerUpload } from "@/lib/banner-file-upload";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

  const result = await saveBannerUpload(file, process.cwd());
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ url: result.publicPath });
}
