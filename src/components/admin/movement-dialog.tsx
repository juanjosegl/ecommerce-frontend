"use client";

import { Controller, useForm } from "react-hook-form";
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
import { createMovement } from "@/lib/api/inventory";

const schema = z.object({
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().min(1),
  reason: z.string().min(3),
});

type FormData = z.infer<typeof schema>;

interface MovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantLabel: string;
  onSuccess: () => void;
}

export function MovementDialog({
  open,
  onOpenChange,
  variantId,
  variantLabel,
  onSuccess,
}: MovementDialogProps) {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "IN", quantity: 1, reason: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createMovement({ variantId, ...data });
      toast.success(t("movementRegistered"));
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? tAuth("genericError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{variantLabel}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("movementType")}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">{t("stockIn")}</SelectItem>
                    <SelectItem value="OUT">{t("stockOut")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="quantity"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("quantity")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </Field>
            )}
          />

          <Controller
            name="reason"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("reason")}</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder={t("reasonPlaceholder")}
                  rows={2}
                />
                {fieldState.invalid && (
                  <FieldError>{tAuth("nameMin")}</FieldError>
                )}
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
