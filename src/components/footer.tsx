"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const REPOS = [
  { key: "frontendRepo", href: "https://github.com/juanjosegl/ecommerce-frontend" },
  { key: "backendRepo", href: "https://github.com/juanjosegl/ecommerce-backend" },
  { key: "apiDocs", href: "https://am-shop-backend.onrender.com/api-docs" },
] as const;

export function Footer() {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const year = new Date().getFullYear();

  const linkClass = "text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <p className="font-heading text-2xl">AM Shop</p>
          <p className="mt-3 text-sm text-muted-foreground">{tFooter("tagline")}</p>
        </div>

        <nav aria-label={tFooter("shop")} className="text-sm">
          <p className="font-medium">{tFooter("shop")}</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/#catalog" className={linkClass}>{t("products")}</Link></li>
            <li><Link href="/cart" className={linkClass}>{t("cart")}</Link></li>
          </ul>
        </nav>

        <nav aria-label={tFooter("account")} className="text-sm">
          <p className="font-medium">{tFooter("account")}</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/profile" className={linkClass}>{t("profile")}</Link></li>
            <li><Link href="/orders" className={linkClass}>{t("orders")}</Link></li>
          </ul>
        </nav>

        <nav aria-label={tFooter("project")} className="text-sm">
          <p className="font-medium">{tFooter("project")}</p>
          <ul className="mt-4 space-y-2.5">
            {REPOS.map(({ key, href }) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noreferrer" className={linkClass}>
                  {tFooter(key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <p>© {year} AM Shop. {tFooter("allRightsReserved")}</p>
          <p>{tFooter("builtWith")}</p>
        </div>
      </div>
    </footer>
  );
}
