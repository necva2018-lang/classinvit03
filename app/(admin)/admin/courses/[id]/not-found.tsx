import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminCourseNotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <h1 className="text-xl font-semibold text-foreground">找不到課程</h1>
      <p className="text-sm text-muted-foreground">
        此課程 ID 不存在或已被刪除。
      </p>
      <Button asChild>
        <Link href="/admin/courses">返回課程列表</Link>
      </Button>
    </div>
  );
}
