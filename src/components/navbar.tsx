"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { initials } from "@/lib/format";
import { LogOut, User, Package, LayoutDashboard, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const router = useRouter();
  const hydrated = useHydrated();
  const { user, clearAuth } = useAuthStore();
  const totalItems = useCartStore((state) => state.totalItems());
  const cartCount = hydrated ? totalItems : 0;
  const currentUser = hydrated ? user : null;

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-heading text-2xl leading-none">
            AM Shop
          </Link>
          <nav className="hidden text-sm sm:block" aria-label={t("main")}>
            <Link
              href="/#catalog"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("products")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/cart"
            aria-label={t("cartWithCount", { count: cartCount })}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
          >
            <ShoppingBag className="size-[1.1rem]" />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold tabular-nums text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" className="ml-1 gap-2 px-1.5" />}
                aria-label={t("account")}
              >
                <Avatar className="size-7">
                  <AvatarImage src={currentUser.avatar ?? undefined} alt="" />
                  <AvatarFallback className="text-xs">
                    {initials(currentUser.firstName, currentUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm md:inline">{currentUser.firstName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <User className="size-4" />
                  {t("profile")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/orders" />}>
                  <Package className="size-4" />
                  {t("orders")}
                </DropdownMenuItem>
                {currentUser.role === "ADMIN" && (
                  <DropdownMenuItem render={<Link href="/admin" />}>
                    <LayoutDashboard className="size-4" />
                    {tAdmin("panel")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="size-4" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "ml-1")}>
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
