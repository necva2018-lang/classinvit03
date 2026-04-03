function hostLikeYoutube(host: string): boolean {
  const h = host.toLowerCase();
  return h === "youtube.com" || h === "www.youtube.com" || h === "youtu.be";
}

function videoIdFromUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") {
    const id = url.pathname.replace(/^\/+/, "").split("/")[0];
    return id || null;
  }
  if (host === "youtube.com" || host === "www.youtube.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id?.trim() || null;
    }
    if (url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.split("/")[2];
      return id?.trim() || null;
    }
    if (url.pathname.startsWith("/embed/")) {
      const id = url.pathname.split("/")[2];
      return id?.trim() || null;
    }
  }
  return null;
}

export function normalizeYoutubeUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return null;
  }
  if (!/^https?:$/i.test(u.protocol)) return null;
  if (!hostLikeYoutube(u.hostname)) return null;
  const id = videoIdFromUrl(u);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

export function isYoutubeUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  return normalizeYoutubeUrl(raw) != null;
}
