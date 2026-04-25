export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface-2/40">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-display text-xl font-bold gradient-text">عقارات سمالوط</div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            قولنا إيه اللي بتدور عليه — وهنجيبهولك.
            <br />
            سوق العقارات الأول في سمالوط والقرى المجاورة.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold mb-3">للباحثين</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>إنشاء حساب</li>
            <li>إعلانات للبيع</li>
            <li>إعلانات للإيجار</li>
            <li>أراضي زراعية</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold mb-3">للمعلنين</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>أضف إعلانك</li>
            <li>اشتراك المكاتب</li>
            <li>الباقات والأسعار</li>
            <li>تواصل معنا</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2025 عقارات سمالوط — ALIENs Venture
      </div>
    </footer>
  );
}
