-- AlterTable
ALTER TABLE "Course" ADD COLUMN "course_prerequisite_text" TEXT,
ADD COLUMN "course_preparation_text" TEXT;

-- CreateTable
CREATE TABLE "CourseAnnouncement" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "announcement_sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseAnnouncement_courseId_idx" ON "CourseAnnouncement"("courseId");

-- AddForeignKey
ALTER TABLE "CourseAnnouncement" ADD CONSTRAINT "CourseAnnouncement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
