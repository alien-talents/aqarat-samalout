import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { t, useLang } from "@/lib/i18n";

const NotFound = () => {
  const lang = useLang();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-display text-6xl font-bold mb-2">404</h1>
          <p className="text-muted-foreground mb-6">
            {lang === "ar" ? "الصفحة دي مش موجودة." : "This page does not exist."}
          </p>
          <Link to="/" className="text-primary underline">
            {t("nav.marketplace", lang)} →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
