import { embedUrlFromVideoPage } from "@/lib/course-intro-embed";

export type BannerBackgroundResolved =
  | { mode: "iframe"; src: string }
  | { mode: "video"; src: string };

/**
 * 將後台填寫的影片網址轉成前台背景用：YouTube／Vimeo 頁面 → iframe；其餘 https 視為直連檔（原生 video）。
 * @param adminPreview 後台表單預覽：顯示控制列、不自動播放
 */
export function resolveBannerBackgroundMedia(
  videoUrl: string,
  reduceMotion: boolean,
  options?: { adminPreview?: boolean },
): BannerBackgroundResolved | null {
  const trimmed = videoUrl.trim();
  if (!/^https:\/\//i.test(trimmed)) return null;

  const embed = embedUrlFromVideoPage(trimmed);
  if (!embed) {
    return { mode: "video", src: trimmed };
  }

  const adminPreview = options?.adminPreview === true;
  const autoplay = adminPreview ? false : !reduceMotion;

  try {
    const u = new URL(embed);

    if (
      u.hostname.includes("youtube.com") ||
      u.hostname.includes("youtube-nocookie.com")
    ) {
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      const id = m?.[1];
      if (!id) return { mode: "video", src: trimmed };

      const base = `${u.origin}${u.pathname}`;
      const p = new URLSearchParams();
      p.set("rel", "0");
      p.set("modestbranding", "1");
      p.set("playsinline", "1");

      if (adminPreview) {
        p.set("controls", "1");
        p.set("autoplay", "0");
      } else {
        p.set("mute", "1");
        p.set("loop", "1");
        p.set("playlist", id);
        p.set("controls", "0");
        p.set("autoplay", autoplay ? "1" : "0");
      }

      return { mode: "iframe", src: `${base}?${p.toString()}` };
    }

    if (u.hostname.includes("vimeo.com")) {
      u.searchParams.set("muted", adminPreview ? "0" : "1");
      u.searchParams.set("loop", adminPreview ? "0" : "1");
      if (adminPreview) {
        u.searchParams.delete("background");
        u.searchParams.set("autoplay", "0");
      } else {
        u.searchParams.set("background", "1");
        u.searchParams.set("autoplay", autoplay ? "1" : "0");
      }
      return { mode: "iframe", src: u.toString() };
    }
  } catch {
    return { mode: "video", src: trimmed };
  }

  return { mode: "video", src: trimmed };
}

export function isBannerVideoUrl(url: string | null | undefined): boolean {
  const v = url?.trim();
  return Boolean(v && /^https:\/\//i.test(v));
}
