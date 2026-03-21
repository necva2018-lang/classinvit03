import { Navbar } from "@/components/Navbar";
import { Suspense } from "react";

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-zinc-200/90 bg-white/95 shadow-none backdrop-blur-md sm:h-16" />
  );
}

/** useSearchParams 需 Suspense 邊界（Next.js 要求） */
export function NavbarShell() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <Navbar />
    </Suspense>
  );
}
