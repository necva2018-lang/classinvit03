"use client";

import { useActionState } from "react";

import { saveSiteSettings } from "@/lib/admin/site-settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function KeyValueRow({
  field,
  defaultValue,
}: {
  field: SiteSettingField;
  defaultValue: string;
}) {
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
          <TabsList className="grid w-full max-w-xl grid-cols-3 sm:inline-flex sm:w-auto">
            <TabsTrigger value="basic">基礎設定</TabsTrigger>
            <TabsTrigger value="seo">SEO 優化</TabsTrigger>
            <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <TabPanel fields={[...SITE_SETTING_GROUPS.basic]} values={initialValues} />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <TabPanel fields={[...SITE_SETTING_GROUPS.seo]} values={initialValues} />
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
