"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

function Callback() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    apiClient
      .get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data: user }) => {
        setAuth(user, token);
        router.replace(user.role === "ADMIN" ? "/admin" : "/");
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [searchParams, router, setAuth]);

  return (
    <p className="text-muted-foreground" role="status">
      {t("signingIn")}
    </p>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Suspense>
        <Callback />
      </Suspense>
    </div>
  );
}
