"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Search, Truck, ShieldCheck, RotateCcw, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProducts, type Product } from "@/lib/api/products";
import { getCategories, type Category } from "@/lib/api/categories";
import { formatCurrency } from "@/lib/format";
import { priceRange, totalStock } from "@/lib/product";
import { cn } from "@/lib/utils";

const SORTS = ["featured", "priceAsc", "priceDesc", "name"] as const;
type Sort = (typeof SORTS)[number];

function sortProducts(products: Product[], sort: Sort) {
  const minPrice = (p: Product) => priceRange(p)?.[0] ?? Infinity;
  const list = [...products];
  if (sort === "priceAsc") list.sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === "priceDesc") list.sort((a, b) => minPrice(b) - minPrice(a));
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  // In-stock first, keeping the chosen order otherwise.
  return list.sort((a, b) => Number(totalStock(b) > 0) - Number(totalStock(a) > 0));
}

const normalize = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function CatalogPage() {
  const t = useTranslations("catalog");
  const tHome = useTranslations("home");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const deferredQuery = useDeferredValue(query);

  const fetchCatalog = useCallback(() => {
    // The API sleeps on the free tier; tell people why the first load is slow.
    const timer = setTimeout(() => setSlow(true), 4000);
    getProducts()
      .then(setProducts)
      .catch(() => setFailed(true))
      .finally(() => clearTimeout(timer));
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => fetchCatalog(), [fetchCatalog]);

  const retry = () => {
    setFailed(false);
    setSlow(false);
    fetchCatalog();
  };

  const visible = useMemo(() => {
    if (!products) return null;
    const selected = categories.find((c) => c.id === categoryId);
    const ids = selected
      ? new Set([selected.id, ...(selected.children ?? []).map((c) => c.id)])
      : null;
    const q = normalize(deferredQuery.trim());
    return sortProducts(
      products.filter(
        (p) =>
          (!ids || ids.has(p.categoryId)) &&
          (!q || normalize(`${p.name} ${p.category.name}`).includes(q)),
      ),
      sort,
    );
  }, [products, categories, categoryId, deferredQuery, sort]);

  const featured = products?.find((p) => p.images.length > 0 && totalStock(p) > 0);
  const featuredRange = featured ? priceRange(featured) : null;
  const filtersActive = categoryId !== null || query.trim() !== "";

  const clearFilters = () => {
    setCategoryId(null);
    setQuery("");
  };

  return (
    <>
      <Navbar />

      <main id="main">
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-12 md:items-end md:pt-20">
          <div className="md:col-span-7">
            <h1 className="text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.95]">
              {tHome("heroTitle")}
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              {tHome("heroDescription")}
            </p>
            <a href="#catalog" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
              {tHome("heroCta")}
            </a>
          </div>

          <div className="md:col-span-5">
            {featured ? (
              <Link href={`/products/${featured.id}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                  <Image
                    src={featured.images[0].url}
                    alt={featured.name}
                    fill
                    priority
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
                <p className="mt-3 flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{featured.name}</span>
                  {featuredRange && (
                    <span className="tabular-nums">{formatCurrency(featuredRange[0])}</span>
                  )}
                </p>
              </Link>
            ) : (
              <Skeleton className="aspect-[4/5] w-full rounded-md" />
            )}
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-6 text-sm sm:grid-cols-3 sm:px-6">
            {[
              { icon: Truck, key: "shippingBadge" },
              { icon: ShieldCheck, key: "secureBadge" },
              { icon: RotateCcw, key: "returnsBadge" },
            ].map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-center gap-3">
                <Icon className="size-5 shrink-0 text-primary" aria-hidden />
                {tHome(key)}
              </li>
            ))}
          </ul>
        </section>

        <section
          id="catalog"
          aria-labelledby="catalog-title"
          className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-16 sm:px-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="catalog-title" className="text-4xl">
                {t("title")}
              </h2>
              {visible && (
                <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
                  {t("resultCount", { count: visible.length })}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <div className="relative sm:w-72">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("searchPlaceholder")}
                  className="pl-9"
                  maxLength={80}
                />
              </div>
              <Select
                value={sort}
                onValueChange={(value) => setSort(value as Sort)}
                items={SORTS.map((s) => ({ value: s, label: t(`sort.${s}`) }))}
              >
                <SelectTrigger className="w-full sm:w-48" aria-label={t("sortLabel")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`sort.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {categories.length > 0 && (
            <div
              className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
              role="group"
              aria-label={t("categories")}
            >
              {[{ id: null, name: t("allProducts") }, ...categories].map((cat) => (
                <button
                  key={cat.id ?? "all"}
                  type="button"
                  aria-pressed={categoryId === cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    categoryId === cat.id
                      ? "border-foreground bg-foreground text-background"
                      : "text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="mt-10">
            {failed && (
              <div className="rounded-md border border-dashed py-16 text-center" role="alert">
                <p className="font-medium">{t("loadError")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("loadErrorHint")}</p>
                <Button variant="outline" className="mt-6" onClick={retry}>
                  {t("retry")}
                </Button>
              </div>
            )}

            {!failed && visible === null && (
              <>
                {slow && (
                  <p className="mb-6 text-sm text-muted-foreground" role="status">
                    {t("coldStart")}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="aspect-[4/5] w-full rounded-md" />
                      <Skeleton className="mt-3 h-4 w-2/3" />
                      <Skeleton className="mt-2 h-3 w-1/3" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {visible?.length === 0 && (
              <div className="rounded-md border border-dashed py-16 text-center">
                <p className="font-medium">
                  {query.trim() ? t("noResults", { query: query.trim() }) : t("noProducts")}
                </p>
                {filtersActive && (
                  <Button variant="outline" className="mt-6" onClick={clearFilters}>
                    <X className="size-4" />
                    {t("clearFilters")}
                  </Button>
                )}
              </div>
            )}

            {visible && visible.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
                {visible.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
