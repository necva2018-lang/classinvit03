/** 後台 Key-Value 設定：欄位定義與分組（對應 SiteSetting.key） */

export type SiteSettingField = {
  key: string;
  label: string;
  description: string;
  multiline: boolean;
};

export const SITE_SETTING_GROUPS = {
  basic: [
    {
      key: "site_name",
      label: "網站名稱",
      description: "顯示於頁首、後台與品牌相關位置。",
      multiline: false,
    },
    {
      key: "site_tagline",
      label: "網站標語",
      description: "簡短一句話說明網站定位（選填）。",
      multiline: false,
    },
  ],
  seo: [
    {
      key: "default_meta_title",
      label: "預設網頁標題",
      description: "未單獨設定 title 的頁面可沿用此 SEO 標題。",
      multiline: false,
    },
    {
      key: "default_meta_description",
      label: "預設 meta 描述",
      description: "搜尋摘要建議約 150 字內。",
      multiline: true,
    },
    {
      key: "og_image_url",
      label: "預設 OG 分享圖 URL",
      description: "社群連結預覽用圖片，建議 1200×630。",
      multiline: false,
    },
    {
      key: "canonical_base_url",
      label: "網站基準網址",
      description: "含 https:// 的正式網域，供 canonical 使用。",
      multiline: false,
    },
  ],
  contact: [
    {
      key: "support_email",
      label: "客服信箱",
      description: "聯絡表單、頁尾或客服用途。",
      multiline: false,
    },
    {
      key: "footer_copy",
      label: "頁尾版權／聲明",
      description: "顯示於全站頁尾的文字（可含換行）。",
      multiline: true,
    },
    {
      key: "contact_phone",
      label: "聯絡電話",
      description: "顯示於頁尾聯絡區（選填）。",
      multiline: false,
    },
    {
      key: "social_facebook_url",
      label: "Facebook 網址",
      description: "完整 https 連結；留空則頁尾不顯示該圖示。",
      multiline: false,
    },
    {
      key: "social_instagram_url",
      label: "Instagram 網址",
      description: "完整 https 連結；留空則隱藏。",
      multiline: false,
    },
    {
      key: "social_youtube_url",
      label: "YouTube 網址",
      description: "完整 https 連結；留空則隱藏。",
      multiline: false,
    },
  ],
} as const satisfies Record<string, readonly SiteSettingField[]>;

export function getAllSiteSettingKeys(): string[] {
  const keys: string[] = [];
  for (const group of Object.values(SITE_SETTING_GROUPS)) {
    for (const f of group) keys.push(f.key);
  }
  return keys;
}
