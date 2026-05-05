import { t, useLang } from "@/lib/i18n";

export function Footer() {
  const lang = useLang();
  return (
    <footer className="border-t border-border mt-16">
      <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {t("brand.name", lang)} — {t("brand.tagline", lang)}
        </p>
        <p className="text-xs">PRD v2 · Frontend prototype</p>
      </div>
    </footer>
  );
}
