"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/format";
import { createOrder } from "@/lib/api/orders";
import { buttonVariants } from "@/components/ui/button";

function CheckoutContent() {
  const t = useTranslations("catalog");
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4 py-16 text-center">
        <p className="mb-4 text-muted-foreground">{t("emptyCart")}</p>
        <Link href="/" className={buttonVariants()}>
          {t("startShopping")}
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });
      clearCart();
      toast.success(t("orderPlaced"));
      router.push(`/orders?highlight=${order.id}`);
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.error(t("insufficientStock"));
      } else {
        toast.error(t("orderError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("checkoutTitle")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("orderSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-muted-foreground">
                    {Object.values(item.attributes).join(" / ")} ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <p>{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>{t("total")}</span>
            <span>{formatCurrency(totalAmount())}</span>
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={isSubmitting}
            onClick={handlePlaceOrder}
          >
            {t("placeOrder")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Navbar />
      <CheckoutContent />
    </AuthGuard>
  );
}
