import { auth } from "@/auth";
import { getAuditRequestMeta } from "@/lib/audit/request-meta";
import { attachVisitorCookie, resolveVisitorId } from "@/lib/audit/visitor-id";
import { prisma } from "@/lib/db";
import { isLikelyDbId } from "@/lib/id-guard";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

type Payload = { courseId?: unknown };

export async function POST(request: NextRequest) {
  let payload: Payload = {};
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const courseId =
    typeof payload.courseId === "string" ? payload.courseId.trim() : "";
  if (!isLikelyDbId(courseId)) {
    return NextResponse.json({ error: "INVALID_COURSE_ID" }, { status: 400 });
  }

  const [{ visitorId, needsSetCookie }, session] = await Promise.all([
    Promise.resolve(resolveVisitorId(request)),
    auth(),
  ]);
  const meta = getAuditRequestMeta(request);

  try {
    await prisma.courseViewLog.create({
      data: {
        courseId,
        userId: session?.user?.id || null,
        visitorId,
        ipHash: meta.ipHash,
        userAgent: meta.userAgent,
      },
    });
  } catch (e) {
    console.error("[track/course-view] 寫入失敗", e);
    return NextResponse.json({ error: "WRITE_FAILED" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  if (needsSetCookie) {
    attachVisitorCookie(response, visitorId);
  }
  return response;
}
