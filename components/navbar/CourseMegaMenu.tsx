import { navCourseCategories } from "@/lib/nav-course-categories";
import Link from "next/link";

type Props = {
  panelId: string;
  onNavigate: () => void;
};

export function CourseMegaMenu({ panelId, onNavigate }: Props) {
  return (
    <div
      id={panelId}
      role="region"
      aria-label="課程分類"
      className="absolute left-0 right-0 top-full z-40 hidden border-b border-zinc-200 bg-white shadow-lg lg:block"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {navCourseCategories.map((group) => (
            <div key={group.label}>
              <Link
                href={group.href}
                className="text-sm font-semibold text-necva-primary hover:underline"
                onClick={onNavigate}
              >
                {group.label}
              </Link>
              <ul className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
                {group.children.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-zinc-600 transition hover:text-necva-primary"
                      onClick={onNavigate}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
