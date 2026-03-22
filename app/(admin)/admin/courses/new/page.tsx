import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CourseForm } from "@/components/admin/course-form";
import { Button } from "@/components/ui/button";
import { toCategoryFormOptions } from "@/lib/admin/course-form-serialize";
import { getCategoriesForSelect } from "@/lib/admin/courses-server";
import { isDatabaseConfigured } from "@/lib/env";

import { createCourse } from "../actions";

export default async function NewCoursePage() {
  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">請先設定 DATABASE_URL。</p>
    );
  }

  const categories = await getCategoriesForSelect();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/courses" className="gap-2">
            <ArrowLeft className="size-4" aria-hidden />
            返回列表
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">新增課程</h1>
      </div>
      <CourseForm
        categories={toCategoryFormOptions(categories)}
        action={createCourse}
        submitLabel="建立課程"
      />
    </div>
  );
}
