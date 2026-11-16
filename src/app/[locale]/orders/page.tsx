"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CircleCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyOrders, type Order } from "@/lib/api/orders";
import { formatCurrency, formatDate, orderRef } from "@/lib/format";
import { ORDER_FLOW } from "@/lib/order-status";
import { cn } from "@/lib/utils";

function OrderProgress({ order }: { order: Order }) {
  const t = useTranslations("profile.orderStatus");
  const current = ORDER_FLOW.indexOf(order.status);
  if (current === -1) return null; // cancelled orders have no progress

  return (
    <ol className="grid grid-cols-5 gap-1.5" aria-label={t(order.status)}>
      {ORDER_FLOW.map((step, i) => (
        <li key={step} aria-current={i === current ? "step" : undefined}>
          <span className={cn("block h-1 rounded-full", i <= current ? "bg-primary" : "bg-border")} />
          <span
            className={cn(
              "mt-2 hidden text-xs sm:block",
              i <= current ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {t(step)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function OrderCard({ order, highlighted }: { order: Order; highlighted: boolean }) {
  const t = useTranslations("orders");
  const locale = useLocale();
  const address = order.shippingAddress;

  return (
    <article
      id={`order-${order.id}`}
      className={cn("rounded-md border p-5 sm:p-6", highlighted && "border-primary ring-1 ring-primary")}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-base font-medium tracking-normal">
            {t("orderNumber", { ref: orderRef(order.id) })}
          </h2>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt, locale)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <div className="mt-5">
        <OrderProgress order={order} />
      </div>

      <ul className="mt-6 divide-y border-y text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-3">
            <div>
              <p className="font-medium">{item.variant.product.name}</p>
              <p className="text-muted-foreground">
                {Object.values(item.variant.attributes).join(" / ")}
              </p>
              <p className="text-muted-foreground tabular-nums">
                {t("unitLine", { count: item.quantity, price: formatCurrency(item.priceAtSale) })}
              </p>
            </div>
            <p className="tabular-nums">
              {formatCurrency(Number(item.priceAtSale) * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        {address ? (
          <address className="text-sm not-italic text-muted-foreground">
            <span className="text-foreground">{address.fullName}</span>
            <br />
            {address.address}, {address.city}, {address.department}
          </address>
        ) : (
          <span />
        )}
        <p className="text-base font-medium tabular-nums">
          {t("total")} {formatCurrency(order.totalAmount)}
        </p>
      </div>
    </article>
  );
}

function OrdersContent() {
  const t = useTranslations("orders");
  const placed = useSearchParams().get("placed");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);

  const fetchOrders = () =>
    getMyOrders()
      .then(setOrders)
      .catch(() => setFailed(true));
  useEffect(() => {
    fetchOrders();
  }, []);

  const retry = () => {
    setFailed(false);
    fetchOrders();
  };

  const placedOrder = orders?.find((o) => o.id === placed);

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
      {placedOrder && (
        <div className="mb-10 flex gap-4 rounded-md bg-success/10 p-5" role="status">
          <CircleCheck className="mt-0.5 size-6 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-medium">{t("placedTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("placedDescription", { ref: orderRef(placedOrder.id) })}
            </p>
          </div>
        </div>
      )}

      <h1 className="text-4xl">{t("title")}</h1>

      <div className="mt-10 space-y-6">
        {failed && (
          <div className="rounded-md border border-dashed py-12 text-center" role="alert">
            <p>{t("loadError")}</p>
            <Button variant="outline" className="mt-4" onClick={retry}>
              {t("retry")}
            </Button>
          </div>
        )}

        {!failed && orders === null && (
          <>
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </>
        )}

        {orders?.length === 0 && (
          <div className="rounded-md border border-dashed py-16 text-center">
            <p className="text-lg">{t("empty")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("emptyHint")}</p>
            <Link href="/" className={cn(buttonVariants(), "mt-6")}>
              {t("browse")}
            </Link>
          </div>
        )}

        {orders?.map((order) => (
          <OrderCard key={order.id} order={order} highlighted={order.id === placed} />
        ))}
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <Navbar />
      <Suspense>
        <OrdersContent />
      </Suspense>
      <Footer />
    </AuthGuard>
  );
}
