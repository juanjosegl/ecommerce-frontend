// Run with: node --experimental-strip-types src/lib/product.test.ts
import assert from "node:assert/strict";
import { findVariant } from "./product.ts";

const v = (id: string, talla: string, color: string, stock = 5) =>
  ({ id, sku: id, price: "1", isActive: true, stock, attributes: { talla, color } });

const variants = [v("s-black", "S", "Negro"), v("m-black", "M", "Negro"), v("m-white", "M", "Blanco", 0), v("l-white", "L", "Blanco")];

// Changing size keeps the chosen color when that combination exists.
assert.equal(findVariant(variants, { talla: "M", color: "Negro" }, "talla")?.id, "m-black");
// Exact combination missing: the clicked attribute wins.
assert.equal(findVariant(variants, { talla: "L", color: "Negro" }, "talla")?.id, "l-white");
// Exact match is preferred even when out of stock (UI shows it as sold out).
assert.equal(findVariant(variants, { talla: "M", color: "Blanco" }, "color")?.id, "m-white");
console.log("product.test: ok");
