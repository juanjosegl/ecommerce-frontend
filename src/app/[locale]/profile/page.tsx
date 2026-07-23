"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile } from "@/lib/api/auth";
import { buttonVariants } from "@/components/ui/button";

const editProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

function ProfileContent() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const { user, setAuth, accessToken } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const onSubmit = async (data: EditProfileFormData) => {
    setIsSubmitting(true);
    try {
      const updated = await updateProfile(data);
      setAuth(updated, accessToken!);
      toast.success(t("updateSuccess"));
    } catch {
      toast.error(tAuth("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("personalInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {tAuth("firstName")}
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
                name="lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {tAuth("lastName")}
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
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {t("saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("myOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("viewOrders")}
          </p>
          <Link href="/orders" className={buttonVariants()}>
            {t("myOrders")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Navbar />
      <ProfileContent />
    </AuthGuard>
  );
}
