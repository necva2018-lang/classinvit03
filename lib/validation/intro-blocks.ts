import { z } from "zod";
import { isYoutubeUrl } from "@/lib/media/youtube";

const mediaLibraryPathUrl = /^\/api\/media\/[a-zA-Z0-9_-]+$/;

const httpUrl = z
  .string()
  .trim()
  .min(1, "請填寫網址")
  .refine(
    (s) => /^https?:\/\/.+/i.test(s),
    "需為 http 或 https 開頭的網址",
  );

const imageUrlForIntro = z
  .string()
  .trim()
  .min(1, "請填寫網址")
  .refine(
    (s) => /^https?:\/\/.+/i.test(s) || mediaLibraryPathUrl.test(s),
    "圖片網址需為 http(s) 或 /api/media/... 素材庫連結",
  );

export const introTextBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("text"),
  body: z.string(),
});

export const introImageBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("image"),
  url: imageUrlForIntro,
  caption: z.string().nullable().optional(),
});

export const introVideoBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("video"),
  url: httpUrl.refine((s) => isYoutubeUrl(s), "影片僅接受 YouTube 連結"),
  caption: z.string().nullable().optional(),
});

export const introBlockSchema = z.discriminatedUnion("type", [
  introTextBlockSchema,
  introImageBlockSchema,
  introVideoBlockSchema,
]);

export type IntroBlock = z.infer<typeof introBlockSchema>;

export const introBlocksArraySchema = z.array(introBlockSchema).max(80);

/** 自 DB Json 欄位還原；失敗回傳 [] */
export function parseIntroBlocksFromJson(raw: unknown): IntroBlock[] {
  const r = introBlocksArraySchema.safeParse(raw);
  return r.success ? r.data : [];
}
