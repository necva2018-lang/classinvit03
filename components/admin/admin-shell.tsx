import Link from "next/link";

import { AdminMobileMenu } from "@/components/admin/admin-mobile-menu";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-zinc-950">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 text-zinc-100 md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-zinc-800 px-4">
          <Link
            href="/admin/dashboard"
            className="text-sm font-bold tracking-tight text-white"
          >
            管理後台
          </Link>
        </div>
        <div className="flex-1 overflow-auto p-3">
          <AdminNavLinks darkSidebar />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <AdminMobileMenu darkSidebar />
          <span className="text-sm font-semibold text-slate-900">NECVA 後台</span>
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
