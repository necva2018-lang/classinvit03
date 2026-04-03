import { NavAuthMobile } from "@/components/navbar/NavAuth";
import type { NavCategoryLink } from "@/lib/category-nav-links";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { RefObject } from "react";
import { NavSearchForm } from "./NavSearchForm";

type Props = {
  drawerRef: RefObject<HTMLDivElement | null>;
  categories: NavCategoryLink[];
  searchQuery: string;
  mobileCourseOpen: boolean;
  setMobileCourseOpen: (v: boolean | ((b: boolean) => boolean)) => void;
  onClose: () => void;
};

export function MobileNavDrawer({
  drawerRef,
  categories,
  searchQuery,
  mobileCourseOpen,
  setMobileCourseOpen,
  onClose,
}: Props) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-zinc-900/40 lg:hidden"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="網站選單"
        className="fixed left-0 right-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-zinc-200 bg-white shadow-lg sm:top-16 sm:max-h-[calc(100dvh-4rem)] lg:hidden"
      >
        <div className="space-y-4 px-4 py-4">
          <NavSearchForm
            variant="mobile"
            defaultQuery={searchQuery}
            onAfterSubmit={onClose}
          />

          <div className="border-t border-zinc-100 pt-2">
            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-zinc-900"
              aria-expanded={mobileCourseOpen}
              onClick={() => setMobileCourseOpen((v) => !v)}
            >
              全方位課程
              <ChevronDown
                className={`size-4 transition-transform ${mobileCourseOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {mobileCourseOpen && (
              <ul className="space-y-1 border-l-2 border-necva-primary/20 pl-3 pb-2">
                {categories.length === 0 ? (
                  <li className="py-2 text-sm text-zinc-500">尚無分類</li>
                ) : (
                  categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={c.href}
                        className="block py-2 text-sm text-zinc-700 hover:text-necva-primary"
                        onClick={onClose}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-1 border-t border-zinc-100 pt-3">
            <Link
              href="#"
              className="rounded-lg py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              onClick={onClose}
            >
              找工作
            </Link>
            <Link
              href="#why-necva"
              className="rounded-lg py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              onClick={onClose}
            >
              職場力
            </Link>
          </div>

          <NavAuthMobile onNavigate={onClose} />
        </div>
      </div>
    </>
  );
}
