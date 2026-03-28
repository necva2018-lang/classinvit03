/** 後台 Key-Value 設定：欄位定義與分組（對應 SiteSetting.key） */

export type SiteSettingField = {
  key: string;
  label: string;
  description: string;
  multiline: boolean;
  /** logo：表單顯示即時圖片預覽 */
  variant?: "default" | "logo";
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
  brand: [
    {
      key: "site_logo_url",
      label: "頁首 LOGO 圖片 URL",
      description:
        "請貼上 https 圖片連結（建議透明底 PNG／SVG）。留空時頁首顯示文字占位。",
      multiline: false,
      variant: "logo",
    },
    {
      key: "site_logo_alt",
      label: "LOGO 替代文字",
      description:
        "無障礙與圖片載入失敗時使用；留空則沿用「網站名稱」。",
      multiline: false,
      variant: "default",
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
      label: "頁尾最底列 · 版權文字",
      description:
        "顯示於黑色頁尾區最底列左側（© 版權列），可含換行。",
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
    {
      key: "social_twitter_url",
      label: "X（Twitter）網址",
      description: "完整 https 連結；留空則頁尾不顯示。",
      multiline: false,
    },
    {
      key: "social_linkedin_url",
      label: "LinkedIn 網址",
      description: "完整 https 連結；留空則隱藏。",
      multiline: false,
    },
    {
      key: "social_blog_url",
      label: "部落格／RSS 網址",
      description: "完整 https 連結；頁尾以 RSS 圖示顯示。",
      multiline: false,
    },
  ],
  footer: [
    {
      key: "footer_press_1_logo_url",
      label: "上方推薦列 · 欄 1 · LOGO URL",
      description:
        "白色區第一欄媒體／合作方 LOGO（https）。與引言擇一或並用即可。",
      multiline: false,
      variant: "logo",
    },
    {
      key: "footer_press_1_quote",
      label: "上方推薦列 · 欄 1 · 引言",
      description: "該欄下方灰色小字引言（選填）。",
      multiline: true,
    },
    {
      key: "footer_press_2_logo_url",
      label: "上方推薦列 · 欄 2 · LOGO URL",
      description: "第二欄 LOGO（https）。",
      multiline: false,
      variant: "logo",
    },
    {
      key: "footer_press_2_quote",
      label: "上方推薦列 · 欄 2 · 引言",
      description: "第二欄引言（選填）。",
      multiline: true,
    },
    {
      key: "footer_press_3_logo_url",
      label: "上方推薦列 · 欄 3 · LOGO URL",
      description: "第三欄 LOGO（https）。",
      multiline: false,
      variant: "logo",
    },
    {
      key: "footer_press_3_quote",
      label: "上方推薦列 · 欄 3 · 引言",
      description: "第三欄引言（選填）。",
      multiline: true,
    },
    {
      key: "footer_nav_col1_title",
      label: "黑色主區 · 第 1 欄標題",
      description: "留空則預設為「課程與學習」。",
      multiline: false,
    },
    {
      key: "footer_nav_col1_links",
      label: "第 1 欄連結（每行一筆）",
      description: '格式：顯示文字|網址。例：線上課程|/courses 或 官網|https://example.com',
      multiline: true,
    },
    {
      key: "footer_nav_col2_title",
      label: "第 2 欄標題",
      description: "留空則預設為「企業與合作」。",
      multiline: false,
    },
    {
      key: "footer_nav_col2_links",
      label: "第 2 欄連結（每行一筆）",
      description: "同上，顯示文字|網址。",
      multiline: true,
    },
    {
      key: "footer_nav_col3_title",
      label: "第 3 欄標題",
      description: "留空則預設為「支援」。",
      multiline: false,
    },
    {
      key: "footer_nav_col3_links",
      label: "第 3 欄連結（每行一筆）",
      description: "同上，顯示文字|網址。",
      multiline: true,
    },
    {
      key: "footer_nav_col4_title",
      label: "第 4 欄標題（社群）",
      description: "留空則預設為「與我們連結」。圖示來自「聯絡資訊」分頁的社群網址。",
      multiline: false,
    },
    {
      key: "footer_legal_links",
      label: "最底列 · 法律／導覽連結（每行一筆）",
      description:
        "顯示於版權文字右側，以 · 分隔風格呈現。格式：顯示文字|網址。",
      multiline: true,
    },
    {
      key: "footer_show_language_switcher",
      label: "顯示語言選單（示意）",
      description:
        "填 1、on 或 yes 時，最底列右側顯示簡易語言下拉（僅版型示意，不含機器翻譯）。",
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
