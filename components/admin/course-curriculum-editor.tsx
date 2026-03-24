"use client";

import {
  createLessonQuick,
  createSectionQuick,
  saveCourseMeta,
  saveLesson,
  saveSection,
  type ActionResult,
} from "@/lib/admin/course-curriculum-actions";
import type { CourseFormCategoryOption } from "@/lib/admin/course-form-serialize";
import {
  collectInvalidCurriculumIds,
  type CourseCurriculumCourseInput,
  type CourseLessonDraftInput,
  type CourseSectionDraftInput,
  type CourseTreeDrafts,
} from "@/lib/validation/course-curriculum";
import { CourseAnnouncementsPanel } from "@/components/admin/course-announcements-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BookMarked,
  ChevronRight,
  Clapperboard,
  GraduationCap,
  Layers,
  Megaphone,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

export type CurriculumLessonInitial = {
  id: string;
  title: string;
  videoUrl: string | null;
  duration: number | null;
  order: number;
};

export type CurriculumSectionInitial = {
  id: string;
  title: string;
  order: number;
  lessons: CurriculumLessonInitial[];
};

export type CurriculumAnnouncementInitial = {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
};

export type CurriculumEditorInitial = {
  /** 資料版本（通常為 course.updatedAt），儲存後 refresh 時用於同步草稿 */
  version: string;
  courseId: string;
  course: CourseCurriculumCourseInput;
  announcements: CurriculumAnnouncementInitial[];
  sections: CurriculumSectionInitial[];
  categories: CourseFormCategoryOption[];
};

type Selection =
  | { kind: "course" }
  | { kind: "announcements" }
  | { kind: "section"; id: string }
  | { kind: "lesson"; id: string; sectionId: string };

function buildDrafts(data: CurriculumEditorInitial): CourseTreeDrafts {
  const sections: Record<string, CourseSectionDraftInput> = {};
  const lessons: Record<string, CourseLessonDraftInput> = {};
  for (const s of data.sections) {
    sections[s.id] = { title: s.title, order: s.order };
    for (const l of s.lessons) {
      lessons[l.id] = {
        title: l.title,
        videoUrl: l.videoUrl,
        duration: l.duration,
        order: l.order,
      };
    }
  }
  return { course: { ...data.course }, sections, lessons };
}

function WarningDot({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <AlertCircle
      className="size-4 shrink-0 text-destructive"
      aria-label="資料未通過驗證"
    />
  );
}

export function CourseCurriculumEditor({ initial }: { initial: CurriculumEditorInitial }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<CourseTreeDrafts>(() => buildDrafts(initial));
  const [selection, setSelection] = useState<Selection>({ kind: "course" });

  useEffect(() => {
    setDrafts(buildDrafts(initial));
  }, [initial.version]);
  const [quickSectionId, setQuickSectionId] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [banner, setBanner] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const invalidIds = useMemo(
    () => collectInvalidCurriculumIds(initial.courseId, drafts),
    [initial.courseId, drafts],
  );

  const updateCourse = useCallback((patch: Partial<CourseCurriculumCourseInput>) => {
    setDrafts((d) => ({ ...d, course: { ...d.course, ...patch } }));
  }, []);

  const updateSection = useCallback((id: string, patch: Partial<CourseSectionDraftInput>) => {
    setDrafts((d) => ({
      ...d,
      sections: { ...d.sections, [id]: { ...d.sections[id], ...patch } },
    }));
  }, []);

  const updateLesson = useCallback((id: string, patch: Partial<CourseLessonDraftInput>) => {
    setDrafts((d) => ({
      ...d,
      lessons: { ...d.lessons, [id]: { ...d.lessons[id], ...patch } },
    }));
  }, []);

  function runSave(fn: () => Promise<ActionResult>) {
    setBanner(null);
    startTransition(async () => {
      const r = await fn();
      setBanner(r);
      if (r.ok) router.refresh();
    });
  }

  function handleQuickAddLesson(sectionId: string) {
    setBanner(null);
    startTransition(async () => {
      const r = await createLessonQuick(
        sectionId,
        initial.courseId,
        quickTitle,
      );
      if (!r.ok) {
        setBanner(r);
        return;
      }
      setQuickTitle("");
      setQuickSectionId(null);
      router.refresh();
    });
  }

  function handleQuickAddSection() {
    setBanner(null);
    startTransition(async () => {
      const r = await createSectionQuick(initial.courseId, newSectionTitle);
      if (!r.ok) {
        setBanner(r);
        return;
      }
      setNewSectionTitle("");
      router.refresh();
    });
  }

  const course = drafts.course;
  const selectedSectionDraft =
    selection.kind === "section" ? drafts.sections[selection.id] : null;
  const selectedLessonDraft =
    selection.kind === "lesson" ? drafts.lessons[selection.id] : null;

  return (
    <div className="flex min-h-[min(70vh,40rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-muted/25 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="border-b border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            課程結構
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-2" aria-label="章節與課堂">
          <button
            type="button"
            onClick={() => setSelection({ kind: "course" })}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
              selection.kind === "course"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted",
            )}
          >
            <GraduationCap className="size-4 shrink-0 opacity-80" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-medium">課程資訊</span>
            <WarningDot show={invalidIds.has(initial.courseId)} />
          </button>

          <button
            type="button"
            onClick={() => setSelection({ kind: "announcements" })}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
              selection.kind === "announcements"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted",
            )}
          >
            <Megaphone className="size-4 shrink-0 opacity-80" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-medium">課程公告</span>
            <span className="tabular-nums text-xs text-muted-foreground">
              {initial.announcements.length}
            </span>
          </button>

          <Separator className="my-2" />

          {initial.sections.map((sec) => (
            <div key={sec.id} className="space-y-0.5">
              <div className="flex items-stretch gap-0.5">
                <button
                  type="button"
                  onClick={() => setSelection({ kind: "section", id: sec.id })}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                    selection.kind === "section" && selection.id === sec.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted",
                  )}
                >
                  <Layers className="size-4 shrink-0 opacity-80" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">
                    {drafts.sections[sec.id]?.title ?? sec.title}
                  </span>
                  <WarningDot show={invalidIds.has(sec.id)} />
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto shrink-0 px-2 text-xs"
                  title="快速新增課堂"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickSectionId((q) => (q === sec.id ? null : sec.id));
                    setSelection({ kind: "section", id: sec.id });
                  }}
                >
                  <Plus className="size-3.5" aria-hidden />
                  <span className="sr-only sm:not-sr-only sm:ml-1">課堂</span>
                </Button>
              </div>

              {quickSectionId === sec.id ? (
                <div className="ml-6 space-y-2 rounded-md border border-dashed border-border bg-background/80 p-2">
                  <Label className="text-xs">快速新增課堂</Label>
                  <Input
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="新課堂標題"
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleQuickAddLesson(sec.id);
                      }
                    }}
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={pending}
                      onClick={() => handleQuickAddLesson(sec.id)}
                    >
                      建立
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setQuickSectionId(null);
                        setQuickTitle("");
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : null}

              <ul className="ml-4 space-y-0.5 border-l border-border/80 pl-2">
                {sec.lessons.map((les) => (
                  <li key={les.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelection({
                          kind: "lesson",
                          id: les.id,
                          sectionId: sec.id,
                        })
                      }
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                        selection.kind === "lesson" && selection.id === les.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted",
                      )}
                    >
                      <Clapperboard className="size-3.5 shrink-0 opacity-70" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">
                        {drafts.lessons[les.id]?.title ?? les.title}
                      </span>
                      <WarningDot show={invalidIds.has(les.id)} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="pt-2">
            <div className="rounded-lg border border-dashed border-border p-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                新增章節
              </p>
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="章節標題"
                className="mb-2 h-8 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full text-xs"
                disabled={pending}
                onClick={handleQuickAddSection}
              >
                <BookMarked className="mr-1 size-3.5" aria-hidden />
                建立章節
              </Button>
            </div>
          </div>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {banner ? (
          <div
            role="status"
            className={cn(
              "mb-4 rounded-lg border px-3 py-2 text-sm",
              banner.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-destructive/30 bg-destructive/5 text-destructive",
            )}
          >
            {banner.ok ? "已儲存。" : banner.message}
          </div>
        ) : null}

        {selection.kind === "course" ? (
          <div className="mx-auto max-w-xl space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ChevronRight className="size-4" aria-hidden />
              <h2 className="text-lg font-semibold text-foreground">課程資訊</h2>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-title">標題（必填）</Label>
              <Input
                id="c-title"
                value={course.title}
                onChange={(e) => updateCourse({ title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-sub">副標題／摘要（前台標題區）</Label>
              <Input
                id="c-sub"
                value={course.subtitle ?? ""}
                onChange={(e) =>
                  updateCourse({
                    subtitle: e.target.value === "" ? null : e.target.value,
                  })
                }
                placeholder="一行摘要"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-desc">完整課程介紹（前台「介紹」分頁）</Label>
              <textarea
                id="c-desc"
                rows={4}
                value={course.description ?? ""}
                onChange={(e) =>
                  updateCourse({
                    description: e.target.value === "" ? null : e.target.value,
                  })
                }
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="支援多行純文字"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-pre">學習前基本能力（每行一則）</Label>
              <textarea
                id="c-pre"
                rows={3}
                value={course.prerequisiteText ?? ""}
                onChange={(e) =>
                  updateCourse({
                    prerequisiteText:
                      e.target.value === "" ? null : e.target.value,
                  })
                }
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="空白則前台使用站方預設"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-prep">學習前準備（每行一則）</Label>
              <textarea
                id="c-prep"
                rows={3}
                value={course.preparationText ?? ""}
                onChange={(e) =>
                  updateCourse({
                    preparationText:
                      e.target.value === "" ? null : e.target.value,
                  })
                }
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="空白則前台使用站方預設"
              />
            </div>
            <div className="grid gap-2">
              <Label>分類（可複選）</Label>
              <div className="space-y-2 rounded-md border border-input p-3">
                {initial.categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    尚無類別，請至「課程類別」建立。
                  </p>
                ) : (
                  initial.categories.map((c) => {
                    const checked = (course.categoryIds ?? []).includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const set = new Set(course.categoryIds ?? []);
                            if (e.target.checked) set.add(c.id);
                            else set.delete(c.id);
                            updateCourse({ categoryIds: [...set] });
                          }}
                          className="size-4 rounded border-input"
                        />
                        {c.name}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="c-price">定價（不可為負）</Label>
                <Input
                  id="c-price"
                  type="number"
                  min={0}
                  step={1}
                  value={course.price ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") {
                      updateCourse({ price: null });
                      return;
                    }
                    const n = Number.parseFloat(v);
                    updateCourse({
                      price: Number.isFinite(n) ? n : null,
                    });
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-sale">特價（不可為負）</Label>
                <Input
                  id="c-sale"
                  type="number"
                  min={0}
                  step={1}
                  value={course.discountedPrice ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") {
                      updateCourse({ discountedPrice: null });
                      return;
                    }
                    const n = Number.parseFloat(v);
                    updateCourse({
                      discountedPrice: Number.isFinite(n) ? n : null,
                    });
                  }}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-img">封面圖 URL</Label>
              <Input
                id="c-img"
                value={course.imageUrl ?? ""}
                onChange={(e) =>
                  updateCourse({
                    imageUrl: e.target.value === "" ? null : e.target.value,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="c-pub"
                type="checkbox"
                checked={course.isPublished}
                onChange={(e) => updateCourse({ isPublished: e.target.checked })}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="c-pub" className="font-normal">
                已上架
              </Label>
            </div>
            <Button
              type="button"
              disabled={pending || invalidIds.has(initial.courseId)}
              onClick={() =>
                runSave(() => saveCourseMeta(initial.courseId, drafts.course))
              }
            >
              儲存課程
            </Button>
            {invalidIds.has(initial.courseId) ? (
              <p className="text-xs text-destructive">
                請修正驗證錯誤後再儲存（標題必填、價格不可為負）。
              </p>
            ) : null}
          </div>
        ) : null}

        {selection.kind === "announcements" ? (
          <CourseAnnouncementsPanel
            courseId={initial.courseId}
            initialRows={initial.announcements}
          />
        ) : null}

        {selection.kind === "section" && selectedSectionDraft ? (
          <div className="mx-auto max-w-xl space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ChevronRight className="size-4" aria-hidden />
              <h2 className="text-lg font-semibold text-foreground">編輯章節</h2>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-title">章節標題（必填）</Label>
              <Input
                id="s-title"
                value={selectedSectionDraft.title}
                onChange={(e) =>
                  updateSection(selection.id, { title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-order">排序序號</Label>
              <Input
                id="s-order"
                type="number"
                step={1}
                value={selectedSectionDraft.order}
                onChange={(e) =>
                  updateSection(selection.id, {
                    order: Number.parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>
            <Button
              type="button"
              disabled={pending || invalidIds.has(selection.id)}
              onClick={() =>
                runSave(() =>
                  saveSection(
                    selection.id,
                    initial.courseId,
                    selectedSectionDraft,
                  ),
                )
              }
            >
              儲存章節
            </Button>
          </div>
        ) : null}

        {selection.kind === "lesson" && selectedLessonDraft ? (
          <div className="mx-auto max-w-xl space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ChevronRight className="size-4" aria-hidden />
              <h2 className="text-lg font-semibold text-foreground">編輯課堂</h2>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="l-title">課堂標題（必填）</Label>
              <Input
                id="l-title"
                value={selectedLessonDraft.title}
                onChange={(e) =>
                  updateLesson(selection.id, { title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="l-video">影片連結（http(s)，可留空）</Label>
              <Input
                id="l-video"
                value={selectedLessonDraft.videoUrl ?? ""}
                onChange={(e) =>
                  updateLesson(selection.id, {
                    videoUrl: e.target.value === "" ? null : e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="l-dur">長度（秒，可留空）</Label>
              <Input
                id="l-dur"
                type="number"
                min={0}
                step={1}
                value={selectedLessonDraft.duration ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    updateLesson(selection.id, { duration: null });
                    return;
                  }
                  const n = Number.parseInt(v, 10);
                  updateLesson(selection.id, {
                    duration: Number.isFinite(n) && n >= 0 ? n : null,
                  });
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="l-order">排序序號</Label>
              <Input
                id="l-order"
                type="number"
                step={1}
                value={selectedLessonDraft.order}
                onChange={(e) =>
                  updateLesson(selection.id, {
                    order: Number.parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>
            <Button
              type="button"
              disabled={pending || invalidIds.has(selection.id)}
              onClick={() =>
                runSave(() =>
                  saveLesson(
                    selection.id,
                    initial.courseId,
                    selectedLessonDraft,
                  ),
                )
              }
            >
              儲存課堂
            </Button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
