"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.push("/login");
      return;
    }

    apiClient
      .get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data: user }) => {
        setAuth(user, token);
        router.push(user.role === "ADMIN" ? "/admin" : "/profile");
      })
      .catch(() => {
        router.push("/login");
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Iniciando sesión...</p>
    </div>
  );
}
