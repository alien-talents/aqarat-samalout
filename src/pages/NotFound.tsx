import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <div className="flex-1 container flex flex-col items-center justify-center py-20 text-center">
      <div className="font-display text-8xl font-bold gradient-text">404</div>
      <h1 className="font-display text-2xl font-bold mt-4">الصفحة مش موجودة</h1>
      <p className="text-muted-foreground mt-2">يمكن الرابط متغير أو الإعلان اتشال</p>
      <Link to="/" className="mt-6">
        <Button className="bg-gradient-gold text-primary-foreground">الرجوع للرئيسية</Button>
      </Link>
    </div>
    <Footer />
  </div>
);

export default NotFound;
