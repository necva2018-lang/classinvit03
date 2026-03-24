-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PAUSED');

-- AlterTable
ALTER TABLE "Course"
ADD COLUMN "course_status" "CourseStatus" NOT NULL DEFAULT 'DRAFT';
