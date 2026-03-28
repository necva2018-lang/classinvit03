-- 前台課程頁側欄「課程資訊」四則文案（後台可編；空白則前台不顯示該列）
ALTER TABLE "Course" ADD COLUMN "course_info_duration_text" TEXT;
ALTER TABLE "Course" ADD COLUMN "course_info_structure_text" TEXT;
ALTER TABLE "Course" ADD COLUMN "course_info_resources_text" TEXT;
ALTER TABLE "Course" ADD COLUMN "course_info_certificate_text" TEXT;
