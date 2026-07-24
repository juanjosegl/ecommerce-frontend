"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllOrders, updateOrderStatus, type Order } from "@/lib/api/orders";
import { formatCurrency, formatDate } from "@/lib/format";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const tProfile = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    getAllOrders().then(setOrders);
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    const previous = orders;
    setOrders(
      (prev) =>
        prev?.map((o) => (o.id === orderId ? { ...o, status } : o)) ?? null,
    );

    try {
      await updateOrderStatus(orderId, status);
      toast.success(t("statusUpdated"));
    } catch {
      toast.error(tAuth("genericError"));
      setOrders(previous);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("ordersTitle")}</h1>

      {orders === null && <Skeleton className="h-64 w-full" />}

      {orders?.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("noOrdersYet")}</p>
      )}

      {orders !== null && orders.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("customer")}
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("date")}
                </TableHead>
                <TableHead>{t("total")}</TableHead>
                <TableHead>{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.user
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(order.createdAt, locale)}
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleStatusChange(order.id, value)
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {tProfile(`orderStatus.${status}` as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
