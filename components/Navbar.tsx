"use client";

import { CourseMegaMenu } from "@/components/navbar/CourseMegaMenu";
import { MobileNavDrawer } from "@/components/navbar/MobileNavDrawer";
import { NavSearchForm } from "@/components/navbar/NavSearchForm";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export function Navbar() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileCourseOpen, setMobileCourseOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const prevMobileOpen = useRef(false);
  const panelId = useId();

  const closeMega = useCallback(() => setMegaOpen(false), []);
  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileCourseOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMega();
        closeMobile();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMega, closeMobile]);

  useEffect(() => {
    if (!megaOpen) return;
    const onPointer = (e: MouseEvent) => {
      const el = headerRef.current;
      if (el && !el.contains(e.target as Node)) closeMega();
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [megaOpen, closeMega]);

  useEffect(() => {
    const onResize = () => {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMegaOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (prevMobileOpen.current && !mobileOpen) {
      menuButtonRef.current?.focus({ preventScroll: true });
    }
    prevMobileOpen.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(
      drawer.querySelectorAll<HTMLElement>(selector),
    );
    const first =
      focusables.find((el) => el.tagName === "INPUT") ?? focusables[0];
    const last = focusables[focusables.length - 1];
    window.requestAnimationFrame(() => first?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    drawer.addEventListener("keydown", onKeyDown);
    return () => drawer.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 border-b border-zinc-200/90 bg-white/95 backdrop-blur-md transition-shadow duration-200 ${
        scrolled ? "shadow-md shadow-zinc-900/12" : "shadow-none"
      }`}
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-3 sm:h-16 lg:gap-4">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex h-9 shrink-0 items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 transition hover:border-necva-primary/40 hover:bg-necva-primary/5 hover:text-necva-primary sm:h-10 sm:px-4"
              onClick={closeMobile}
            >
              Logo
            </Link>

            <div className="relative hidden lg:block">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-necva-primary"
                aria-expanded={megaOpen}
                aria-haspopup="true"
                aria-controls={megaOpen ? panelId : undefined}
                onClick={() => setMegaOpen((v) => !v)}
              >
                全方位課程
                <ChevronDown
                  className={`size-4 shrink-0 transition-transform ${megaOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 justify-center px-2 lg:flex">
            <NavSearchForm variant="desktop" defaultQuery={searchQuery} />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:gap-3">
            <Link
              href="#"
              className="hidden rounded-lg px-2 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-necva-primary lg:inline-flex"
            >
              找工作
            </Link>
            <Link
              href="#why-necva"
              className="hidden rounded-lg px-2 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-necva-primary lg:inline-flex"
            >
              職場力
            </Link>
            <div className="hidden h-6 w-px bg-zinc-200 lg:block" aria-hidden />
            <Link
              href="#"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:text-necva-primary lg:inline-flex"
            >
              登入
            </Link>
            <Link
              href="#"
              className="hidden rounded-full bg-necva-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-necva-accent/90 lg:inline-flex"
            >
              註冊
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileOpen ? "關閉選單" : "開啟選單"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="size-6" aria-hidden />
              ) : (
                <Menu className="size-6" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {megaOpen && (
          <CourseMegaMenu panelId={panelId} onNavigate={closeMega} />
        )}
      </div>

      {mobileOpen && (
        <MobileNavDrawer
          drawerRef={drawerRef}
          searchQuery={searchQuery}
          mobileCourseOpen={mobileCourseOpen}
          setMobileCourseOpen={setMobileCourseOpen}
          onClose={closeMobile}
        />
      )}
    </header>
  );
}
