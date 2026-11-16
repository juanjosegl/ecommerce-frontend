"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ImageOff } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { LOW_STOCK, priceRange, totalStock } from "@/lib/product";
import type { Product } from "@/lib/api/products";
import { cn } from "@/lib/utils";

const SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const t = useTranslations("catalog");

  const stock = totalStock(product);
  const range = priceRange(product);
  const [front, back] = product.images;
  const soldOut = stock === 0;

  return (
    <Link href={`/products/${product.id}`} className="group block focus-visible:outline-none">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted ring-offset-2 ring-offset-background group-focus-visible:ring-2 group-focus-visible:ring-ring">
        {front ? (
          <>
            <Image
              src={front.url}
              alt={product.name}
              fill
              sizes={SIZES}
              priority={priority}
              className={cn(
                "object-cover transition-opacity duration-500",
                back && "group-hover:opacity-0",
                soldOut && "opacity-60",
              )}
            />
            {back && (
              <Image
                src={back.url}
                alt=""
                fill
                sizes={SIZES}
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff className="size-8 text-muted-foreground" aria-hidden />
          </div>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-sm bg-background px-2 py-1 text-xs font-medium">
            {t("outOfStock")}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <h3 className="mt-1 line-clamp-2 font-medium leading-snug underline-offset-4 group-hover:underline">
          {product.name}
        </h3>
        {range && (
          <p className="mt-1.5 text-sm tabular-nums">
            {range[0] === range[1]
              ? formatCurrency(range[0])
              : t("priceFrom", { price: formatCurrency(range[0]) })}
          </p>
        )}
      </div>
      {!soldOut && stock <= LOW_STOCK && (
        <p className="mt-1 text-xs text-warning">{t("lowStock")}</p>
      )}
    </Link>
  );
}
