import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Store } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
        <div className="glass-dark max-w-3xl rounded-3xl p-8 md:p-12" dir="rtl">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6 text-white">
            اشترِ وبيع كل ما تريد في <span className="text-zinc-300">Algshop</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-200 mb-8 leading-relaxed">
            منصة واعدة للإعلان عن منتجاتك مع إضافة الصور والوصف والأنواع والخيارات الاختيارية. تصميم احترافي يجعل البيع والشراء سهلاً.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 px-7 py-3.5 rounded-full font-bold text-lg transition-all shadow-xl shadow-white/10"
            >
              <ShoppingBag className="w-5 h-5" />
              تصفح المنتجات
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white px-7 py-3.5 rounded-full font-bold text-lg transition-all"
            >
              <Store className="w-5 h-5" />
              أضف منتجك للبيع
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
