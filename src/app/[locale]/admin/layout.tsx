"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminSidebarNav } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <AdminSidebarNav />
        </aside>

        <div className="flex-1">
          <header className="flex h-14 items-center justify-between border-b px-4 md:justify-end">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <AdminSidebarNav onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <ThemeToggle />
          </header>

          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}