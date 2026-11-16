"use client";

import { useState } from "react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FormField } from "@/components/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/format";
import { createOrder } from "@/lib/api/orders";
import { apiMessage, httpStatus } from "@/lib/api-client";
import { COLOMBIA_DEPARTMENTS } from "@/lib/colombia";
import {
  shippingSchema,
  type ShippingFormData,
  type ShippingFormInput,
} from "@/lib/validations/checkout";
import { cn } from "@/lib/utils";

function CheckoutContent() {
  const t = useTranslations("checkout");
  const tCatalog = useTranslations("catalog");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { items, totalAmount, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<ShippingFormInput, unknown, ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : "",
      phone: "",
      city: "",
      address: "",
      notes: "",
    },
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl">{tCatalog("emptyCart")}</h1>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          {tCatalog("startShopping")}
        </Link>
      </div>
    );
  }

  const onSubmit = async (shippingAddress: ShippingFormData) => {
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
        shippingAddress: { ...shippingAddress, notes: shippingAddress.notes || undefined },
      });
      clearCart();
      router.replace(`/orders?placed=${order.id}`);
    } catch (error) {
      // 400/404 carry a specific reason (sold out, product withdrawn).
      const status = httpStatus(error);
      toast.error(t("orderError"), {
        description:
          status === 400 || status === 404 ? apiMessage(error) : t("orderErrorHint"),
      });
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
      <h1 className="text-4xl">{t("title")}</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-10 grid gap-12 lg:grid-cols-[1fr_24rem]"
      >
        <section aria-labelledby="shipping-title" className="space-y-5">
          <h2 id="shipping-title" className="text-2xl">
            {t("shippingTitle")}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField control={control} name="fullName" label={t("fullName")} autoComplete="name" />
            <FormField
              control={control}
              name="phone"
              label={t("phone")}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="300 123 4567"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              name="department"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="department">{t("department")}</FieldLabel>
                  <Select
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    items={COLOMBIA_DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                  >
                    <SelectTrigger
                      id="department"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                    >
                      <SelectValue placeholder={t("selectDepartment")} />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOMBIA_DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error?.message && (
                    <FieldError>{tValidation(fieldState.error.message)}</FieldError>
                  )}
                </Field>
              )}
            />
            <FormField control={control} name="city" label={t("city")} autoComplete="address-level2" />
          </div>

          <FormField
            control={control}
            name="address"
            label={t("address")}
            autoComplete="street-address"
            placeholder={t("addressPlaceholder")}
          />
          <FormField
            control={control}
            name="notes"
            label={t("notes")}
            multiline
            placeholder={t("notesPlaceholder")}
          />

          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t("paymentTitle")}</p>
            <p className="mt-1">{t("paymentDescription")}</p>
          </div>
        </section>

        <aside className="h-fit rounded-md bg-muted/60 p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl">{tCatalog("orderSummary")}</h2>
          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3 text-sm">
                <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
                  {item.image && (
                    <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.productName}</p>
                  <p className="text-muted-foreground">
                    {Object.values(item.attributes).join(" / ")}
                  </p>
                  <p className="text-muted-foreground">
                    {tCatalog("qty", { count: item.quantity })}
                  </p>
                </div>
                <p className="tabular-nums">{formatCurrency(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-3 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{tCatalog("shipping")}</dt>
              <dd>{tCatalog("freeShipping")}</dd>
            </div>
            <div className="flex justify-between text-base font-medium">
              <dt>{tCatalog("total")}</dt>
              <dd className="tabular-nums">{formatCurrency(totalAmount())}</dd>
            </div>
          </dl>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
            <Lock className="size-4" aria-hidden />
            {isSubmitting ? t("placing") : t("placeOrder")}
          </Button>
          <Link
            href="/cart"
            className="mt-4 block text-center text-sm text-primary underline-offset-4 hover:underline"
          >
            {t("editCart")}
          </Link>
        </aside>
      </form>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Navbar />
      <CheckoutContent />
      <Footer />
    </AuthGuard>
  );
}
