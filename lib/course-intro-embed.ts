/** 由影片頁面網址推導可嵌入的 URL（YouTube／Vimeo）；無則回傳 null（改以 <video> 或連結處理） */
export function embedUrlFromVideoPage(url: string): string | null {
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname.toLowerCase();

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      const m = u.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/);
      if (m?.[2]) return `https://www.youtube-nocookie.com/embed/${m[2]}`;
    }

    if (host.includes("vimeo.com")) {
      const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
      if (m?.[1]) return `https://player.vimeo.com/video/${m[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function isProbablyDirectVideoFile(url: string): boolean {
  const u = url.trim().toLowerCase().split("?")[0];
  return /\.(mp4|webm|ogg)(\s*)$/i.test(u);
}
