import type { Product, ProductVariant } from "@/lib/api/products";

export const LOW_STOCK = 3;

export function activeVariants(product: Product): ProductVariant[] {
  return product.variants.filter((v) => v.isActive);
}

export function priceRange(product: Product): [number, number] | null {
  const prices = activeVariants(product).map((v) => Number(v.price));
  return prices.length ? [Math.min(...prices), Math.max(...prices)] : null;
}

export function totalStock(product: Product): number {
  return activeVariants(product).reduce((sum, v) => sum + v.stock, 0);
}

/**
 * Picks the variant that matches `selection` on every attribute. When the exact
 * combination doesn't exist, keeps the attribute just chosen (`priority`) and
 * matches as many of the others as possible, preferring in-stock variants.
 */
export function findVariant(
  variants: ProductVariant[],
  selection: Record<string, string>,
  priority?: string,
): ProductVariant | undefined {
  const candidates = priority
    ? variants.filter((v) => v.attributes[priority] === selection[priority])
    : variants;
  const score = (v: ProductVariant) =>
    Object.entries(selection).filter(([k, val]) => v.attributes[k] === val).length * 2 +
    (v.stock > 0 ? 1 : 0);
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}
