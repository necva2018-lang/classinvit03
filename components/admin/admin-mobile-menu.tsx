"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminMobileMenu({ darkSidebar }: { darkSidebar?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="開啟選單">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className={
          darkSidebar
            ? "w-64 border-zinc-800 bg-zinc-950 p-0 text-zinc-100"
            : "w-64 bg-sidebar p-0"
        }
      >
        <SheetHeader
          className={
            darkSidebar
              ? "border-b border-zinc-800 p-4 text-left"
              : "border-b border-sidebar-border p-4 text-left"
          }
        >
          <SheetTitle
            className={darkSidebar ? "text-white" : "text-sidebar-primary"}
          >
            管理後台
          </SheetTitle>
        </SheetHeader>
        <div className="p-3">
          <AdminNavLinks
            darkSidebar={darkSidebar}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
