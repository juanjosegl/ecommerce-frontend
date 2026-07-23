"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProducts, type Product } from "@/lib/api/products";
import { getCategories, type Category } from "@/lib/api/categories";

export default function CatalogPage() {
  const t = useTranslations("catalog");
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
      <div className="mx-auto max-w-6xl p-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>

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
    </>
  );
}
