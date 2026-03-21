import { CourseListClient } from "@/components/courses/course-list-client";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "課程列表",
  description:
    "依主題與價格瀏覽 NECVA 線上課程：人工智慧、網頁前端、數位行銷、設計與數據分析等。",
};

export default function CoursesPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-sm text-zinc-500" aria-label="麵包屑">
            <Link href="/" className="hover:text-necva-primary">
              首頁
            </Link>
            <span className="mx-2 text-zinc-300">/</span>
            <span className="font-medium text-zinc-800">全部課程</span>
          </nav>
          <h1 className="mt-3 text-2xl font-bold text-necva-primary sm:text-3xl">
            探索課程
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            課程資料由伺服器連線 PostgreSQL 載入；左側可篩選分類與價格，右側可排序。
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <CourseListClient />
      </div>
    </div>
  );
}
