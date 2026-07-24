"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { addVariant } from "@/lib/api/products";

const schema = z.object({
  sku: z.string().min(1),
  attributeName: z.string().min(1),
  attributeValue: z.string().min(1),
  price: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface AddVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onSuccess: () => void;
}

export function AddVariantDialog({
  open,
  onOpenChange,
  productId,
  onSuccess,
}: AddVariantDialogProps) {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: "",
      attributeName: "",
      attributeValue: "",
      price: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addVariant(productId, {
        sku: data.sku,
        attributes: { [data.attributeName]: data.attributeValue },
        price: data.price,
      });
      toast.success(t("variantSaved"));
      reset();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(tAuth("genericError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addVariantTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>{t("sku")}</FieldLabel>
            <Input {...register("sku")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>{t("attributeName")}</FieldLabel>
              <Input {...register("attributeName")} placeholder="talla" />
            </Field>
            <Field>
              <FieldLabel>{t("attributeValue")}</FieldLabel>
              <Input {...register("attributeValue")} placeholder="M" />
            </Field>
          </div>
          <Field>
            <FieldLabel>{t("price")}</FieldLabel>
            <Input
              type="number"
              {...register("price", { valueAsNumber: true })}
            />
          </Field>
          <Button type="submit" className="w-full">
            {tCommon("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}