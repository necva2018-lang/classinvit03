"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IntroBlock } from "@/lib/validation/intro-blocks";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  Clapperboard,
  FileText,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

function newId(): string {
  return crypto.randomUUID();
}

type Props = {
  blocks: IntroBlock[];
  onChange: (next: IntroBlock[]) => void;
  disabled?: boolean;
};

export function CourseIntroBlocksEditor({
  blocks,
  onChange,
  disabled,
}: Props) {
  function addText() {
    onChange([
      ...blocks,
      { id: newId(), type: "text", body: "" },
    ]);
  }
  function addImage() {
    onChange([
      ...blocks,
      { id: newId(), type: "image", url: "https://", caption: null },
    ]);
  }
  function addVideo() {
    onChange([
      ...blocks,
      { id: newId(), type: "video", url: "https://", caption: null },
    ]);
  }

  function patchAt(index: number, patch: Partial<IntroBlock>) {
    const b = blocks[index];
    if (!b) return;
    const next = { ...b, ...patch } as IntroBlock;
    onChange(blocks.map((x, i) => (i === index ? next : x)));
  }

  function removeAt(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= blocks.length) return;
    const copy = [...blocks];
    const t = copy[index]!;
    copy[index] = copy[j]!;
    copy[j] = t;
    onChange(copy);
  }

  const btnClass =
    "h-9 gap-2 rounded-md border border-input bg-background px-3 text-sm font-normal shadow-sm hover:bg-muted/60";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          新增區塊
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(btnClass)}
            disabled={disabled}
            onClick={addImage}
          >
            <ImageIcon className="size-4 shrink-0" aria-hidden />
            圖片
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(btnClass)}
            disabled={disabled}
            onClick={addVideo}
          >
            <Clapperboard className="size-4 shrink-0" aria-hidden />
            影片
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(btnClass)}
            disabled={disabled}
            onClick={addText}
          >
            <FileText className="size-4 shrink-0" aria-hidden />
            文字
          </Button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
          尚未新增區塊。請使用上方按鈕加入圖片、影片或文字。
        </p>
      ) : (
        <ul className="space-y-3">
          {blocks.map((block, index) => (
            <li
              key={block.id}
              className="rounded-lg border border-border bg-muted/10 p-3 shadow-sm"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {block.type === "text"
                    ? "文字"
                    : block.type === "image"
                      ? "圖片"
                      : "影片"}
                </span>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label="上移"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={disabled || index === blocks.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="下移"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    disabled={disabled}
                    onClick={() => removeAt(index)}
                    aria-label="刪除區塊"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {block.type === "text" ? (
                <div className="grid gap-2">
                  <Label className="text-xs">內容</Label>
                  <textarea
                    rows={4}
                    value={block.body}
                    disabled={disabled}
                    onChange={(e) =>
                      patchAt(index, {
                        type: "text",
                        id: block.id,
                        body: e.target.value,
                      })
                    }
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="純文字，支援換行"
                  />
                </div>
              ) : null}

              {block.type === "image" ? (
                <div className="grid gap-2">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">圖片 URL（https）</Label>
                    <Input
                      value={block.url}
                      disabled={disabled}
                      onChange={(e) =>
                        patchAt(index, {
                          type: "image",
                          id: block.id,
                          url: e.target.value,
                          caption: block.caption,
                        })
                      }
                      placeholder="https://…"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">圖說（選填）</Label>
                    <Input
                      value={block.caption ?? ""}
                      disabled={disabled}
                      onChange={(e) =>
                        patchAt(index, {
                          type: "image",
                          id: block.id,
                          url: block.url,
                          caption:
                            e.target.value === "" ? null : e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : null}

              {block.type === "video" ? (
                <div className="grid gap-2">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">
                      影片連結（YouTube／Vimeo 或 .mp4 等）
                    </Label>
                    <Input
                      value={block.url}
                      disabled={disabled}
                      onChange={(e) =>
                        patchAt(index, {
                          type: "video",
                          id: block.id,
                          url: e.target.value,
                          caption: block.caption,
                        })
                      }
                      placeholder="https://…"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">說明（選填）</Label>
                    <Input
                      value={block.caption ?? ""}
                      disabled={disabled}
                      onChange={(e) =>
                        patchAt(index, {
                          type: "video",
                          id: block.id,
                          url: block.url,
                          caption:
                            e.target.value === "" ? null : e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
