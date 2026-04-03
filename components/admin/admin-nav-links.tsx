"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  LibraryBig,
  PanelLeft,
  Settings2,
  ShoppingBag,
  UserRoundCog,
} from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "儀表板", icon: LayoutDashboard },
  { href: "/admin/courses", label: "課程管理", icon: BookOpen },
  { href: "/admin/categories", label: "課程類別", icon: FolderTree },
  { href: "/admin/members", label: "會員管理", icon: UserRoundCog },
  { href: "/admin/orders", label: "訂單紀錄", icon: ShoppingBag },
  { href: "/admin/media", label: "素材庫", icon: LibraryBig },
  { href: "/admin/banners", label: "首頁輪播", icon: ImageIcon },
  { href: "/admin/settings", label: "全站設定", icon: Settings2 },
  { href: "/", label: "返回前台", icon: PanelLeft },
] as const;

export function AdminNavLinks({
  className,
  onNavigate,
  darkSidebar = false,
}: {
  className?: string;
  onNavigate?: () => void;
  /** 深色側欄（專業後台） */
  darkSidebar?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      <p
        className={cn(
          "mb-2 px-3 text-xs font-semibold uppercase tracking-wider",
          darkSidebar ? "text-zinc-500" : "text-sidebar-foreground/60",
        )}
      >
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
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              darkSidebar
                ? cn(
                    "text-zinc-300 hover:bg-white/10 hover:text-white",
                    active && "bg-white/15 text-white",
                  )
                : cn(
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active && "bg-sidebar-accent text-sidebar-accent-foreground",
                  ),
            )}
          >
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </Link>
        );
      })}
      <div
        className={cn(
          "my-2 border-t",
          darkSidebar ? "border-zinc-800" : "border-sidebar-border",
        )}
      />
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-xs",
          darkSidebar ? "text-zinc-500" : "text-sidebar-foreground/70",
        )}
      >
        <Building2 className="size-4 shrink-0" aria-hidden />
        NECVA 後台
      </div>
    </nav>
  );
}
