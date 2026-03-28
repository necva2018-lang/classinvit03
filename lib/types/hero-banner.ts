/** 首頁 Hero 輪播（前台用，可序列化） */
export type HeroBannerPublic = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  /** https：影片直連（mp4 等）或 YouTube／Vimeo 頁面網址；有值時以影片為背景（imageUrl 可作 poster） */
  videoUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
};
