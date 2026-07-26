"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { ImageOff } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/api/products";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("catalog");

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const prices = product.variants.map((v) => parseFloat(v.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const image = product.images[0]?.url;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
        <AspectRatio ratio={1} className="overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </AspectRatio>
        <CardContent className="space-y-1 p-4">
          <p className="text-xs text-muted-foreground">
            {product.category.name}
          </p>
          <h3 className="font-heading font-semibold leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center justify-between pt-1">
            <p className="font-semibold">
              {minPrice === maxPrice
                ? formatCurrency(minPrice)
                : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
            </p>
            {totalStock === 0 && (
              <Badge variant="destructive">{t("outOfStock")}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
