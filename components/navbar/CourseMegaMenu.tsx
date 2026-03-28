import type { NavCategoryLink } from "@/lib/category-nav-links";
import Link from "next/link";

type Props = {
  panelId: string;
  categories: NavCategoryLink[];
  onNavigate: () => void;
};

export function CourseMegaMenu({ panelId, categories, onNavigate }: Props) {
  return (
    <div
      id={panelId}
      role="region"
      aria-label="課程分類"
      className="absolute left-0 right-0 top-full z-40 hidden border-b border-zinc-200 bg-white shadow-lg lg:block"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          依資料庫分類瀏覽
        </p>
        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            尚無分類，請至後台建立 Category。
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.href}
                  className="block rounded-lg border border-zinc-100 bg-zinc-50/80 px-4 py-3 text-sm font-medium text-zinc-800 transition hover:border-necva-primary/30 hover:bg-necva-primary/5 hover:text-necva-primary"
                  onClick={onNavigate}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-zinc-400">
          點擊後會開啟課程列表並依該分類篩選（與後台「課程類別」同步）。
        </p>
      </div>
    </div>
  );
}
