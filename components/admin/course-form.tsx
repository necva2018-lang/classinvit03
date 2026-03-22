"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CourseFormCategoryOption,
  CourseFormInitialValues,
} from "@/lib/admin/course-form-serialize";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "處理中…" : label}
    </Button>
  );
}

type CourseFormProps = {
  categories: CourseFormCategoryOption[];
  action: (formData: FormData) => Promise<void>;
  course?: CourseFormInitialValues;
  submitLabel: string;
};

export function CourseForm({
  categories,
  action,
  course,
  submitLabel,
}: CourseFormProps) {
  return (
    <form action={action} className="mx-auto max-w-2xl space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="title">標題</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={course?.title ?? ""}
          placeholder="課程名稱"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subtitle">副標題（選填）</Label>
        <Input
          id="subtitle"
          name="subtitle"
          defaultValue={course?.subtitle ?? ""}
          placeholder="一句話說明課程"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="categoryId">分類（選填）</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={course?.categoryId ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— 未分類 —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">課程介紹</Label>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={course?.description ?? ""}
          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Markdown 或純文字皆可（選填）"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="price">定價（NT$，可含小數）</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            defaultValue={course?.price ?? ""}
            placeholder="原價／牌價"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="discountedPrice">特價（選填）</Label>
          <Input
            id="discountedPrice"
            name="discountedPrice"
            type="number"
            min={0}
            step={1}
            defaultValue={course?.discountedPrice ?? ""}
            placeholder="無特價可留空"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="imageUrl">封面圖 URL（選填）</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={course?.imageUrl ?? ""}
          placeholder="https://…"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          value="on"
          defaultChecked={course?.isPublished ?? false}
          className="size-4 rounded border-input"
        />
        <Label htmlFor="isPublished" className="font-normal">
          已上架（前台可見）
        </Label>
      </div>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
