"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaPickerSheet } from "@/components/admin/media-picker-sheet";
import type {
  CourseFormCategoryOption,
  CourseFormInitialValues,
} from "@/lib/admin/course-form-serialize";
import {
  CTA_KIND_DEFAULT_FIELDS,
  courseUsesCommerceListingFields,
  normalizeCourseCtaKind,
  type CourseCtaKind,
} from "@/lib/course-cta";

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
  const initialKind = normalizeCourseCtaKind(course?.ctaKind);
  const [ctaKind, setCtaKind] = useState<CourseCtaKind>(initialKind);

  const [ctaCartText, setCtaCartText] = useState(() => {
    if (!course) return CTA_KIND_DEFAULT_FIELDS.CART.outlineText;
    const t = course.ctaCartText?.trim();
    const kind = normalizeCourseCtaKind(course.ctaKind);
    return t || CTA_KIND_DEFAULT_FIELDS[kind].outlineText;
  });
  const [ctaCartUrl, setCtaCartUrl] = useState(() => {
    if (!course) return CTA_KIND_DEFAULT_FIELDS.CART.outlineHref;
    const t = course.ctaCartUrl?.trim();
    const kind = normalizeCourseCtaKind(course.ctaKind);
    return t || CTA_KIND_DEFAULT_FIELDS[kind].outlineHref;
  });
  const [ctaBuyText, setCtaBuyText] = useState(() => {
    if (!course) return CTA_KIND_DEFAULT_FIELDS.CART.solidText;
    const t = course.ctaBuyText?.trim();
    const kind = normalizeCourseCtaKind(course.ctaKind);
    return t || CTA_KIND_DEFAULT_FIELDS[kind].solidText;
  });
  const [ctaBuyUrl, setCtaBuyUrl] = useState(() => {
    if (!course) return CTA_KIND_DEFAULT_FIELDS.CART.solidHref;
    const t = course.ctaBuyUrl?.trim();
    const kind = normalizeCourseCtaKind(course.ctaKind);
    return t || CTA_KIND_DEFAULT_FIELDS[kind].solidHref;
  });
  const [imageUrl, setImageUrl] = useState(course?.imageUrl ?? "");
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const isPublishDisabled = status === "PAUSED";
  const isSubsidyCta = ctaKind === "SUBSIDY";

  function applyCtaKindDefaults(next: CourseCtaKind) {
    const d = CTA_KIND_DEFAULT_FIELDS[normalizeCourseCtaKind(next)];
    setCtaKind(next);
    setCtaCartText(d.outlineText);
    setCtaCartUrl(d.outlineHref);
    setCtaBuyText(d.solidText);
    setCtaBuyUrl(d.solidHref);
  }

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
        <Label htmlFor="learnOutcomesText">你可以學到（選填）</Label>
        <textarea
          id="learnOutcomesText"
          name="learnOutcomesText"
          rows={5}
          defaultValue={course?.learnOutcomesText ?? ""}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="每行一則；空白時前台依課程分類顯示站方預設條列"
        />
        <p className="text-xs text-muted-foreground">
          對應前台「介紹」分頁橙色勾選區塊。
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="targetAudienceText">適合對象（選填）</Label>
        <textarea
          id="targetAudienceText"
          name="targetAudienceText"
          rows={4}
          defaultValue={course?.targetAudienceText ?? ""}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="每行一則；空白時前台依課程分類顯示站方預設條列"
        />
        <p className="text-xs text-muted-foreground">
          對應前台「介紹」分頁藍色勾選區塊。
        </p>
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

      <div className="grid w-full min-w-0 gap-4 rounded-md border border-dashed border-border bg-muted/30 p-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            前台側欄 · 課程資訊（選填）
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            對應課程頁右側「課程資訊」區塊。每欄空白則前台不顯示該列；四欄皆空白則不顯示整塊。
            不分購物車或補助課，有填寫的列皆會顯示於前台。
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="infoDurationText">課程時長</Label>
          <textarea
            id="infoDurationText"
            name="infoDurationText"
            rows={2}
            defaultValue={course?.infoDurationText ?? ""}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="例如：約 6 小時、依單元內容而定"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="infoStructureText">單元結構</Label>
          <textarea
            id="infoStructureText"
            name="infoStructureText"
            rows={2}
            defaultValue={course?.infoStructureText ?? ""}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="例如：共 4 單元 24 小節"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="infoResourcesText">學習資源</Label>
          <textarea
            id="infoResourcesText"
            name="infoResourcesText"
            rows={2}
            defaultValue={course?.infoResourcesText ?? ""}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="例如：教材將於開課後提供下載"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="infoCertificateText">完訓證明</Label>
          <textarea
            id="infoCertificateText"
            name="infoCertificateText"
            rows={2}
            defaultValue={course?.infoCertificateText ?? ""}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="例如：提供完課學習證明（實際依平台規範為準）"
          />
        </div>
      </div>

      <div className="grid gap-4 rounded-md border border-border p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">課程 CTA 按鈕</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            先選類型：切換後會自動帶入對應預設文字與連結，可直接修改後再儲存。
          </p>
        </div>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="ctaKind">前台 CTA 類型</Label>
          <select
            id="ctaKind"
            name="ctaKind"
            value={ctaKind}
            onChange={(e) =>
              applyCtaKindDefaults(
                e.target.value === "SUBSIDY" ? "SUBSIDY" : "CART",
              )
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="CART">購物車（預設：加入購物車／立即購買）</option>
            <option value="SUBSIDY">補助課（預設：預約諮詢／立即報名）</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="ctaCartText">
              按鈕一文字（選填，外框／左）
              {isSubsidyCta ? " · 預設：預約諮詢" : " · 預設：加入購物車"}
            </Label>
            <Input
              id="ctaCartText"
              name="ctaCartText"
              value={ctaCartText}
              onChange={(e) => setCtaCartText(e.target.value)}
              placeholder={
                isSubsidyCta ? "例如：預約諮詢" : "例如：加入購物車"
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ctaCartUrl">按鈕一連結（選填）</Label>
            <Input
              id="ctaCartUrl"
              name="ctaCartUrl"
              value={ctaCartUrl}
              onChange={(e) => setCtaCartUrl(e.target.value)}
              placeholder={
                isSubsidyCta
                  ? "例如：諮詢表單或 Line 連結"
                  : "例如：/cart"
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ctaBuyText">
              按鈕二文字（選填，實心／右）
              {isSubsidyCta ? " · 預設：立即報名" : " · 預設：立即購買"}
            </Label>
            <Input
              id="ctaBuyText"
              name="ctaBuyText"
              value={ctaBuyText}
              onChange={(e) => setCtaBuyText(e.target.value)}
              placeholder={
                isSubsidyCta ? "例如：立即報名" : "例如：立即購買"
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ctaBuyUrl">按鈕二連結（選填）</Label>
            <Input
              id="ctaBuyUrl"
              name="ctaBuyUrl"
              value={ctaBuyUrl}
              onChange={(e) => setCtaBuyUrl(e.target.value)}
              placeholder={
                isSubsidyCta
                  ? "例如：報名或開課頁面"
                  : "例如：/checkout"
              }
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
          {isSubsidyCta ? (
            <p className="mt-2 text-xs text-muted-foreground">
              前台 CTA 為「補助課」時，定價與特價欄位停用且不會寫入；封面圖與「已上架」仍會儲存並影響前台。
            </p>
          ) : null}
        </div>

      <fieldset
        disabled={!courseUsesCommerceListingFields(ctaKind)}
        className="min-w-0 space-y-4 border-0 p-0 disabled:pointer-events-none disabled:opacity-60"
      >
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
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="imageUrl">封面圖 URL（選填）</Label>
        <div className="flex gap-2">
          <Input
            id="imageUrl"
            name="imageUrl"
            type="text"
            inputMode="url"
            autoComplete="off"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/api/media/..."
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setImagePickerOpen(true)}
          >
            從素材庫選取
          </Button>
        </div>
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
      <MediaPickerSheet
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        title="選擇課程封面圖"
        kind="IMAGE"
        onSelect={(url) => setImageUrl(url)}
      />
    </form>
  );
}
