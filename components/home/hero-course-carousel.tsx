"use client";

import { featuredCourses } from "@/lib/featured-courses";
import { ChevronLeft, ChevronRight, Clock, Star, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_MS = 5200;

export function HeroCourseCarousel() {
  const count = featuredCourses.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (paused || count <= 1 || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, count, reduceMotion]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div
      ref={rootRef}
      className="relative w-full max-w-full outline-none"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="精選課程輪播"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div className="rounded-2xl border border-white/25 bg-white/10 p-4 shadow-xl backdrop-blur-md sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-white/75">
            精選課程
          </p>
          <span className="text-xs text-white/60">
            {index + 1} / {count}
          </span>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-xl">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {featuredCourses.map((c, i) => (
              <article
                key={c.title}
                className="w-full shrink-0 px-0.5"
                aria-hidden={i !== index}
              >
                <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-lg">
                  <div
                    className={`relative flex h-28 items-end justify-between bg-gradient-to-br p-3 sm:h-32 sm:p-4 ${c.tint}`}
                  >
                    <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-necva-primary shadow-sm">
                      {c.tag}
                    </span>
                    <div className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs text-amber-700 shadow-sm">
                      <Star
                        className="size-3.5 fill-amber-400 text-amber-400"
                        aria-hidden
                      />
                      4.8
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
                      {c.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3.5 shrink-0" aria-hidden />
                        {c.instructor}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5 shrink-0" aria-hidden />
                        {c.hours}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-400">
                      難度：{c.level}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5">
                      <span className="text-sm font-bold text-necva-accent">
                        立即試聽
                      </span>
                      <span className="text-xs text-zinc-400">詳情 →</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="上一張課程"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <div
            className="flex flex-1 justify-center gap-1.5"
            role="tablist"
            aria-label="選擇課程"
          >
            {featuredCourses.map((c, i) => (
              <button
                key={c.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`第 ${i + 1} 張：${c.title}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-necva-accent"
                    : "w-2 bg-white/35 hover:bg-white/55"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="下一張課程"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
