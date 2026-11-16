"use client";

import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/lib/api/orders";
import { orderStatusClass } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("profile.orderStatus");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        orderStatusClass[status],
      )}
    >
      {t(status)}
    </span>
  );
}
