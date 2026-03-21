import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

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

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">尚無分類，無法編輯。</p>
    );
  }

  const boundUpdate = updateCourse.bind(null, course.id);
  const categoryOptions = toCategoryFormOptions(categories);
  const courseInitial = toCourseFormInitialValues(course);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/courses" className="gap-2">
            <ArrowLeft className="size-4" aria-hidden />
            返回列表
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">編輯課程</h1>
      </div>
      <CourseForm
        categories={categoryOptions}
        course={courseInitial}
        action={boundUpdate}
        submitLabel="儲存變更"
      />
    </div>
  );
}
