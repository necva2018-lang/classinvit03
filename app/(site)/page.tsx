import { CategoryPills } from "@/components/home/category-pills";
import { CtaBanner } from "@/components/home/cta-banner";
import { HeroSwiper } from "@/components/home/hero-swiper";
import { PopularCoursesSection } from "@/components/home/popular-courses-section";
import { WhySection } from "@/components/home/why-section";
import {
  toNavCategoryLinks,
  type NavCategoryLink,
} from "@/lib/category-nav-links";
import { isDatabaseConfigured } from "@/lib/env";
import { getActiveBannersForHome } from "@/lib/site-queries/banners";
import { buildHomeMetadata } from "@/lib/site-queries/home-metadata";
import { getNavCategories } from "@/lib/site-queries/categories";
import type { HeroBannerPublic } from "@/lib/types/hero-banner";
import type { Metadata } from "next";

/** 與 layout 一致；首頁可單獨調整時改此處即可 */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildHomeMetadata();
}

export default async function Home() {
  let dbBanners: HeroBannerPublic[] = [];
  let categoryLinks: NavCategoryLink[] = [];
  if (isDatabaseConfigured()) {
    try {
      const rows = await getActiveBannersForHome();
      dbBanners = rows.map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        imageUrl: r.imageUrl,
        linkUrl: r.linkUrl,
        linkLabel: r.linkLabel,
      }));
    } catch {
      dbBanners = [];
    }
    try {
      const cats = await getNavCategories();
      categoryLinks = toNavCategoryLinks(cats);
    } catch {
      categoryLinks = [];
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <HeroSwiper dbBanners={dbBanners} />
      <CategoryPills items={categoryLinks} />
      <PopularCoursesSection />
      <WhySection />
      <CtaBanner />
    </div>
  );
}
