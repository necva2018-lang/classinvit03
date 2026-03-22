import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_BYTES = 5 * 1024 * 1024;

export type SaveUploadResult =
  | { ok: true; publicPath: string }
  | { ok: false; error: string };

/**
 * 將上傳的圖片寫入 public/uploads/banners，回傳可給前端的公開路徑（如 /uploads/banners/xxx.jpg）。
 * 可供其他上傳 API 或 Server Action 重複使用。
 */
export async function saveBannerUpload(
  file: File,
  projectRoot: string,
): Promise<SaveUploadResult> {
  const type = file.type || "application/octet-stream";
  if (!ALLOWED.has(type)) {
    return { ok: false, error: "僅支援 JPEG、PNG、WebP、GIF" };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "檔案不可超過 5MB" };
  }

  const dir = path.join(projectRoot, "public", "uploads", "banners");
  await mkdir(dir, { recursive: true });

  const ext = EXT[type] ?? ".bin";
  const name = `${randomUUID()}${ext}`;
  const abs = path.join(dir, name);

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return { ok: false, error: "檔案不可超過 5MB" };
  }

  await writeFile(abs, buf);

  return { ok: true, publicPath: `/uploads/banners/${name}` };
}
