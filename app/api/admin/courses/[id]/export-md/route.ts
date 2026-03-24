import { exportCourseToMarkdown } from "@/lib/admin/course-export-markdown";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type RouteCtx = {
  params: Promise<{ id: string }>;
};

function safeFileName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\-_]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(_req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      categories: true,
      announcements: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  const markdown = exportCourseToMarkdown(course);
  const filename = `${safeFileName(course.title) || "course"}-${course.id.slice(0, 8)}.md`;
  return new Response(markdown, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
