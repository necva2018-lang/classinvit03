"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, FileText, Link2, RefreshCcw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MediaKind = "IMAGE" | "PDF" | "YOUTUBE";
type MediaStatus = "ACTIVE" | "ARCHIVED";

type MediaListItem = {
  id: string;
  kind: MediaKind;
  status: MediaStatus;
  originalName: string | null;
  tags: string[];
  mimeType: string | null;
  sizeBytes: number | null;
  youtubeUrl: string | null;
  publicUrl: string;
  usageCount: number;
  createdAt: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type MediaUsageItem = {
  id: string;
  entityType: string;
  entityId: string;
  fieldPath: string;
  createdAt: string;
};

function formatBytes(n: number | null) {
  if (!n || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function kindText(kind: MediaKind) {
  if (kind === "IMAGE") return "圖片";
  if (kind === "PDF") return "PDF";
  return "YouTube";
}

function parseYoutubeVideoId(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\/+/, "").split("/")[0] || null;
    }
    if (u.pathname === "/watch") {
      return u.searchParams.get("v");
    }
    if (u.pathname.startsWith("/shorts/")) {
      return u.pathname.split("/")[2] || null;
    }
    if (u.pathname.startsWith("/embed/")) {
      return u.pathname.split("/")[2] || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function MediaLibraryManager({
  initialItems,
  initialPagination,
  initialAvailableTags,
}: {
  initialItems: MediaListItem[];
  initialPagination: Pagination;
  initialAvailableTags: string[];
}) {
  const [items, setItems] = useState<MediaListItem[]>(initialItems);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [kind, setKind] = useState<"ALL" | MediaKind>("ALL");
  const [status, setStatus] = useState<"ALL" | MediaStatus>("ACTIVE");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [losslessOptimizeOnOversize, setLosslessOptimizeOnOversize] =
    useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [usageOpen, setUsageOpen] = useState(false);
  const [usageTarget, setUsageTarget] = useState<MediaListItem | null>(null);
  const [usageItems, setUsageItems] = useState<MediaUsageItem[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>(initialAvailableTags);
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialItems.map((i) => [i.id, (i.tags || []).join(", ")])),
  );
  const [tagSavingId, setTagSavingId] = useState<string | null>(null);

  const canPrev = pagination.page > 1;
  const canNext = pagination.page < pagination.totalPages;

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(pagination.page));
    p.set("pageSize", String(pagination.pageSize));
    p.set("kind", kind);
    p.set("status", status);
    if (q.trim()) p.set("q", q.trim());
    if (tagFilter.trim()) p.set("tag", tagFilter.trim());
    return p.toString();
  }, [kind, pagination.page, pagination.pageSize, q, status, tagFilter]);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/media?${queryString}`, {
        method: "GET",
        cache: "no-store",
      });
      const json = (await res.json()) as
        | {
            ok?: true;
            items?: MediaListItem[];
            pagination?: Pagination;
            availableTags?: string[];
          }
        | { error?: string };
      if (!res.ok || !("ok" in json)) {
        throw new Error(
          "error" in json && json.error ? json.error : "讀取素材庫失敗",
        );
      }
      setItems(json.items ?? []);
      if (json.pagination) {
        setPagination(json.pagination);
      }
      if (json.availableTags) {
        setAvailableTags(json.availableTags);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "讀取素材庫失敗");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setTagDrafts(
      Object.fromEntries(items.map((i) => [i.id, (i.tags || []).join(", ")])),
    );
  }, [items]);

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMsg("已複製");
      setTimeout(() => setCopyMsg(null), 1200);
    } catch {
      setCopyMsg("複製失敗");
      setTimeout(() => setCopyMsg(null), 1200);
    }
  }

  async function uploadFile(kindValue: "image" | "pdf", file: File | null) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.set("kind", kindValue);
      fd.set("file", file);
      if (kindValue === "image" && losslessOptimizeOnOversize) {
        fd.set("losslessOptimize", "1");
      }
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as
        | { ok?: true; asset?: { url?: string } }
        | { error?: string };
      if (!res.ok || !("ok" in json)) {
        throw new Error(
          "error" in json && json.error ? json.error : "上傳失敗",
        );
      }
      await reload();
      if ("asset" in json && json.asset?.url) {
        await copyText(json.asset.url);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "上傳失敗");
    } finally {
      setUploading(false);
    }
  }

  async function submitYoutube() {
    const t = youtubeUrl.trim();
    if (!t) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch("/api/admin/media/youtube", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: t }),
      });
      const json = (await res.json()) as
        | { ok?: true; asset?: { url?: string } }
        | { error?: string };
      if (!res.ok || !("ok" in json)) {
        throw new Error(
          "error" in json && json.error ? json.error : "建立 YouTube 素材失敗",
        );
      }
      setYoutubeUrl("");
      await reload();
      if ("asset" in json && json.asset?.url) {
        await copyText(json.asset.url);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "建立 YouTube 素材失敗");
    } finally {
      setUploading(false);
    }
  }

  async function toggleAssetStatus(row: MediaListItem) {
    setStatusUpdatingId(row.id);
    try {
      const nextStatus: MediaStatus =
        row.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
      const res = await fetch(`/api/admin/media/${row.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = (await res.json()) as
        | { ok?: true; item?: { status?: MediaStatus } }
        | { error?: string };
      if (!res.ok || !("ok" in json)) {
        throw new Error(
          "error" in json && json.error ? json.error : "更新素材狀態失敗",
        );
      }
      await reload();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "更新素材狀態失敗");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function openUsages(row: MediaListItem) {
    setUsageTarget(row);
    setUsageOpen(true);
    setUsageItems([]);
    setUsageLoading(true);
    setUsageError(null);
    try {
      const res = await fetch(`/api/admin/media/${row.id}`, {
        method: "GET",
        cache: "no-store",
      });
      const json = (await res.json()) as
        | { ok?: true; usages?: MediaUsageItem[] }
        | { error?: string };
      if (!res.ok || !("ok" in json)) {
        throw new Error(
          "error" in json && json.error ? json.error : "讀取使用位置失敗",
        );
      }
      setUsageItems(json.usages ?? []);
    } catch (e) {
      setUsageError(e instanceof Error ? e.message : "讀取使用位置失敗");
    } finally {
      setUsageLoading(false);
    }
  }

  async function saveTags(row: MediaListItem) {
    setTagSavingId(row.id);
    try {
      const raw = tagDrafts[row.id] ?? "";
      const tags = [...new Set(raw.split(",").map((x) => x.trim()).filter(Boolean))];
      const res = await fetch(`/api/admin/media/${row.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      const json = (await res.json()) as
        | { ok?: true }
        | { error?: string };
      if (!res.ok || !("ok" in json)) {
        throw new Error(
          "error" in json && json.error ? json.error : "更新標籤失敗",
        );
      }
      await reload();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "更新標籤失敗");
    } finally {
      setTagSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            統一素材庫
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            圖片（5MB 內）、PDF（40MB 內）、YouTube 連結統一管理，供 Banner／課程／站點設定重複取用。
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void reload()}>
          <RefreshCcw className="size-4" aria-hidden />
          重新整理
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <p className="mb-3 text-sm font-medium">快速新增素材</p>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 rounded-md border border-border p-3">
            <Label htmlFor="media-image-upload">上傳圖片（{"<= 5MB"}）</Label>
            <Input
              id="media-image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(e) =>
                void uploadFile("image", e.currentTarget.files?.[0] ?? null)
              }
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={losslessOptimizeOnOversize}
                onChange={(e) => setLosslessOptimizeOnOversize(e.target.checked)}
                className="size-4 rounded border-input"
              />
              超過 5MB 時，嘗試無損壓縮後再上傳
            </label>
          </div>
          <div className="space-y-2 rounded-md border border-border p-3">
            <Label htmlFor="media-pdf-upload">上傳 PDF（{"<= 40MB"}）</Label>
            <Input
              id="media-pdf-upload"
              type="file"
              accept="application/pdf,.pdf"
              disabled={uploading}
              onChange={(e) =>
                void uploadFile("pdf", e.currentTarget.files?.[0] ?? null)
              }
            />
          </div>
          <div className="space-y-2 rounded-md border border-border p-3">
            <Label htmlFor="media-youtube-url">新增 YouTube 連結</Label>
            <div className="flex gap-2">
              <Input
                id="media-youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={uploading}
              />
              <Button
                type="button"
                disabled={uploading || youtubeUrl.trim().length === 0}
                onClick={() => void submitYoutube()}
              >
                <Upload className="size-4" aria-hidden />
                建立
              </Button>
            </div>
          </div>
        </div>
        {uploadError ? (
          <p className="mt-3 text-sm text-destructive">{uploadError}</p>
        ) : null}
        {copyMsg ? (
          <p className="mt-1 text-xs text-muted-foreground">{copyMsg}</p>
        ) : null}
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto_auto]">
          <Input
            placeholder="搜尋名稱 / YouTube URL / 標籤"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as "ALL" | MediaKind);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <option value="ALL">全部類型</option>
            <option value="IMAGE">圖片</option>
            <option value="PDF">PDF</option>
            <option value="YOUTUBE">YouTube</option>
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "ALL" | MediaStatus);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <option value="ACTIVE">啟用中</option>
            <option value="ALL">全部狀態</option>
            <option value="ARCHIVED">已封存</option>
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <option value="">全部標籤</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={() => {
              setQ(qInput.trim());
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            搜尋
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[92px]">預覽</TableHead>
              <TableHead>名稱 / 連結</TableHead>
              <TableHead className="w-[92px]">類型</TableHead>
              <TableHead className="w-[260px]">標籤（可編輯）</TableHead>
              <TableHead className="w-[100px] text-right">大小</TableHead>
              <TableHead className="w-[84px] text-right">使用數</TableHead>
              <TableHead className="w-[120px]">建立時間</TableHead>
              <TableHead className="w-[240px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {loading ? "讀取中..." : "目前沒有素材"}
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.kind === "IMAGE" ? (
                      <div className="relative aspect-[4/3] w-16 overflow-hidden rounded border border-border bg-muted">
                        <Image
                          src={row.publicUrl}
                          alt={row.originalName || row.id}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : row.kind === "PDF" ? (
                      <div className="flex h-12 w-16 items-center justify-center rounded border border-border bg-muted">
                        <FileText className="size-5 text-muted-foreground" />
                      </div>
                    ) : (
                      (() => {
                        const ytId = parseYoutubeVideoId(row.youtubeUrl);
                        const thumb = ytId
                          ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
                          : null;
                        if (thumb) {
                          return (
                            <div className="relative aspect-video w-16 overflow-hidden rounded border border-border bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumb}
                                alt=""
                                className="size-full object-cover"
                              />
                            </div>
                          );
                        }
                        return (
                          <div className="flex h-12 w-16 items-center justify-center rounded border border-border bg-muted">
                            <Link2 className="size-5 text-muted-foreground" />
                          </div>
                        );
                      })()
                    )}
                  </TableCell>
                  <TableCell className="max-w-[380px]">
                    <div className="truncate text-sm font-medium">
                      {row.originalName || "—"}
                    </div>
                    {row.kind === "YOUTUBE" ? (
                      <Link
                        href={row.youtubeUrl || row.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-1 text-xs text-muted-foreground hover:underline"
                      >
                        {row.youtubeUrl || row.publicUrl}
                      </Link>
                    ) : (
                      <code className="line-clamp-1 text-xs text-muted-foreground">
                        {row.publicUrl}
                      </code>
                    )}
                  </TableCell>
                  <TableCell>{kindText(row.kind)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Input
                        value={tagDrafts[row.id] ?? ""}
                        onChange={(e) =>
                          setTagDrafts((prev) => ({
                            ...prev,
                            [row.id]: e.target.value,
                          }))
                        }
                        placeholder="例如：首頁, 行銷, AI"
                        className="h-8 text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={tagSavingId === row.id}
                        onClick={() => void saveTags(row)}
                      >
                        儲存
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBytes(row.sizeBytes)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.usageCount}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString("zh-TW", {
                      hour12: false,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void copyText(row.publicUrl)}
                      >
                        <Copy className="size-3.5" aria-hidden />
                        複製
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void openUsages(row)}
                      >
                        使用位置
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={row.status === "ACTIVE" ? "destructive" : "outline"}
                        disabled={statusUpdatingId === row.id}
                        onClick={() => void toggleAssetStatus(row)}
                      >
                        {row.status === "ACTIVE" ? "封存" : "啟用"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {loadError ? <p className="text-sm text-destructive">{loadError}</p> : null}

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          共 {pagination.total} 筆，第 {pagination.page} / {pagination.totalPages} 頁
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canPrev || loading}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
            }
          >
            上一頁
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canNext || loading}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.totalPages, prev.page + 1),
              }))
            }
          >
            下一頁
          </Button>
        </div>
      </div>

      <Sheet open={usageOpen} onOpenChange={setUsageOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>素材使用位置</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {usageTarget?.originalName || usageTarget?.id || "—"}
            </p>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>實體類型</TableHead>
                    <TableHead>實體 ID</TableHead>
                    <TableHead>欄位</TableHead>
                    <TableHead className="w-[120px]">建立時間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageItems.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        {usageLoading ? "讀取中..." : "目前無使用紀錄"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    usageItems.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.entityType}</TableCell>
                        <TableCell className="font-mono text-xs">{u.entityId}</TableCell>
                        <TableCell className="font-mono text-xs">{u.fieldPath}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("zh-TW")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {usageError ? <p className="text-sm text-destructive">{usageError}</p> : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
