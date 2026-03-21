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
        <Label htmlFor="categoryId">分類</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={course?.categoryId ?? categories[0]?.id ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">描述</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={course?.description ?? ""}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="課程簡介（選填）"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="price">售價（NT$，整數）</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            defaultValue={course?.price ?? 0}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priceOriginal">原價（選填）</Label>
          <Input
            id="priceOriginal"
            name="priceOriginal"
            type="number"
            min={0}
            defaultValue={course?.priceOriginal ?? ""}
            placeholder="無則留空"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="coverImageUrl">封面圖 URL</Label>
        <Input
          id="coverImageUrl"
          name="coverImageUrl"
          type="url"
          required
          defaultValue={course?.coverImageUrl ?? ""}
          placeholder="https://…"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="instructorName">講師名稱</Label>
        <Input
          id="instructorName"
          name="instructorName"
          required
          defaultValue={course?.instructorName ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="rating">評分（0–5）</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            required
            defaultValue={course ? course.rating : 4.5}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="reviewCount">評價數</Label>
          <Input
            id="reviewCount"
            name="reviewCount"
            type="number"
            min={0}
            required
            defaultValue={course?.reviewCount ?? 0}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">網址 slug（選填，留空則自動產生）</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={course?.slug ?? ""}
          placeholder="my-course-slug"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
