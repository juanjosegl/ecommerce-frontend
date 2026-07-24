"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMovementsByVariant,
  type InventoryMovement,
} from "@/lib/api/inventory";
import { formatDate } from "@/lib/format";

interface MovementHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string | null;
  variantLabel: string;
}

export function MovementHistoryDialog({
  open,
  onOpenChange,
  variantId,
  variantLabel,
}: MovementHistoryDialogProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [movements, setMovements] = useState<InventoryMovement[] | null>(null);

  useEffect(() => {
    if (open && variantId) {
      setMovements(null);
      getMovementsByVariant(variantId).then(setMovements);
    }
  }, [open, variantId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("movementHistory")} — {variantLabel}
          </DialogTitle>
        </DialogHeader>

        {movements === null && <Skeleton className="h-32 w-full" />}

        {movements?.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("noMovements")}
          </p>
        )}

        <div className="space-y-2">
          {movements?.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border p-3 text-sm"
            >
              <div>
                <p>{m.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(m.createdAt, locale)}
                </p>
              </div>
              <Badge variant={m.type === "IN" ? "secondary" : "outline"}>
                {m.type === "IN" ? "+" : "-"}
                {m.quantity}
              </Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
