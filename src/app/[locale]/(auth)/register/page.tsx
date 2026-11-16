"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/google-icon";
import { AuthShell, OrDivider } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { registerUser, getGoogleAuthUrl } from "@/lib/api/auth";
import { httpStatus } from "@/lib/api-client";
import { safeRedirect } from "@/lib/safe-redirect";
import { useAuthStore } from "@/stores/auth-store";

function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const next = useSearchParams().get("next");
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setError } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (form: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const result = await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setAuth(result.user, result.accessToken);
      toast.success(t("registerSuccess"));
      router.replace(safeRedirect(next, "/"));
    } catch (error) {
      if (httpStatus(error) === 409) {
        setError("email", { message: "emailTaken" });
      } else {
        toast.error(t("genericError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={control}
            name="firstName"
            label={t("firstName")}
            autoComplete="given-name"
          />
          <FormField
            control={control}
            name="lastName"
            label={t("lastName")}
            autoComplete="family-name"
          />
        </div>
        <FormField
          control={control}
          name="email"
          label={t("email")}
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
        />
        <FormField
          control={control}
          name="password"
          label={t("password")}
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
          {isSubmitting ? t("creatingAccount") : t("registerButton")}
        </Button>
      </form>

      <OrDivider label={t("orContinueWith")} />

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => (window.location.href = getGoogleAuthUrl())}
      >
        <GoogleIcon className="size-4" />
        {t("continueWithGoogle")}
      </Button>

      <p className="mt-8 text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("loginButton")}
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  return (
    <AuthShell title={t("registerTitle")} subtitle={t("registerSubtitle")}>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
