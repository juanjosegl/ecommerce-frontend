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
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { loginUser, getGoogleAuthUrl } from "@/lib/api/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { httpStatus } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

// Public demo accounts, also listed in the README.
const DEMO_ACCOUNTS = [
  { key: "demoCustomer", email: "test@example.com", password: "123456" },
  { key: "demoAdmin", email: "admin@ecommerce.com", password: "CambiaEstaClave123!" },
] as const;

function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const next = useSearchParams().get("next");
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const result = await loginUser(data);
      setAuth(result.user, result.accessToken);
      toast.success(t("loginSuccess", { name: result.user.firstName }));
      router.replace(
        safeRedirect(next, result.user.role === "ADMIN" ? "/admin" : "/"),
      );
    } catch (error) {
      toast.error(t(httpStatus(error) === 401 ? "invalidCredentials" : "genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={control}
          name="email"
          label={t("email")}
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
        />
        <div className="space-y-2">
          <FormField
            control={control}
            name="password"
            label={t("password")}
            type="password"
            autoComplete="current-password"
          />
          <Link
            href="/forgot-password"
            className="inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("signingIn") : t("loginButton")}
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
        {t("noAccount")}{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("registerButton")}
        </Link>
      </p>

      <section className="mt-10 rounded-md border border-dashed p-4">
        <h2 className="font-sans text-sm font-medium tracking-normal">
          {t("demoTitle")}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("demoDescription")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.key}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => reset({ email: account.email, password: account.password })}
            >
              {t(account.key)}
            </Button>
          ))}
        </div>
      </section>
    </>
  );
}

export default function LoginPage() {
  const t = useTranslations("auth");
  return (
    <AuthShell title={t("loginTitle")} subtitle={t("loginSubtitle")}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
