import type { NavCategoryLink } from "@/lib/category-nav-links";
import {
  BarChart3,
  BookOpen,
  Brain,
  Code2,
  Megaphone,
  Palette,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

/** 與 `COURSE_FILTER_OPTIONS`／Category.name（種子）對齊時顯示對應圖示 */
const LABEL_ICONS: Partial<Record<string, LucideIcon>> = {
  人工智慧: Brain,
  網頁前端: Code2,
  數位行銷: Megaphone,
  設計與多媒體: Palette,
  數據分析: BarChart3,
  職涯與管理: ShieldCheck,
};

type Props = {
  items: NavCategoryLink[];
};

export function CategoryPills({ items }: Props) {
  return (
    <section className="border-b border-zinc-100 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold text-zinc-900">
          探索學習領域
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-500">
          依職涯目標選擇主題，系統化安排學習路徑
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">
              尚無分類資料，請至後台建立 Category。
            </p>
          ) : (
            items.map((item) => {
              const Icon = LABEL_ICONS[item.name] ?? BookOpen;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-necva-primary/40 hover:bg-necva-primary/5 hover:text-necva-primary"
                >
                  <Icon
                    className="size-4 shrink-0 text-necva-primary"
                    aria-hidden
                  />
                  {item.name}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
