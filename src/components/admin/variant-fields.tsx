"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ProductFormData } from "@/lib/validations/product";

export function VariantFields({
  control,
}: {
  control: Control<ProductFormData>;
}) {
  const t = useTranslations("admin");
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FieldLabel>{t("variants")}</FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              sku: "",
              attributeName: "",
              attributeValue: "",
              price: 0,
              initialStock: 0,
            })
          }
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addVariant")}
        </Button>
      </div>

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
            <Field className="sm:col-span-1">
              <FieldLabel className="text-xs">{t("sku")}</FieldLabel>
              <Input
                {...control.register(`variants.${index}.sku`)}
                placeholder="SKU-001"
              />
            </Field>

            <Field className="sm:col-span-1">
              <FieldLabel className="text-xs">
                {t("attributeName")}
              </FieldLabel>
              <Input
                {...control.register(`variants.${index}.attributeName`)}
                placeholder="talla"
              />
            </Field>

            <Field className="sm:col-span-1">
              <FieldLabel className="text-xs">
                {t("attributeValue")}
              </FieldLabel>
              <Input
                {...control.register(`variants.${index}.attributeValue`)}
                placeholder="M"
              />
            </Field>

            <Field className="sm:col-span-1">
              <FieldLabel className="text-xs">{t("price")}</FieldLabel>
              <Input
                type="number"
                {...control.register(`variants.${index}.price`, {
                  valueAsNumber: true,
                })}
              />
            </Field>

            <div className="flex items-end gap-2 sm:col-span-1">
              <Field className="flex-1">
                <FieldLabel className="text-xs">
                  {t("initialStock")}
                </FieldLabel>
                <Input
                  type="number"
                  {...control.register(`variants.${index}.initialStock`, {
                    valueAsNumber: true,
                  })}
                />
              </Field>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}