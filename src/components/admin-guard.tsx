"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useHydrated } from "@/hooks/use-hydrated";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const hasHydrated = useHydrated();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!accessToken) {
      router.replace("/login?next=/admin");
    } else if (user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [hasHydrated, accessToken, user, router]);

  if (!hasHydrated || !accessToken || user?.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}