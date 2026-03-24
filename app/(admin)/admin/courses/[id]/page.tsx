import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { notFound } from "next/navigation";

import { AdminCourseFrontendNotice } from "@/components/admin/admin-course-frontend-notice";
import { CourseForm } from "@/components/admin/course-form";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";
import { Button } from "@/components/ui/button";
import {
  toCategoryFormOptions,
  toCourseFormInitialValues,
} from "@/lib/admin/course-form-serialize";
import {
  getAdminCourseById,
  getCategoriesForSelect,
} from "@/lib/admin/courses-server";
import { isDatabaseConfigured } from "@/lib/env";

import { deleteCourse, duplicateCourse, updateCourse } from "../actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">請先設定 DATABASE_URL。</p>
    );
  }

  const [course, categories] = await Promise.all([
    getAdminCourseById(id),
    getCategoriesForSelect(),
  ]);

  if (!course) {
    notFound();
  }

  const boundUpdate = updateCourse.bind(null, course.id);
  const boundDuplicate = duplicateCourse.bind(null, course.id);
  const boundDelete = deleteCourse.bind(null, course.id);
  const categoryOptions = toCategoryFormOptions(categories);
  const courseInitial = toCourseFormInitialValues(course);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/courses" className="gap-2">
              <ArrowLeft className="size-4" aria-hidden />
              返回列表
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/courses/${id}/edit`} className="gap-2">
              <Layers className="size-4" aria-hidden />
              課程與單元（大綱 · 公告）
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-foreground">編輯課程</h1>
      </div>
      <AdminCourseFrontendNotice context="form" />
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">狀態設定與操作</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          狀態請在下方表單「狀態」欄位調整並儲存。其餘操作可直接執行。
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" asChild>
            <Link href={`/api/admin/courses/${course.id}/export-md`}>
              匯出課程 MD
            </Link>
          </Button>
          <form action={boundDuplicate}>
            <Button type="submit" variant="outline" className="w-full">
              複製課程
            </Button>
          </form>
          <div />
          <DeleteCourseButton
            action={boundDelete}
            disabled={course.isPublished}
          />
        </div>
        {course.isPublished ? (
          <p className="mt-3 text-xs text-muted-foreground">
            已上架課程不可刪除，請先在下方取消「已上架」後儲存。
          </p>
        ) : null}
      </section>
      <CourseForm
        categories={categoryOptions}
        course={courseInitial}
        action={boundUpdate}
        submitLabel="儲存變更"
      />
    </div>
  );
}
