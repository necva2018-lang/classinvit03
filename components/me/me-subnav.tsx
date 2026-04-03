"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/me/courses", label: "我的課程" },
  { href: "/me/account", label: "帳號設定" },
] as const;

export function MeSubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap gap-1 py-2" aria-label="會員導覽">
          {tabs.map((t) => {
            const active =
              pathname === t.href || pathname.startsWith(`${t.href}/`);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-necva-primary/10 text-necva-primary"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
