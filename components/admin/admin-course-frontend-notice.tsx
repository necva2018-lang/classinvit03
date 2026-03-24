import { ExternalLink, LayoutList, Megaphone, ScrollText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type Context = "list" | "form" | "curriculum";

const copy: Record<
  Context,
  { title: string; lines: string[]; extra?: ReactNode }
> = {
  list: {
    title: "前台課程頁已改版，後台請到這裡編輯",
    lines: [
      "點表格中的課程列 →「編輯課程」表單：可填副標、完整介紹、學習前基本能力／準備（對應前台「介紹」分頁）。",
      "同一門課再點「課程與單元（大綱 · 公告）」：左側有「課程公告」（對應前台「公告」）與章節（對應「大綱」）。",
    ],
  },
  form: {
    title: "以下欄位會出現在對外課程頁 /courses/課程ID",
    lines: [
      "「副標題／摘要」＝標題區下方一行話；「完整課程介紹」＝「介紹」分頁主文。",
      "「學習前基本能力／準備」請每行寫一則；留空則前台顯示站方預設文案。",
      "「公告」請到「課程與單元（大綱 · 公告）」→ 左側「課程公告」新增。",
    ],
    extra: (
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ScrollText className="size-3.5 shrink-0" aria-hidden />
          介紹
        </span>
        <span className="inline-flex items-center gap-1">
          <LayoutList className="size-3.5 shrink-0" aria-hidden />
          大綱
        </span>
        <span className="inline-flex items-center gap-1">
          <Megaphone className="size-3.5 shrink-0" aria-hidden />
          公告
        </span>
      </p>
    ),
  },
  curriculum: {
    title: "本頁對應前台「大綱」與「公告」分頁",
    lines: [
      "左側第二項「課程公告」：新增後會出現在對外課程頁的「公告」分頁。",
      "「課程資訊」裡也可改副標、完整介紹、學習前說明（與基本資料表單相同欄位，擇一處儲存即可同步）。",
    ],
  },
};

export function AdminCourseFrontendNotice({ context }: { context: Context }) {
  const c = copy[context];
  return (
    <div
      role="note"
      className="rounded-lg border-2 border-primary/30 bg-primary/5 px-4 py-3 text-sm shadow-sm"
    >
      <p className="font-semibold text-primary">{c.title}</p>
      <ul className="mt-2 list-inside list-disc space-y-1.5 text-foreground/90">
        {c.lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      {c.extra ?? null}
      {context === "list" ? (
        <p className="mt-3 text-xs text-muted-foreground">
          前台範例路徑：
          <Link
            href="/courses"
            className="ml-1 inline-flex items-center gap-0.5 font-medium text-primary underline-offset-4 hover:underline"
          >
            課程列表
            <ExternalLink className="size-3" aria-hidden />
          </Link>
        </p>
      ) : null}
    </div>
  );
}
