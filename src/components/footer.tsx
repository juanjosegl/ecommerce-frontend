"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const t = useTranslations("nav");
  const tCatalog = useTranslations("catalog");
  const tFooter = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-heading text-lg font-bold">AM Shop</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {tFooter("tagline")}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">{tCatalog("title")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  {tCatalog("allProducts")}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-foreground">
                  {t("cart")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">{t("profile")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/profile" className="hover:text-foreground">
                  {t("profile")}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-foreground">
                  {t("orders")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">{tFooter("contact")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>hola@amshop.com</li>
              <li>Popayán, Colombia</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} AM Shop. {tFooter("allRightsReserved")}
          </p>
          <p>{tFooter("builtWith")}</p>
        </div>
      </div>
    </footer>
  );
}
