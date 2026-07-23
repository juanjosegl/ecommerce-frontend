"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import { getProducts } from "@/lib/api/products";
import { getAllOrders, type Order } from "@/lib/api/orders";
import { getUsers } from "@/lib/api/users";
import { getLowStockVariants, type LowStockVariant } from "@/lib/api/inventory";
import { formatCurrency, formatDate } from "@/lib/format";
import { orderStatusVariant } from "@/lib/order-status";
import { useLocale } from "next-intl";

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const tProfile = useTranslations("profile");
  const locale = useLocale();

  const [productCount, setProductCount] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [lowStock, setLowStock] = useState<LowStockVariant[] | null>(null);

  useEffect(() => {
    getProducts().then((data) => setProductCount(data.length));
    getAllOrders().then(setOrders);
    getUsers().then((data) => setUserCount(data.length));
    getLowStockVariants().then(setLowStock);
  }, []);

  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("totalProducts")}
              </p>
              {productCount === null ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <p className="text-2xl font-bold">{productCount}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("totalOrders")}
              </p>
              {orders === null ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <p className="text-2xl font-bold">{orders.length}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("totalUsers")}
              </p>
              {userCount === null ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <p className="text-2xl font-bold">{userCount}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t("lowStockAlert")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lowStock === null && <Skeleton className="h-24 w-full" />}
            {lowStock?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("noLowStock")}
              </p>
            )}
            <div className="space-y-2">
              {lowStock?.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {v.product.name} —{" "}
                    {Object.values(v.attributes).join(" / ")}
                  </span>
                  <Badge variant="destructive">{v.stock}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t("recentOrders")}</CardTitle>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline"
            >
              {t("viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {orders === null && <Skeleton className="h-24 w-full" />}
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt, locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <Badge variant={orderStatusVariant[order.status]}>
                      {tProfile(`orderStatus.${order.status}` as any)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}