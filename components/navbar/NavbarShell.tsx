import { Navbar } from "@/components/Navbar";
import { toNavCategoryLinks } from "@/lib/category-nav-links";
import { isDatabaseConfigured } from "@/lib/env";
import { getNavCategories } from "@/lib/site-queries/categories";
import { getSiteSettingsByKeys } from "@/lib/site-queries/site-settings";
import { Suspense } from "react";

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-zinc-200/90 bg-white/95 shadow-none backdrop-blur-md sm:h-16" />
  );
}

/** 從 Category 表載入分類後交給 client Navbar（useSearchParams 仍需 Suspense） */
async function NavbarWithCategories() {
  let categories = toNavCategoryLinks([]);
  let logoUrl: string | null = null;
  let logoAlt: string | null = null;
  let siteName: string | null = null;

  if (isDatabaseConfigured()) {
    try {
      const rows = await getNavCategories();
      categories = toNavCategoryLinks(rows);
    } catch {
      categories = [];
    }
    try {
      const s = await getSiteSettingsByKeys([
        "site_logo_url",
        "site_logo_alt",
        "site_name",
      ]);
      const u = s.site_logo_url?.trim();
      logoUrl = u && /^https:\/\//i.test(u) ? u : null;
      logoAlt = s.site_logo_alt?.trim() || null;
      siteName = s.site_name?.trim() || null;
    } catch {
      /* ignore */
    }
  }

  return (
    <Navbar
      categories={categories}
      logoUrl={logoUrl}
      logoAlt={logoAlt}
      siteName={siteName}
    />
  );
}

/** useSearchParams 需 Suspense 邊界（Next.js 要求） */
export function NavbarShell() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarWithCategories />
    </Suspense>
  );
}
