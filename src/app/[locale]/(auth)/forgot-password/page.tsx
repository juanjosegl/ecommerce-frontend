"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSentTo(email);
    } catch {
      toast.error(t("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={t("forgotPasswordTitle")}
      subtitle={sentTo ? undefined : t("forgotPasswordDescription")}
    >
      {sentTo ? (
        <div className="space-y-4" role="status">
          <MailCheck className="size-8 text-primary" aria-hidden />
          <p className="text-sm">{t("resetLinkSent", { email: sentTo })}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            control={control}
            name="email"
            label={t("email")}
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
          />
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {t("sendResetLink")}
          </Button>
        </form>
      )}
      <Link
        href="/login"
        className="mt-8 inline-block text-sm text-primary underline-offset-4 hover:underline"
      >
        {t("backToLogin")}
      </Link>
    </AuthShell>
  );
}
