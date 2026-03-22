import { fetchCourses } from "@/lib/courses-queries";
import { isDatabaseConfigured } from "@/lib/env";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "伺服器未設定 DATABASE_URL。請在 Zeabur PostgreSQL 複製連線字串並寫入專案根目錄的 .env。",
        data: [] as const,
      },
      { status: 503 },
    );
  }

  const res = await fetchCourses();
  if (res.error) {
    return NextResponse.json(
      { error: res.error.message, data: [] as const },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: res.data });
}
