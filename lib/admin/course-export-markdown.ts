import { resolveCourseCtaPair } from "@/lib/course-cta";
import type {
  Category,
  Course,
  CourseAnnouncement,
  Lesson,
  Section,
} from "@prisma/client";

type CourseWithDetail = Course & {
  categories: Category[];
  announcements: CourseAnnouncement[];
  sections: (Section & { lessons: Lesson[] })[];
};

function linesFor(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function mdEscape(value: string): string {
  return value.replace(/\|/g, "\\|");
}

export function exportCourseToMarkdown(course: CourseWithDetail): string {
  const categories =
    course.categories.length > 0
      ? course.categories.map((c) => c.name).join("、")
      : "未分類";

  const statusMap: Record<string, string> = {
    DRAFT: "草稿",
    PAUSED: "暫停",
  };

  const chunks: string[] = [];
  chunks.push(`# ${course.title}`);
  chunks.push("");
  chunks.push("## 課程基本資訊");
  chunks.push("");
  chunks.push("| 欄位 | 內容 |");
  chunks.push("| --- | --- |");
  chunks.push(`| 狀態 | ${statusMap[course.status] ?? course.status} |`);
  chunks.push(`| 是否上架 | ${course.isPublished ? "是" : "否"} |`);
  chunks.push(`| 分類 | ${mdEscape(categories)} |`);
  chunks.push(
    `| 定價 | ${course.price == null ? "-" : `NT$ ${Math.round(course.price).toLocaleString("zh-TW")}`} |`,
  );
  chunks.push(
    `| 特價 | ${course.discountedPrice == null ? "-" : `NT$ ${Math.round(course.discountedPrice).toLocaleString("zh-TW")}`} |`,
  );
  const ctaKindLabel = course.ctaKind === "SUBSIDY" ? "補助課" : "購物車";
  chunks.push(`| CTA 類型 | ${ctaKindLabel} |`);
  const cta = resolveCourseCtaPair(course);
  chunks.push(
    `| CTA 按鈕一（外框） | ${mdEscape(cta.outline.text)} -> ${mdEscape(cta.outline.href)} |`,
  );
  chunks.push(
    `| CTA 按鈕二（實心） | ${mdEscape(cta.solid.text)} -> ${mdEscape(cta.solid.href)} |`,
  );

  const c = course as Course & {
    infoDurationText?: string | null;
    infoStructureText?: string | null;
    infoResourcesText?: string | null;
    infoCertificateText?: string | null;
  };
  const infoDur = c.infoDurationText?.trim();
  const infoStruct = c.infoStructureText?.trim();
  const infoRes = c.infoResourcesText?.trim();
  const infoCert = c.infoCertificateText?.trim();
  if (infoDur || infoStruct || infoRes || infoCert) {
    chunks.push("");
    chunks.push("## 前台側欄｜課程資訊");
    chunks.push("");
    chunks.push("| 項目 | 內容 |");
    chunks.push("| --- | --- |");
    if (infoDur) {
      chunks.push(`| 課程時長 | ${mdEscape(infoDur)} |`);
    }
    if (infoStruct) {
      chunks.push(`| 單元結構 | ${mdEscape(infoStruct)} |`);
    }
    if (infoRes) {
      chunks.push(`| 學習資源 | ${mdEscape(infoRes)} |`);
    }
    if (infoCert) {
      chunks.push(`| 完訓證明 | ${mdEscape(infoCert)} |`);
    }
  }

  if (course.subtitle?.trim()) {
    chunks.push("");
    chunks.push("## 副標題");
    chunks.push("");
    chunks.push(course.subtitle.trim());
  }

  if (course.description?.trim()) {
    chunks.push("");
    chunks.push("## 課程介紹");
    chunks.push("");
    chunks.push(course.description.trim());
  }

  const learnOut = linesFor(course.learnOutcomesText);
  if (learnOut.length > 0) {
    chunks.push("");
    chunks.push("## 你可以學到");
    chunks.push("");
    for (const line of learnOut) chunks.push(`- ${line}`);
  }

  const audienceLines = linesFor(course.targetAudienceText);
  if (audienceLines.length > 0) {
    chunks.push("");
    chunks.push("## 適合對象");
    chunks.push("");
    for (const line of audienceLines) chunks.push(`- ${line}`);
  }

  const prerequisite = linesFor(course.prerequisiteText);
  if (prerequisite.length > 0) {
    chunks.push("");
    chunks.push("## 學習前基本能力");
    chunks.push("");
    for (const line of prerequisite) chunks.push(`- ${line}`);
  }

  const prepare = linesFor(course.preparationText);
  if (prepare.length > 0) {
    chunks.push("");
    chunks.push("## 學習前準備");
    chunks.push("");
    for (const line of prepare) chunks.push(`- ${line}`);
  }

  if (course.announcements.length > 0) {
    chunks.push("");
    chunks.push("## 課程公告");
    chunks.push("");
    for (const a of course.announcements) {
      chunks.push(`### ${a.title}`);
      if (a.body?.trim()) {
        chunks.push("");
        chunks.push(a.body.trim());
      }
      chunks.push("");
    }
  }

  if (course.sections.length > 0) {
    chunks.push("## 課程大綱");
    chunks.push("");
    for (const s of course.sections) {
      chunks.push(`### ${s.title}`);
      chunks.push("");
      if (s.lessons.length === 0) {
        chunks.push("- （尚無課堂）");
      } else {
        for (const l of s.lessons) {
          const dur =
            l.duration == null
              ? ""
              : `（${Math.floor(l.duration / 60)}:${String(l.duration % 60).padStart(2, "0")}）`;
          chunks.push(`- ${l.title}${dur}`);
        }
      }
      chunks.push("");
    }
  }

  chunks.push("---");
  chunks.push(`匯出時間：${new Date().toLocaleString("zh-TW")}`);
  return chunks.join("\n");
}
