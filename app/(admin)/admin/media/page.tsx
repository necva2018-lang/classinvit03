import type { Metadata } from "next";
import { MediaLibraryManager } from "@/components/admin/media-library-manager";
import { listMediaAssets, listMediaTags, mediaPublicUrl } from "@/lib/media/core";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "素材庫",
};

export default async function AdminMediaPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">未設定資料庫</p>
        <p className="mt-2 text-amber-800/90">
          請在專案根目錄 <code className="rounded bg-white/80 px-1">.env</code> 設定{" "}
          <code className="rounded bg-white/80 px-1">DATABASE_URL</code> 後重新整理。
        </p>
      </div>
    );
  }

  const result = await listMediaAssets({
    kind: "ALL",
    status: "ACTIVE",
    page: 1,
    pageSize: 20,
  });
  const initialAvailableTags = await listMediaTags();

  return (
    <MediaLibraryManager
      initialItems={result.rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        status: row.status,
        originalName: row.originalName,
        tags: row.tags,
        mimeType: row.mimeType,
        sizeBytes: row.sizeBytes,
        youtubeUrl: row.youtubeUrl,
        publicUrl: mediaPublicUrl(row.id),
        usageCount: row._count?.usages ?? 0,
        createdAt: row.createdAt.toISOString(),
      }))}
      initialPagination={{
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      }}
      initialAvailableTags={initialAvailableTags}
    />
  );
}
