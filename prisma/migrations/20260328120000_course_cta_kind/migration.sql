-- CreateEnum
CREATE TYPE "CourseCtaKind" AS ENUM ('CART', 'SUBSIDY');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "course_cta_kind" "CourseCtaKind" NOT NULL DEFAULT 'CART';
