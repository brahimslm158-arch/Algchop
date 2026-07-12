import Link from 'next/link';
import Brand from './Brand';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-emerald-950/10 bg-slate-950 text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-flex rounded-xl bg-white p-2">
              <Brand />
            </Link>
            <p className="text-sm leading-7 text-slate-300">
              سوق جزائري لعرض المنتجات وطلبها بسهولة، مع تواصل مباشر وتجربة واضحة على الهاتف والحاسوب.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-black text-white">الشراء</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/search" className="text-sm font-bold text-slate-300 transition-colors hover:text-emerald-300">
                  تصفح المنتجات
                </Link>
              </li>
              <li>
                <Link href="/categories/%D8%A5%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A%D8%A7%D8%AA" className="text-sm font-bold text-slate-300 transition-colors hover:text-emerald-300">
                  إلكترونيات
                </Link>
              </li>
              <li>
                <Link href="/categories/%D8%A3%D8%B2%D9%8A%D8%A7%D8%A1" className="text-sm font-bold text-slate-300 transition-colors hover:text-emerald-300">
                  أزياء
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-black text-white">البيع</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/sell" className="text-sm font-bold text-slate-300 transition-colors hover:text-emerald-300">
                  أضف منتج للبيع
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm font-bold text-slate-300 transition-colors hover:text-emerald-300">
                  إدارة المنتجات
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm font-bold text-slate-300 transition-colors hover:text-emerald-300">
                  مبيعاتي
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-black text-white">روابط سريعة</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#how-it-works" className="text-sm font-bold text-slate-300 transition-colors hover:text-emerald-300">
                  كيف يعمل algshop
                </Link>
              </li>
              <li>
                <Link href="/auth?mode=signup" className="text-sm font-bold text-slate-300 transition-colors hover:text-emerald-300">
                  إنشاء حساب
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm font-bold text-slate-300 transition-colors hover:text-emerald-300">
                  لوحة الحساب
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-8 text-center text-sm font-bold text-slate-400">
          © {new Date().getFullYear()} Algshop. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
