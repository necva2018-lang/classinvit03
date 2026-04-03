import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      kind: true,
      mimeType: true,
      originalName: true,
      blobData: true,
      youtubeUrl: true,
      updatedAt: true,
    },
  });
  if (!asset || asset.status !== "ACTIVE") {
    return new NextResponse("Not found", { status: 404 });
  }

  if (asset.kind === "YOUTUBE") {
    if (!asset.youtubeUrl) return new NextResponse("Not found", { status: 404 });
    return NextResponse.redirect(asset.youtubeUrl, 307);
  }
  if (!asset.blobData) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bytes = Buffer.from(asset.blobData);
  const mime =
    asset.mimeType ||
    (asset.kind === "PDF" ? "application/pdf" : "application/octet-stream");
  const filename = (asset.originalName || `${asset.id}`).replace(/["\r\n]/g, "_");

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type": mime,
      "content-length": String(bytes.length),
      "cache-control": "public, max-age=31536000, immutable",
      etag: `"${asset.id}-${asset.updatedAt.getTime()}"`,
      "content-disposition":
        asset.kind === "PDF"
          ? `inline; filename="${filename}"`
          : `inline; filename="${filename}"`,
    },
  });
}
