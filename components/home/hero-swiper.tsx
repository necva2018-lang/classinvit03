"use client";

import "./hero-swiper.css";

import {
  isBannerVideoUrl,
  resolveBannerBackgroundMedia,
} from "@/lib/banner-video-embed";
import type { HeroBannerPublic } from "@/lib/types/hero-banner";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

type GradientSlide = {
  kind: "gradient";
  id: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  gradient: string;
};

type DbSlide = { kind: "db" } & HeroBannerPublic;

type Slide = GradientSlide | DbSlide;

const FALLBACK_SLIDES: GradientSlide[] = [
  {
    kind: "gradient",
    id: "s1",
    eyebrow: "NECVA 線上實戰學習",
    title: "把職場要用的能力，",
    titleAccent: "線上學會、立刻用上",
    description:
      "資訊科技、設計、行銷與數據等主題，搭配業師案例與演練；從入門到進階，累積可展示的成果。",
    primary: { href: "/courses", label: "免費探索課程" },
    secondary: { href: "#why-necva", label: "了解學習方式" },
    gradient: "from-necva-primary via-[#004494] to-[#003d7a]",
  },
  {
    kind: "gradient",
    id: "s2",
    eyebrow: "AI · 資料 · 雲端",
    title: "跟上生成式 AI 與資料思維，",
    titleAccent: "讓工作流全面升級",
    description:
      "從提示工程到分析儀表板，用實作專題把工具變成你的日常戰力，與產業需求同步。",
    primary: { href: "/courses", label: "瀏覽相關課程" },
    secondary: { href: "/search?q=AI", label: "搜尋 AI 課程" },
    gradient: "from-[#0a3d6b] via-necva-primary to-[#0056b3]",
  },
  {
    kind: "gradient",
    id: "s3",
    eyebrow: "企業與團隊",
    title: "為團隊量身打造的學習路徑，",
    titleAccent: "提升組織即戰力",
    description:
      "內訓、學習地圖與完課追蹤一次到位，協助企業快速補齊數位與軟實力缺口。",
    primary: { href: "#site-footer", label: "聯絡企業方案" },
    secondary: { href: "#why-necva", label: "查看學習特色" },
    gradient: "from-[#004494] via-[#003566] to-necva-primary",
  },
  {
    kind: "gradient",
    id: "s4",
    eyebrow: "限時學習加值",
    title: "精選課程限時優惠，",
    titleAccent: "現在入手最划算",
    description:
      "熱門領域課程下殺特價中，隨時開課、無限回放，用更低成本完成職涯佈局。",
    primary: { href: "/courses", label: "查看熱門課程" },
    secondary: { href: "/courses", label: "全部課程" },
    gradient: "from-necva-primary via-[#0056b3] to-[#1a5f9e]",
  },
];

function toDbSlides(banners: HeroBannerPublic[]): DbSlide[] {
  return banners.map((b) => ({ kind: "db" as const, ...b }));
}

function BannerBackgroundMedia({
  imageUrl,
  videoUrl,
  imageAlt,
  reduceMotion,
}: {
  imageUrl: string | null;
  videoUrl: string | null;
  imageAlt: string;
  reduceMotion: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const showVideo = isBannerVideoUrl(videoUrl);
  const src = videoUrl?.trim() ?? "";
  const poster = imageUrl?.trim() || undefined;
  const imgSrc = imageUrl?.trim() ?? "";

  const resolved = useMemo(
    () =>
      showVideo && src
        ? resolveBannerBackgroundMedia(src, reduceMotion)
        : null,
    [showVideo, src, reduceMotion],
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el || resolved?.mode !== "video") return;
    if (reduceMotion) {
      el.pause();
      el.autoplay = false;
      return;
    }
    el.muted = true;
    void el.play().catch(() => {});
  }, [resolved, reduceMotion, src]);

  if (showVideo && resolved?.mode === "iframe") {
    return (
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <iframe
          key={resolved.src}
          title=""
          src={resolved.src}
          className="pointer-events-none absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
          style={{
            width: "177.78vh",
            height: "100%",
            minWidth: "100%",
            minHeight: "56.25vw",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (showVideo && resolved?.mode === "video") {
    return (
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        src={resolved.src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay={!reduceMotion}
        preload="metadata"
        aria-hidden
      />
    );
  }

  if (imgSrc) {
    return (
      <Image
        src={imgSrc}
        alt={imageAlt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        unoptimized
      />
    );
  }

  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950"
      aria-hidden
    />
  );
}

type Props = {
  /** 資料庫中 isActive 的 Banner；有資料時優先使用，否則顯示內建漸層輪播 */
  dbBanners?: HeroBannerPublic[];
};

export function HeroSwiper({ dbBanners = [] }: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);

  const slides: Slide[] =
    dbBanners.length > 0 ? toDbSlides(dbBanners) : FALLBACK_SLIDES;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section
      className="relative text-white"
      aria-roledescription="carousel"
      aria-label="首頁重點輪播"
    >
      <Swiper
        className="hero-swiper"
        modules={[A11y, Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length > 1}
        speed={reduceMotion ? 0 : 600}
        autoplay={
          reduceMotion
            ? false
            : {
                delay: 6500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        pagination={{ clickable: true }}
        a11y={{
          enabled: true,
          prevSlideMessage: "上一張",
          nextSlideMessage: "下一張",
          paginationBulletMessage: "前往第 {{index}} 張",
        }}
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            {s.kind === "gradient" ? (
              <div
                className={`relative flex min-h-[min(78dvh,36rem)] items-center bg-gradient-to-br sm:min-h-[min(82dvh,40rem)] lg:min-h-[min(85dvh,44rem)] ${s.gradient}`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.2]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 15% 85%, #ff8a00 0%, transparent 45%), radial-gradient(circle at 88% 12%, #ffffff 0%, transparent 35%)",
                  }}
                  aria-hidden
                />
                <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-sm sm:normal-case sm:tracking-normal">
                    {s.eyebrow}
                  </p>
                  <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-snug tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-tight">
                    {s.title}
                    <span className="text-necva-accent">{s.titleAccent}</span>
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/88 sm:text-base">
                    {s.description}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Link
                      href={s.primary.href}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-necva-accent px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-necva-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {s.primary.label}
                      <ArrowRight className="size-4 shrink-0" aria-hidden />
                    </Link>
                    <Link
                      href={s.secondary.href}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 py-3 text-center text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Sparkles className="size-4 shrink-0 text-necva-accent" aria-hidden />
                      {s.secondary.label}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex min-h-[min(78dvh,36rem)] items-center sm:min-h-[min(82dvh,40rem)] lg:min-h-[min(85dvh,44rem)]">
                <BannerBackgroundMedia
                  imageUrl={s.imageUrl}
                  videoUrl={s.videoUrl}
                  imageAlt={s.title}
                  reduceMotion={reduceMotion}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25"
                  aria-hidden
                />
                <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                  <h2 className="max-w-3xl text-2xl font-bold leading-snug tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-tight">
                    {s.title}
                  </h2>
                  {s.subtitle ? (
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                      {s.subtitle}
                    </p>
                  ) : null}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Link
                      href={s.linkUrl ?? "/courses"}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-necva-accent px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-necva-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {s.linkLabel?.trim() || "了解更多"}
                      <ArrowRight className="size-4 shrink-0" aria-hidden />
                    </Link>
                    <Link
                      href="/courses"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 py-3 text-center text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Sparkles className="size-4 shrink-0 text-necva-accent" aria-hidden />
                      探索全部課程
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
