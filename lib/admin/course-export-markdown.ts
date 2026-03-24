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
  chunks.push(
    `| CTA 按鈕一 | ${mdEscape((course.ctaCartText ?? "加入購物車").trim() || "加入購物車")} -> ${mdEscape((course.ctaCartUrl ?? "/cart").trim() || "/cart")} |`,
  );
  chunks.push(
    `| CTA 按鈕二 | ${mdEscape((course.ctaBuyText ?? "立即購買").trim() || "立即購買")} -> ${mdEscape((course.ctaBuyUrl ?? "/checkout").trim() || "/checkout")} |`,
  );

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
