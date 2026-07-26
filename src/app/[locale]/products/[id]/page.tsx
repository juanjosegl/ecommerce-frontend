"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ImageOff, ChevronLeft, Minus, Plus } from "lucide-react";
import { getProductById, type Product, type ProductVariant } from "@/lib/api/products";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { Footer } from "@/components/footer";

export default function ProductDetailPage() {
  const t = useTranslations("catalog");
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    getProductById(productId).then((data) => {
      setProduct(data);
      setSelectedVariant(data.variants[0] ?? null);
    });
  }, [productId]);

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-4xl p-4 py-8">
          <Skeleton className="aspect-square w-full" />
        </div>
      </>
    );
  }

  const attributeKeys = Array.from(
    new Set(product.variants.flatMap((v) => Object.keys(v.attributes))),
  );

  const image = product.images[0]?.url;

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      sku: selectedVariant.sku,
      attributes: selectedVariant.attributes,
      price: parseFloat(selectedVariant.price),
      quantity,
      maxStock: selectedVariant.stock,
    });

    toast.success(t("addedToCart"));
    setQuantity(1);
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl p-4 py-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("backToCatalog")}
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <AspectRatio ratio={1} className="rounded-lg bg-muted">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {product.category.name}
              </p>
              <h1 className="font-heading text-2xl font-bold">
                {product.name}
              </h1>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            )}

            {selectedVariant && (
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(selectedVariant.price)}
              </p>
            )}

            {attributeKeys.map((key) => (
              <div key={key} className="space-y-2">
                <p className="text-sm font-semibold capitalize">{key}</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(product.variants.map((v) => v.attributes[key])),
                  ).map((value) => {
                    const variantForValue = product.variants.find(
                      (v) => v.attributes[key] === value,
                    );
                    const isSelected =
                      selectedVariant?.attributes[key] === value;
                    return (
                      <Button
                        key={value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          variantForValue && setSelectedVariant(variantForValue)
                        }
                      >
                        {value}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}

            {selectedVariant && (
              <p className="text-sm text-muted-foreground">
                {selectedVariant.stock > 0
                  ? `${selectedVariant.stock} ${t("inStock")}`
                  : t("outOfStock")}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center rounded-lg border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(q + 1, selectedVariant?.stock ?? 1),
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex-1"
                disabled={!selectedVariant || selectedVariant.stock === 0}
                onClick={handleAddToCart}
              >
                {t("addToCart")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}