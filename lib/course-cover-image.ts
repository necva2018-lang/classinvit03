import { COURSE_COVER_PLACEHOLDER } from "@/lib/course-cover-placeholder";
import { embedUrlFromVideoPage } from "@/lib/course-intro-embed";

function youtubeVideoIdFromPageUrl(url: string): string | null {
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname.toLowerCase();
    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/);
      if (m?.[2]) return m[2];
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * 課程 imageUrl 若貼 YouTube／Vimeo 等影片頁，next/image 無法直接使用；
 * YouTube 改為官方縮圖 CDN，其餘嵌入網址改為站內預設封面圖。
 */
export function resolveCourseCoverImageUrl(raw: string | null | undefined): string {
  const t = raw?.trim();
  if (!t) return COURSE_COVER_PLACEHOLDER;

  if (!embedUrlFromVideoPage(t)) {
    return t;
  }

  const ytId = youtubeVideoIdFromPageUrl(t);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  return COURSE_COVER_PLACEHOLDER;
}
