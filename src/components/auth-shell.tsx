"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("footer");

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="font-heading text-2xl">
          AM Shop
        </Link>
        <p
          aria-hidden
          className="pointer-events-none absolute -bottom-[0.18em] -left-[0.04em] font-heading text-[clamp(14rem,26vw,24rem)] leading-none opacity-[0.09] select-none"
        >
          AM
        </p>
        <p className="relative max-w-sm font-heading text-3xl leading-tight">
          {t("tagline")}
        </p>
      </aside>

      <main className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-heading text-xl lg:invisible">
            AM Shop
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
