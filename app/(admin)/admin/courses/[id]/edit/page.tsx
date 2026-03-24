import { AdminCourseFrontendNotice } from "@/components/admin/admin-course-frontend-notice";
import { CourseCurriculumEditor } from "@/components/admin/course-curriculum-editor";
import { Button } from "@/components/ui/button";
import {
  getAdminCourseWithCurriculum,
  getCategoriesForSelect,
} from "@/lib/admin/courses-server";
import { toCategoryFormOptions } from "@/lib/admin/course-form-serialize";
import { isDatabaseConfigured } from "@/lib/env";
import type { Metadata } from "next";
import { ArrowLeft, LayoutList } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `課程編輯｜${id.slice(0, 8)}…` };
}

export default async function CourseCurriculumEditPage({ params }: PageProps) {
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">請先設定 DATABASE_URL。</p>
    );
  }

  const [course, categories] = await Promise.all([
    getAdminCourseWithCurriculum(id),
    getCategoriesForSelect(),
  ]);

  if (!course) {
    notFound();
  }

  const initial = {
    version: course.updatedAt.toISOString(),
    courseId: course.id,
    course: {
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      prerequisiteText: course.prerequisiteText,
      preparationText: course.preparationText,
      imageUrl: course.imageUrl,
      categoryIds: course.categories.map((c) => c.id),
      price: course.price,
      discountedPrice: course.discountedPrice,
      isPublished: course.isPublished,
    },
    announcements: course.announcements.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      createdAt: a.createdAt.toISOString(),
    })),
    sections: course.sections.map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        videoUrl: l.videoUrl,
        duration: l.duration,
        order: l.order,
      })),
    })),
    categories: toCategoryFormOptions(categories),
  };

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
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/courses/${id}`} className="gap-2">
              <LayoutList className="size-4" aria-hidden />
              基本資料（前台文案）
            </Link>
          </Button>
        </div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          課程與單元（大綱 · 公告）
        </h1>
      </div>
      <AdminCourseFrontendNotice context="curriculum" />
      <p className="text-sm text-muted-foreground">
        左側選單：<strong className="text-foreground">課程資訊</strong>（與基本資料表單相同主檔欄位）、
        <strong className="text-foreground"> 課程公告</strong>（對外「公告」分頁）、章節／課堂（對外「大綱」）。請分區儲存。
      </p>
      <CourseCurriculumEditor initial={initial} />
    </div>
  );
}
