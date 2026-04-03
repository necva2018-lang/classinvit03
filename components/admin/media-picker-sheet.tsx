"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type MediaItem = {
  id: string;
  kind: MediaKind;
  originalName: string | null;
  publicUrl: string;
  youtubeUrl: string | null;
  createdAt: string;
  usageCount: number;
};

type PickerView = "library" | "recent";

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

function recentStorageKey(kind: MediaKind): string {
  return `admin.media-picker.recent.${kind}`;
}

export function MediaPickerSheet({
  open,
  onOpenChange,
  title,
  kind,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  kind: MediaKind;
  onSelect: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [view, setView] = useState<PickerView>("library");
  const [recentItems, setRecentItems] = useState<MediaItem[]>([]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("kind", kind);
    p.set("status", "ACTIVE");
    p.set("page", String(page));
    p.set("pageSize", "12");
    if (q.trim()) p.set("q", q.trim());
    return p.toString();
  }, [kind, page, q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media?${query}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as
        | { ok?: true; items?: MediaItem[]; pagination?: { totalPages?: number } }
        | { error?: string };
      if (!res.ok || !("ok" in json)) {
        throw new Error(
          "error" in json && json.error ? json.error : "讀取素材失敗",
        );
      }
      setItems(json.items ?? []);
      setTotalPages(Math.max(1, json.pagination?.totalPages ?? 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "讀取素材失敗");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = window.localStorage.getItem(recentStorageKey(kind));
      if (!raw) {
        setRecentItems([]);
        return;
      }
      const parsed = JSON.parse(raw) as MediaItem[];
      setRecentItems(Array.isArray(parsed) ? parsed.slice(0, 8) : []);
    } catch {
      setRecentItems([]);
    }
  }, [open, kind]);

  function rememberRecent(item: MediaItem) {
    try {
      const raw = window.localStorage.getItem(recentStorageKey(kind));
      const prev = raw ? ((JSON.parse(raw) as MediaItem[]) ?? []) : [];
      const dedup = [item, ...prev.filter((x) => x.id !== item.id)].slice(0, 8);
      window.localStorage.setItem(recentStorageKey(kind), JSON.stringify(dedup));
      setRecentItems(dedup);
    } catch {
      // ignore localStorage failure
    }
  }

  const shownItems = view === "recent" ? recentItems : items;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={view === "library" ? "default" : "outline"}
              onClick={() => setView("library")}
            >
              素材庫
            </Button>
            <Button
              type="button"
              variant={view === "recent" ? "default" : "outline"}
              onClick={() => setView("recent")}
            >
              最近使用
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="搜尋素材名稱"
              disabled={view === "recent"}
            />
            <Button
              type="button"
              disabled={view === "recent"}
              onClick={() => {
                setPage(1);
                setQ(qInput.trim());
              }}
            >
              搜尋
            </Button>
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[78px]">預覽</TableHead>
                  <TableHead>名稱</TableHead>
                  <TableHead className="w-[120px]">使用數</TableHead>
                  <TableHead className="w-[140px]">建立時間</TableHead>
                  <TableHead className="w-[110px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shownItems.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      {loading && view === "library"
                        ? "讀取中..."
                        : view === "recent"
                          ? "尚無最近使用素材"
                          : "沒有可選素材"}
                    </TableCell>
                  </TableRow>
                ) : (
                  shownItems.map((item) => {
                    const url = item.publicUrl;
                    const youtubeId = parseYoutubeVideoId(item.youtubeUrl);
                    const youtubeThumb = youtubeId
                      ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
                      : null;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.kind === "IMAGE" ? (
                            <div className="relative aspect-[4/3] w-14 overflow-hidden rounded border border-border bg-muted">
                              <Image
                                src={url}
                                alt={item.originalName || item.id}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                          ) : youtubeThumb ? (
                            <div className="relative aspect-video w-14 overflow-hidden rounded border border-border bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={youtubeThumb}
                                alt=""
                                className="size-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-14 items-center justify-center rounded border border-border bg-muted text-xs text-muted-foreground">
                              影片
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[340px]">
                          <div className="truncate text-sm font-medium">
                            {item.originalName || item.id}
                          </div>
                          <code className="line-clamp-1 text-xs text-muted-foreground">
                            {item.kind === "YOUTUBE" ? item.youtubeUrl || url : url}
                          </code>
                        </TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {item.usageCount}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("zh-TW")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              rememberRecent(item);
                              onSelect(url);
                              onOpenChange(false);
                            }}
                          >
                            套用
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {view === "library" ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                第 {page} / {totalPages} 頁
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  上一頁
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  下一頁
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
