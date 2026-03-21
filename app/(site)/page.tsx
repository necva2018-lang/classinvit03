import { CategoryPills } from "@/components/home/category-pills";
import { CtaBanner } from "@/components/home/cta-banner";
import { HeroSwiper } from "@/components/home/hero-swiper";
import { PopularCoursesSection } from "@/components/home/popular-courses-section";
import { WhySection } from "@/components/home/why-section";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <HeroSwiper />
      <CategoryPills />
      <PopularCoursesSection />
      <WhySection />
      <CtaBanner />
    </div>
  );
}
