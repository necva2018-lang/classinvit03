-- 課程列表卡片：無講師／無評價時自訂文案（每門課）
ALTER TABLE "Course" ADD COLUMN "course_listing_no_instructor_line" TEXT;
ALTER TABLE "Course" ADD COLUMN "course_listing_no_reviews_line" TEXT;
