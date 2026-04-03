"use client";

import {
  deleteBanner,
  moveBanner,
  saveBanner,
  toggleBannerActive,
} from "@/lib/admin/banner-actions";
import {
  isBannerVideoUrl,
  resolveBannerBackgroundMedia,
} from "@/lib/banner-video-embed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MediaPickerSheet } from "@/components/admin/media-picker-sheet";
import { ChevronDown, ChevronUp, Film, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export type AdminBannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  order: number;
  isActive: boolean;
};

function ActiveSwitch({ id, defaultActive }: { id: string; defaultActive: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(defaultActive);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setOn(defaultActive);
  }, [defaultActive]);

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={on}
        disabled={pending}
        onCheckedChange={(next) => {
          setOn(next);
          startTransition(async () => {
            await toggleBannerActive(id, next);
            router.refresh();
          });
        }}
        aria-label={on ? "已啟用" : "已停用"}
      />
      <span className="text-xs text-muted-foreground">{on ? "啟用" : "停用"}</span>
    </div>
  );
}

export function BannersManager({ initialRows }: { initialRows: AdminBannerRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBannerRow | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);

  const openCreate = () => {
    const nextOrder =
      initialRows.length === 0
        ? 0
        : Math.max(...initialRows.map((r) => r.order)) + 1;
    setEditing({
      id: "",
      title: "",
      subtitle: null,
      imageUrl: null,
      videoUrl: null,
      linkUrl: null,
      linkLabel: "了解更多",
      order: nextOrder,
      isActive: true,
    });
    setImageUrl("");
    setVideoUrl("");
    setFormError(null);
    setUploadError(null);
    setOpen(true);
  };

  const openEdit = (row: AdminBannerRow) => {
    setEditing({ ...row });
    setImageUrl(row.imageUrl ?? "");
    setVideoUrl(row.videoUrl ?? "");
    setFormError(null);
    setUploadError(null);
    setOpen(true);
  };

  useEffect(() => {
    if (!editing) return;
    setImageUrl(editing.imageUrl ?? "");
    setVideoUrl(editing.videoUrl ?? "");
  }, [editing?.id, editing?.imageUrl, editing?.videoUrl]);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/upload-banner", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setUploadError(json.error ?? "上傳失敗");
        return;
      }
      if (json.url) setImageUrl(json.url);
    } catch {
      setUploadError("上傳失敗，請檢查網路");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("imageUrl", imageUrl.trim());
    fd.set("videoUrl", videoUrl.trim());
    try {
      await saveBanner(fd);
      setOpen(false);
      setEditing(null);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing?.id) return;
    if (!confirm("確定刪除此 Banner？")) return;
    await deleteBanner(editing.id);
    setOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleMove(id: string, dir: "up" | "down") {
    await moveBanner(id, dir);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            首頁輪播
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理首頁 Hero 輪播；可為圖片或 YouTube 影片。僅「啟用」項目會顯示於前台，可用上下箭頭調整順序。
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          新增 Banner
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">預覽</TableHead>
              <TableHead>標題</TableHead>
              <TableHead className="hidden md:table-cell">連結</TableHead>
              <TableHead className="w-[100px] text-center">排序</TableHead>
              <TableHead className="w-[120px]">狀態</TableHead>
              <TableHead className="w-[100px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  尚無 Banner。請新增，或執行 seed／migrate。
                </TableCell>
              </TableRow>
            ) : (
              initialRows.map((row, idx) => {
                const hasVideo = isBannerVideoUrl(row.videoUrl);
                const thumb = row.imageUrl?.trim() ?? "";
                return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="relative aspect-[16/10] w-20 overflow-hidden rounded-md border border-border bg-muted">
                      {hasVideo ? (
                        <span className="absolute right-0.5 top-0.5 z-10 rounded bg-black/75 px-1 text-[10px] font-medium text-white">
                          影片
                        </span>
                      ) : null}
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={row.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized
                        />
                      ) : hasVideo ? (
                        <div className="flex size-full items-center justify-center bg-zinc-800 text-zinc-400">
                          <Film className="size-6" aria-hidden />
                        </div>
                      ) : (
                        <div className="flex size-full items-center justify-center p-1 text-center text-[10px] text-muted-foreground">
                          無預覽
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                    {row.linkUrl ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={idx === 0}
                        onClick={() => handleMove(row.id, "up")}
                        aria-label="上移"
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <span className="w-6 text-center text-xs tabular-nums text-muted-foreground">
                        {row.order}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={idx === initialRows.length - 1}
                        onClick={() => handleMove(row.id, "down")}
                        aria-label="下移"
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ActiveSwitch id={row.id} defaultActive={row.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      編輯
                    </Button>
                  </TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "編輯 Banner" : "新增 Banner"}</SheetTitle>
          </SheetHeader>
          {editing ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {editing.id ? (
                <input type="hidden" name="id" value={editing.id} />
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="banner-title">標題</Label>
                <Input
                  id="banner-title"
                  name="title"
                  required
                  defaultValue={editing.title}
                  placeholder="輪播主標題"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="banner-subtitle">副標／說明（選填）</Label>
                <Textarea
                  id="banner-subtitle"
                  name="subtitle"
                  rows={3}
                  defaultValue={editing.subtitle ?? ""}
                  placeholder="簡短說明文字"
                />
              </div>

              <div className="grid gap-2">
                <Label>圖片／封面</Label>
                <p className="text-xs text-muted-foreground">
                  與下方「YouTube URL」至少填一項。上傳後會建立素材庫連結；有影片時此圖可作為載入前封面（poster）。
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="max-w-xs cursor-pointer text-sm"
                    disabled={uploading}
                    onChange={onPickFile}
                  />
                  {uploading ? (
                    <span className="text-xs text-muted-foreground">上傳中…</span>
                  ) : null}
                </div>
                {uploadError ? (
                  <p className="text-sm text-destructive">{uploadError}</p>
                ) : null}
                <div className="grid gap-2">
                  <Label htmlFor="banner-image-url">圖片 URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="banner-image-url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="/api/media/..."
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setImagePickerOpen(true)}
                    >
                      素材庫
                    </Button>
                  </div>
                </div>
                {imageUrl.trim() ? (
                  <div
                    className={cn(
                      "relative mt-2 aspect-[21/9] w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted",
                    )}
                  >
                    <Image
                      src={imageUrl.trim()}
                      alt="預覽"
                      fill
                      className="object-cover"
                      sizes="(max-width: 448px) 100vw, 448px"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="banner-video-url">YouTube URL（選填）</Label>
                <p className="text-xs text-muted-foreground">
                  僅接受 YouTube 連結（如 watch / youtu.be / shorts）；系統會自動嵌入播放，建議另設圖片作為載入前封面。
                </p>
                <Input
                  id="banner-video-url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="font-mono text-sm"
                />
                <div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setVideoPickerOpen(true)}
                  >
                    從素材庫選 YouTube
                  </Button>
                </div>
                {(() => {
                  const resolved =
                    isBannerVideoUrl(videoUrl) &&
                    resolveBannerBackgroundMedia(videoUrl, false, {
                      adminPreview: true,
                    });
                  if (!resolved) return null;
                  if (resolved.mode === "iframe") {
                    return (
                      <div className="relative mt-2 aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border bg-black">
                        <iframe
                          title="影片預覽"
                          src={resolved.src}
                          className="size-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="banner-link">跳轉連結（選填）</Label>
                <Input
                  id="banner-link"
                  name="linkUrl"
                  defaultValue={editing.linkUrl ?? ""}
                  placeholder="https://… 或 /courses"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="banner-link-label">按鈕文字（選填）</Label>
                <Input
                  id="banner-link-label"
                  name="linkLabel"
                  defaultValue={editing.linkLabel ?? ""}
                  placeholder="預設：了解更多"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="banner-order">排序序號</Label>
                <Input
                  id="banner-order"
                  name="order"
                  type="number"
                  defaultValue={editing.order}
                  min={0}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  數字越小越靠前；亦可用列表上的上下箭頭交換順序。
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <input
                  type="checkbox"
                  id="banner-active"
                  name="isActive"
                  value="on"
                  defaultChecked={editing.isActive}
                  className="size-4 rounded border-input"
                />
                <Label htmlFor="banner-active" className="font-normal">
                  啟用（前台顯示）
                </Label>
              </div>

              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "儲存中…" : "儲存"}
                </Button>
                {editing.id ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    刪除
                  </Button>
                ) : null}
              </div>
              <MediaPickerSheet
                open={imagePickerOpen}
                onOpenChange={setImagePickerOpen}
                title="選擇 Banner 圖片"
                kind="IMAGE"
                onSelect={(url) => setImageUrl(url)}
              />
              <MediaPickerSheet
                open={videoPickerOpen}
                onOpenChange={setVideoPickerOpen}
                title="選擇 Banner YouTube 素材"
                kind="YOUTUBE"
                onSelect={(url) => setVideoUrl(url)}
              />
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
