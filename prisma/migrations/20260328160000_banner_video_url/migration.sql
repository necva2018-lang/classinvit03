-- 首頁輪播：可選背景影片；圖片改為可空（作純圖或影片 poster）
ALTER TABLE "Banner" ADD COLUMN "banner_video_url" TEXT;
ALTER TABLE "Banner" ALTER COLUMN "imageUrl" DROP NOT NULL;
