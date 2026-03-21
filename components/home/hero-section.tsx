import { HeroCourseCarousel } from "@/components/home/hero-course-carousel";
import { HeroVisual } from "@/components/home/hero-visual";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-necva-primary via-[#004494] to-necva-primary text-white"
      aria-labelledby="hero-headline"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 78%, #ff8a00 0%, transparent 42%), radial-gradient(circle at 82% 18%, #ffffff 0%, transparent 32%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12 xl:gap-16">
          {/* 文案 + CTA：行動版全寬優先，避免資訊過載 */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-sm sm:normal-case sm:tracking-normal">
              <span className="sm:hidden">NECVA · 線上實戰學習</span>
              <span className="hidden sm:inline">
                NECVA 線上實戰學習平台
              </span>
            </p>
            <h1
              id="hero-headline"
              className="mt-3 text-[1.65rem] font-bold leading-snug tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-tight"
            >
              把職場要用的能力，
              <span className="text-necva-accent"> 線上學會、立刻用上</span>
            </h1>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-white/88 sm:text-base">
              資訊科技、設計、行銷與數據等主題，搭配業師案例與演練；從入門到進階，用清楚的學習節奏幫你累積可展示的成果。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="#courses"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-necva-accent px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-necva-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                免費探索課程
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
              <Link
                href="#why-necva"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 py-3 text-center text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Sparkles className="size-4 shrink-0 text-necva-accent" aria-hidden />
                了解學習方式
              </Link>
            </div>
          </div>

          {/* 視覺 + 輪播：桌機右欄；行動版大圖在上、輪播在下，層次單一 */}
          <div className="flex flex-col gap-6 sm:gap-8 lg:col-span-7">
            <HeroVisual />
            <div
              role="group"
              className="w-full max-w-lg justify-self-center lg:ml-auto lg:mr-0 lg:max-w-md xl:max-w-lg"
              aria-label="精選課程預覽"
            >
              <HeroCourseCarousel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
