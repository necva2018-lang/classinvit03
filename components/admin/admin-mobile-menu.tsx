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

export function AdminMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="開啟選單">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-0">
        <SheetHeader className="border-b border-sidebar-border p-4 text-left">
          <SheetTitle className="text-sidebar-primary">管理後台</SheetTitle>
        </SheetHeader>
        <div className="p-3">
          <AdminNavLinks onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
