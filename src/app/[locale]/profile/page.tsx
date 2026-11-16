"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FormField } from "@/components/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile } from "@/lib/api/auth";
import { initials } from "@/lib/format";
import { profileSchema, type ProfileFormData } from "@/lib/validations/auth";

function ProfileContent() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const { user, setAuth, accessToken } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  if (!user || !accessToken) return null;

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const updated = await updateProfile(data);
      setAuth(updated, accessToken);
      reset(data);
      toast.success(t("updateSuccess"));
    } catch {
      toast.error(tAuth("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
      <div className="flex items-center gap-5">
        <Avatar className="size-16">
          <AvatarImage src={user.avatar ?? undefined} alt="" />
          <AvatarFallback className="text-lg">
            {initials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-4xl">
            {user.firstName} {user.lastName}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <section aria-labelledby="personal-info" className="mt-12 border-t pt-8">
        <h2 id="personal-info" className="text-2xl">
          {t("personalInfo")}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField control={control} name="firstName" label={tAuth("firstName")} autoComplete="given-name" />
            <FormField control={control} name="lastName" label={tAuth("lastName")} autoComplete="family-name" />
          </div>
          <Button type="submit" disabled={isSubmitting || !formState.isDirty}>
            {t("saveChanges")}
          </Button>
        </form>
      </section>

      <section className="mt-12 border-t pt-8">
        <Link
          href="/orders"
          className="flex items-center justify-between gap-4 rounded-md border p-5 transition-colors hover:bg-muted/60"
        >
          <span className="flex items-center gap-4">
            <Package className="size-5 text-primary" aria-hidden />
            <span>
              <span className="block font-medium">{t("myOrders")}</span>
              <span className="block text-sm text-muted-foreground">{t("viewOrders")}</span>
            </span>
          </span>
        </Link>
      </section>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Navbar />
      <ProfileContent />
      <Footer />
    </AuthGuard>
  );
}
