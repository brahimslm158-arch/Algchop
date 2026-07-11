import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 mt-auto" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 mb-4" dir="ltr">
              <div className="bg-zinc-900 text-white font-black px-2.5 py-1 rounded-lg text-lg tracking-tight">
                alg
              </div>
              <span className="font-black text-xl tracking-tight text-zinc-900">shop</span>
            </Link>
            <p className="leading-relaxed text-zinc-600 text-sm">
              منصة alg shop تتيح للجميع عرض منتجاتهم للبيع والشراء بسهولة وأمان مع خيارات متعددة وتواصل مباشر.
            </p>
          </div>
          <div>
            <h4 className="text-zinc-900 font-bold mb-4">الشراء</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/search" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-bold">
                  تصفح المنتجات
                </Link>
              </li>
              <li>
                <Link href="/categories/%D8%A5%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A%D8%A7%D8%AA" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-bold">
                  إلكترونيات
                </Link>
              </li>
              <li>
                <Link href="/categories/%D8%A3%D8%B2%D9%8A%D8%A7%D8%A1" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-bold">
                  أزياء
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-900 font-bold mb-4">البيع</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/sell" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-bold">
                  أضف منتج للبيع
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-bold">
                  إدارة المنتجات
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-bold">
                  مبيعاتي
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-900 font-bold mb-4">المساعدة</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-bold">
                  كيف يعمل algshop
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-bold">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-bold">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-200 mt-10 pt-8 text-center text-zinc-500 text-sm font-bold">
          © {new Date().getFullYear()} alg shop. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
