import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const t = useTranslations('nav');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">{t('home')} 🎉</h1>
      <p className="text-muted-foreground">
        Sistema de diseño funcionando: idiomas + modo oscuro + colores personalizados
      </p>
      <div className="flex items-center gap-4">
        <Button>{t('login')}</Button>
        <Button variant="outline">{t('register')}</Button>
      </div>
      <ThemeToggle />
    </div>
  );
}