"use client";

import type {
  SiteCourseCurriculumSection,
  SiteCoursePublicAnnouncement,
} from "@/lib/courses-queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ChevronDown, ListTree, Megaphone, ScrollText } from "lucide-react";
import { useState } from "react";

function formatLessonDuration(sec: number | null): string | null {
  if (sec == null || sec <= 0) return null;
  const m = Math.round(sec / 60);
  if (m < 1) return "不到 1 分鐘";
  return `約 ${m} 分鐘`;
}

type Props = {
  bodyDescription: string | null;
  heroTeaser: string | null;
  learn: string[];
  audience: string[];
  prerequisiteBullets: string[];
  prepareBullets: string[];
  curriculum: SiteCourseCurriculumSection[];
  announcements: SiteCoursePublicAnnouncement[];
};

export function CourseDetailTabs({
  bodyDescription,
  heroTeaser,
  learn,
  audience,
  prerequisiteBullets,
  prepareBullets,
  curriculum,
  announcements,
}: Props) {
  const [tab, setTab] = useState("intro");

  const introBody =
    bodyDescription?.trim() ||
    heroTeaser?.trim() ||
    "講師將於此處補充更完整的課程說明與學習路徑。";

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-zinc-200 bg-transparent p-0 text-zinc-500">
        <TabsTrigger
          value="intro"
          className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-semibold text-zinc-600 shadow-none data-[state=active]:border-necva-primary data-[state=active]:bg-transparent data-[state=active]:text-necva-primary data-[state=active]:shadow-none sm:px-5"
        >
          <ScrollText className="mr-2 size-4 opacity-80" aria-hidden />
          介紹
        </TabsTrigger>
        <TabsTrigger
          value="outline"
          className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-semibold text-zinc-600 shadow-none data-[state=active]:border-necva-primary data-[state=active]:bg-transparent data-[state=active]:text-necva-primary data-[state=active]:shadow-none sm:px-5"
        >
          <ListTree className="mr-2 size-4 opacity-80" aria-hidden />
          大綱
        </TabsTrigger>
        <TabsTrigger
          value="news"
          className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-semibold text-zinc-600 shadow-none data-[state=active]:border-necva-primary data-[state=active]:bg-transparent data-[state=active]:text-necva-primary data-[state=active]:shadow-none sm:px-5"
        >
          <Megaphone className="mr-2 size-4 opacity-80" aria-hidden />
          公告
        </TabsTrigger>
      </TabsList>

      <TabsContent value="intro" className="mt-6 focus-visible:ring-0">
        <section className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">課程介紹</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
              {introBody}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900">你可以學到</h2>
            <ul className="mt-3 space-y-2.5">
              {learn.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-zinc-700">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-necva-accent"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900">適合對象</h2>
            <ul className="mt-3 space-y-2.5">
              {audience.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-zinc-700">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-necva-primary"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900">學習前基本能力</h2>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-zinc-600">
              {prerequisiteBullets.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900">學習前準備</h2>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-zinc-600">
              {prepareBullets.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>
      </TabsContent>

      <TabsContent value="outline" className="mt-6 focus-visible:ring-0">
        {curriculum.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-10 text-center text-sm text-zinc-500">
            尚無公開單元大綱。講師上架章節後將顯示於此。
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">
              展開各章節可檢視課堂標題與預估長度（若有設定）。
            </p>
            {curriculum.map((section, sIdx) => (
              <details
                key={section.id}
                className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm open:shadow-md"
                open={sIdx === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-zinc-900 marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    第 {sIdx + 1} 章｜{section.title}
                    <span className="ml-2 font-normal text-zinc-500">
                      （{section.lessons.length} 小節）
                    </span>
                  </span>
                  <ChevronDown
                    className="size-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <ul className="space-y-0 border-t border-zinc-100 bg-zinc-50/50 px-4 py-2">
                  {section.lessons.map((lesson, lIdx) => {
                    const dur = formatLessonDuration(lesson.durationSec);
                    return (
                      <li
                        key={lesson.id}
                        className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-100 py-2.5 text-sm last:border-b-0"
                      >
                        <span className="text-zinc-800">
                          {sIdx + 1}-{lIdx + 1} {lesson.title}
                        </span>
                        {dur ? (
                          <span className="tabular-nums text-xs text-zinc-500">
                            {dur}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="news" className="mt-6 focus-visible:ring-0">
        {announcements.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-12 text-center">
            <Megaphone
              className="mx-auto size-10 text-zinc-300"
              aria-hidden
            />
            <p className="mt-4 text-sm font-medium text-zinc-700">
              目前尚無任何課程公告
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              講師可於後台「課程與單元編輯 → 課程公告」發布通知。
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm"
              >
                <p className="font-semibold text-zinc-900">{a.title}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {new Date(a.createdAt).toLocaleString("zh-TW")}
                </p>
                {a.body ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
                    {a.body}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}
