"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/order-status-badge";
import {
  getAllOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "@/lib/api/orders";
import { apiMessage } from "@/lib/api-client";
import { formatCurrency, formatDate, orderRef } from "@/lib/format";
import { ORDER_TRANSITIONS } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const tStatus = useTranslations("profile.orderStatus");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  const changeStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev?.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)) ?? null,
      );
      toast.success(t("statusUpdated"));
    } catch (error) {
      toast.error(apiMessage(error) ?? tAuth("genericError"));
    }
  };

  const onSelect = (order: Order, status: OrderStatus) => {
    if (status === order.status) return;
    if (status === "CANCELLED") setCancelling(order.id);
    else void changeStatus(order.id, status);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{t("ordersTitle")}</h1>

      {orders === null && <Skeleton className="h-64 w-full" />}

      {orders?.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("noOrdersYet")}</p>
      )}

      {orders !== null && orders.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>{t("order")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("customer")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("date")}</TableHead>
                <TableHead className="text-right">{t("total")}</TableHead>
                <TableHead>{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const next = ORDER_TRANSITIONS[order.status];
                const isOpen = expanded === order.id;
                const options = [order.status, ...next];
                return (
                  <Fragment key={order.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-expanded={isOpen}
                          aria-label={t("toggleDetails")}
                          onClick={() => setExpanded(isOpen ? null : order.id)}
                        >
                          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{orderRef(order.id)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {order.user ? (
                          <>
                            <span className="block">{order.user.firstName} {order.user.lastName}</span>
                            <span className="block text-xs text-muted-foreground">{order.user.email}</span>
                          </>
                        ) : null}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDate(order.createdAt, locale)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {next.length === 0 ? (
                          <OrderStatusBadge status={order.status} />
                        ) : (
                          <Select
                            value={order.status}
                            onValueChange={(value) => onSelect(order, value as OrderStatus)}
                            items={options.map((s) => ({ value: s, label: tStatus(s) }))}
                          >
                            <SelectTrigger className="w-40" aria-label={t("status")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {tStatus(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableCell />
                        <TableCell colSpan={5} className="whitespace-normal py-4">
                          <div className="grid gap-6 md:grid-cols-2">
                            <ul className="space-y-1 text-sm">
                              {order.items.map((item) => (
                                <li key={item.id} className="flex justify-between gap-4">
                                  <span>
                                    {item.quantity} × {item.variant.product.name}{" "}
                                    <span className="text-muted-foreground">
                                      ({Object.values(item.variant.attributes).join(" / ")})
                                    </span>
                                  </span>
                                  <span className="tabular-nums">
                                    {formatCurrency(Number(item.priceAtSale) * item.quantity)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <div className="text-sm">
                              <p className="font-medium">{t("shippingTo")}</p>
                              {order.shippingAddress ? (
                                <address className="mt-1 not-italic text-muted-foreground">
                                  {order.shippingAddress.fullName}, {order.shippingAddress.phone}
                                  <br />
                                  {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                                  {order.shippingAddress.department}
                                  {order.shippingAddress.notes && (
                                    <>
                                      <br />
                                      {order.shippingAddress.notes}
                                    </>
                                  )}
                                </address>
                              ) : (
                                <p className="mt-1 text-muted-foreground">{t("noShipping")}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!cancelling} onOpenChange={(open) => !open && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelOrderTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("cancelOrderDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelling) void changeStatus(cancelling, "CANCELLED");
                setCancelling(null);
              }}
            >
              {t("cancelOrderConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
