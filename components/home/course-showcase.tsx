import { featuredCourses } from "@/lib/featured-courses";
import { Clock, Star, User } from "lucide-react";

export function CourseShowcase() {
  return (
    <section
      id="courses"
      className="scroll-mt-20 bg-zinc-50 py-14 sm:scroll-mt-24 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-necva-primary">
              精選課程
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              實務案例導向，上完即可應用於工作場景
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-necva-accent hover:underline"
          >
            查看全部課程
          </button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCourses.map((c) => (
            <article
              key={c.title}
              className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`relative h-36 bg-gradient-to-br ${c.tint} flex items-end justify-between p-4`}
              >
                <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-necva-primary shadow-sm">
                  {c.tag}
                </span>
                <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs text-amber-700 shadow-sm">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  4.8
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-zinc-900 group-hover:text-necva-primary">
                  {c.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3.5" aria-hidden />
                    {c.instructor}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden />
                    {c.hours}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">難度：{c.level}</p>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="text-sm font-bold text-necva-accent">
                    立即試聽
                  </span>
                  <span className="text-xs text-zinc-400">詳情 →</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
