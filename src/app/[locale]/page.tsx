"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProducts, type Product } from "@/lib/api/products";
import { getCategories, type Category } from "@/lib/api/categories";

export default function CatalogPage() {
  const t = useTranslations("catalog");
  const tHome = useTranslations("home");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setProducts(null);
    getProducts(selectedCategory ?? undefined)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [selectedCategory]);

  return (
    <>
      <Navbar />

      <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/30">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {tHome("heroTitle1")}
            <br className="hidden sm:block" /> {tHome("heroTitle2")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {tHome("heroDescription")}
          </p>
          <Button
            size="lg"
            className="mt-6"
            onClick={() =>
              document
                .getElementById("catalog")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {t("allProducts")}
          </Button>

          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium">{tHome("shippingBadge")}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium">{tHome("secureBadge")}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RotateCcw className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium">{tHome("returnsBadge")}</p>
            </div>
          </div>
        </div>
      </section>

      <div id="catalog" className="mx-auto max-w-6xl scroll-mt-16 p-4 py-8">
        <h2 className="mb-6 text-2xl font-bold">{t("title")}</h2>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            {t("allProducts")}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {products === null && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        )}

        {products !== null && products.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            {t("noProducts")}
          </p>
        )}

        <div
          className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4")}
        >
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
