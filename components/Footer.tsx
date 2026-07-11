import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-white text-zinc-900 font-extrabold px-3 py-1.5 rounded-xl text-xl tracking-tight">
                alg
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">shop</span>
            </Link>
            <p className="leading-relaxed text-zinc-400">
              منصة Algshop تتيح للجميع عرض منتجاتهم للبيع والشراء بسهولة وأمان مع خيارات متعددة وتواصل مباشر.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">الشراء</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  تصفح المنتجات
                </Link>
              </li>
              <li>
                <Link href="/categories/%D8%A5%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A%D8%A7%D8%AA" className="hover:text-white transition-colors">
                  إلكترونيات
                </Link>
              </li>
              <li>
                <Link href="/categories/%D8%A3%D8%B2%D9%8A%D8%A7%D8%A1" className="hover:text-white transition-colors">
                  أزياء
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">البيع</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/sell" className="hover:text-white transition-colors">
                  أضف منتج للبيع
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  إدارة المنتجات
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  مبيعاتي
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">المساعدة</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  كيف يعمل Algshop
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-zinc-500">
          © {new Date().getFullYear()} Algshop. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
