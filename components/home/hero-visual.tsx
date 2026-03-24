import Image from "next/image";

/** Unsplash 來源圖：請求寬度限制在 640px、quality 75，由 Next 再輸出適當尺寸。 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=75";

/**
 * Hero 主視覺：固定比例避免 CLS，行動與桌機共用同一張優化圖。
 */
export function HeroVisual() {
  return (
    <figure className="mx-auto w-full max-w-lg lg:max-w-xl">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-white/25 shadow-2xl shadow-black/25 ring-1 ring-white/10">
        <Image
          src={HERO_IMAGE}
          alt="學員與講師在討論專案與筆記，象徵線上實戰學習與同儕共學"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 36rem"
          quality={75}
          priority
          className="object-cover object-center"
          fetchPriority="high"
        />
      </div>
      <figcaption className="sr-only">
        展示團隊協作學習情境，呼應 NECVA 實戰導向課程
      </figcaption>
    </figure>
  );
}
