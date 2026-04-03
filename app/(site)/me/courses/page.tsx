import { auth } from "@/auth";
import { resolveCourseCoverImageUrl } from "@/lib/course-cover-image";
import { getEnrollmentsForUser } from "@/lib/site-queries/my-enrollments";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "我的課程",
  description: "您已報名或開通的課程列表。",
};

export default async function MyCoursesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login?callbackUrl=/me/courses");
  }

  let rows: Awaited<ReturnType<typeof getEnrollmentsForUser>> = [];
  try {
    rows = await getEnrollmentsForUser(userId);
  } catch {
    rows = [];
  }

  return (
    <>
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="text-sm text-zinc-500" aria-label="麵包屑">
            <Link href="/" className="hover:text-necva-primary">
              首頁
            </Link>
            <span className="mx-2 text-zinc-300">/</span>
            <span className="font-medium text-zinc-800">我的課程</span>
          </nav>
          <h1 className="mt-3 text-2xl font-bold text-necva-primary sm:text-3xl">
            我的課程
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            報名或開通後的課程會顯示於此；若尚無紀錄，可先前往課程列表選課。
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-zinc-800">尚無課程紀錄</p>
            <p className="mt-2 text-sm text-zinc-500">
              完成報名或開通後，課程會出現在這裡。您也可以先到課程列表逛逛。
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex rounded-full bg-necva-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-necva-primary/90"
            >
              瀏覽課程
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => {
              const cover = resolveCourseCoverImageUrl(row.course.imageUrl);
              return (
                <li key={row.id}>
                  <Link
                    href={`/courses/${row.course.id}`}
                    className="group flex overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-necva-primary/30 hover:shadow-md"
                  >
                    <div className="relative h-24 w-28 shrink-0 bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element -- 動態圖床 */}
                      <img
                        src={cover}
                        alt=""
                        className="size-full object-cover object-center"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-necva-primary">
                        {row.course.title}
                      </p>
                      {!row.course.isPublished ? (
                        <span className="mt-1 text-xs text-amber-700">未上架</span>
                      ) : (
                        <span className="mt-1 text-xs text-zinc-400">
                          已於{" "}
                          {new Date(row.createdAt).toLocaleDateString("zh-TW")}
                          {" "}加入
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
