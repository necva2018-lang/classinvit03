import { Navbar } from "@/components/Navbar";
import { toNavCategoryLinks } from "@/lib/category-nav-links";
import { isDatabaseConfigured } from "@/lib/env";
import { getNavCategories } from "@/lib/site-queries/categories";
import { Suspense } from "react";

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-zinc-200/90 bg-white/95 shadow-none backdrop-blur-md sm:h-16" />
  );
}

/** 從 Category 表載入分類後交給 client Navbar（useSearchParams 仍需 Suspense） */
async function NavbarWithCategories() {
  let categories = toNavCategoryLinks([]);
  if (isDatabaseConfigured()) {
    try {
      const rows = await getNavCategories();
      categories = toNavCategoryLinks(rows);
    } catch {
      categories = [];
    }
  }
  return <Navbar categories={categories} />;
}

/** useSearchParams 需 Suspense 邊界（Next.js 要求） */
export function NavbarShell() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarWithCategories />
    </Suspense>
  );
}
