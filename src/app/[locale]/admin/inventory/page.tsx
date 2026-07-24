"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { History, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { MovementDialog } from "@/components/admin/movement-dialog";
import { MovementHistoryDialog } from "@/components/admin/movement-history-dialog";
import {
  getProducts,
  type Product,
  type ProductVariant,
} from "@/lib/api/products";

interface FlatVariant extends ProductVariant {
  productName: string;
}

export default function AdminInventoryPage() {
  const t = useTranslations("admin");
  const [variants, setVariants] = useState<FlatVariant[] | null>(null);
  const [movementTarget, setMovementTarget] = useState<FlatVariant | null>(
    null,
  );
  const [historyTarget, setHistoryTarget] = useState<FlatVariant | null>(null);

  const loadVariants = () => {
    getProducts().then((products: Product[]) => {
      const flat = products.flatMap((p) =>
        p.variants.map((v) => ({ ...v, productName: p.name })),
      );
      setVariants(flat);
    });
  };

  useEffect(() => {
    loadVariants();
  }, []);

  const labelFor = (v: FlatVariant) =>
    `${v.productName} — ${Object.values(v.attributes).join(" / ")} (${v.sku})`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("inventoryTitle")}</h1>

      {variants === null && <Skeleton className="h-64 w-full" />}

      {variants !== null && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("productName")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("variants")}
                </TableHead>
                <TableHead>{t("stock")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.sku}</TableCell>
                  <TableCell>{v.productName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {Object.values(v.attributes).join(" / ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={v.stock <= 5 ? "destructive" : "secondary"}>
                      {v.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setMovementTarget(v)}
                    >
                      <PackagePlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setHistoryTarget(v)}
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {movementTarget && (
        <MovementDialog
          open={!!movementTarget}
          onOpenChange={(open) => !open && setMovementTarget(null)}
          variantId={movementTarget.id}
          variantLabel={labelFor(movementTarget)}
          onSuccess={loadVariants}
        />
      )}

      <MovementHistoryDialog
        open={!!historyTarget}
        onOpenChange={(open) => !open && setHistoryTarget(null)}
        variantId={historyTarget?.id ?? null}
        variantLabel={historyTarget ? labelFor(historyTarget) : ""}
      />
    </div>
  );
}
