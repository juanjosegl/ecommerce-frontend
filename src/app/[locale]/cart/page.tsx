"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImageOff, Minus, Plus, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const t = useTranslations("catalog");
  const router = useRouter();
  const hydrated = useHydrated();
  const { items, updateQuantity, removeItem, totalAmount, totalItems } = useCartStore();
  const accessToken = useAuthStore((s) => s.accessToken);

  const handleCheckout = () => {
    router.push(accessToken ? "/checkout" : "/login?next=/checkout");
  };

  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        <h1 className="text-4xl">{t("cartTitle")}</h1>

        {!hydrated ? (
          <Skeleton className="mt-10 h-40 w-full" />
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-md border border-dashed py-20 text-center">
            <p className="text-lg">{t("emptyCart")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("emptyCartHint")}</p>
            <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
              {t("startShopping")}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem]">
            <ul className="divide-y border-y">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-6 sm:gap-6">
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-28"
                  >
                    {item.image ? (
                      <Image src={item.image} alt={item.productName} fill sizes="112px" className="object-cover" />
                    ) : (
                      <ImageOff className="m-auto mt-10 size-6 text-muted-foreground" aria-hidden />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {item.productName}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {Object.values(item.attributes).join(" / ")}
                        </p>
                        <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-medium tabular-nums">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div
                        className="flex items-center rounded-md border"
                        role="group"
                        aria-label={t("quantityFor", { name: item.productName })}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("decrease")}
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <output className="w-7 text-center text-sm tabular-nums">{item.quantity}</output>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("increase")}
                          disabled={item.quantity >= item.maxStock}
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <X className="size-3.5" />
                        {t("remove")}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-md bg-muted/60 p-6 lg:sticky lg:top-24">
              <h2 className="text-2xl">{t("orderSummary")}</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    {t("subtotalItems", { count: totalItems() })}
                  </dt>
                  <dd className="tabular-nums">{formatCurrency(totalAmount())}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("shipping")}</dt>
                  <dd>{t("freeShipping")}</dd>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-medium">
                  <dt>{t("total")}</dt>
                  <dd className="tabular-nums">{formatCurrency(totalAmount())}</dd>
                </div>
              </dl>
              <Button className="mt-6 w-full" size="lg" onClick={handleCheckout}>
                {t("checkout")}
              </Button>
              {!accessToken && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {t("loginToCheckout")}
                </p>
              )}
              <Link
                href="/"
                className="mt-4 block text-center text-sm text-primary underline-offset-4 hover:underline"
              >
                {t("continueShopping")}
              </Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
