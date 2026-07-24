"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/category";
import {
  createCategory,
  updateCategory,
  type Category,
} from "@/lib/api/categories";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  categories: Category[];
  onSuccess: () => void;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  categories,
  onSuccess,
}: CategoryFormDialogProps) {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const { control, handleSubmit, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", parentId: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? "",
        description: category?.description ?? "",
        parentId: category?.parentId ?? "",
      });
    }
  }, [open, category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload = {
        ...data,
        parentId: data.parentId || undefined,
      };

      if (category) {
        await updateCategory(category.id, payload);
        toast.success(t("updateSuccess"));
      } else {
        await createCategory(payload);
        toast.success(t("createSuccess"));
      }

      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(tAuth("genericError"));
    }
  };

  const availableParents = categories.filter((c) => c.id !== category?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? t("editCategory") : t("newCategory")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("categoryName")}
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
                  {t("categoryDescription")}
                </FieldLabel>
                <Textarea {...field} id={field.name} rows={3} />
              </Field>
            )}
          />

          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("parentCategory")}</FieldLabel>
                <Select
                  value={field.value || "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("noParent")}</SelectItem>
                    {availableParents.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Button type="submit" className="w-full">
            {tCommon("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
