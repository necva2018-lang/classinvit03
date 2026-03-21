"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/courses", label: "課程管理", icon: BookOpen },
  { href: "/", label: "返回前台", icon: PanelLeft },
] as const;

export function AdminNavLinks({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
        選單
      </p>
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </Link>
        );
      })}
      <div className="my-2 border-t border-sidebar-border" />
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/70">
        <LayoutDashboard className="size-4 shrink-0" aria-hidden />
        NECVA 後台
      </div>
    </nav>
  );
}
