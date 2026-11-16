"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImageOff, Minus, Plus, Check } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductById, type Product, type ProductVariant } from "@/lib/api/products";
import { httpStatus } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { activeVariants, findVariant, LOW_STOCK } from "@/lib/product";
import { useCartStore } from "@/stores/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const productId = useParams<{ id: string }>().id;
  return <ProductLoader key={productId} productId={productId} />;
}

function ProductLoader({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<"notFound" | "failed" | null>(null);

  useEffect(() => {
    getProductById(productId)
      .then((data) => (data.isActive ? setProduct(data) : setError("notFound")))
      .catch((e) => setError(httpStatus(e) === 404 ? "notFound" : "failed"));
  }, [productId]);

  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {error ? (
          <ProductError kind={error} />
        ) : product ? (
          <ProductView key={product.id} product={product} />
        ) : (
          <div className="grid gap-10 md:grid-cols-2">
            <Skeleton className="aspect-[4/5] w-full rounded-md" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function ProductError({ kind }: { kind: "notFound" | "failed" }) {
  const t = useTranslations("catalog");
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl">{t(kind === "notFound" ? "productNotFound" : "loadError")}</h1>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-8")}>
        {t("backToCatalog")}
      </Link>
    </div>
  );
}

function ProductView({ product }: { product: Product }) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const hydrated = useHydrated();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const variants = useMemo(() => activeVariants(product), [product]);
  const [selected, setSelected] = useState<ProductVariant | undefined>(
    () => variants.find((v) => v.stock > 0) ?? variants[0],
  );
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const attributeKeys = useMemo(
    () => Array.from(new Set(variants.flatMap((v) => Object.keys(v.attributes)))),
    [variants],
  );

  // Images tagged to the selected variant come first.
  const images = useMemo(
    () =>
      [...product.images].sort(
        (a, b) =>
          Number(b.variantId === selected?.id) - Number(a.variantId === selected?.id),
      ),
    [product.images, selected?.id],
  );
  const image = images[imageIndex] ?? images[0];

  const inCart = hydrated
    ? (cartItems.find((i) => i.variantId === selected?.id)?.quantity ?? 0)
    : 0;
  const available = Math.max(0, (selected?.stock ?? 0) - inCart);
  const qty = Math.min(quantity, Math.max(available, 1));

  const choose = (key: string, value: string) => {
    const next = findVariant(variants, { ...selected?.attributes, [key]: value }, key);
    if (next) {
      setSelected(next);
      setQuantity(1);
      setImageIndex(0);
    }
  };

  const handleAddToCart = () => {
    if (!selected || available === 0) return;
    addItem({
      variantId: selected.id,
      productId: product.id,
      productName: product.name,
      image: images[0]?.url,
      sku: selected.sku,
      attributes: selected.attributes,
      price: Number(selected.price),
      quantity: qty,
      maxStock: selected.stock,
    });
    toast.success(t("addedToCart"), {
      description: product.name,
      action: { label: t("viewCart"), onClick: () => router.push("/cart") },
    });
    setQuantity(1);
  };

  return (
    <>
      <nav aria-label={t("breadcrumb")} className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">
              {t("title")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>{product.category.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <div className="space-y-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
            {image ? (
              <Image
                key={image.id}
                src={image.url}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="size-12 text-muted-foreground" aria-hidden />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={t("showImage", { index: i + 1 })}
                  aria-current={i === imageIndex}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-sm bg-muted ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    i === imageIndex ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100",
                  )}
                >
                  <Image src={img.url} alt="" fill sizes="10vw" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:pt-4">
          <h1 className="text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          {selected && (
            <p className="mt-4 text-2xl tabular-nums">{formatCurrency(selected.price)}</p>
          )}

          {product.description && (
            <p className="mt-6 max-w-prose whitespace-pre-line leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-8 space-y-6">
            {attributeKeys.map((key) => {
              const values = Array.from(new Set(variants.map((v) => v.attributes[key])));
              return (
                <fieldset key={key}>
                  <legend className="mb-3 text-sm">
                    <span className="capitalize">{key}</span>
                    {selected && (
                      <span className="text-muted-foreground">: {selected.attributes[key]}</span>
                    )}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value) => {
                      const match = findVariant(
                        variants,
                        { ...selected?.attributes, [key]: value },
                        key,
                      );
                      const exact =
                        match &&
                        Object.entries({ ...selected?.attributes, [key]: value }).every(
                          ([k, v]) => match.attributes[k] === v,
                        );
                      const soldOut = !exact || match.stock === 0;
                      const isSelected = selected?.attributes[key] === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => choose(key, value)}
                          className={cn(
                            "min-w-12 rounded-md border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                            isSelected
                              ? "border-foreground bg-foreground text-background"
                              : "hover:border-foreground/50",
                            soldOut && !isSelected && "text-muted-foreground line-through decoration-1",
                          )}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>

          <p
            className={cn(
              "mt-6 flex items-center gap-2 text-sm",
              !selected || selected.stock === 0
                ? "text-destructive"
                : selected.stock <= LOW_STOCK
                  ? "text-warning"
                  : "text-success",
            )}
            role="status"
          >
            {selected && selected.stock > 0 && <Check className="size-4" aria-hidden />}
            {!selected || selected.stock === 0
              ? t("outOfStock")
              : selected.stock <= LOW_STOCK
                ? t("onlyLeft", { count: selected.stock })
                : t("inStock")}
          </p>

          <div className="mt-6 flex gap-3">
            <div className="flex items-center rounded-md border" role="group" aria-label={t("quantity")}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                aria-label={t("decrease")}
                disabled={qty <= 1}
                onClick={() => setQuantity(qty - 1)}
              >
                <Minus className="size-4" />
              </Button>
              <output className="w-8 text-center tabular-nums" aria-live="polite">
                {qty}
              </output>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                aria-label={t("increase")}
                disabled={qty >= available}
                onClick={() => setQuantity(qty + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              disabled={!selected || available === 0}
              onClick={handleAddToCart}
            >
              {selected && selected.stock > 0 && available === 0
                ? t("maxInCart")
                : t("addToCart")}
            </Button>
          </div>

          {inCart > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("alreadyInCart", { count: inCart })}{" "}
              <Link href="/cart" className="text-primary underline-offset-4 hover:underline">
                {t("viewCart")}
              </Link>
            </p>
          )}

          {selected && (
            <p className="mt-8 border-t pt-4 font-mono text-xs text-muted-foreground">
              SKU {selected.sku}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
