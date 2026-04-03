"use client";

import { useActionState, useState } from "react";

import { saveSiteSettings } from "@/lib/admin/site-settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaPickerSheet } from "@/components/admin/media-picker-sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  SITE_SETTING_GROUPS,
  type SiteSettingField,
} from "@/lib/site-settings";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

const FORM_ID = "site-settings-form";

function looksLikeHttpImageUrl(s: string): boolean {
  const t = s.trim();
  return /^https:\/\/.+/i.test(t);
}

function LogoUrlRow({
  field,
  defaultValue,
}: {
  field: SiteSettingField;
  defaultValue: string;
}) {
  const id = `setting-${field.key}`;
  const [url, setUrl] = useState(defaultValue);
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div className="grid gap-2 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-base font-semibold">
          {field.label}
        </Label>
        <code className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {field.key}
        </code>
      </div>
      <p className="text-sm text-muted-foreground">{field.description}</p>
      <div className="flex gap-2">
        <Input
          id={id}
          name={field.key}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="font-mono text-sm"
          placeholder="/api/media/..."
        />
        <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
          素材庫
        </Button>
      </div>
      {looksLikeHttpImageUrl(url) ? (
        <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-muted/30 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- 後台預覽任意圖床 */}
          <img
            src={url.trim()}
            alt=""
            className="max-h-14 w-auto max-w-[200px] object-contain object-left"
          />
          <span className="text-xs text-muted-foreground">預覽</span>
        </div>
      ) : null}
      <MediaPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title={`選擇素材：${field.label}`}
        kind="IMAGE"
        onSelect={(value) => setUrl(value)}
      />
    </div>
  );
}

function KeyValueRow({
  field,
  defaultValue,
}: {
  field: SiteSettingField;
  defaultValue: string;
}) {
  if (field.variant === "logo") {
    return <LogoUrlRow field={field} defaultValue={defaultValue} />;
  }

  const id = `setting-${field.key}`;
  return (
    <div className="grid gap-2 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-base font-semibold">
          {field.label}
        </Label>
        <code className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {field.key}
        </code>
      </div>
      <p className="text-sm text-muted-foreground">{field.description}</p>
      {field.multiline ? (
        <Textarea
          id={id}
          name={field.key}
          defaultValue={defaultValue}
          rows={4}
          className="font-mono text-sm"
        />
      ) : (
        <Input
          id={id}
          name={field.key}
          defaultValue={defaultValue}
          className="font-mono text-sm"
        />
      )}
    </div>
  );
}

function TabPanel({ fields, values }: { fields: SiteSettingField[]; values: Record<string, string> }) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <KeyValueRow
          key={field.key}
          field={field}
          defaultValue={values[field.key] ?? ""}
        />
      ))}
    </div>
  );
}

export function SiteSettingsForm({
  initialValues,
}: {
  initialValues: Record<string, string>;
}) {
  const [state, formAction, isPending] = useActionState(saveSiteSettings, null);

  return (
    <>
      <form id={FORM_ID} action={formAction} className="relative pb-24">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              全站設定
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              以鍵值方式編輯；儲存後會重新驗證首頁快取。
            </p>
          </div>
          {state ? (
            <p
              role="status"
              className={cn(
                "text-sm sm:max-w-xs sm:text-right",
                state.ok ? "text-emerald-700" : "text-destructive",
              )}
            >
              {state.message}
            </p>
          ) : null}
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="flex w-full max-w-2xl flex-wrap gap-1">
            <TabsTrigger value="basic" className="flex-1 min-[480px]:flex-none">
              基礎設定
            </TabsTrigger>
            <TabsTrigger value="brand" className="flex-1 min-[480px]:flex-none">
              LOGO 管理
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex-1 min-[480px]:flex-none">
              SEO 優化
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex-1 min-[480px]:flex-none">
              頁尾版型
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-1 min-[480px]:flex-none">
              聯絡資訊
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <TabPanel fields={[...SITE_SETTING_GROUPS.basic]} values={initialValues} />
          </TabsContent>

          <TabsContent value="brand" className="space-y-4">
            <TabPanel fields={[...SITE_SETTING_GROUPS.brand]} values={initialValues} />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <TabPanel fields={[...SITE_SETTING_GROUPS.seo]} values={initialValues} />
          </TabsContent>

          <TabsContent value="footer" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              對應前台雙層頁尾：上方白色推薦列（三欄 LOGO＋引言）＋下方黑色四欄導覽與社群，以及最底列版權／法律連結。
            </p>
            <TabPanel fields={[...SITE_SETTING_GROUPS.footer]} values={initialValues} />
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <TabPanel
              fields={[...SITE_SETTING_GROUPS.contact]}
              values={initialValues}
            />
          </TabsContent>
        </Tabs>
      </form>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 top-0 z-40 flex justify-end p-4 pt-20 sm:p-6 sm:pt-24">
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <Button
            type="submit"
            form={FORM_ID}
            size="lg"
            disabled={isPending}
            className="shadow-lg shadow-primary/20"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                儲存中…
              </>
            ) : (
              <>
                <Check className="size-4" aria-hidden />
                儲存變更
              </>
            )}
          </Button>
          <span className="hidden text-right text-xs text-muted-foreground sm:block">
            快捷：送出表單即寫入資料庫
          </span>
        </div>
      </div>
    </>
  );
}
