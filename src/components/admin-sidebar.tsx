"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Warehouse,
  ShoppingBag,
  Users,
  ArrowLeft,
} from "lucide-react";

const links = [
  { href: "/admin", icon: LayoutDashboard, key: "dashboard" },
  { href: "/admin/products", icon: Package, key: "products" },
  { href: "/admin/categories", icon: FolderTree, key: "categories" },
  { href: "/admin/inventory", icon: Warehouse, key: "inventory" },
  { href: "/admin/orders", icon: ShoppingBag, key: "orders" },
  { href: "/admin/users", icon: Users, key: "users" },
] as const;

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <p className="mb-4 px-3 pt-2 font-heading text-xl leading-tight">
        {t("panel")}
      </p>

      {links.map(({ href, icon: Icon, key }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {t(key)}
          </Link>
        );
      })}

      <div className="mt-auto">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToStore")}
        </Link>
      </div>
    </nav>
  );
}