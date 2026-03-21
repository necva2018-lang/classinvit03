-- TibaMe 取向：使用者角色、課程章節、訂單金流欄位、課程綁定講師帳號

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- AlterTable
ALTER TABLE "courses" ADD COLUMN "instructor_user_id" UUID;

-- CreateIndex
CREATE INDEX "courses_category_id_idx" ON "courses"("category_id");
CREATE INDEX "courses_instructor_user_id_idx" ON "courses"("instructor_user_id");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_user_id_fkey" FOREIGN KEY ("instructor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "chapters" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "content" TEXT,
    "video_url" TEXT,
    "duration_seconds" INTEGER,
    "is_preview_free" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chapters_course_id_sort_order_idx" ON "chapters"("course_id", "sort_order");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "order_number" TEXT;
ALTER TABLE "orders" ADD COLUMN "paid_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "payment_provider" TEXT;
ALTER TABLE "orders" ADD COLUMN "external_payment_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX "orders_status_idx" ON "orders"("status");
