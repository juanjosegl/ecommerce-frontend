"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";

export default function CartPage() {
  const t = useTranslations("catalog");
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalAmount } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-2xl p-4 py-16 text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">{t("emptyCart")}</p>
          <Link href="/" className={buttonVariants()}>
            {t("startShopping")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-2xl p-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">{t("cartTitle")}</h1>

        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.variantId}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-heading font-semibold">
                    {item.productName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Object.values(item.attributes).join(" / ")}
                  </p>
                  <p className="text-sm font-medium">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <div className="flex items-center rounded-lg border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={item.quantity >= item.maxStock}
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.variantId)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>{t("total")}</span>
              <span>{formatCurrency(totalAmount())}</span>
            </div>
            <Separator className="my-4" />
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              {t("checkout")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}