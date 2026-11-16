"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="font-heading text-8xl text-primary">404</p>
      <h1 className="text-3xl">{t("title")}</h1>
      <p className="max-w-sm text-muted-foreground">{t("description")}</p>
      <Link href="/" className={buttonVariants()}>
        {t("backHome")}
      </Link>
    </div>
  );
}