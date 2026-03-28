import { fetchCourses, fetchPublicCategories } from "@/lib/courses-queries";
import { isDatabaseConfigured } from "@/lib/env";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL_MISSING: 執行中的 Web 服務未讀到 DATABASE_URL（與本機 .env 無關）。請在 Zeabur「Web 服務」綁定 PostgreSQL，或於 Variables 新增 DATABASE_URL 後重新部署。",
        data: [] as const,
        categories: [] as const,
      },
      { status: 503 },
    );
  }

  const res = await fetchCourses();
  if (res.error) {
    return NextResponse.json(
      { error: res.error.message, data: [] as const, categories: [] as const },
      { status: 500 },
    );
  }

  const catRes = await fetchPublicCategories();
  const categories = catRes.error ? [] : catRes.data;

  return NextResponse.json({ data: res.data, categories });
}
