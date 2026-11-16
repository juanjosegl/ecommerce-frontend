"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import { resetPassword } from "@/lib/api/auth";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("resetPasswordInvalid")}
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          {t("requestNewLink")}
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await resetPassword(token, data.newPassword);
      toast.success(t("resetPasswordSuccess"));
      router.replace("/login");
    } catch {
      toast.error(t("resetPasswordInvalid"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FormField
        control={control}
        name="newPassword"
        label={t("newPassword")}
        type="password"
        autoComplete="new-password"
        description={t("passwordHint")}
      />
      <FormField
        control={control}
        name="confirmPassword"
        label={t("confirmPassword")}
        type="password"
        autoComplete="new-password"
      />
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {t("resetPasswordButton")}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  return (
    <AuthShell
      title={t("resetPasswordTitle")}
      subtitle={t("resetPasswordDescription")}
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
