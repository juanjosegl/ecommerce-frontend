"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getProducts, type Product } from "@/lib/api/products";
import { formatCurrency } from "@/lib/format";

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("productsTitle")}</h1>
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" />
          {t("newProduct")}
        </Link>
      </div>

      {products === null && <Skeleton className="h-64 w-full" />}

      {products !== null && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("productName")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("category")}
                </TableHead>
                <TableHead>{t("variants")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("stock")}
                </TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0,
                );
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.category.name}
                    </TableCell>
                    <TableCell>{product.variants.length}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={totalStock === 0 ? "destructive" : "secondary"}>
                        {totalStock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon-sm",
                        })}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}