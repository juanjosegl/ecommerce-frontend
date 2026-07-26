"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getMyOrders, type Order } from "@/lib/api/orders";
import { formatCurrency, formatDate } from "@/lib/format";
import { orderStatusVariant, orderStatusColor } from "@/lib/order-status";
import { Package } from "lucide-react";
import { Footer } from "@/components/footer";

function OrdersContent() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("myOrders")}</h1>

      {orders === null && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {orders !== null && orders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">{t("noOrders")}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  #{order.id.slice(0, 8).toUpperCase()}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt, locale)}
                </p>
              </div>
              <Badge variant={orderStatusVariant[order.status]}>
                <span className={orderStatusColor[order.status]}>
                  {t(`orderStatus.${order.status}` as any)}
                </span>
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {item.variant.product.name}
                      </p>
                      <p className="text-muted-foreground">
                        {Object.values(item.variant.attributes).join(" / ")} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <p>{formatCurrency(item.priceAtSale)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <Navbar />
      <OrdersContent />
      <Footer />
    </AuthGuard>
  );
}
