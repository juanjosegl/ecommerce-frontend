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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser } from "@/lib/api/users";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "CUSTOMER"]),
});

type FormData = z.infer<typeof schema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "CUSTOMER",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createUser(data);
      toast.success(t("userCreated"));
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error(tAuth("emailTaken"));
      } else {
        toast.error(tAuth("genericError"));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("newUser")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="firstName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {tAuth("firstName")}
                  </FieldLabel>
                  <Input {...field} id={field.name} />
                  {fieldState.invalid && (
                    <FieldError>{tAuth("nameMin")}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {tAuth("lastName")}
                  </FieldLabel>
                  <Input {...field} id={field.name} />
                  {fieldState.invalid && (
                    <FieldError>{tAuth("nameMin")}</FieldError>
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{tAuth("email")}</FieldLabel>
                <Input {...field} id={field.name} type="email" />
                {fieldState.invalid && (
                  <FieldError>{tAuth("emailInvalid")}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {tAuth("password")}
                </FieldLabel>
                <Input {...field} id={field.name} type="password" />
                {fieldState.invalid && (
                  <FieldError>{tAuth("passwordMin")}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("role")}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">
                      {t("roleCustomer")}
                    </SelectItem>
                    <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
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
