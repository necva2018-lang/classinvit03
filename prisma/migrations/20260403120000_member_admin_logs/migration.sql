-- AlterTable
ALTER TABLE "User"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateEnum
CREATE TYPE "AuthLoginStatus" AS ENUM ('SUCCESS', 'FAIL');

-- CreateEnum
CREATE TYPE "AuthLoginFailureCode" AS ENUM (
  'INVALID_INPUT',
  'USER_NOT_FOUND',
  'PASSWORD_NOT_SET',
  'INVALID_PASSWORD',
  'USER_DISABLED'
);

-- CreateTable
CREATE TABLE "AuthLoginLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "email_input" TEXT,
  "status" "AuthLoginStatus" NOT NULL,
  "failure_code" "AuthLoginFailureCode",
  "ip_hash" TEXT,
  "user_agent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthLoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseViewLog" (
  "id" TEXT NOT NULL,
  "course_id" TEXT NOT NULL,
  "user_id" TEXT,
  "visitor_id" TEXT,
  "ip_hash" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CourseViewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthLoginLog_createdAt_idx" ON "AuthLoginLog"("createdAt");
CREATE INDEX "AuthLoginLog_userId_createdAt_idx" ON "AuthLoginLog"("userId", "createdAt");
CREATE INDEX "AuthLoginLog_status_createdAt_idx" ON "AuthLoginLog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CourseViewLog_created_at_idx" ON "CourseViewLog"("created_at");
CREATE INDEX "CourseViewLog_course_id_created_at_idx" ON "CourseViewLog"("course_id", "created_at");
CREATE INDEX "CourseViewLog_user_id_created_at_idx" ON "CourseViewLog"("user_id", "created_at");
CREATE INDEX "CourseViewLog_visitor_id_created_at_idx" ON "CourseViewLog"("visitor_id", "created_at");

-- AddForeignKey
ALTER TABLE "AuthLoginLog"
ADD CONSTRAINT "AuthLoginLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseViewLog"
ADD CONSTRAINT "CourseViewLog_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "Course"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseViewLog"
ADD CONSTRAINT "CourseViewLog_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
