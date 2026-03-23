"use client";

import {
  createCourseAnnouncement,
  deleteCourseAnnouncement,
  type AnnouncementActionResult,
} from "@/lib/admin/course-announcement-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
};

type Props = {
  courseId: string;
  initialRows: AnnouncementRow[];
};

export function CourseAnnouncementsPanel({ courseId, initialRows }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<AnnouncementActionResult | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function onCreate() {
    setBanner(null);
    startTransition(async () => {
      const r = await createCourseAnnouncement(courseId, title, body);
      setBanner(r);
      if (r.ok) {
        setTitle("");
        setBody("");
        router.refresh();
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("確定刪除此公告？")) return;
    setBanner(null);
    startTransition(async () => {
      const r = await deleteCourseAnnouncement(id, courseId);
      setBanner(r);
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">課程公告</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        對應前台課程頁「公告」分頁；學員可看到標題與內文（前台樣式將依上架內容顯示）。
      </p>

      {banner && !banner.ok ? (
        <p className="text-sm text-destructive">{banner.message}</p>
      ) : null}

      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">新增公告</p>
        <div className="grid gap-2">
          <Label htmlFor="ann-title">標題</Label>
          <Input
            id="ann-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：教材更新、作業截止提醒"
            disabled={pending}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ann-body">內文（選填）</Label>
          <Textarea
            id="ann-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="支援多行純文字"
            disabled={pending}
          />
        </div>
        <Button type="button" size="sm" disabled={pending} onClick={onCreate}>
          發布公告
        </Button>
      </div>

      <ul className="space-y-2">
        {initialRows.length === 0 ? (
          <li className="rounded-md border border-border bg-card px-3 py-6 text-center text-sm text-muted-foreground">
            尚無公告
          </li>
        ) : (
          initialRows.map((row) => (
            <li
              key={row.id}
              className="flex gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{row.title}</p>
                {row.body ? (
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {row.body}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString("zh-TW")}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() => onDelete(row.id)}
                aria-label="刪除公告"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
