import Link from "next/link";

import { AdminMobileMenu } from "@/components/admin/admin-mobile-menu";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <Link
            href="/admin/courses"
            className="text-sm font-bold tracking-tight text-sidebar-primary"
          >
            管理後台
          </Link>
        </div>
        <div className="flex-1 overflow-auto p-3">
          <AdminNavLinks />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 md:hidden">
          <AdminMobileMenu />
          <span className="text-sm font-semibold text-foreground">NECVA 後台</span>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
