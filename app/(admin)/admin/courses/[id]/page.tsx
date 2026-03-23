import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { notFound } from "next/navigation";

import { AdminCourseFrontendNotice } from "@/components/admin/admin-course-frontend-notice";
import { CourseForm } from "@/components/admin/course-form";
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

import { updateCourse } from "../actions";

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
      <CourseForm
        categories={categoryOptions}
        course={courseInitial}
        action={boundUpdate}
        submitLabel="儲存變更"
      />
    </div>
  );
}
