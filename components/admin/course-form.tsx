"use client";

import { useState } from "react";
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
  const [status, setStatus] = useState<"DRAFT" | "PAUSED">(
    course?.status ?? "DRAFT",
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    (course?.isPublished ?? false) && (course?.status ?? "DRAFT") !== "PAUSED",
  );
  const isPublishDisabled = status === "PAUSED";

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-8">
      <section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="border-b border-border pb-2">
          <h2 className="text-base font-semibold text-foreground">
            基本與前台文案
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            下列內容會影響對外課程頁（標題區與「介紹」分頁）；請與「課程與單元」頁的「課程公告」一併維護。
          </p>
        </div>

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

      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="status">狀態</Label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => {
            const next = e.target.value === "PAUSED" ? "PAUSED" : "DRAFT";
            setStatus(next);
            if (next === "PAUSED") {
              setIsPublished(false);
            }
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="DRAFT">草稿</option>
          <option value="PAUSED">暫停</option>
        </select>
        <p className="text-xs text-muted-foreground">
          課程營運狀態，供後台管理使用。
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subtitle">副標題／摘要（選填）</Label>
        <Input
          id="subtitle"
          name="subtitle"
          defaultValue={course?.subtitle ?? ""}
          placeholder="前台課程頁標題區的一行摘要"
        />
        <p className="text-xs text-muted-foreground">
          對應前台課程詳情頂部文案；完整介紹請寫在下方「課程介紹」。
        </p>
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium leading-none">分類（可複選，選填）</legend>
        <div className="space-y-2 rounded-md border border-input p-3">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">尚無類別，請至「課程類別」建立。</p>
          ) : (
            categories.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 text-sm font-normal"
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={c.id}
                  defaultChecked={(course?.categoryIds ?? []).includes(c.id)}
                  className="size-4 rounded border-input"
                />
                {c.name}
              </label>
            ))
          )}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="description">完整課程介紹（選填）</Label>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={course?.description ?? ""}
          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="對應前台「介紹」分頁的課程介紹全文"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="prerequisiteText">學習前基本能力（選填）</Label>
        <textarea
          id="prerequisiteText"
          name="prerequisiteText"
          rows={4}
          defaultValue={course?.prerequisiteText ?? ""}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="每行一則；空白時前台顯示站方預設文案"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="preparationText">學習前準備（選填）</Label>
        <textarea
          id="preparationText"
          name="preparationText"
          rows={4}
          defaultValue={course?.preparationText ?? ""}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="每行一則；空白時前台顯示站方預設文案"
        />
      </div>

      <div className="grid gap-4 rounded-md border border-border p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">課程 CTA 按鈕</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            可依課程銷售方式自訂，例如「加入購物車 / 立即購買」或「索取簡章 / 直接報名」。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="ctaCartText">按鈕一文字（選填）</Label>
            <Input
              id="ctaCartText"
              name="ctaCartText"
              defaultValue={course?.ctaCartText ?? ""}
              placeholder="例如：加入購物車、索取簡章"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ctaCartUrl">按鈕一連結（選填）</Label>
            <Input
              id="ctaCartUrl"
              name="ctaCartUrl"
              defaultValue={course?.ctaCartUrl ?? ""}
              placeholder="例如：/cart 或 https://example.com/form"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ctaBuyText">按鈕二文字（選填）</Label>
            <Input
              id="ctaBuyText"
              name="ctaBuyText"
              defaultValue={course?.ctaBuyText ?? ""}
              placeholder="例如：立即購買、直接報名"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ctaBuyUrl">按鈕二連結（選填）</Label>
            <Input
              id="ctaBuyUrl"
              name="ctaBuyUrl"
              defaultValue={course?.ctaBuyUrl ?? ""}
              placeholder="例如：/checkout 或 https://example.com/register"
            />
          </div>
        </div>
      </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="border-b border-border pb-2">
          <h2 className="text-base font-semibold text-foreground">
            價格、封面與上架
          </h2>
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
          checked={isPublished}
          disabled={isPublishDisabled}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="size-4 rounded border-input"
        />
        <Label htmlFor="isPublished" className="font-normal">
          已上架（前台可見）
        </Label>
      </div>
      {isPublishDisabled ? (
        <p className="text-xs text-muted-foreground">
          狀態為「暫停」時不可上架，系統會自動取消勾選。
        </p>
      ) : null}
      </section>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
