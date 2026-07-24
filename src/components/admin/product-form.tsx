"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VariantFields } from "./variant-fields";
import { productFormSchema, type ProductFormData } from "@/lib/validations/product";
import { createProduct } from "@/lib/api/products";
import { getCategories, type Category } from "@/lib/api/categories";

function flattenCategories(
  categories: Category[],
  depth = 0,
): (Category & { depth: number })[] {
  return categories.flatMap((c) => [
    { ...c, depth },
    ...(c.children ? flattenCategories(c.children, depth + 1) : []),
  ]);
}

export function ProductForm() {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      variants: [
        {
          sku: "",
          attributeName: "",
          attributeValue: "",
          price: 0,
          initialStock: 0,
        },
      ],
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const product = await createProduct({
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        variants: data.variants.map((v) => ({
          sku: v.sku,
          attributes: { [v.attributeName]: v.attributeValue },
          price: v.price,
          initialStock: v.initialStock,
        })),
      });
      toast.success(t("productCreated"));
      router.push(`/admin/products/${product.id}`);
    } catch {
      toast.error(tAuth("genericError"));
    }
  };

  const flatCategories = flattenCategories(categories);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("newProduct")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("productName")}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError>{tAuth("nameMin")}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t("productDescription")}
                </FieldLabel>
                <Textarea {...field} id={field.name} rows={3} />
              </Field>
            )}
          />

          <Controller
            name="categoryId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("category")}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {"— ".repeat(cat.depth)}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <VariantFields control={control} />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {tCommon("save")}
      </Button>
    </form>
  );
}