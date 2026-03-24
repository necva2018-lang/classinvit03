"use client";

import {
  deleteCategory,
  moveCategory,
  saveCategory,
} from "@/lib/admin/category-actions";
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
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type AdminCategoryRow = {
  id: string;
  name: string;
  sortOrder: number;
  courseCount: number;
};

export function CategoriesManager({
  initialRows,
}: {
  initialRows: AdminCategoryRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    const nextOrder =
      initialRows.length === 0
        ? 0
        : Math.max(...initialRows.map((r) => r.sortOrder)) + 1;
    setEditing({
      id: "",
      name: "",
      sortOrder: nextOrder,
      courseCount: 0,
    });
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (row: AdminCategoryRow) => {
    setEditing({ ...row });
    setFormError(null);
    setOpen(true);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      await saveCategory(fd);
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
    const n = editing.courseCount;
    const msg =
      n > 0
        ? `此類別下有 ${n} 門課程；刪除後這些課程將變為「未分類」。確定刪除？`
        : "確定刪除此類別？";
    if (!confirm(msg)) return;
    await deleteCategory(editing.id);
    setOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleMove(id: string, dir: "up" | "down") {
    await moveCategory(id, dir);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            課程類別
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理課程分類名稱與排序；導覽列、首頁分類與課程表單下拉選單皆依「排序」顯示。名稱不可重複。
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          新增類別
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>類別名稱</TableHead>
              <TableHead className="w-[140px] text-center">排序</TableHead>
              <TableHead className="w-[100px] text-right tabular-nums">
                課程數
              </TableHead>
              <TableHead className="w-[100px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  尚無類別。請新增，或執行 seed。
                </TableCell>
              </TableRow>
            ) : (
              initialRows.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
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
                      <span className="w-8 text-center text-xs tabular-nums text-muted-foreground">
                        {row.sortOrder}
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
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {row.courseCount}
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
              ))
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
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editing?.id ? "編輯類別" : "新增類別"}
            </SheetTitle>
          </SheetHeader>
          {editing ? (
            <form
              key={editing.id || "new"}
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              {editing.id ? (
                <input type="hidden" name="id" value={editing.id} />
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="category-name">名稱</Label>
                <Input
                  id="category-name"
                  name="name"
                  required
                  defaultValue={editing.name}
                  placeholder="例如：人工智慧、網頁前端"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  名稱會顯示於首頁導覽與課程列表；與前台篩選標籤文字相同時可一鍵篩選該類課程。
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category-sort">排序</Label>
                <Input
                  id="category-sort"
                  name="sortOrder"
                  type="number"
                  required
                  defaultValue={editing.sortOrder}
                  min={0}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  數字越小越靠前；亦可用列表上的上下箭頭交換順序（會自動重新編號）。
                </p>
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
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
