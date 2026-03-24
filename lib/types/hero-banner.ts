/** 首頁 Hero 輪播（前台用，可序列化） */
export type HeroBannerPublic = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
};
